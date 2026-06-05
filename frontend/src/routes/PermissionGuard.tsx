import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const can = useAuthStore((s) => s.can);

  if (!can(permission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
