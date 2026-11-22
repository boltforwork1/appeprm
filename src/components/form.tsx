import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        ref={sheetRef}
        className="relative flex max-h-[90dvh] flex-col rounded-t-3xl bg-white shadow-2xl animate-slide-up"
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-sand-200" />
        <div className="mb-4 flex shrink-0 items-center justify-between px-5 pt-3">
          <h2 className="text-lg font-bold text-sand-800">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-100 text-sand-600 active:bg-sand-200 transition"
            aria-label="إغلاق"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="app-scroll px-5 pb-2">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-sand-100 bg-white px-5 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function scrollIntoViewOnFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  setTimeout(() => {
    e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 300);
}

export function TextField({ label, value, onChange, type = 'text', placeholder, step, error }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  error?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 block text-sm font-semibold text-sand-700">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={scrollIntoViewOnFocus}
        className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-base text-sand-800 placeholder:text-sand-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 outline-none transition"
      />
      {error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, error }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 block text-sm font-semibold text-sand-700">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        onFocus={scrollIntoViewOnFocus}
        className="w-full resize-none rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-base text-sand-800 placeholder:text-sand-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 outline-none transition"
      />
      {error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}
    </label>
  );
}

export function SelectField({ label, value, onChange, options, error }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 block text-sm font-semibold text-sand-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={scrollIntoViewOnFocus}
        className="w-full appearance-none rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-base text-sand-800 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 outline-none transition"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1rem center' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}
    </label>
  );
}

export function SubmitButton({ label, loading, onClick }: { label: string; loading?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="mt-2 w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.98] disabled:opacity-60 transition"
    >
      {loading ? 'جارٍ الحفظ…' : label}
    </button>
  );
}

export function DeleteButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="mt-3 w-full rounded-2xl border-2 border-red-200 bg-red-50 py-3 text-base font-semibold text-red-600 active:scale-[0.98] disabled:opacity-60 transition"
    >
      {loading ? 'جارٍ الحذف…' : 'حذف'}
    </button>
  );
}
