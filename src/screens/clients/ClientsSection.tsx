import { useState } from 'react';
import { ResourceScreen, type Field, type CardRenderer } from '@/components/ResourceScreen';
import { SectionTabs, type Tab } from '@/components/SectionTabs';
import { Badge, Money } from '@/components/card';
import { PageContainer } from '@/components/ui';

type Client = Record<string, unknown> & { id: string; name: string; phone?: string; company?: string };
type Quote = Record<string, unknown> & { id: string; client_id?: string; amount: number | null; date: string; status: string };
type Contract = Record<string, unknown> & { id: string; client_id?: string; project_id?: string; value: number | null; status: string; start_date: string };
type FollowUp = Record<string, unknown> & { id: string; client_id?: string; date: string; text?: string };
type Correspondence = Record<string, unknown> & { id: string; client_id?: string; subject?: string; date: string; body?: string };

const tabs: Tab[] = [
  { key: 'clients', label: 'العملاء' },
  { key: 'quotes', label: 'عروض الأسعار' },
  { key: 'contracts', label: 'العقود' },
  { key: 'followups', label: 'المتابعات' },
  { key: 'correspondence', label: 'المراسلات' },
];

const quoteStatusOptions = [
  { value: 'draft', label: 'مسودة' },
  { value: 'sent', label: 'مرسلة' },
  { value: 'accepted', label: 'مقبولة' },
  { value: 'rejected', label: 'مرفوضة' },
];

const contractStatusOptions = [
  { value: 'draft', label: 'مسودة' },
  { value: 'signed', label: 'موقعة' },
  { value: 'active', label: 'سارية' },
  { value: 'closed', label: 'منتهية' },
];

export function ClientsSection() {
  const [active, setActive] = useState('clients');
  return (
    <PageContainer>
      <SectionTabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-4">
        {active === 'clients' && <ClientsTab />}
        {active === 'quotes' && <QuotesTab />}
        {active === 'contracts' && <ContractsTab />}
        {active === 'followups' && <FollowUpsTab />}
        {active === 'correspondence' && <CorrespondenceTab />}
      </div>
    </PageContainer>
  );
}

function ClientsTab() {
  const fields: Field[] = [
    { key: 'name', label: 'اسم العميل', type: 'text', required: true },
    { key: 'phone', label: 'الهاتف', type: 'text' },
    { key: 'company', label: 'الشركة', type: 'text' },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Client> = (r) => ({ title: r.name, subtitle: [r.company, r.phone].filter(Boolean).join(' · ') });
  return (
    <ResourceScreen<Client>
      table="clients"
      title="العملاء والمقاولين"
      fields={fields}
      searchColumns={['name', 'phone', 'company']}
      searchPlaceholder="ابحث باسم العميل…"
      renderCard={renderCard}
    />
  );
}

function QuotesTab() {
  const fields: Field[] = [
    { key: 'client_id', label: 'العميل', type: 'foreign', table: 'clients', labelColumn: 'name', required: true },
    { key: 'amount', label: 'القيمة', type: 'number', required: true, step: '0.01' },
    { key: 'date', label: 'التاريخ', type: 'date', required: true },
    { key: 'status', label: 'الحالة', type: 'select', options: quoteStatusOptions },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Quote> = (r) => ({
    title: 'عرض سعر',
    subtitle: r.date,
    meta: (
      <>
        <Badge tone="brand"><Money amount={r.amount} /></Badge>
        <Badge>{quoteStatusOptions.find((o) => o.value === r.status)?.label ?? r.status}</Badge>
      </>
    ),
  });
  return (
    <ResourceScreen<Quote>
      table="quotes"
      title="عروض الأسعار"
      fields={fields}
      searchColumns={['notes']}
      searchPlaceholder="ابحث في العروض…"
      renderCard={renderCard}
    />
  );
}

function ContractsTab() {
  const fields: Field[] = [
    { key: 'client_id', label: 'العميل', type: 'foreign', table: 'clients', labelColumn: 'name', required: true },
    { key: 'project_id', label: 'المشروع', type: 'foreign', table: 'projects', labelColumn: 'name' },
    { key: 'value', label: 'القيمة', type: 'number', required: true, step: '0.01' },
    { key: 'status', label: 'الحالة', type: 'select', options: contractStatusOptions },
    { key: 'start_date', label: 'تاريخ البدء', type: 'date', required: true },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Contract> = (r) => ({
    title: 'عقد',
    subtitle: r.start_date,
    meta: (
      <>
        <Badge tone="brand"><Money amount={r.value} /></Badge>
        <Badge>{contractStatusOptions.find((o) => o.value === r.status)?.label ?? r.status}</Badge>
      </>
    ),
  });
  return (
    <ResourceScreen<Contract>
      table="contracts"
      title="العقود"
      fields={fields}
      searchColumns={['notes']}
      searchPlaceholder="ابحث في العقود…"
      renderCard={renderCard}
    />
  );
}

function FollowUpsTab() {
  const fields: Field[] = [
    { key: 'client_id', label: 'العميل', type: 'foreign', table: 'clients', labelColumn: 'name', required: true },
    { key: 'date', label: 'التاريخ', type: 'date', required: true },
    { key: 'text', label: 'المتابعة', type: 'textarea', required: true },
  ];
  const renderCard: CardRenderer<FollowUp> = (r) => ({ title: r.date, subtitle: r.text });
  return (
    <ResourceScreen<FollowUp>
      table="follow_ups"
      title="المتابعات"
      fields={fields}
      searchColumns={['text']}
      searchPlaceholder="ابحث في المتابعات…"
      renderCard={renderCard}
    />
  );
}

function CorrespondenceTab() {
  const fields: Field[] = [
    { key: 'client_id', label: 'العميل', type: 'foreign', table: 'clients', labelColumn: 'name', required: true },
    { key: 'subject', label: 'الموضوع', type: 'text', required: true },
    { key: 'date', label: 'التاريخ', type: 'date', required: true },
    { key: 'body', label: 'المحتوى', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Correspondence> = (r) => ({ title: r.subject ?? 'مراسلة', subtitle: r.date });
  return (
    <ResourceScreen<Correspondence>
      table="correspondence"
      title="المراسلات"
      fields={fields}
      searchColumns={['subject', 'body']}
      searchPlaceholder="ابحث في المراسلات…"
      renderCard={renderCard}
    />
  );
}
