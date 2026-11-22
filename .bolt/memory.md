# Project memory

## Product intent & audience

- Business management app for a company with operations across employees, materials, warehouses, projects, clients, invoices, attendance, and finance.
- Runs inside a Capacitor Android WebView as a native-like mobile app (not a standard browser site).
- UI is in Arabic (RTL); "عرض المزيد" used for load-more.

## Brand personality & voice

- Production-quality, native-feeling mobile experience; not a responsive web page.
- Professional and practical; feature-complete over decorative.

## Visual design & UX direction

- App shell pattern: fixed top header + single scrollable main + fixed bottom nav on every page. Only main content scrolls; body/page never scrolls.
- Safe-area insets (`env(safe-area-inset-top/bottom)`) applied to header and bottom nav; viewport uses `viewport-fit=cover`.
- `100dvh` shell with `100vh` fallback; `h-full` / `flex-1` / `min-h-0` instead of `h-screen` / `min-h-screen`.
- Scroll area classes `.app-shell` and `.app-scroll` centralize native scroll quality (`-webkit-overflow-scrolling: touch`, `overscroll-behavior-y: contain`, `touch-action: pan-y`).
- Avoid heavy mobile perf costs: no large blur/backdrop-filter, no big box-shadows on list rows, no per-row animations; `will-change` only where needed.
- Long lists paginate at 50 items with a "load more" button instead of full render.
- Forms/dialogs: `max-h-[90dvh]`, internal scroll, pinned footer buttons, `scrollIntoView` on input focus; all inputs `font-size >= 16px` to prevent auto-zoom.
- FABs are `sticky` inside the scroll area, not `fixed`, so they clear the bottom nav.

## Decisions, constraints & rationale

- Stack: Vite + React + JSX, Tailwind CSS, Lucide React icons; `@/` alias maps to `src/`. No extra UI/icon packages.
- Reusable primitives live in `src/components/`: `ui.tsx` (AppHeader, PageContainer, FAB, SearchBar), `form.tsx` (Sheet), `card.tsx` (ListCard), `SectionTabs.tsx`, `BottomNav.tsx`, `ResourceScreen.tsx`.
- `ResourceScreen` is the generic CRUD screen pattern used by sections; handles list pagination and Sheet-based add/edit with footer actions.
- BottomNav is part of the flex column (not `fixed`/`translate`), keeping layout predictable across safe areas.
- SectionTabs stays sticky to the top of the scroll area (sub-header) while the main app header sits above the scroll area.
- Features and data logic are stable; layout/perf work must not alter them.

## Open questions & assumptions

- Assumed target is Android only via Capacitor; iOS safe-area behavior is untested.
- Pagination threshold fixed at 50; no virtualization yet (may be needed for very large datasets).
- RTL is handled by existing Arabic UI; no explicit `dir` handling was added in this pass.
- Global instructions live in `.bolt/prompt` and are authoritative; not duplicated here.