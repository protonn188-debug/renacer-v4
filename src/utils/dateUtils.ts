export const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
};

export const getCurrentMonth = (): string => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[new Date().getMonth()];
};

export const getYearProgress = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    const diff = now.getTime() - start.getTime();
    const total = end.getTime() - start.getTime();
    return (diff / total) * 100;
};

export const isNewDay = (lastReset: string | null): boolean => {
    if (!lastReset) return true;
    
    const last = new Date(lastReset);
    const now = new Date();
    
    return last.getDate() !== now.getDate() ||
           last.getMonth() !== now.getMonth() ||
           last.getFullYear() !== now.getFullYear();
};