import { useEffect, useState } from 'react';
import { ResourceScreen, type Field, type CardRenderer } from '@/components/ResourceScreen';
import { SectionTabs, type Tab } from '@/components/SectionTabs';
import { Badge, Money } from '@/components/card';
import { AppHeader, EmptyState, ErrorView, Loading, PageContainer } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useList } from '@/lib/crud';

type Expense = Record<string, unknown> & { id: string; project_id?: string; amount: number | null; category?: string; date: string };
type Revenue = Record<string, unknown> & { id: string; project_id?: string; amount: number | null; source?: string; date: string };
type Supplier = Record<string, unknown> & { id: string; name: string; phone?: string };
type Invoice = Record<string, unknown> & { id: string; supplier_id?: string; project_id?: string; amount: number | null; status: string; date: string };
type Project = Record<string, unknown> & { id: string; name: string };

const tabs: Tab[] = [
  { key: 'summary', label: 'ملخص الأرباح' },
  { key: 'expenses', label: 'المصروفات' },
  { key: 'revenues', label: 'الإيرادات' },
  { key: 'suppliers', label: 'الموردين' },
  { key: 'invoices', label: 'الفواتير' },
];

export function FinanceSection() {
  const [active, setActive] = useState('summary');
  return (
    <PageContainer>
      <SectionTabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-3">
        {active === 'summary' && <SummaryTab />}
        {active === 'expenses' && <ExpensesTab />}
        {active === 'revenues' && <RevenuesTab />}
        {active === 'suppliers' && <SuppliersTab />}
        {active === 'invoices' && <InvoicesTab />}
      </div>
    </PageContainer>
  );
}

