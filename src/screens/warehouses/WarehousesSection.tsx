import { useState } from 'react';
import { ResourceScreen, type Field, type CardRenderer } from '@/components/ResourceScreen';
import { SectionTabs, type Tab } from '@/components/SectionTabs';
import { Badge } from '@/components/card';
import { PageContainer } from '@/components/ui';

type Warehouse = Record<string, unknown> & { id: string; name: string; location?: string };
type Stock = Record<string, unknown> & { id: string; warehouse_id?: string; material_id?: string; qty: number | null };
type Request = Record<string, unknown> & { id: string; project_id?: string; material_id?: string; qty: number | null; status: string };

const tabs: Tab[] = [
  { key: 'warehouses', label: 'المخازن' },
  { key: 'stock', label: 'المخزون' },
  { key: 'requests', label: 'الطلبات' },
];

const statusOptions = [
  { value: 'requested', label: 'مطلوب' },
  { value: 'approved', label: 'معتمد' },
  { value: 'purchased', label: 'تم الشراء' },
  { value: 'received', label: 'تم الاستلام' },
  { value: 'issued', label: 'تم الصرف' },
];

const statusTone: Record<string, 'neutral' | 'brand' | 'amber' | 'green' | 'red'> = {
  requested: 'neutral',
  approved: 'brand',
  purchased: 'amber',
  received: 'green',
  issued: 'red',
};

export function WarehousesSection() {
  const [active, setActive] = useState('warehouses');
  return (
    <PageContainer>
      <SectionTabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-3">
        {active === 'warehouses' && <WarehousesTab />}
        {active === 'stock' && <StockTab />}
        {active === 'requests' && <RequestsTab />}
      </div>
    </PageContainer>
  );
}

function WarehousesTab() {
  const fields: Field[] = [
    { key: 'name', label: 'اسم المخزن', type: 'text', required: true },
    { key: 'location', label: 'الموقع', type: 'text' },
  ];
  const renderCard: CardRenderer<Warehouse> = (r) => ({ title: r.name, subtitle: r.location });
  return (
    <ResourceScreen<Warehouse>
      table="warehouses"
      title="المخازن"
      fields={fields}
      searchColumns={['name', 'location']}
      searchPlaceholder="ابحث باسم المخزن…"
      renderCard={renderCard}
    />
  );
}

function StockTab() {
  const fields: Field[] = [
    { key: 'warehouse_id', label: 'المخزن', type: 'foreign', table: 'warehouses', labelColumn: 'name', required: true },
    { key: 'material_id', label: 'المادة', type: 'foreign', table: 'materials', labelColumn: 'name', required: true },
    { key: 'qty', label: 'الكمية', type: 'number', required: true, step: '0.01' },
  ];
  const renderCard: CardRenderer<Stock> = (r) => ({
    title: `كمية: ${r.qty ?? '—'}`,
    subtitle: 'صنف مخزون',
    meta: <Badge tone="brand">{r.qty ?? 0} وحدة</Badge>,
  });
  return (
    <ResourceScreen<Stock>
      table="stock"
      title="المخزون"
      fields={fields}
      searchColumns={[]}
      searchPlaceholder="ابحث في المخزون…"
      renderCard={renderCard}
    />
  );
}

function RequestsTab() {
  const fields: Field[] = [
    { key: 'project_id', label: 'المشروع', type: 'foreign', table: 'projects', labelColumn: 'name', required: true },
    { key: 'material_id', label: 'المادة', type: 'foreign', table: 'materials', labelColumn: 'name', required: true },
    { key: 'qty', label: 'الكمية المطلوبة', type: 'number', required: true, step: '0.01' },
    { key: 'status', label: 'الحالة', type: 'select', options: statusOptions },
  ];
  const renderCard: CardRenderer<Request> = (r) => ({
    title: `طلب: ${r.qty ?? '—'} وحدة`,
    subtitle: 'مادة للمشروع',
    meta: <Badge tone={statusTone[r.status] ?? 'neutral'}>{statusOptions.find((o) => o.value === r.status)?.label ?? r.status}</Badge>,
  });
  return (
    <ResourceScreen<Request>
      table="material_requests"
      title="طلبات المواد"
      fields={fields}
      searchColumns={[]}
      searchPlaceholder="ابحث في الطلبات…"
      renderCard={renderCard}
    />
  );
}
