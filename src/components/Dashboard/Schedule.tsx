import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../../types';

interface ScheduleProps {
    schedule: ScheduleItem[];
    workMode: boolean;
    onToggleMode: () => void;
}

const Schedule: React.FC<ScheduleProps> = ({ schedule, workMode, onToggleMode }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentActivity, setCurrentActivity] = useState<ScheduleItem | null>(null);
    const [nextActivity, setNextActivity] = useState<ScheduleItem | null>(null);
    const [timeToNext, setTimeToNext] = useState<string>('');
    const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

    // Actualizar reloj cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Cargar actividades completadas del día
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`activities_${today}`);
        if (saved) {
            setCompletedActivities(new Set(JSON.parse(saved)));
        }
    }, []);

    // Determinar actividad actual y próxima
    useEffect(() => {
        const now = currentTime.getHours() * 60 + currentTime.getMinutes();

        let current: ScheduleItem | null = null;
        let next: ScheduleItem | null = null;

        for (let i = 0; i < schedule.length; i++) {
            const item = schedule[i];
            const [hours, minutes] = item.time.split(':').map(Number);
            const itemTime = hours * 60 + minutes;

            if (itemTime <= now) {
                current = item;
            } else if (!next) {
                next = item;
                break;
            }
        }

        setCurrentActivity(current);
        setNextActivity(next);

        // Calcular tiempo hasta siguiente actividad
        if (next) {
            const [hours, minutes] = next.time.split(':').map(Number);
            const nextTime = hours * 60 + minutes;
            const diff = nextTime - now;
            
            if (diff > 0) {
                const hoursLeft = Math.floor(diff / 60);
                const minutesLeft = diff % 60;
                setTimeToNext(`${hoursLeft}h ${minutesLeft}m`);
            }
        }
    }, [currentTime, schedule]);

    const toggleActivityCompletion = (time: string) => {
        const today = new Date().toISOString().split('T')[0];
        const newCompleted = new Set(completedActivities);

        if (newCompleted.has(time)) {
            newCompleted.delete(time);
        } else {
            newCompleted.add(time);
        }

        setCompletedActivities(newCompleted);
        localStorage.setItem(`activities_${today}`, JSON.stringify(Array.from(newCompleted)));
    };

    const getProgressPercentage = (): number => {
        const now = currentTime.getHours() * 60 + currentTime.getMinutes();
        const startOfDay = 6 * 60; // 6:00 AM
        const endOfDay = 23 * 60; // 11:00 PM
        
        const progress = ((now - startOfDay) / (endOfDay - startOfDay)) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    const getCategoryColor = (category: string): string => {
        const colors: { [key: string]: string } = {
            'SALUD': 'bg-secondary',
            'ACADÉMICO': 'bg-primary',
            'TRABAJO': 'bg-accent',
            'ESTUDIO': 'bg-warning',
            'DESARROLLO': 'bg-purple-500'
        };
        return colors[category] || 'bg-gray-500';
    };

    const completedCount = completedActivities.size;
    const totalCount = schedule.length;
    const completionPercentage = (completedCount / totalCount) * 100;

    return (
        <div className="card col-span-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="card-header">
                <div>
                    <div className="card-title flex items-center gap-3">
                        Programación Inteligente
                        <span className="text-sm font-normal text-tertiary">
                            {currentTime.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit' 
                            })}
                        </span>
                    </div>
                    <div className="card-subtitle">
                        {currentActivity 
                            ? `Ahora: ${currentActivity.activity}` 
                            : 'Secuencia óptima para hoy'
                        }
                    </div>
                </div>
                <button 
                    className={`btn btn-sm ${workMode ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={onToggleMode}
                >
                    <i className={`fas fa-${workMode ? 'briefcase' : 'graduation-cap'}`}></i>
                    {workMode ? 'Modo Trabajo' : 'Solo Estudio'}
                </button>
            </div>

            {/* Estado actual y próximo */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-primary/10 border border-primary/30 rounded">
                    <div className="text-xs text-tertiary mb-1">ACTIVIDAD ACTUAL</div>
                    {currentActivity ? (
                        <>
                            <div className="font-semibold text-sm">{currentActivity.activity}</div>
                            <div className="text-xs text-tertiary mt-1">
                                {currentActivity.time} • {currentActivity.category}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-tertiary">Ninguna actividad programada</div>
                    )}
                </div>

                <div className="p-3 bg-secondary/10 border border-secondary/30 rounded">
                    <div className="text-xs text-tertiary mb-1">PRÓXIMA ACTIVIDAD</div>
                    {nextActivity ? (
                        <>
                            <div className="font-semibold text-sm">{nextActivity.activity}</div>
                            <div className="text-xs text-tertiary mt-1">
                                En {timeToNext} • {nextActivity.time}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-tertiary">No hay más actividades hoy</div>
                    )}
                </div>
            </div>

            {/* Progreso del día */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-tertiary">Progreso del Día</span>
                    <span className="font-mono">{getProgressPercentage().toFixed(0)}%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                    <div 
                        className="progress-fill" 
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>

            {/* Lista de actividades mejorada */}
            <div className="space-y-2 mb-4">
                {schedule.map((item, index) => {
                    const isCompleted = completedActivities.has(item.time);
                    const isCurrent = currentActivity?.time === item.time;
                    const isPast = () => {
                        const now = currentTime.getHours() * 60 + currentTime.getMinutes();
                        const [hours, minutes] = item.time.split(':').map(Number);
                        const itemTime = hours * 60 + minutes;
                        return itemTime < now && !isCurrent;
                    };

                    return (
                        <div 
                            key={index}
                            className={`schedule-item relative transition-all ${
                                isCurrent ? 'bg-primary/5 border-l-4 border-primary' : ''
                            } ${isPast() && !isCompleted ? 'opacity-50' : ''}`}
                        >
                            {/* Checkbox de completado */}
                            <div 
                                className={`w-5 h-5 rounded border-2 cursor-pointer transition-all flex items-center justify-center ${
                                    isCompleted 
                                        ? 'bg-secondary border-secondary' 
                                        : 'border-tertiary hover:border-secondary'
                                }`}
                                onClick={() => toggleActivityCompletion(item.time)}
                            >
                                {isCompleted && (
                                    <i className="fas fa-check text-white text-xs"></i>
                                )}
                            </div>

                            <div className="schedule-time">
                                {item.time}
                                {isCurrent && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                )}
                            </div>
                            
                            <div className="schedule-content flex-1">
                                <div className={`schedule-title ${isCompleted ? 'line-through opacity-50' : ''}`}>
                                    {item.activity}
                                    {isCurrent && (
                                        <span className="ml-2 text-xs text-primary font-normal">
                                            • En progreso
                                        </span>
                                    )}
                                </div>
                                <div className="schedule-description">
                                    {item.description}
                                </div>
                            </div>
                            
                            <div className={`schedule-badge ${getCategoryColor(item.category)}`}>
                                {item.category}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Resumen de completado */}
            <div className="pt-4 border-t border-surface-lighter">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-tertiary">Actividades Completadas</span>
                    <span className="font-mono">{completedCount}/{totalCount}</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>

                {completionPercentage === 100 && (
                    <div className="mt-3 p-2 bg-secondary/10 border border-secondary/30 rounded text-center text-sm text-secondary font-semibold">
                        🎉 ¡Todas las actividades completadas! Día productivo.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;