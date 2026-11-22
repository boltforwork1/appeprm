import type { ReactNode } from 'react';

export type Tab = { key: string; label: string };

export function SectionTabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (k: string) => void; children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-l from-brand-700 to-brand-600 text-white shadow-md">
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                active === t.key ? 'bg-white text-brand-700 shadow-sm' : 'bg-white/15 text-white active:bg-white/25'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
