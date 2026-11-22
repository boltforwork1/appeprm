import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insertRow, softDeleteRow, updateRow, useList } from '@/lib/crud';
import { useForeignOptionsBatch, type ForeignRef } from '@/lib/optionsBatch';
import { AppHeader, EmptyState, ErrorView, FAB, Loading, PageContainer, SearchBar } from './ui';
import { DeleteButton, SelectField, Sheet, SubmitButton, TextAreaField, TextField } from './form';
import { ListCard } from './card';

const PAGE_SIZE = 50;

export type Field =
  | { key: string; label: string; type: 'text' | 'number' | 'textarea' | 'date'; required?: boolean; placeholder?: string; step?: string; defaultValue?: string; hidden?: boolean }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; required?: boolean; hidden?: boolean }
  | { key: string; label: string; type: 'boolean'; options: { value: string; label: string }[]; required?: boolean; hidden?: boolean }
  | { key: string; label: string; type: 'foreign'; table: string; labelColumn: string; filter?: { column: string; value: string }; required?: boolean; addRoute?: string; entityLabel?: string; hidden?: boolean };

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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const foreignFields = fields.filter((f): f is Extract<Field, { type: 'foreign' }> => f.type === 'foreign');
  const foreignRefs: ForeignRef[] = foreignFields.map((f) => ({ table: f.table, labelColumn: f.labelColumn, filter: f.filter }));
  const { map: foreignMap } = useForeignOptionsBatch(foreignRefs);

  const { rows, loading, error, reload } = useList<T>(table, { search, searchColumns, extraFilter });

  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = rows.length > visibleCount;

  const openAdd = useCallback(() => {
    setEditing(null);
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.type === 'select' || f.type === 'boolean') init[f.key] = f.options[0]?.value ?? '';
      else if (f.type === 'foreign') init[f.key] = '';
      else init[f.key] = f.defaultValue ?? '';
    });
    setForm(init);
    setFormError(null);
    setFieldErrors({});
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
      setFieldErrors({});
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
      } else if (f.type === 'boolean') {
        payload[f.key] = raw === '' ? null : raw === 'true';
      } else {
        payload[f.key] = raw === '' ? null : raw;
      }
    });
    return payload;
  }, [fields, form]);

  const save = useCallback(async () => {
    setFormError(null);
    const errors: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && (form[f.key] ?? '') === '') {
        errors[f.key] = 'هذا الحقل مطلوب';
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (editing) await updateRow<T>(table, editing.id, buildPayload() as Partial<T>);
      else await insertRow<T>(table, buildPayload() as Partial<T>);
      setSheetOpen(false);
      await reload();
    } catch (err) {
      const e = err as { code?: string; message?: string; details?: string; hint?: string };
      console.error(`[ResourceScreen:${table}:save]`, { code: e.code, message: e.message, details: e.details, hint: e.hint });
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
      const e = err as { code?: string; message?: string; details?: string; hint?: string };
      console.error(`[ResourceScreen:${table}:delete]`, { code: e.code, message: e.message, details: e.details, hint: e.hint });
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
        <>
          <div className="flex flex-col gap-2.5 px-4">
            {visibleRows.map((row) => {
              const card = renderCard(row);
              return <ListCard key={row.id} title={card.title} subtitle={card.subtitle} meta={card.meta} onClick={() => openEdit(row)} />;
            })}
          </div>
          {hasMore && (
            <div className="px-4 py-4">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full rounded-xl border border-sand-200 bg-white py-3 text-sm font-semibold text-brand-600 active:scale-[0.98] transition"
              >
                عرض المزيد ({rows.length - visibleCount} المتبقية)
              </button>
            </div>
          )}
        </>
      )}

      <div className="px-4 pb-4">
        <FAB onClick={openAdd} />
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? 'تعديل' : 'إضافة جديد'}
        footer={
          <>
            {formError && (
              <div className="mb-3 rounded-xl bg-red-50 p-3 text-center">
                <p className="text-sm font-semibold text-red-600">تعذّر الحفظ</p>
                <p className="mt-0.5 text-xs text-red-500 break-words">{formError}</p>
              </div>
            )}
            <SubmitButton label={editing ? 'حفظ التعديلات' : 'حفظ'} loading={saving} onClick={save} />
            {editing && <DeleteButton onClick={doDelete} loading={deleting} />}
          </>
        }
      >
        {fields.map((f) => {
          if (f.hidden) return null;
          if (f.type === 'textarea') {
            return (
              <TextAreaField
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                placeholder={f.placeholder}
                error={fieldErrors[f.key]}
              />
            );
          }
          if (f.type === 'select' || f.type === 'boolean') {
            return (
              <SelectField
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                options={f.options}
                error={fieldErrors[f.key]}
              />
            );
          }
          if (f.type === 'foreign') {
            const idx = foreignFields.indexOf(f);
            const opts = foreignMap[idx] ?? [];
            if (opts.length === 0) {
              return (
                <div key={f.key} className="mb-4 rounded-xl bg-amber-50 p-3.5 text-center">
                  <p className="text-sm font-semibold text-amber-800">أضف {f.entityLabel ?? 'عنصر'} أولاً</p>
                  {!f.required && <p className="mt-0.5 text-xs text-amber-600">هذا الحقل اختياري — يمكنك الحفظ بدونه</p>}
                  {f.addRoute && (
                    <button
                      onClick={() => { setSheetOpen(false); navigate(f.addRoute); }}
                      className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white active:scale-95 transition"
                    >
                      إضافة {f.entityLabel ?? 'عنصر'}
                    </button>
                  )}
                </div>
              );
            }
            const selectOptions = [
              ...(f.required ? [] : [{ value: '', label: 'بدون' }]),
              ...opts.map((o) => ({ value: o.id, label: o.label })),
            ];
            return (
              <SelectField
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                options={selectOptions}
                error={fieldErrors[f.key]}
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
              error={fieldErrors[f.key]}
            />
          );
        })}
      </Sheet>
    </PageContainer>
  );
}