function SummaryTab() {
  const { rows: projects, loading, error } = useList<Project>('projects', { orderBy: { column: 'name', ascending: true } });
  const [summary, setSummary] = useState<Record<string, { revenue: number; expense: number }>>({});
  const [sumLoading, setSumLoading] = useState(true);
  const [sumError, setSumError] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) {
      setSumLoading(false);
      return;
    }
    setSumLoading(true);
    Promise.all(
      projects.map(async (p) => {
        const [rev, exp] = await Promise.all([
          supabase.from('revenues').select('amount').eq('is_deleted', false).eq('project_id', p.id),
          supabase.from('expenses').select('amount').eq('is_deleted', false).eq('project_id', p.id),
        ]);
        const revenue = (rev.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
        const expense = (exp.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
        return [p.id, { revenue, expense }] as const;
      })
    )
      .then((entries) => {
        const map: Record<string, { revenue: number; expense: number }> = {};
        entries.forEach(([id, v]) => (map[id] = v));
        setSummary(map);
        setSumLoading(false);
      })
      .catch((e) => {
        console.error('[Finance:summary]', e);
        setSumError((e as { message?: string }).message ?? 'تعذّر تحميل الملخص');
        setSumLoading(false);
      });
  }, [projects]);

  if (loading || sumLoading) return <Loading />;
  if (error || sumError) return <ErrorView title="تعذّر تحميل الملخص" message={error ?? sumError ?? undefined} />;
  if (projects.length === 0) return <EmptyState title="لا توجد مشاريع" hint="أضف مشروعًا أولًا لعرض الملخص" />;

  return (
    <div className="px-4">
      <div className="flex flex-col gap-3">
        {projects.map((p) => {
          const s = summary[p.id] ?? { revenue: 0, expense: 0 };
          const profit = s.revenue - s.expense;
          const profitTone = profit >= 0 ? 'green' : 'red';
          return (
            <div key={p.id} className="rounded-2xl bg-white p-4 ring-1 ring-sand-100">
              <p className="mb-2 text-base font-bold text-sand-800">{p.name}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <p className="text-xs text-emerald-600">الإيرادات</p>
                  <p className="mt-0.5"><Money amount={s.revenue} /></p>
                </div>
                <div className="rounded-xl bg-red-50 p-2.5">
                  <p className="text-xs text-red-600">المصروفات</p>
                  <p className="mt-0.5"><Money amount={s.expense} /></p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-sand-50 p-2.5">
                <span className="text-sm font-semibold text-sand-600">صافي الربح</span>
                <Badge tone={profitTone}><Money amount={profit} /></Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpensesTab() {
  const fields: Field[] = [
    { key: 'project_id', label: 'المشروع', type: 'foreign', table: 'projects', labelColumn: 'name', addRoute: '/projects', entityLabel: 'مشروع' },
    { key: 'amount', label: 'المبلغ', type: 'number', step: '0.01' },
    { key: 'category', label: 'البند', type: 'text', placeholder: 'عمالة / مواد / معدات' },
    { key: 'date', label: 'التاريخ', type: 'date' },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Expense> = (r) => ({
    title: r.category ?? 'مصروف',
    subtitle: r.date,
    meta: <Badge tone="red"><Money amount={r.amount} /></Badge>,
  });
  return (
    <ResourceScreen<Expense>
      table="expenses"
      title="المصروفات"
      fields={fields}
      searchColumns={['category', 'notes']}
      searchPlaceholder="ابحث في المصروفات…"
      renderCard={renderCard}
    />
  );
}

function RevenuesTab() {
  const fields: Field[] = [
    { key: 'project_id', label: 'المشروع', type: 'foreign', table: 'projects', labelColumn: 'name', addRoute: '/projects', entityLabel: 'مشروع' },
    { key: 'amount', label: 'المبلغ', type: 'number', step: '0.01' },
    { key: 'source', label: 'المصدر', type: 'text', placeholder: 'دفعة عميل / بيع' },
    { key: 'date', label: 'التاريخ', type: 'date' },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Revenue> = (r) => ({
    title: r.source ?? 'إيراد',
    subtitle: r.date,
    meta: <Badge tone="green"><Money amount={r.amount} /></Badge>,
  });
  return (
    <ResourceScreen<Revenue>
      table="revenues"
      title="الإيرادات"
      fields={fields}
      searchColumns={['source', 'notes']}
      searchPlaceholder="ابحث في الإيرادات…"
      renderCard={renderCard}
    />
  );
}

function SuppliersTab() {
  const fields: Field[] = [
    { key: 'name', label: 'اسم المورّد', type: 'text', required: true },
    { key: 'phone', label: 'الهاتف', type: 'text', placeholder: '01xxxxxxxxx' },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Supplier> = (r) => ({ title: r.name, subtitle: r.phone });
  return (
    <ResourceScreen<Supplier>
      table="suppliers"
      title="الموردين"
      fields={fields}
      searchColumns={['name', 'phone']}
      searchPlaceholder="ابحث باسم المورّد…"
      renderCard={renderCard}
    />
  );
}

function InvoicesTab() {
  const fields: Field[] = [
    { key: 'supplier_id', label: 'المورّد', type: 'foreign', table: 'suppliers', labelColumn: 'name', addRoute: '/finance', entityLabel: 'مورد' },
    { key: 'project_id', label: 'المشروع', type: 'foreign', table: 'projects', labelColumn: 'name', addRoute: '/projects', entityLabel: 'مشروع' },
    { key: 'amount', label: 'المبلغ', type: 'number', step: '0.01' },
    {
      key: 'status',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: 'unpaid', label: 'غير مدفوعة' },
        { value: 'partial', label: 'مدفوعة جزئيًا' },
        { value: 'paid', label: 'مدفوعة' },
      ],
    },
    { key: 'date', label: 'التاريخ', type: 'date' },
  ];
  const renderCard: CardRenderer<Invoice> = (r) => ({
    title: 'فاتورة',
    subtitle: r.date,
    meta: (
      <>
        <Badge tone="brand"><Money amount={r.amount} /></Badge>
        <Badge>{r.status}</Badge>
      </>
    ),
  });
  return (
    <ResourceScreen<Invoice>
      table="invoices"
      title="الفواتير"
      fields={fields}
      searchColumns={['status']}
      searchPlaceholder="ابحث في الفواتير…"
      renderCard={renderCard}
    />
  );
}
