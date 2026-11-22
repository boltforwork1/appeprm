import type { ReactNode } from 'react';

export function ListCard({
  title,
  subtitle,
  meta,
  trailing,
  onClick,
}: {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-right ring-1 ring-sand-100 active:scale-[0.99] transition"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-sand-800">{title}</p>
        {subtitle && <p className="truncate text-sm text-sand-500">{subtitle}</p>}
        {meta && <div className="mt-2 flex flex-wrap gap-2">{meta}</div>}
      </div>
      {trailing ?? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-sand-300" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      )}
    </button>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'green' | 'amber' | 'red' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-sand-100 text-sand-600',
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Money({ amount, currency = 'ج.م' }: { amount: number | null | undefined; currency?: string }) {
  const value = Number(amount ?? 0);
  const text = value.toLocaleString('ar-EG', { maximumFractionDigits: 2 });
  return <span className="font-semibold text-sand-800">{text} <span className="text-xs font-normal text-sand-500">{currency}</span></span>;
}
