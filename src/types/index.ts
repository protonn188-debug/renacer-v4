export interface User {
    codename: string;
    goal: string;
    level: string;
    workMode: boolean;
    streak: number;
    dailyPages: number;
}

export interface Book {
    title: string;
    author: string;
    totalPages: number;
    currentPage: number;
    progress: number;
    category: string;
    quote: string;
}

export interface ReadingPlanBlock {
    period: string;
    category: string;
    books: number;
    completed: number;
}

export interface Habit {
    id: number;
    name: string;
    icon: string;
    frequency: string;
    completed: boolean;
}

export interface PrivacyTask {
    id: number;
    task: string;
    priority: string;
    enabled: boolean;
}

export interface ScheduleItem {
    time: string;
    activity: string;
    category: string;
    description?: string;
}

export interface Schedule {
    workMode: ScheduleItem[];
    studyMode: ScheduleItem[];
}

export interface RenacerStateType {
    version: string;
    user: User;
    reading: {
        currentBook: Book;
        plan: ReadingPlanBlock[];
    };
    habits: Habit[];
    privacy: PrivacyTask[];
    schedule: Schedule;
}

// Tipo para notificaciones
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

// Agregar al archivo types/index.ts
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