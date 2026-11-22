import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message?: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
    } catch (err) {
      const e = err as { message?: string };
      console.error('[Login]', e);
      setError({
        title: mode === 'signin' ? 'تعذّر تسجيل الدخول' : 'تعذّر إنشاء الحساب',
        message: e.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell bg-gradient-to-b from-brand-700 via-brand-600 to-brand-800">
      <div className="app-scroll flex flex-col justify-center px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">علام ERP</h1>
          <p className="mt-1 text-brand-100">نظام إدارة شركات الإنشاءات</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex rounded-2xl bg-sand-100 p-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === 'signin' ? 'bg-white text-brand-700 shadow-sm' : 'text-sand-500'}`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === 'signup' ? 'bg-white text-brand-700 shadow-sm' : 'text-sand-500'}`}
            >
              حساب جديد
            </button>
          </div>

          <label className="block mb-4">
            <span className="mb-1.5 block text-sm font-semibold text-sand-700">البريد الإلكتروني</span>
            <input
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-base text-sand-800 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 outline-none transition text-left"
            />
          </label>

          <label className="block mb-5">
            <span className="mb-1.5 block text-sm font-semibold text-sand-700">كلمة المرور</span>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-base text-sand-800 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 outline-none transition text-left"
            />
          </label>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-center">
              <p className="text-sm font-semibold text-red-600">{error.title}</p>
              {error.message && <p className="mt-0.5 text-xs text-red-500 break-words">{error.message}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.98] disabled:opacity-60 transition"
          >
            {loading ? 'جارٍ المعالجة…' : mode === 'signin' ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-brand-100/80">
          جميع الشاشات تتطلب تسجيل الدخول
        </p>
      </div>
    </div>
  );
}
