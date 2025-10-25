import AppLayout from '@/components/AppLayout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ToastProvider } from '@/lib/contexts/ToastContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <AppLayout>{children}</AppLayout>
      </ToastProvider>
    </ProtectedRoute>
  );
}
