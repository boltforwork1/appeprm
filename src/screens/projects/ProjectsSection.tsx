import { useState } from 'react';
import { ResourceScreen, type Field, type CardRenderer } from '@/components/ResourceScreen';
import { SectionTabs, type Tab } from '@/components/SectionTabs';
import { Badge } from '@/components/card';
import { PageContainer } from '@/components/ui';

type Project = Record<string, unknown> & {
  id: string;
  name: string;
  client_id?: string;
  progress_percent: number | null;
  engineer?: string;
  foreman?: string;
  status?: string;
};
type DailyNote = Record<string, unknown> & { id: string; text?: string; photo_url?: string; date: string; project_id?: string };

const tabs: Tab[] = [
  { key: 'projects', label: 'المشاريع' },
  { key: 'notes', label: 'ملاحظات اليوم' },
];

const statusOptions = [
  { value: 'planning', label: 'تخطيط' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'paused', label: 'متوقف' },
  { value: 'completed', label: 'مكتمل' },
];

const statusTone: Record<string, 'neutral' | 'brand' | 'amber' | 'green'> = {
  planning: 'neutral',
  in_progress: 'brand',
  paused: 'amber',
  completed: 'green',
};

export function ProjectsSection() {
  const [active, setActive] = useState('projects');
  return (
    <PageContainer>
      <SectionTabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-3">
        {active === 'projects' && <ProjectsTab />}
        {active === 'notes' && <NotesTab />}
      </div>
    </PageContainer>
  );
}

function ProjectsTab() {
  const fields: Field[] = [
    { key: 'name', label: 'اسم المشروع', type: 'text', required: true, placeholder: 'فيلا الشيخ محمد' },
    { key: 'client_id', label: 'العميل', type: 'foreign', table: 'clients', labelColumn: 'name' },
    { key: 'progress_percent', label: 'نسبة الإنجاز %', type: 'number', step: '1' },
    { key: 'engineer', label: 'المهندس', type: 'text' },
    { key: 'foreman', label: 'المراقب', type: 'text' },
    { key: 'status', label: 'الحالة', type: 'select', options: statusOptions },
  ];
  const renderCard: CardRenderer<Project> = (r) => ({
    title: r.name,
    subtitle: [r.engineer, r.foreman].filter(Boolean).join(' · '),
    meta: (
      <>
        <Badge tone="brand">{r.progress_percent ?? 0}%</Badge>
        {r.status && <Badge tone={statusTone[r.status] ?? 'neutral'}>{statusOptions.find((o) => o.value === r.status)?.label ?? r.status}</Badge>}
      </>
    ),
  });
  return (
    <ResourceScreen<Project>
      table="projects"
      title="المشاريع والمواقع"
      fields={fields}
      searchColumns={['name', 'engineer', 'foreman']}
      searchPlaceholder="ابحث باسم المشروع أو المهندس…"
      renderCard={renderCard}
    />
  );
}

function NotesTab() {
  const fields: Field[] = [
    { key: 'project_id', label: 'المشروع', type: 'foreign', table: 'projects', labelColumn: 'name', required: true },
    { key: 'date', label: 'التاريخ', type: 'date', required: true },
    { key: 'text', label: 'الملاحظة', type: 'textarea', required: true },
    { key: 'photo_url', label: 'رابط الصورة', type: 'text', placeholder: 'https://…' },
  ];
  const renderCard: CardRenderer<DailyNote> = (r) => ({
    title: r.date,
    subtitle: r.text,
  });
  return (
    <ResourceScreen<DailyNote>
      table="daily_notes"
      title="ملاحظات اليوم"
      fields={fields}
      searchColumns={['text']}
      searchPlaceholder="ابحث في الملاحظات…"
      renderCard={renderCard}
    />
  );
}
