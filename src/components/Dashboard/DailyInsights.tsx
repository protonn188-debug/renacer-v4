import React, { useState, useEffect } from 'react';

interface Insight {
    id: string;
    icon: string;
    color: string;
    title: string;
    description: string;
    type: 'tip' | 'achievement' | 'warning' | 'recommendation';
    priority: number;
}

const DailyInsights: React.FC = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [activeInsight, setActiveInsight] = useState(0);

    useEffect(() => {
        generateInsights();
        
        // Rotar insights cada 15 segundos
        const interval = setInterval(() => {
            setActiveInsight(prev => (prev + 1) % insights.length);
        }, 15000);

        return () => clearInterval(interval);
    }, [insights.length]);

    const generateInsights = () => {
        const allInsights: Insight[] = [];

        // Cargar datos del usuario
        const state = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');
        const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
        const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');

        // Análisis de productividad
        if (sessions.length > 0) {
            const lastSession = sessions[sessions.length - 1];
            const avgSpeed = sessions.reduce((sum: number, s: any) => sum + parseFloat(s.speed), 0) / sessions.length;
            
            allInsights.push({
                id: 'productivity',
                icon: '🎯',
                color: 'primary',
                title: 'Análisis de Productividad',
                description: `Tu velocidad promedio de lectura es ${avgSpeed.toFixed(1)} páginas/minuto. ${
                    avgSpeed > 0.3 
                        ? '¡Excelente ritmo! Mantenlo así.' 
                        : 'Considera técnicas de lectura rápida para mejorar.'
                }`,
                type: 'tip',
                priority: 1
            });
        }

        // Análisis de hábitos
        const habitDays = Object.keys(habitHistory).length;
        if (habitDays >= 7) {
            const completionRate = Object.values(habitHistory).reduce((sum: number, day: any) => {
                return sum + (day.filter((h: boolean) => h).length / day.length);
            }, 0) / habitDays;

            allInsights.push({
                id: 'habits',
                icon: '🌱',
                color: 'secondary',
                title: 'Consistencia de Hábitos',
                description: `Tu tasa de completado promedio es ${(completionRate * 100).toFixed(0)}%. ${
                    completionRate > 0.7 
                        ? '¡Increíble consistencia!' 
                        : 'Intenta mejorar tu disciplina diaria.'
                }`,
                type: 'achievement',
                priority: 2
            });
        }

        // Proyección de lectura
        if (state.reading?.currentBook) {
            const pagesLeft = state.reading.currentBook.totalPages - state.reading.currentBook.currentPage;
            const daysToFinish = Math.ceil(pagesLeft / 20);
            
            allInsights.push({
                id: 'reading',
                icon: '📚',
                color: 'accent',
                title: 'Proyección de Lectura',
                description: `Con tu ritmo actual de 20 páginas/día, terminarás "${state.reading.currentBook.title}" en ${daysToFinish} días. ${
                    daysToFinish <= 7 
                        ? '¡Ya casi terminas!' 
                        : 'Mantén el ritmo para completar a tiempo.'
                }`,
                type: 'recommendation',
                priority: 1
            });
        }

        // Horario óptimo
        const now = new Date().getHours();
        if (now >= 17 && now <= 21) {
            allInsights.push({
                id: 'time',
                icon: '⏰',
                color: 'warning',
                title: 'Ventana de Productividad',
                description: 'Estás en tu ventana de máxima productividad (17:00-21:00). Aprovecha este momento para estudio profundo o lectura concentrada.',
                type: 'tip',
                priority: 3
            });
        }

        // Racha en riesgo
        if (state.user?.streak > 0 && state.user?.dailyPages === 0) {
            const hourOfDay = new Date().getHours();
            if (hourOfDay >= 20) {
                allInsights.push({
                    id: 'streak',
                    icon: '🔥',
                    color: 'danger',
                    title: '¡Atención! Racha en Riesgo',
                    description: `Tienes una racha de ${state.user.streak} días. Lee al menos 20 páginas antes de medianoche para mantenerla.`,
                    type: 'warning',
                    priority: 0
                });
            }
        }

        // Meta semanal
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 0) { // Domingo
            allInsights.push({
                id: 'weekly',
                icon: '🎊',
                color: 'secondary',
                title: 'Nueva Semana',
                description: 'Comienza la semana con energía. Establece tus metas semanales: 140 páginas de lectura y 35 hábitos completados.',
                type: 'recommendation',
                priority: 1
            });
        }

        // Tips aleatorios
        const tips = [
            {
                icon: '💡',
                title: 'Técnica Pomodoro',
                description: 'Estudia en bloques de 25 minutos seguidos de 5 minutos de descanso. Mejora significativamente la retención.',
                color: 'primary'
            },
            {
                icon: '🧠',
                title: 'Recuerdo Activo',
                description: 'Después de leer un capítulo, cierra el libro e intenta resumir lo leído. Esto mejora la memoria a largo plazo.',
                color: 'accent'
            },
            {
                icon: '✍️',
                title: 'Toma de Notas',
                description: 'Escribe notas a mano en lugar de digitales. La escritura manual mejora la comprensión y retención del material.',
                color: 'secondary'
            }
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        allInsights.push({
            id: 'tip',
            ...randomTip,
            type: 'tip',
            priority: 4
        });

        // Ordenar por prioridad
        allInsights.sort((a, b) => a.priority - b.priority);
        setInsights(allInsights);
    };

    const getColorClass = (color: string): string => {
        return `text-${color}`;
    };

    const getTypeIcon = (type: string): string => {
        switch (type) {
            case 'achievement': return '🏆';
            case 'warning': return '⚠️';
            case 'recommendation': return '💡';
            default: return 'ℹ️';
        }
    };

    if (insights.length === 0) {
        return (
            <div className="card col-span-2 animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Insights del Sistema</div>
                        <div className="card-subtitle">Cargando análisis...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card col-span-2 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="card-header">
                <div>
                    <div className="card-title flex items-center gap-2">
                        <i className="fas fa-robot text-primary"></i>
                        Insights del Sistema
                        <span className="badge bg-primary text-white text-xs">
                            {insights.length} Insights
                        </span>
                    </div>
                    <div className="card-subtitle">Análisis y recomendaciones inteligentes</div>
                </div>
                <div className="flex gap-2">
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveInsight(Math.max(0, activeInsight - 1))}
                        disabled={activeInsight === 0}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveInsight(Math.min(insights.length - 1, activeInsight + 1))}
                        disabled={activeInsight === insights.length - 1}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* Insight destacado */}
            <div className="mb-4">
                {insights.map((insight, index) => (
                    <div
                        key={insight.id}
                        className={`p-6 bg-gradient-to-br from-${insight.color}/10 to-${insight.color}/5 border border-${insight.color}/30 rounded-lg transition-all duration-500 ${
                            index === activeInsight ? 'block' : 'hidden'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">{insight.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                                    <div className="font-semibold text-lg">{insight.title}</div>
                                </div>
                                <p className="text-secondary leading-relaxed">{insight.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Indicadores de página */}
            <div className="flex justify-center gap-2 mb-4">
                {insights.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === activeInsight 
                                ? 'bg-primary w-8' 
                                : 'bg-surface-lighter hover:bg-surface-light'
                        }`}
                        onClick={() => setActiveInsight(index)}
                    />
                ))}
            </div>

            {/* Lista compacta de todos los insights */}
            <div className="space-y-2">
                {insights.map((insight, index) => (
                    <div 
                        key={insight.id}
                        className={`p-3 rounded cursor-pointer transition-all ${
                            index === activeInsight 
                                ? `bg-${insight.color}/20 border border-${insight.color}/40` 
                                : 'bg-surface-light hover:bg-surface-lighter'
                        }`}
                        onClick={() => setActiveInsight(index)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${insight.color}/20 flex items-center justify-center text-xl`}>
                                {insight.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm">{insight.title}</div>
                                <div className="text-xs text-tertiary truncate">{insight.description}</div>
                            </div>
                            {index === activeInsight && (
                                <i className="fas fa-eye text-primary"></i>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón de refrescar */}
            <button 
                className="btn btn-secondary w-full mt-4"
                onClick={generateInsights}
            >
                <i className="fas fa-sync-alt"></i>
                Generar Nuevos Insights
            </button>
        </div>
    );
};

export default DailyInsights;