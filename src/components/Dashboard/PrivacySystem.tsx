import React, { useState, useEffect } from 'react';
import { PrivacyTask } from '../../types';

interface PrivacySystemProps {
    tasks: PrivacyTask[];
    onToggleTask: (index: number, enabled: boolean) => void;
}

interface PrivacyStats {
    score: number;
    level: string;
    color: string;
    recommendations: string[];
}

const PrivacySystem: React.FC<PrivacySystemProps> = ({ tasks, onToggleTask }) => {
    const [stats, setStats] = useState<PrivacyStats>({
        score: 0,
        level: 'Bajo',
        color: 'danger',
        recommendations: [],
    });

    const [showDetails, setShowDetails] = useState(false);
    const [history, setHistory] = useState<Array<{ date: string; score: number }>>([]);

    useEffect(() => {
        loadHistory();
        calculatePrivacyScore();
    }, [tasks]);

    const calculatePrivacyScore = () => {
        const completedTasks = tasks.filter(t => t.enabled).length;
        const score = tasks.length ? (completedTasks / tasks.length) * 100 : 0;

        let level = 'Crítico';
        let color = 'danger';
        const recommendations: string[] = [];

        if (score === 0) {
            recommendations.push('⚠️ Activa VPN inmediatamente');
            recommendations.push('🔒 Usa Brave Browser');
        } else if (score < 50) {
            level = 'Bajo';
            color = 'warning';
            recommendations.push('Activa tareas de alta prioridad');
        } else if (score < 75) {
            level = 'Medio';
            color = 'primary';
            recommendations.push('Buen progreso, completa las tareas restantes');
        } else if (score < 100) {
            level = 'Alto';
            color = 'secondary';
            recommendations.push('¡Excelente! Solo falta un paso más');
        } else {
            level = 'Máximo';
            color = 'secondary';
            recommendations.push('🎉 Protección completa activada');
        }

        setStats({ score, level, color, recommendations });

        const today = new Date().toISOString().split('T')[0];
        const newHistory = [...history.filter(h => h.date !== today), { date: today, score }];
        setHistory(newHistory);
        localStorage.setItem('privacy_history', JSON.stringify(newHistory));
    };

    const loadHistory = () => {
        const saved = localStorage.getItem('privacy_history');
        if (saved) setHistory(JSON.parse(saved));
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'alta': return '🔴';
            case 'media': return '🟡';
            case 'baja': return '🟢';
            default: return '⚪';
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        const order: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };
        return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    });

    return (
        <div className="card col-span-2">
            {/* Header */}
            <div className="card-header flex justify-between items-center">
                <div>
                    <h3 className="flex items-center gap-2">
                        <i className="fas fa-shield-alt"></i>
                        Sistema de Privacidad
                        <span className={`badge bg-${stats.color} text-white`}>{stats.level}</span>
                    </h3>
                    <p className="text-sm text-tertiary">Proceso de desconexión digital</p>
                </div>
                <div className="text-right">
                    <div className={`text-4xl font-bold text-${stats.color}`}>{stats.score.toFixed(0)}%</div>
                    <div className="text-xs text-tertiary">Nivel de Protección</div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="my-4">
                <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                        className="h-6 rounded-full transition-all duration-500"
                        style={{
                            width: `${stats.score}%`,
                            background: `linear-gradient(to right, red, orange, yellow, green, blue)`
                        }}
                    />
                </div>
            </div>

            {/* Recommendations */}
            {stats.recommendations.length > 0 && (
                <div className={`p-4 rounded border border-${stats.color}/30 bg-${stats.color}/10 mb-4`}>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <i className="fas fa-lightbulb"></i> Recomendaciones
                    </h4>
                    <ul className="list-disc list-inside text-sm">
                        {stats.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Task list */}
            <div className="space-y-3 mb-4">
                {sortedTasks.map(task => {
                    const index = tasks.findIndex(t => t.id === task.id);
                    return (
                        <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded ${
                                task.enabled ? 'bg-secondary/10 border border-secondary/30' : 'bg-gray-100'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={task.enabled}
                                onChange={e => onToggleTask(index, e.target.checked)}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span>{getPriorityIcon(task.priority)}</span>
                                    <span>{task.task}</span>
                                </div>
                                <div className="text-xs text-tertiary">
                                    Prioridad: {task.priority} | {task.enabled ? '✓ Activado' : '○ Pendiente'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show details button */}
            <button
                className="btn btn-secondary w-full mb-4"
                onClick={() => setShowDetails(!showDetails)}
            >
                {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
            </button>

            {/* Details */}
            {showDetails && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-100 rounded">
                        <h4 className="font-semibold mb-2">Historial (7 días)</h4>
                        <div className="flex justify-between items-end h-24">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - (6 - i));
                                const dateStr = d.toISOString().split('T')[0];
                                const day = history.find(h => h.date === dateStr);
                                const s = day?.score ?? 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-blue-500 rounded-t"
                                            style={{ height: `${s}%`, minHeight: s > 0 ? 4 : 0 }}
                                        />
                                        <div className="text-xs">{['D','L','M','X','J','V','S'][d.getDay()]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivacySystem;
