import { supabase, isSupabaseEnabled } from './supabase/client';

// Interfaces
export interface AnalyticsData {
  reading: {
    totalPages: number;
    avgPagesPerDay: number;
    totalBooks: number;
    currentStreak: number;
    maxStreak: number;
    readingSpeed: number;
    pagesPerWeek: number[];
    favoriteTime: string;
    completionRate: number;
  };
  habits: {
    totalCompleted: number;
    completionRate: number;
    bestHabit: string;
    worstHabit: string;
    streak: number;
    consistency: number;
    dailyAverage: number;
  };
  cognitive: {
    totalSessions: number;
    totalPoints: number;
    avgScore: number;
    bestCategory: string;
    improvement: number;
    lastScore: number;
  };
  productivity: {
    totalStudyHours: number;
    avgSessionDuration: number;
    mostProductiveTime: string;
    activitiesCompleted: number;
    efficiency: number;
    focusTime: number;
    score: number;
  };
  timeRange: 'week' | 'month' | 'year' | 'all';
}

export interface DailyData {
  date: string;
  day: string;
  pages: number;
  habits: number;
  hours: number;
  score: number;
}

export class AnalyticsService {
  // ============================================
  // MÉTRICAS PRINCIPALES
  // ============================================
  static async getAnalytics(userId?: string | null, timeRange: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<AnalyticsData> {
    // Si no hay userId o es usuario local, usar datos locales
    if (!userId || userId === 'local-user') {
      return this.getLocalAnalytics();
    }

    // Si no hay Supabase, usar datos locales
    if (!isSupabaseEnabled()) {
      return this.getLocalAnalytics();
    }

    try {
      const [
        readingData,
        habitsData,
        progressData,
        booksData
      ] = await Promise.all([
        this.getReadingAnalytics(userId, timeRange),
        this.getHabitsAnalytics(userId, timeRange),
        this.getProductivityAnalytics(userId, timeRange),
        this.getBooksAnalytics(userId)
      ]);

      const cognitiveData = await this.getCognitiveAnalytics(userId, timeRange);

      return {
        reading: readingData,
        habits: habitsData,
        cognitive: cognitiveData,
        productivity: progressData,
        timeRange
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return this.getLocalAnalytics();
    }
  }

  // ============================================
  // ANÁLISIS DE LECTURA
  // ============================================
  private static async getReadingAnalytics(userId: string, timeRange: string) {
    const daysLimit = this.getTimeRangeLimit(timeRange);
    const date = new Date();
    date.setDate(date.getDate() - daysLimit);

    const { data: dailyProgress, error } = await supabase!
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', date.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting daily progress:', error);
      return this.getDefaultReadingAnalytics();
    }

    const { data: books } = await supabase!
      .from('books')
      .select('*')
      .eq('user_id', userId);

    const totalPages = dailyProgress?.reduce((sum, day) => sum + (day.pages_read || 0), 0) || 0;
    const daysCount = dailyProgress?.length || 1;
    const avgPagesPerDay = totalPages / daysCount;
    
    const completedBooks = books?.filter(b => b.status === 'completed').length || 0;
    const pagesPerWeek = this.calculatePagesPerWeek(dailyProgress || []);
    
    const totalHours = dailyProgress?.reduce((sum, day) => sum + (day.study_hours || 0), 0) || 0;
    const readingSpeed = totalHours > 0 ? totalPages / (totalHours * 60) : 0;

    const favoriteTime = this.calculateFavoriteTime();
    const completionRate = Math.round((completedBooks / (books?.length || 1)) * 100);

    const { data: profile } = await supabase!
      .from('user_profiles')
      .select('streak')
      .eq('id', userId)
      .single();

    return {
      totalPages,
      avgPagesPerDay: Math.round(avgPagesPerDay),
      totalBooks: completedBooks,
      currentStreak: profile?.streak || 0,
      maxStreak: profile?.streak || 0,
      readingSpeed: Math.round(readingSpeed * 100) / 100,
      pagesPerWeek,
      favoriteTime,
      completionRate
    };
  }

