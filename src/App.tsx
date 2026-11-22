import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Login } from '@/screens/Login';
import { BottomNav } from '@/components/BottomNav';
import { MaterialsSection } from '@/screens/materials/MaterialsSection';
import { ProjectsSection } from '@/screens/projects/ProjectsSection';
import { WarehousesSection } from '@/screens/warehouses/WarehousesSection';
import { FinanceSection } from '@/screens/finance/FinanceSection';
import { EmployeesSection } from '@/screens/employees/EmployeesSection';
import { ClientsSection } from '@/screens/clients/ClientsSection';

function ConfigError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-sand-800">إعداد غير مكتمل</h1>
      <p className="mt-2 max-w-xs text-sm text-sand-600">
        يرجى إضافة عنوان URL ومفتاح Supabase في ملف <span dir="ltr" className="font-mono">.env</span> قبل تشغيل التطبيق.
      </p>
      <p className="mt-2 max-w-xs text-xs text-sand-500">
        استخدم <span dir="ltr" className="font-mono">.env.example</span> كنموذج، ثم أعد تشغيل التطبيق.
      </p>
    </div>
  );
}

function Protected() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600" />
      </div>
    );
  }
  if (!user) return <Login />;
  return (
    <div className="min-h-screen bg-sand-50">
      <Routes>
        <Route path="/materials/*" element={<MaterialsSection />} />
        <Route path="/projects/*" element={<ProjectsSection />} />
        <Route path="/warehouses/*" element={<WarehousesSection />} />
        <Route path="/finance/*" element={<FinanceSection />} />
        <Route path="/employees/*" element={<EmployeesSection />} />
        <Route path="/clients/*" element={<ClientsSection />} />
        <Route path="*" element={<Navigate to="/materials" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigError />;
  return (
    <AuthProvider>
      <HashRouter>
        <Protected />
      </HashRouter>
    </AuthProvider>
  );
}
