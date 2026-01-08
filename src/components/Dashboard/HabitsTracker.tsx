import React, { useEffect, useState } from 'react';
import { Habit } from '../../types';

interface HabitsTrackerProps {
    habits: Habit[];
    onToggleHabit: (index: number) => void;
}

interface HabitStats {
    totalCompleted: number;
    streak: number;
    weekCompletion: number;
    bestDay: string;
}

const HabitsTracker: React.FC<HabitsTrackerProps> = ({ habits, onToggleHabit }) => {
    const [stats, setStats] = useState<HabitStats>({
        totalCompleted: 0,
        streak: 0,
        weekCompletion: 0,
        bestDay: 'N/A'
    });
    const [weekData, setWeekData] = useState<boolean[][]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        loadHabitStats();
        loadWeekData();
    }, [habits]);

    const loadHabitStats = () => {
        const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
        
        let totalCompleted = 0;
        let currentStreak = 0;
        let weekCompletion = 0;
        
        // Calcular estadísticas
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        last7Days.forEach((date, index) => {
            const dayData = habitHistory[date];
            if (dayData) {
                const completed = dayData.filter((h: boolean) => h).length;
                totalCompleted += completed;
                
                if (completed === habits.length) {
                    if (index === 0) currentStreak++;
                } else {
                    if (index === 0) currentStreak = 0;
                }
                
                weekCompletion += (completed / habits.length) * 100;
            }
        });

        setStats({
            totalCompleted,
            streak: currentStreak,
            weekCompletion: weekCompletion / 7,
            bestDay: 'Lunes' // Calcular el mejor día
        });
    };

    const loadWeekData = () => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
        
        const data = days.map(date => {
            return habitHistory[date] || habits.map(() => false);
        });

        setWeekData(data);
    };

    const handleToggle = (index: number) => {
        const wasCompleted = habits[index].completed;
        onToggleHabit(index);

        // Guardar en historial
        const today = new Date().toISOString().split('T')[0];
        const habitHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
        
        if (!habitHistory[today]) {
            habitHistory[today] = habits.map(h => h.completed);
        }
        
        habitHistory[today][index] = !wasCompleted;
        localStorage.setItem('habit_history', JSON.stringify(habitHistory));

        // Confetti si se completan todos
        const allCompleted = habits.every((h, i) => i === index ? !wasCompleted : h.completed);
        if (allCompleted && !wasCompleted) {
            triggerConfetti();
        }

        loadHabitStats();
        loadWeekData();
    };

    const triggerConfetti = () => {
        setShowConfetti(true);
        
        // Crear elementos de confetti
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'fixed inset-0 pointer-events-none z-tooltip';
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.remove();
            setShowConfetti(false);
        }, 5000);
    };

    const completed = habits.filter(h => h.completed).length;
    const total = habits.length;
    const progress = (completed / total) * 100;

    return (
        <>
            <style>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>

            <div className="card animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title flex items-center gap-2">
                            Matriz de Hábitos
                            {completed === total && completed > 0 && (
                                <span className="text-lg">🎉</span>
                            )}
                        </div>
                        <div className="card-subtitle">Seguimiento Diario</div>
                    </div>
                    <div className="text-sm text-tertiary">
                        Racha: <span className="text-primary font-bold">{stats.streak}</span> días
                    </div>
                </div>

                {/* Mini estadísticas */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-surface-light rounded">
                        <div className="text-lg font-bold text-primary">{stats.totalCompleted}</div>
                        <div className="text-xs text-tertiary">Esta semana</div>
                    </div>
                    <div className="text-center p-2 bg-surface-light rounded">
                        <div className="text-lg font-bold text-secondary">{stats.weekCompletion.toFixed(0)}%</div>
                        <div className="text-xs text-tertiary">Promedio</div>
                    </div>
                    <div className="text-center p-2 bg-surface-light rounded">
                        <div className="text-lg font-bold text-accent">{stats.streak}</div>
                        <div className="text-xs text-tertiary">Racha máx</div>
                    </div>
                </div>

                {/* Lista de hábitos mejorada */}
                <div>
                    {habits.map((habit, index) => (
                        <div 
                            key={habit.id}
                            className="habit-item relative"
                            onClick={() => handleToggle(index)}
                        >
                            <div className={`habit-checkbox ${habit.completed ? 'checked' : ''}`}>
                                {habit.completed && (
                                    <i className="fas fa-check text-xs"></i>
                                )}
                            </div>
                            <div className="habit-icon">{habit.icon}</div>
                            <div className="flex-1">
                                <div className={`font-medium transition-all ${habit.completed ? 'line-through opacity-50' : ''}`}>
                                    {habit.name}
                                </div>
                                <div className="text-xs text-tertiary">{habit.frequency}</div>
                            </div>

                            {/* Indicador de progreso individual */}
                            {habit.completed && (
                                <div className="text-secondary text-sm font-semibold animate-fade-in">
                                    ✓ Completado
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Heatmap semanal */}
                <div className="mt-4 pt-4 border-t border-surface-lighter">
                    <div className="text-sm font-semibold mb-3">Últimos 7 días</div>
                    <div className="grid grid-cols-7 gap-2">
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, dayIndex) => (
                            <div key={dayIndex} className="text-center">
                                <div className="text-xs text-tertiary mb-1">{day}</div>
                                <div className="space-y-1">
                                    {habits.map((_, habitIndex) => {
                                        const completed = weekData[dayIndex]?.[habitIndex] || false;
                                        return (
                                            <div
                                                key={habitIndex}
                                                className={`w-full h-4 rounded transition-all ${
                                                    completed 
                                                        ? 'bg-secondary' 
                                                        : 'bg-surface-light'
                                                }`}
                                                title={`${habits[habitIndex].name}: ${completed ? 'Completado' : 'Pendiente'}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Progreso total */}
                <div className="mt-4 pt-4 border-t border-surface-lighter">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-tertiary">Completados Hoy</span>
                        <span className="font-medium">{completed}/{total}</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    {progress === 100 && (
                        <div className="mt-3 p-2 bg-secondary/10 border border-secondary/30 rounded text-center text-sm text-secondary font-semibold">
                            🎯 ¡Todos los hábitos completados! Excelente trabajo.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HabitsTracker;