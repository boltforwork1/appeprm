import { useState } from 'react';
import { ResourceScreen, type Field, type CardRenderer } from '@/components/ResourceScreen';
import { SectionTabs, type Tab } from '@/components/SectionTabs';
import { Badge, Money } from '@/components/card';
import { PageContainer } from '@/components/ui';

type Material = Record<string, unknown> & { id: string; name: string; unit: string; avg_market_price: number | null; category?: string };
type PriceQuote = Record<string, unknown> & { id: string; supplier: string; price: number | null; date: string; notes?: string; material_id?: string };
type PriceList = Record<string, unknown> & { id: string; list_name: string; material_id?: string; price: number | null; unit?: string };
type Quantity = Record<string, unknown> & { id: string; material_id?: string; building_type?: string; qty: number | null };

const tabs: Tab[] = [
  { key: 'materials', label: 'المواد' },
  { key: 'quotes', label: 'عروض الأسعار' },
  { key: 'electricity', label: 'قائمة الكهرباء' },
  { key: 'plumbing', label: 'قائمة السباكة' },
  { key: 'quantities', label: 'الكميات' },
];

export function MaterialsSection() {
  const [active, setActive] = useState('materials');

  return (
    <PageContainer>
      <SectionTabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-3">
        {active === 'materials' && <MaterialsTab />}
        {active === 'quotes' && <QuotesTab />}
        {active === 'electricity' && <PriceListTab listName="كهرباء" />}
        {active === 'plumbing' && <PriceListTab listName="سباكة" />}
        {active === 'quantities' && <QuantitiesTab />}
      </div>
    </PageContainer>
  );
}

function MaterialsTab() {
  const fields: Field[] = [
    { key: 'name', label: 'اسم المادة', type: 'text', required: true, placeholder: 'أسمنت' },
    { key: 'unit', label: 'الوحدة', type: 'text', required: true, placeholder: 'شيكارة / طن / متر' },
    { key: 'avg_market_price', label: 'متوسط سعر السوق', type: 'number', step: '0.01', placeholder: '0.00' },
    {
      key: 'category',
      label: 'التصنيف',
      type: 'select',
      options: [
        { value: 'general', label: 'عام' },
        { value: 'electricity', label: 'كهرباء' },
        { value: 'plumbing', label: 'سباكة' },
      ],
    },
  ];
  const renderCard: CardRenderer<Material> = (r) => ({
    title: r.name,
    subtitle: r.unit,
    meta: (
      <>
        <Badge tone="brand"><Money amount={r.avg_market_price} /></Badge>
        {r.category && <Badge>{r.category}</Badge>}
      </>
    ),
  });
  return (
    <ResourceScreen<Material>
      table="materials"
      title="المواد والأسعار"
      fields={fields}
      searchColumns={['name', 'unit']}
      searchPlaceholder="ابحث باسم المادة…"
      renderCard={renderCard}
    />
  );
}

function QuotesTab() {
  const fields: Field[] = [
    { key: 'material_id', label: 'المادة', type: 'foreign', table: 'materials', labelColumn: 'name', required: true },
    { key: 'supplier', label: 'المورّد', type: 'text', required: true, placeholder: 'شركة …' },
    { key: 'price', label: 'السعر', type: 'number', required: true, step: '0.01' },
    { key: 'date', label: 'التاريخ', type: 'date' },
    { key: 'notes', label: 'ملاحظات', type: 'textarea' },
  ];
  const renderCard: CardRenderer<PriceQuote> = (r) => ({
    title: r.supplier,
    subtitle: r.date,
    meta: <Badge tone="green"><Money amount={r.price} /></Badge>,
  });
  return (
    <ResourceScreen<PriceQuote>
      table="price_quotes"
      title="عروض أسعار الموردين"
      fields={fields}
      searchColumns={['supplier', 'notes']}
      searchPlaceholder="ابحث باسم المورّد…"
      renderCard={renderCard}
    />
  );
}

function PriceListTab({ listName }: { listName: string }) {
  const fields: Field[] = [
    { key: 'list_name', label: 'القائمة', type: 'text', required: true },
    { key: 'material_id', label: 'المادة', type: 'foreign', table: 'materials', labelColumn: 'name' },
    { key: 'price', label: 'السعر', type: 'number', step: '0.01' },
    { key: 'unit', label: 'الوحدة', type: 'text', placeholder: 'متر / طن' },
  ];
  const renderCard: CardRenderer<PriceList> = (r) => ({
    title: r.unit ?? r.list_name,
    subtitle: r.list_name,
    meta: <Badge tone="brand"><Money amount={r.price} /></Badge>,
  });
  return (
    <ResourceScreen<PriceList>
      table="price_lists"
      title={`قائمة أسعار ${listName}`}
      fields={fields}
      searchColumns={['list_name', 'unit']}
      searchPlaceholder="ابحث في القائمة…"
      renderCard={renderCard}
      extraFilter={{ column: 'list_name', value: listName }}
    />
  );
}

function QuantitiesTab() {
  const fields: Field[] = [
    { key: 'material_id', label: 'المادة', type: 'foreign', table: 'materials', labelColumn: 'name', required: true },
    {
      key: 'building_type',
      label: 'نوع المبنى',
      type: 'select',
      options: [
        { value: 'villa', label: 'فيلا' },
        { value: 'apartment', label: 'شقة' },
      ],
    },
    { key: 'qty', label: 'الكمية', type: 'number', required: true, step: '0.01' },
  ];
  const renderCard: CardRenderer<Quantity> = (r) => ({
    title: r.building_type === 'villa' ? 'فيلا' : r.building_type === 'apartment' ? 'شقة' : '—',
    subtitle: 'الكمية: ' + (r.qty ?? '—'),
  });
  return (
    <ResourceScreen<Quantity>
      table="material_quantities"
      title="كميات المواد لكل مبنى"
      fields={fields}
      searchColumns={['building_type']}
      searchPlaceholder="ابحث بنوع المبنى…"
      renderCard={renderCard}
    />
  );
}
