import React from 'react';
import Header from './Header';
import StatsCard from './StatsCard';
import CurrentReading from './CurrentReading';
import HabitsTracker from './HabitsTracker';
import Schedule from './Schedule';
import ReadingPlan from './ReadingPlan';
import PrivacySystem from './PrivacySystem';
import DailyInsights from './DailyInsights';
import { RenacerStateType } from '../../types';

interface DashboardProps {
    state: RenacerStateType;
    onToggleHabit: (index: number) => void;
    onLogProgress: () => void;
    onToggleWorkMode: () => void;
    onTogglePrivacyTask: (index: number, enabled: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    state,
    onToggleHabit,
    onLogProgress,
    onToggleWorkMode,
    onTogglePrivacyTask
}) => {
    // Validación defensiva
    if (!state || !state.user || !state.reading || !state.schedule) {
        return (
            <main className="main-content">
                <div className="card">
                    <p className="text-center text-tertiary">Cargando sistema...</p>
                </div>
            </main>
        );
    }

    const habitsCompleted = state.habits ? state.habits.filter(h => h.completed).length : 0;
    const habitsTotal = state.habits ? state.habits.length : 0;
    
    // Determinar el horario según el modo
    const currentSchedule = state.user.workMode 
        ? state.schedule.workMode 
        : state.schedule.studyMode;
    
    return (
        <main className="main-content">
            <Header 
                username={state.user.codename}
                goal={state.user.goal}
            />

            <div className="grid grid-cols-4 gap-5 mb-6">
                {/* Stats Cards */}
                <StatsCard
                    icon="fas fa-fire"
                    value={state.user.streak}
                    label="Días de Racha"
                    progress={(state.user.streak / 365) * 100}
                    delay={0.1}
                />
                
                <StatsCard
                    icon="fas fa-book"
                    value={`${state.user.dailyPages}/20`}
                    label="Páginas Hoy"
                    progress={(state.user.dailyPages / 20) * 100}
                    delay={0.2}
                />
                
                <StatsCard
                    icon="fas fa-check-circle"
                    value={`${habitsCompleted}/${habitsTotal}`}
                    label="Hábitos Completados"
                    progress={(habitsCompleted / habitsTotal) * 100}
                    delay={0.3}
                />
                
                <StatsCard
                    icon="fas fa-chart-line"
                    value="--"
                    label="Rendimiento Actual"
                    progress={0}
                    delay={0.4}
                />

                {/* Current Reading */}
                {state.reading.currentBook && (
                    <CurrentReading
                        book={state.reading.currentBook}
                        onLogProgress={onLogProgress}
                    />
                )}

                {/* Habits Tracker */}
                {state.habits && state.habits.length > 0 && (
                    <HabitsTracker
                        habits={state.habits}
                        onToggleHabit={onToggleHabit}
                    />
                )}

                {/* Schedule */}
                {currentSchedule && currentSchedule.length > 0 && (
                    <Schedule
                        schedule={currentSchedule}
                        workMode={state.user.workMode}
                        onToggleMode={onToggleWorkMode}
                    />
                )}

                {/* Reading Plan 2026 */}
                {state.reading.plan && state.reading.plan.length > 0 && (
                    <ReadingPlan
                        plan={state.reading.plan}
                    />
                )}

                {/* Privacy System */}
                {state.privacy && state.privacy.length > 0 && (
                    <PrivacySystem
                        tasks={state.privacy}
                        onToggleTask={onTogglePrivacyTask}
                    />
                )}

                {/* Daily Insights */}
                <DailyInsights />
            </div>
        </main>
    );
};

export default Dashboard;