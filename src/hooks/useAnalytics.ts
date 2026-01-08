import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService, type AnalyticsData, type DailyData } from '../services/analyticsService';

export const useAnalytics = (userId?: string | null) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [analyticsData, weeklyData] = await Promise.all([
        AnalyticsService.getAnalytics(userId, timeRange),
        AnalyticsService.getWeeklyData(userId)
      ]);
      
      setAnalytics(analyticsData);
      setWeeklyData(weeklyData);
    } catch (err) {
      setError('Error al cargar las analíticas');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, timeRange]);

  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    weeklyData,
    loading,
    error,
    timeRange,
    setTimeRange,
    refreshAnalytics
  };
};