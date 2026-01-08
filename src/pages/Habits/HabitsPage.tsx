import React from 'react';
import { RenacerStateType } from '../../types';

interface HabitsPageProps {
    state: RenacerStateType;
    onToggleHabit: (index: number) => void;
}

const HabitsPage: React.FC<HabitsPageProps> = ({ state, onToggleHabit }) => {
    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-seedling"></i>
                    <span>Arquitectura de Hábitos</span>
                </div>
                <h1 className="greeting">
                    Construye tu <span className="text-primary">Rutina</span> Perfecta
                </h1>
                <p className="greeting-subtitle">
                    Sistema 5×7: 5 hábitos diarios, 7 días a la semana. Consistencia es la clave.
                </p>
            </header>

            <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Hábitos de Hoy</h3>
                    <div className="space-y-2">
                        {state.habits.map((habit, index) => (
                            <div 
                                key={habit.id}
                                className="habit-item"
                                onClick={() => onToggleHabit(index)}
                            >
                                <div className={`habit-checkbox ${habit.completed ? 'checked' : ''}`}></div>
                                <div className="habit-icon">{habit.icon}</div>
                                <div className="flex-1">
                                    <div className="font-medium">{habit.name}</div>
                                    <div className="text-xs text-tertiary">{habit.frequency}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-surface-lighter">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progreso Diario</span>
                            <span className="font-mono">
                                {state.habits.filter(h => h.completed).length}/{state.habits.length}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ 
                                    width: `${(state.habits.filter(h => h.completed).length / state.habits.length) * 100}%` 
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Estadísticas Semanales</h3>
                    <p className="text-tertiary text-sm mb-4">
                        Completa hábitos durante 7 días para ver tu progreso semanal.
                    </p>
                    
                    <div className="grid grid-cols-7 gap-2">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div 
                                key={i}
                                className="text-center p-3 rounded bg-surface-light"
                            >
                                <div className="text-xs text-tertiary mb-1">{day}</div>
                                <div className="text-lg">—</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="text-xl font-semibold mb-4">
                    <i className="fas fa-lightbulb text-warning"></i> Consejos de Consistencia
                </h3>
                <ul className="space-y-2 text-sm text-secondary">
                    <li>• Empieza con 1-2 hábitos y agrega más gradualmente</li>
                    <li>• Haz los hábitos a la misma hora cada día</li>
                    <li>• Si fallas un día, retoma inmediatamente al siguiente</li>
                    <li>• Celebra las pequeñas victorias</li>
                    <li>• La consistencia - La perfección</li>
                </ul>
            </div>
        </main>
    );
};

export default HabitsPage;