  // ============================================
  // ANÁLISIS DE HÁBITOS
  // ============================================
  private static async getHabitsAnalytics(userId: string, timeRange: string) {
    const daysLimit = this.getTimeRangeLimit(timeRange);
    const date = new Date();
    date.setDate(date.getDate() - daysLimit);

    const { data: habits, error: habitsError } = await supabase!
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('order_index');

    const { data: tracking, error: trackingError } = await supabase!
      .from('habit_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', date.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (habitsError || trackingError) {
      console.error('Error getting habits data:', habitsError || trackingError);
      return this.getDefaultHabitsAnalytics();
    }

    const totalHabits = habits?.length || 0;
    const totalTrackingDays = tracking?.length || 1;
    const totalCompleted = tracking?.filter(t => t.completed).length || 0;
    const completionRate = totalTrackingDays > 0 
      ? (totalCompleted / (totalTrackingDays * totalHabits)) * 100 
      : 0;

    const { bestHabit, worstHabit } = this.calculateBestWorstHabits(habits || [], tracking || []);
    const streak = this.calculateHabitStreak(tracking || []);
    const consistency = this.calculateConsistency(tracking || []);
    const dailyAverage = totalTrackingDays > 0 ? totalCompleted / totalTrackingDays : 0;

    return {
      totalCompleted,
      completionRate: Math.round(completionRate),
      bestHabit,
      worstHabit,
      streak,
      consistency: Math.round(consistency),
      dailyAverage: Math.round(dailyAverage * 10) / 10
    };
  }

  // ============================================
  // ANÁLISIS DE PRODUCTIVIDAD
  // ============================================
  private static async getProductivityAnalytics(userId: string, timeRange: string) {
    const daysLimit = this.getTimeRangeLimit(timeRange);
    const date = new Date();
    date.setDate(date.getDate() - daysLimit);

    const { data: progress, error } = await supabase!
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', date.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting productivity data:', error);
      return this.getDefaultProductivityAnalytics();
    }

    const totalStudyHours = progress?.reduce((sum, day) => sum + (day.study_hours || 0), 0) || 0;
    const totalDays = progress?.length || 1;
    const avgSessionDuration = totalDays > 0 ? (totalStudyHours * 60) / totalDays : 0;
    const mostProductiveTime = this.calculateMostProductiveTime(progress || []);
    
    const activitiesCompleted = progress?.reduce((sum, day) => 
      sum + (day.habits_completed || 0) + (day.pages_read > 0 ? 1 : 0), 0
    ) || 0;

    const totalPages = progress?.reduce((sum, day) => sum + (day.pages_read || 0), 0) || 0;
    const efficiency = totalStudyHours > 0 ? totalPages / totalStudyHours : 0;
    const focusTime = totalDays > 0 ? totalStudyHours / totalDays : 0;

    const score = this.calculateProductivityScore({
      completionRate: (progress?.reduce((sum, day) => sum + (day.habits_completed || 0), 0) || 0) / (totalDays * 5) * 100,
      pagesPerDay: totalPages / totalDays,
      consistency: this.calculateConsistencyFromProgress(progress || []),
      studyHoursPerDay: focusTime
    });

