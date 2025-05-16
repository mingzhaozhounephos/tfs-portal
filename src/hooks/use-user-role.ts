import { useEffect } from 'react';
import { useUserRoleStore } from '@/store/user-role-store';

export function useUserRole() {
  const { role, loading, error, initialize, refresh } = useUserRoleStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    role,
    loading,
    error,
    refresh
  };
} 