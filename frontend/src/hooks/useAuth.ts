import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { accessToken, user, permissions, logout: storeLogout } = useAuthStore();
  const isAuthenticated = !!accessToken && !!user;

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const loginRes = await authApi.login(username, password);
        useAuthStore.getState().setTokens(
          loginRes.data.access_token,
          loginRes.data.refresh_token
        );

        const meRes = await authApi.getMe();
        const permRes = await authApi.getMyPermissions();
        useAuthStore.getState().setUser(meRes.data, permRes.data);

        navigate('/');
        return true;
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response: { data: { message: string } } }).response?.data?.message
            : 'Login failed';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      navigate('/login');
    }
  }, [navigate, storeLogout]);

  return {
    login,
    logout,
    user,
    permissions,
    isAuthenticated,
    isLoading,
    error,
  };
}