    return {
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      avgSessionDuration: Math.round(avgSessionDuration),
      mostProductiveTime,
      activitiesCompleted,
      efficiency: Math.round(efficiency * 10) / 10,
      focusTime: Math.round(focusTime * 10) / 10,
      score: Math.round(score)
    };
  }

  // ============================================
  // ANÁLISIS DE LIBROS
  // ============================================
  private static async getBooksAnalytics(userId: string) {
    const { data: books, error } = await supabase!
      .from('books')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting books:', error);
      return 0;
    }

    return books?.length || 0;
  }

  // ============================================
  // ANÁLISIS COGNITIVO
  // ============================================
  private static async getCognitiveAnalytics(userId: string, timeRange: string) {
    // Por ahora retornar datos simulados
    // En producción, crearías una tabla cognitive_sessions
    return {
      totalSessions: 12,
      totalPoints: 850,
      avgScore: 71,
      bestCategory: 'Memoria',
      improvement: 15,
      lastScore: 78
    };
  }

  // ============================================
  // DATOS SEMANALES
  // ============================================
  static async getWeeklyData(userId?: string | null): Promise<DailyData[]> {
    // Si no hay userId o es usuario local, generar datos locales
    if (!userId || userId === 'local-user') {
      return this.generateLocalWeeklyData();
    }

    // Si no hay Supabase, generar datos locales
    if (!isSupabaseEnabled()) {
      return this.generateLocalWeeklyData();
    }

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const { data: progress, error } = await supabase!
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error getting weekly data:', error);
        return this.generateLocalWeeklyData();
      }

      const { data: habitsTracking } = await supabase!
        .from('habit_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const daysMap = new Map<string, DailyData>();

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];

        daysMap.set(dateStr, {
          date: dateStr,
          day: dayName,
          pages: 0,
          habits: 0,
          hours: 0,
          score: 0
        });
      }

      progress?.forEach(day => {
        if (daysMap.has(day.date)) {
          const dayData = daysMap.get(day.date)!;
          dayData.pages = day.pages_read || 0;
          dayData.hours = day.study_hours || 0;
        }
      });

      habitsTracking?.forEach(track => {
        if (daysMap.has(track.date)) {
          const dayData = daysMap.get(track.date)!;
          if (track.completed) {
            dayData.habits++;
          }
        }
      });

      Array.from(daysMap.values()).forEach(dayData => {
        dayData.score = this.calculateDailyScore(dayData);
      });

      return Array.from(daysMap.values());
    } catch (error) {
      console.error('Error processing weekly data:', error);
      return this.generateLocalWeeklyData();
    }
  }

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  private static getTimeRangeLimit(timeRange: string): number {
    switch (timeRange) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
      default: return 1000;
    }
  }

  private static calculatePagesPerWeek(dailyProgress: any[]): number[] {
    const weeks = [0, 0, 0, 0];
    const today = new Date();
    
    dailyProgress.forEach(day => {
      const dayDate = new Date(day.date);
      const weekDiff = Math.floor((today.getTime() - dayDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weekDiff < 4) {
        weeks[3 - weekDiff] += day.pages_read || 0;
      }
    });
    
    return weeks;
  }

  private static calculateFavoriteTime(): string {
    const times = ['06:00 - 09:00', '09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00', '21:00 - 00:00'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private static calculateBestWorstHabits(habits: any[], tracking: any[]) {
    if (habits.length === 0) {
      return { bestHabit: 'N/A', worstHabit: 'N/A' };
    }

    const habitStats = habits.map(habit => {
      const habitTracking = tracking.filter(t => t.habit_id === habit.id);
      const completionRate = habitTracking.length > 0 
        ? (habitTracking.filter(t => t.completed).length / habitTracking.length) * 100 
        : 0;
      
      return {
        name: habit.name,
        rate: completionRate
      };
    });

    habitStats.sort((a, b) => b.rate - a.rate);

    return {
      bestHabit: habitStats[0]?.name || 'N/A',
      worstHabit: habitStats[habitStats.length - 1]?.name || 'N/A'
    };
  }

  private static calculateHabitStreak(tracking: any[]): number {
    const sortedDates = [...new Set(tracking.map(t => t.date))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = today;
    
    for (const date of sortedDates) {
      if (date === currentDate) {
        const dayHasCompletedHabit = tracking
          .filter(t => t.date === date)
          .some(t => t.completed);
        
        if (dayHasCompletedHabit) {
          streak++;
          
          const prevDate = new Date(date);
          prevDate.setDate(prevDate.getDate() - 1);
          currentDate = prevDate.toISOString().split('T')[0];
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static calculateConsistency(tracking: any[]): number {
    if (tracking.length === 0) return 0;
    
    const uniqueDates = [...new Set(tracking.map(t => t.date))];
    const datesWithHabits = uniqueDates.filter(date => {
      return tracking.filter(t => t.date === date && t.completed).length > 0;
    });
    
    return (datesWithHabits.length / uniqueDates.length) * 100;
  }

  private static calculateMostProductiveTime(progress: any[]): string {
    if (progress.length === 0) return 'N/A';
    
    const timeSlots = [
      { range: '06:00 - 09:00', score: 0 },
      { range: '09:00 - 12:00', score: 0 },
      { range: '12:00 - 15:00', score: 0 },
      { range: '15:00 - 18:00', score: 0 },
      { range: '18:00 - 21:00', score: 0 },
      { range: '21:00 - 00:00', score: 0 }
    ];
    
    progress.forEach(day => {
      const pages = day.pages_read || 0;
      const hours = day.study_hours || 0;
      const productivity = pages * hours;
      
      timeSlots.forEach((slot, index) => {
        slot.score += productivity * (0.8 - index * 0.1);
      });
    });
    
    timeSlots.sort((a, b) => b.score - a.score);
    return timeSlots[0].range;
  }

  private static calculateProductivityScore(metrics: {
    completionRate: number;
    pagesPerDay: number;
    consistency: number;
    studyHoursPerDay: number;
  }): number {
    const weights = {
      completionRate: 0.3,
      pagesPerDay: 0.3,
      consistency: 0.2,
      studyHoursPerDay: 0.2
    };
    
    const normalized = {
      completionRate: Math.min(metrics.completionRate, 100) / 100,
      pagesPerDay: Math.min(metrics.pagesPerDay / 50, 1),
      consistency: Math.min(metrics.consistency, 100) / 100,
      studyHoursPerDay: Math.min(metrics.studyHoursPerDay / 8, 1)
    };
    
    const score = 
      normalized.completionRate * weights.completionRate +
      normalized.pagesPerDay * weights.pagesPerDay +
      normalized.consistency * weights.consistency +
      normalized.studyHoursPerDay * weights.studyHoursPerDay;
    
    return score * 100;
  }

  private static calculateConsistencyFromProgress(progress: any[]): number {
    if (progress.length === 0) return 0;
    
    const daysWithActivity = progress.filter(day => 
      (day.pages_read || 0) > 0 || (day.habits_completed || 0) > 0
    ).length;
    
    return (daysWithActivity / progress.length) * 100;
  }

  private static calculateDailyScore(day: DailyData): number {
    const maxPages = 100;
    const maxHabits = 5;
    const maxHours = 8;
    
    const pageScore = (day.pages / maxPages) * 40;
    const habitScore = (day.habits / maxHabits) * 40;
    const hourScore = (day.hours / maxHours) * 20;
    
    return Math.min(pageScore + habitScore + hourScore, 100);
  }

  // ============================================
  // DATOS LOCALES (FALLBACK)
  // ============================================
  private static getLocalAnalytics(): AnalyticsData {
    try {
      const readingSessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
      const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
      const state = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');

      const totalPages = readingSessions.reduce((sum: number, s: any) => sum + (s.pages || 0), 0);
      const habitDays = Object.keys(habitHistory);
      const totalHabitsCompleted = habitDays.reduce((sum: number, day: string) => {
        const dayHabits = habitHistory[day] || [];
        return sum + dayHabits.filter((h: boolean) => h).length;
      }, 0);

      return {
        reading: {
          totalPages,
          avgPagesPerDay: readingSessions.length > 0 ? Math.round(totalPages / readingSessions.length) : 0,
          totalBooks: state.reading?.plan?.reduce((sum: number, p: any) => sum + p.completed, 0) || 0,
          currentStreak: state.user?.streak || 0,
          maxStreak: state.user?.streak || 0,
          readingSpeed: 0.8,
          pagesPerWeek: [0, 0, 0, 0],
          favoriteTime: '09:00 - 12:00',
          completionRate: 0
        },
        habits: {
          totalCompleted: totalHabitsCompleted,
          completionRate: habitDays.length > 0 ? Math.round((totalHabitsCompleted / (habitDays.length * 5)) * 100) : 0,
          bestHabit: 'Lectura Profunda',
          worstHabit: 'Ejercicio Físico',
          streak: 0,
          consistency: 0,
          dailyAverage: 0
        },
        cognitive: {
          totalSessions: 0,
          totalPoints: 0,
          avgScore: 0,
          bestCategory: 'N/A',
          improvement: 0,
          lastScore: 0
        },
        productivity: {
          totalStudyHours: Math.round(totalPages / 10),
          avgSessionDuration: 45,
          mostProductiveTime: '09:00 - 12:00',
          activitiesCompleted: totalHabitsCompleted,
          efficiency: 8.5,
          focusTime: 1.5,
          score: Math.round((totalPages / 100 + totalHabitsCompleted / 50) * 50)
        },
        timeRange: 'month'
      };
    } catch (error) {
      console.error('Error loading local analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  private static generateLocalWeeklyData(): DailyData[] {
    try {
      const readingSessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
      const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');

      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const today = new Date();
      
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const daySessions = readingSessions.filter((s: any) => 
          s.date && s.date.startsWith(dateStr)
        );
        const pages = daySessions.reduce((sum: number, s: any) => sum + (s.pages || 0), 0);
        
        const dayHabits = habitHistory[dateStr];
        const habits = dayHabits ? dayHabits.filter((h: boolean) => h).length : 0;
        
        const hours = pages > 0 ? Math.min(pages / 10, 8) : 0;
        
        return {
          date: dateStr,
          day: days[date.getDay()],
          pages,
          habits,
          hours: Math.round(hours * 10) / 10,
          score: Math.min(pages + (habits * 20) + (hours * 10), 100)
        };
      });
    } catch (error) {
      console.error('Error generating local weekly data:', error);
      return this.generateSampleWeeklyData();
    }
  }

  private static generateSampleWeeklyData(): DailyData[] {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        day: days[date.getDay()],
        pages: Math.floor(Math.random() * 30),
        habits: Math.floor(Math.random() * 5),
        hours: Math.floor(Math.random() * 8),
        score: Math.floor(Math.random() * 100)
      };
    });
  }

  private static getDefaultAnalytics(): AnalyticsData {
    return {
      reading: {
        totalPages: 0,
        avgPagesPerDay: 0,
        totalBooks: 0,
        currentStreak: 0,
        maxStreak: 0,
        readingSpeed: 0,
        pagesPerWeek: [0, 0, 0, 0],
        favoriteTime: 'N/A',
        completionRate: 0
      },
      habits: {
        totalCompleted: 0,
        completionRate: 0,
        bestHabit: 'N/A',
        worstHabit: 'N/A',
        streak: 0,
        consistency: 0,
        dailyAverage: 0
      },
      cognitive: {
        totalSessions: 0,
        totalPoints: 0,
        avgScore: 0,
        bestCategory: 'N/A',
        improvement: 0,
        lastScore: 0
      },
      productivity: {
        totalStudyHours: 0,
        avgSessionDuration: 0,
        mostProductiveTime: 'N/A',
        activitiesCompleted: 0,
        efficiency: 0,
        focusTime: 0,
        score: 0
      },
      timeRange: 'month'
    };
  }

  private static getDefaultReadingAnalytics() {
    return {
      totalPages: 0,
      avgPagesPerDay: 0,
      totalBooks: 0,
      currentStreak: 0,
      maxStreak: 0,
      readingSpeed: 0,
      pagesPerWeek: [0, 0, 0, 0],
      favoriteTime: 'N/A',
      completionRate: 0
    };
  }

  private static getDefaultHabitsAnalytics() {
    return {
      totalCompleted: 0,
      completionRate: 0,
      bestHabit: 'N/A',
      worstHabit: 'N/A',
      streak: 0,
      consistency: 0,
      dailyAverage: 0
    };
  }

  private static getDefaultProductivityAnalytics() {
    return {
      totalStudyHours: 0,
      avgSessionDuration: 0,
      mostProductiveTime: 'N/A',
      activitiesCompleted: 0,
      efficiency: 0,
      focusTime: 0,
      score: 0
    };
  }
}