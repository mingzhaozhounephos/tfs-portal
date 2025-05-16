import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';

export function useDashboard() {
  const { stats, loading, error, initialize, refresh } = useDashboardStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    stats,
    loading,
    error,
    refresh
  };
} 