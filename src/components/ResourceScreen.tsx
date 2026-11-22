import { useCallback, useState } from 'react';
import { insertRow, softDeleteRow, updateRow, useList } from '@/lib/crud';
import { useForeignOptionsBatch, type ForeignRef } from '@/lib/optionsBatch';
import { AppHeader, EmptyState, ErrorView, FAB, Loading, PageContainer, SearchBar } from './ui';
import { DeleteButton, SelectField, Sheet, SubmitButton, TextAreaField, TextField } from './form';
import { ListCard } from './card';

export type Field =
  | { key: string; label: string; type: 'text' | 'number' | 'textarea' | 'date'; required?: boolean; placeholder?: string; step?: string }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; required?: boolean }
  | { key: string; label: string; type: 'foreign'; table: string; labelColumn: string; filter?: { column: string; value: string }; required?: boolean };

export type CardRenderer<T> = (row: T) => { title: string; subtitle?: string; meta?: React.ReactNode };

export function ResourceScreen<T extends Record<string, unknown> & { id: string }>(props: {
  table: string;
  title: string;
  subtitle?: string;
  fields: Field[];
  searchColumns: string[];
  searchPlaceholder?: string;
  renderCard: CardRenderer<T>;
  extraFilter?: { column: string; value: string };
}) {
  const { table, title, fields, searchColumns, searchPlaceholder, renderCard, extraFilter } = props;
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const foreignFields = fields.filter((f): f is Extract<Field, { type: 'foreign' }> => f.type === 'foreign');
  const foreignRefs: ForeignRef[] = foreignFields.map((f) => ({ table: f.table, labelColumn: f.labelColumn, filter: f.filter }));
  const { map: foreignMap } = useForeignOptionsBatch(foreignRefs);

  const { rows, loading, error, reload } = useList<T>(table, { search, searchColumns, extraFilter });

  const openAdd = useCallback(() => {
    setEditing(null);
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.type === 'select') init[f.key] = f.options[0]?.value ?? '';
      else init[f.key] = '';
    });
    setForm(init);
    setFormError(null);
    setSheetOpen(true);
  }, [fields]);

  const openEdit = useCallback(
    (row: T) => {
      setEditing(row);
      const init: Record<string, string> = {};
      fields.forEach((f) => {
        const v = row[f.key];
        init[f.key] = v === null || v === undefined ? '' : String(v);
      });
      setForm(init);
      setFormError(null);
      setSheetOpen(true);
    },
    [fields]
  );

  const buildPayload = useCallback((): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      const raw = form[f.key] ?? '';
      if (f.type === 'number') {
        payload[f.key] = raw === '' ? null : Number(raw);
      } else {
        payload[f.key] = raw === '' ? null : raw;
      }
    });
    return payload;
  }, [fields, form]);

  const save = useCallback(async () => {
    setFormError(null);
    for (const f of fields) {
      if (f.required && (form[f.key] ?? '') === '') {
        setFormError('يرجى تعبئة جميع الحقول المطلوبة');
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) await updateRow<T>(table, editing.id, buildPayload());
      else await insertRow<T>(table, buildPayload());
      setSheetOpen(false);
      await reload();
    } catch (err) {
      const e = err as { message?: string };
      console.error(`[ResourceScreen:${table}:save]`, e);
      setFormError(e.message ?? 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  }, [fields, form, editing, table, buildPayload, reload]);

  const doDelete = useCallback(async () => {
    if (!editing) return;
    setDeleting(true);
    try {
      await softDeleteRow(table, editing.id);
      setSheetOpen(false);
      await reload();
    } catch (err) {
      const e = err as { message?: string };
      console.error(`[ResourceScreen:${table}:delete]`, e);
      setFormError(e.message ?? 'تعذّر الحذف');
    } finally {
      setDeleting(false);
    }
  }, [editing, table, reload]);

  const subtitle = props.subtitle ?? (rows.length > 0 ? `${rows.length} عنصر` : undefined);

  return (
    <PageContainer>
      <AppHeader title={title} subtitle={subtitle} />
      <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder ?? 'بحث…'} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView title="تعذّر تحميل البيانات" message={error} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد عناصر بعد" hint="اضغط زر الإضافة لإنشاء أول عنصر" />
      ) : (
        <div className="flex flex-col gap-2.5 px-4">
          {rows.map((row) => {
            const card = renderCard(row);
            return <ListCard key={row.id} title={card.title} subtitle={card.subtitle} meta={card.meta} onClick={() => openEdit(row)} />;
          })}
        </div>
      )}

      <FAB onClick={openAdd} />

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'تعديل' : 'إضافة جديد'}>
        {fields.map((f) => {
          if (f.type === 'textarea') {
            return (
              <TextAreaField
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                placeholder={f.placeholder}
              />
            );
          }
          if (f.type === 'select') {
            return (
              <SelectField
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                options={f.options}
              />
            );
          }
          if (f.type === 'foreign') {
            const idx = foreignFields.indexOf(f);
            const opts = foreignMap[idx] ?? [];
            return (
              <SelectField
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                options={opts}
              />
            );
          }
          return (
            <TextField
              key={f.key}
              label={f.label + (f.required ? ' *' : '')}
              value={form[f.key] ?? ''}
              onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
              type={f.type}
              step={f.step}
              placeholder={f.placeholder}
            />
          );
        })}

        {formError && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-center">
            <p className="text-sm font-semibold text-red-600">حدث خطأ</p>
            <p className="mt-0.5 text-xs text-red-500 break-words">{formError}</p>
          </div>
        )}

        <SubmitButton label={editing ? 'حفظ التعديلات' : 'حفظ'} loading={saving} onClick={save} />
        {editing && <DeleteButton onClick={doDelete} loading={deleting} />}
      </Sheet>
    </PageContainer>
  );
}
