import React from 'react';
import { RenacerStateType } from '../../types';

interface PrivacyPageProps {
    state: RenacerStateType;
    onToggleTask: (index: number, enabled: boolean) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ state, onToggleTask }) => {
    const completedTasks = state.privacy.filter(t => t.enabled).length;
    const progress = (completedTasks / state.privacy.length) * 100;

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-user-secret"></i>
                    <span>Seguridad y Privacidad</span>
                </div>
                <h1 className="greeting">
                    Protege tu <span className="text-primary">Identidad</span> Digital
                </h1>
                <p className="greeting-subtitle">
                    Desconéctate del ruido digital. Enfócate en lo que importa.
                </p>
            </header>

            <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Progreso de Implementación</h3>
                    <div className="text-3xl font-bold text-secondary">{progress.toFixed(0)}%</div>
                </div>
                <div className="progress-bar mb-2" style={{ height: '12px' }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-tertiary">
                    {completedTasks}/{state.privacy.length} tareas completadas
                </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Tareas de Privacidad</h3>
                    <div className="space-y-3">
                        {state.privacy.map((task, index) => (
                            <div 
                                key={task.id}
                                className="flex items-center gap-3 p-3 bg-surface-light rounded"
                            >
                                <div className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        id={`privacy-${task.id}`}
                                        checked={task.enabled}
                                        onChange={(e) => onToggleTask(index, e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{task.task}</div>
                                    <div className="text-xs text-tertiary">
                                        Prioridad: {task.priority}
                                    </div>
                                </div>
                                {task.enabled && (
                                    <i className="fas fa-check-circle text-secondary"></i>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">
                        <i className="fas fa-shield-alt text-primary"></i> Beneficios
                    </h3>
                    <ul className="space-y-3 text-sm text-secondary">
                        <li className="flex gap-2">
                            <span className="text-secondary">✓</span>
                            <span>Mayor privacidad y control de datos personales</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-secondary">✓</span>
                            <span>Menos distracciones de redes sociales</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-secondary">✓</span>
                            <span>Protección contra rastreo online</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-secondary">✓</span>
                            <span>Mayor enfoque en objetivos académicos</span>
                        </li>
                    </ul>

                    <div className="mt-6 p-4 bg-surface-light rounded">
                        <h4 className="font-semibold mb-2 text-warning">
                            <i className="fas fa-exclamation-triangle"></i> Importante
                        </h4>
                        <p className="text-xs text-tertiary">
                            La privacidad digital es un proceso continuo. Revisa y actualiza 
                            regularmente tus configuraciones de seguridad.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPage;