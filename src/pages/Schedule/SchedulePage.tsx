import React from 'react';
import { RenacerStateType } from '../../types';

interface SchedulePageProps {
    state: RenacerStateType;
    onToggleWorkMode: () => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ state, onToggleWorkMode }) => {
    const currentSchedule = state.user.workMode 
        ? state.schedule.workMode 
        : state.schedule.studyMode;

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Programación Inteligente</span>
                </div>
                <h1 className="greeting">
                    Tu <span className="text-primary">Agenda</span> Optimizada
                </h1>
                <p className="greeting-subtitle">
                    Secuencia de actividades diseñada para máxima productividad.
                </p>
            </header>

            <div className="flex gap-4 mb-6">
                <button 
                    className={`btn flex-1 ${state.user.workMode ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={onToggleWorkMode}
                >
                    <i className="fas fa-briefcase"></i>
                    Modo Trabajo
                </button>
                <button 
                    className={`btn flex-1 ${!state.user.workMode ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={onToggleWorkMode}
                >
                    <i className="fas fa-graduation-cap"></i>
                    Solo Estudio
                </button>
            </div>

            <div className="card mb-6">
                <h3 className="text-xl font-semibold mb-4">
                    Horario de Hoy - {state.user.workMode ? 'Modo Trabajo' : 'Solo Estudio'}
                </h3>
                <div>
                    {currentSchedule.map((item, index) => (
                        <div key={index} className="schedule-item">
                            <div className="schedule-time">{item.time}</div>
                            <div className="schedule-content">
                                <div className="schedule-title">{item.activity}</div>
                                <div className="schedule-description">{item.description}</div>
                            </div>
                            <div className="schedule-badge">{item.category}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Modo Trabajo</h3>
                    <ul className="space-y-2 text-sm text-secondary">
                        <li>• 4 horas de trabajo (12:30 - 16:30)</li>
                        <li>• Balance entre ingresos y estudio</li>
                        <li>• 5 horas de estudio académico</li>
                    </ul>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Solo Estudio</h3>
                    <ul className="space-y-2 text-sm text-secondary">
                        <li>• 100% enfocado en academia</li>
                        <li>• 7+ horas de estudio diario</li>
                        <li>• Sesiones de investigación extendidas</li>
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default SchedulePage;