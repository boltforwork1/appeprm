import { useState } from 'react';
import { ResourceScreen, type Field, type CardRenderer } from '@/components/ResourceScreen';
import { SectionTabs, type Tab } from '@/components/SectionTabs';
import { Badge, Money } from '@/components/card';
import { PageContainer } from '@/components/ui';

type Employee = Record<string, unknown> & { id: string; name: string; job_title?: string; daily_wage: number | null };
type Attendance = Record<string, unknown> & { id: string; employee_id?: string; date: string; status: string };
type Salary = Record<string, unknown> & { id: string; employee_id?: string; month: string; amount: number | null; paid: boolean };
type Leave = Record<string, unknown> & { id: string; employee_id?: string; start_date: string; end_date: string; reason?: string };

const tabs: Tab[] = [
  { key: 'employees', label: 'الموظفون' },
  { key: 'attendance', label: 'الحضور' },
  { key: 'salaries', label: 'المرتبات' },
  { key: 'leaves', label: 'الإجازات' },
];

const attendanceOptions = [
  { value: 'present', label: 'حاضر' },
  { value: 'absent', label: 'غائب' },
  { value: 'leave', label: 'إجازة' },
];

const attendanceTone: Record<string, 'green' | 'red' | 'amber'> = {
  present: 'green',
  absent: 'red',
  leave: 'amber',
};

export function EmployeesSection() {
  const [active, setActive] = useState('employees');
  return (
    <PageContainer>
      <SectionTabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-4">
        {active === 'employees' && <EmployeesTab />}
        {active === 'attendance' && <AttendanceTab />}
        {active === 'salaries' && <SalariesTab />}
        {active === 'leaves' && <LeavesTab />}
      </div>
    </PageContainer>
  );
}

function EmployeesTab() {
  const fields: Field[] = [
    { key: 'name', label: 'اسم الموظف', type: 'text', required: true },
    { key: 'job_title', label: 'الوظيفة', type: 'text', placeholder: 'نجار / حداد / عامل' },
    { key: 'daily_wage', label: 'الأجر اليومي', type: 'number', step: '0.01' },
    { key: 'phone', label: 'الهاتف', type: 'text' },
  ];
  const renderCard: CardRenderer<Employee> = (r) => ({
    title: r.name,
    subtitle: r.job_title,
    meta: r.daily_wage != null ? <Badge tone="brand"><Money amount={r.daily_wage} /></Badge> : undefined,
  });
  return (
    <ResourceScreen<Employee>
      table="employees"
      title="الموظفون"
      fields={fields}
      searchColumns={['name', 'job_title', 'phone']}
      searchPlaceholder="ابحث باسم الموظف…"
      renderCard={renderCard}
    />
  );
}

function AttendanceTab() {
  const fields: Field[] = [
    { key: 'employee_id', label: 'الموظف', type: 'foreign', table: 'employees', labelColumn: 'name', required: true },
    { key: 'date', label: 'التاريخ', type: 'date', required: true },
    { key: 'status', label: 'الحالة', type: 'select', options: attendanceOptions },
  ];
  const renderCard: CardRenderer<Attendance> = (r) => ({
    title: r.date,
    subtitle: 'سجل حضور',
    meta: <Badge tone={attendanceTone[r.status] ?? 'neutral'}>{attendanceOptions.find((o) => o.value === r.status)?.label ?? r.status}</Badge>,
  });
  return (
    <ResourceScreen<Attendance>
      table="attendance"
      title="الحضور والانصراف"
      fields={fields}
      searchColumns={['date']}
      searchPlaceholder="ابحث بالتاريخ…"
      renderCard={renderCard}
    />
  );
}

function SalariesTab() {
  const fields: Field[] = [
    { key: 'employee_id', label: 'الموظف', type: 'foreign', table: 'employees', labelColumn: 'name', required: true },
    { key: 'month', label: 'الشهر', type: 'text', required: true, placeholder: '2026-01' },
    { key: 'amount', label: 'المبلغ', type: 'number', required: true, step: '0.01' },
    {
      key: 'paid',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: 'false', label: 'غير مدفوع' },
        { value: 'true', label: 'مدفوع' },
      ],
    },
  ];
  const renderCard: CardRenderer<Salary> = (r) => ({
    title: r.month,
    subtitle: 'مرتب',
    meta: (
      <>
        <Badge tone="brand"><Money amount={r.amount} /></Badge>
        <Badge tone={r.paid ? 'green' : 'red'}>{r.paid ? 'مدفوع' : 'غير مدفوع'}</Badge>
      </>
    ),
  });
  return (
    <ResourceScreen<Salary>
      table="salaries"
      title="المرتبات"
      fields={fields}
      searchColumns={['month']}
      searchPlaceholder="ابحث بالشهر…"
      renderCard={renderCard}
    />
  );
}

function LeavesTab() {
  const fields: Field[] = [
    { key: 'employee_id', label: 'الموظف', type: 'foreign', table: 'employees', labelColumn: 'name', required: true },
    { key: 'start_date', label: 'من تاريخ', type: 'date', required: true },
    { key: 'end_date', label: 'إلى تاريخ', type: 'date', required: true },
    { key: 'reason', label: 'السبب', type: 'textarea' },
  ];
  const renderCard: CardRenderer<Leave> = (r) => ({
    title: `${r.start_date} ← ${r.end_date}`,
    subtitle: r.reason,
  });
  return (
    <ResourceScreen<Leave>
      table="leaves"
      title="الإجازات"
      fields={fields}
      searchColumns={['reason']}
      searchPlaceholder="ابحث في الإجازات…"
      renderCard={renderCard}
    />
  );
}
