import React, { useState, useEffect } from 'react';

interface AnalyticsData {
    totalPages: number;
    studyHours: number;
    maxStreak: number;
    booksCompleted: number;
    habitsCompletion: number;
    avgReadingSpeed: number;
    productivityScore: number;
    weeklyTrend: string;
}

interface DailyData {
    date: string;
    pages: number;
    hours: number;
    habits: number;
}

const AnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalPages: 0,
        studyHours: 0,
        maxStreak: 0,
        booksCompleted: 0,
        habitsCompletion: 0,
        avgReadingSpeed: 0,
        productivityScore: 0,
        weeklyTrend: 'stable'
    });

    const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<'pages' | 'hours' | 'habits'>('pages');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = () => {
        const state = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');
        const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
        const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');

        // Calcular páginas totales
        const totalPages = sessions.reduce((sum: number, s: any) => sum + s.pages, 0);

        // Calcular horas de estudio
        const studyHours = sessions.reduce((sum: number, s: any) => sum + (s.duration / 3600), 0);

        // Calcular racha máxima
        const maxStreak = state.user?.streak || 0;

        // Libros completados (simulado basado en páginas)
        const booksCompleted = Math.floor(totalPages / 200);

        // Calcular completion rate de hábitos
        const habitDays = Object.keys(habitHistory);
        const habitsCompletion = habitDays.length > 0
            ? Object.values(habitHistory).reduce((sum: number, day: any) => {
                  return sum + (day.filter((h: boolean) => h).length / day.length) * 100;
              }, 0) / habitDays.length
            : 0;

        // Velocidad promedio de lectura
        const avgReadingSpeed = sessions.length > 0
            ? sessions.reduce((sum: number, s: any) => sum + parseFloat(s.speed || 0), 0) / sessions.length
            : 0;

        // Score de productividad (promedio ponderado)
        const productivityScore = (
            (habitsCompletion * 0.3) +
            (Math.min((totalPages / 1000) * 100, 100) * 0.3) +
            (Math.min((maxStreak / 30) * 100, 100) * 0.4)
        );

        // Tendencia semanal
        const last7Days = getLastNDays(7);
        const firstHalf = last7Days.slice(0, 3);
        const secondHalf = last7Days.slice(4, 7);
        
        const avgFirst = firstHalf.reduce((sum, d) => sum + d.pages, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, d) => sum + d.pages, 0) / secondHalf.length;
        
        let weeklyTrend = 'stable';
        if (avgSecond > avgFirst * 1.1) weeklyTrend = 'up';
        if (avgSecond < avgFirst * 0.9) weeklyTrend = 'down';

        setAnalytics({
            totalPages,
            studyHours,
            maxStreak,
            booksCompleted,
            habitsCompletion,
            avgReadingSpeed,
            productivityScore,
            weeklyTrend
        });

        setWeeklyData(last7Days);
    };

    const getLastNDays = (n: number): DailyData[] => {
        const days: DailyData[] = [];
        const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
        const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');

        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayHabits = habitHistory[dateStr] || [];
            const daySessions = sessions.filter((s: any) => s.date.startsWith(dateStr));

            days.push({
                date: dateStr,
                pages: daySessions.reduce((sum: number, s: any) => sum + s.pages, 0),
                hours: daySessions.reduce((sum: number, s: any) => sum + (s.duration / 3600), 0),
                habits: dayHabits.filter((h: boolean) => h).length
            });
        }

        return days;
    };

    const stats = [
        { 
            label: 'Páginas Totales', 
            value: analytics.totalPages.toLocaleString(), 
            icon: '📖', 
            color: 'primary',
            trend: analytics.weeklyTrend,
            suffix: 'páginas'
        },
        { 
            label: 'Horas de Estudio', 
            value: `${analytics.studyHours.toFixed(1)}h`, 
            icon: '⏱️', 
            color: 'secondary',
            trend: analytics.weeklyTrend,
            suffix: ''
        },
        { 
            label: 'Racha Máxima', 
            value: `${analytics.maxStreak} días`, 
            icon: '🔥', 
            color: 'accent',
            trend: 'up',
            suffix: ''
        },
        { 
            label: 'Libros Completados', 
            value: `${analytics.booksCompleted}/24`, 
            icon: '✅', 
            color: 'success',
            trend: analytics.weeklyTrend,
            suffix: ''
        }
    ];

    const maxValue = Math.max(...weeklyData.map(d => d[selectedMetric]));

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return '📈';
        if (trend === 'down') return '📉';
        return '➡️';
    };

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-chart-line"></i>
                    <span>Analíticas Avanzadas</span>
                </div>
                <h1 className="greeting">
                    Tus <span className="text-primary">Métricas</span>
                </h1>
                <p className="greeting-subtitle">
                    Análisis detallado de tu progreso y rendimiento académico con insights accionables.
                </p>
            </header>

            {/* Score de productividad destacado */}
            <div className="card mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-tertiary mb-2">SCORE DE PRODUCTIVIDAD</div>
                        <div className="text-6xl font-bold text-primary mb-2">
                            {analytics.productivityScore.toFixed(0)}
                            <span className="text-2xl text-tertiary">/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{getTrendIcon(analytics.weeklyTrend)}</span>
                            <span className="text-sm text-secondary">
                                {analytics.weeklyTrend === 'up' && 'Tendencia al alza esta semana'}
                                {analytics.weeklyTrend === 'down' && 'Tendencia a la baja esta semana'}
                                {analytics.weeklyTrend === 'stable' && 'Manteniéndote constante'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-8xl opacity-20">📊</div>
                    </div>
                </div>
            </div>

            {/* Stats cards con animación */}
            <div className="grid grid-cols-4 gap-5 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card stat-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-3xl">{stat.icon}</div>
                            <span className="text-2xl">{getTrendIcon(stat.trend)}</span>
                        </div>
                        <div className="text-3xl font-bold mb-2">{stat.value}</div>
                        <div className="text-sm text-tertiary">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Gráfico interactivo */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold">Progreso Temporal</h3>
                        <p className="text-tertiary text-sm">Evolución de tus métricas en el tiempo</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex border rounded-lg overflow-hidden">
                            {['pages', 'hours', 'habits'].map((metric) => (
                                <button
                                    key={metric}
                                    className={`px-4 py-2 text-sm transition-all ${
                                        selectedMetric === metric
                                            ? 'bg-primary text-white'
                                            : 'bg-surface hover:bg-surface/50'
                                    }`}
                                    onClick={() => setSelectedMetric(metric as any)}
                                >
                                    {metric === 'pages' && '📖 Páginas'}
                                    {metric === 'hours' && '⏱️ Horas'}
                                    {metric === 'habits' && '✅ Hábitos'}
                                </button>
                            ))}
                        </div>
                        <div className="flex border rounded-lg overflow-hidden">
                            {['7d', '30d', '90d'].map((range) => (
                                <button
                                    key={range}
                                    className={`px-4 py-2 text-sm transition-all ${
                                        timeRange === range
                                            ? 'bg-secondary text-white'
                                            : 'bg-surface hover:bg-surface/50'
                                    }`}
                                    onClick={() => setTimeRange(range as any)}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-64">
                    <div className="flex items-end h-48 gap-3">
                        {weeklyData.map((day, index) => {
                            const value = day[selectedMetric];
                            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                            const date = new Date(day.date);
                            const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="text-xs text-tertiary mb-2">
                                        {dayName}<br />
                                        <span className="font-mono">{date.getDate()}</span>
                                    </div>
                                    <div className="relative w-10 group">
                                        <div 
                                            className={`w-10 rounded-t-lg transition-all duration-500 ${
                                                selectedMetric === 'pages' ? 'bg-primary hover:bg-primary/80' :
                                                selectedMetric === 'hours' ? 'bg-secondary hover:bg-secondary/80' :
                                                'bg-success hover:bg-success/80'
                                            }`}
                                            style={{ height: `${percentage}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap">
                                                {value.toFixed(1)}
                                                {selectedMetric === 'pages' ? ' págs' : 
                                                 selectedMetric === 'hours' ? ' hrs' : ' háb'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Métricas adicionales */}
            <div className="grid grid-cols-3 gap-5 mb-6">
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <i className="fas fa-brain text-primary text-xl"></i>
                        </div>
                        <div>
                            <div className="text-sm text-tertiary">RENDIMIENTO COGNITIVO</div>
                            <div className="text-2xl font-bold">
                                {analytics.avgReadingSpeed.toFixed(1)}
                                <span className="text-sm text-tertiary ml-1">pág/min</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-tertiary">
                        Velocidad promedio de lectura
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-secondary/10">
                            <i className="fas fa-check-circle text-secondary text-xl"></i>
                        </div>
                        <div>
                            <div className="text-sm text-tertiary">HÁBITOS</div>
                            <div className="text-2xl font-bold">
                                {analytics.habitsCompletion.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-tertiary">
                        Tasa de completado
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-success/10">
                            <i className="fas fa-trophy text-success text-xl"></i>
                        </div>
                        <div>
                            <div className="text-sm text-tertiary">METAS</div>
                            <div className="text-2xl font-bold">
                                {Math.floor(analytics.totalPages / 200)}/24
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-tertiary">
                        Libros completados (aprox)
                    </div>
                </div>
            </div>

            {/* Insights recomendaciones */}
            <div className="card">
                <h3 className="text-xl font-semibold mb-4">💡 Insights Personalizados</h3>
                <div className="space-y-4">
                    {analytics.totalPages < 100 && (
                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                            <div className="text-primary">📚</div>
                            <div>
                                <div className="font-medium">Incrementa tu lectura</div>
                                <div className="text-sm text-tertiary">
                                    Has leído {analytics.totalPages} páginas. Intenta alcanzar 100 páginas esta semana para construir un hábito sólido.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {analytics.habitsCompletion < 70 && (
                        <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                            <div className="text-secondary">✅</div>
                            <div>
                                <div className="font-medium">Consistencia en hábitos</div>
                                <div className="text-sm text-tertiary">
                                    Tu tasa de completado es {analytics.habitsCompletion.toFixed(0)}%. Apunta al 70% para mejores resultados.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {analytics.maxStreak < 7 && (
                        <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                            <div className="text-accent">🔥</div>
                            <div>
                                <div className="font-medium">Construye una racha</div>
                                <div className="text-sm text-tertiary">
                                    Tu racha actual es {analytics.maxStreak} días. Intenta llegar a 7 días seguidos para consolidar el hábito.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {analytics.weeklyTrend === 'down' && (
                        <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg">
                            <div className="text-warning">📉</div>
                            <div>
                                <div className="font-medium">Tendencia a la baja</div>
                                <div className="text-sm text-tertiary">
                                    Tu productividad ha disminuido esta semana. Revisa tu rutina y establece metas más pequeñas.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {analytics.productivityScore > 80 && (
                        <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
                            <div className="text-success">🏆</div>
                            <div>
                                <div className="font-medium">¡Excelente progreso!</div>
                                <div className="text-sm text-tertiary">
                                    Con un score de {analytics.productivityScore.toFixed(0)}/100 estás en el camino correcto. ¡Sigue así!
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AnalyticsPage;