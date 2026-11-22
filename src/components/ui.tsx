import type { ReactNode } from 'react';

export function AppHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <header className="bg-gradient-to-l from-brand-700 to-brand-600 text-white">
      <div className="flex items-center gap-3 px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 active:bg-white/25 transition"
            aria-label="رجوع"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-sm text-white/80">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="bg-sand-50 pb-28">{children}</div>;
}

export function SearchBar({ value, onChange, placeholder = 'بحث…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative px-4 py-3">
      <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-sand-400">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-sand-200 bg-white py-3 pr-12 pl-4 text-base text-sand-800 placeholder:text-sand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
      />
    </div>
  );
}

export function FAB({ onClick, label = 'إضافة' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="sticky bottom-4 z-20 mx-auto flex items-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/30 active:scale-95 transition"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sand-100 text-sand-400">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <p className="text-base font-semibold text-sand-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-sand-500">{hint}</p>}
    </div>
  );
}

export function ErrorView({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-base font-semibold text-red-600">{title}</p>
      {message && <p className="mt-1 max-w-xs break-words text-sm text-red-500">{message}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600" />
    </div>
  );
}
