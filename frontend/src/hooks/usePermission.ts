import { useAuthStore } from '@/store/authStore';

export function usePermission() {
  const can = useAuthStore((state) => state.can);
  const user = useAuthStore((state) => state.user);

  return {
    can,
    isSuperuser: user?.is_superuser ?? false,
  };
}
