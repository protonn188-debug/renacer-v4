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