import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import CognitivePage from './pages/Cognitive/CognitivePage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import ReadingPage from './pages/Reading/ReadingPage';
import HabitsPage from './pages/Habits/HabitsPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import PrivacyPage from './pages/Privacy/PrivacyPage';
import SettingsPage from './pages/Settings/SettingsPage';
import APIPage from './pages/API/APIPage';
import ProgressModal from './components/Modal/ProgressModal';
import NotificationSystem from './components/Notification/NotificationSystem';
import { initialState } from './state/RenacerState';
import { loadState, saveState } from './state/persistence';
import { setupConsoleAPI } from './utils/consoleAPI';
import { isNewDay, getYearProgress } from './utils/dateUtils';
import { DataService } from './services/dataService';
import { RenacerStateType } from './types';
import './index.css';

interface NotificationType {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

function App() {
    const [state, setState] = useState<RenacerStateType>(() => {
        const loaded = loadState();
        return loaded || initialState;
    });
    
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [currentUserId] = useState<string | null>(null);

    const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            saveState(state);
            if (currentUserId) {
                DataService.saveUserState(currentUserId, state);
            }
        }, 30000);
        
        return () => clearInterval(interval);
    }, [state, currentUserId]);
    
    useEffect(() => {
        saveState(state);
        if (currentUserId) {
            DataService.saveUserState(currentUserId, state);
        }
    }, [state, currentUserId]);

    useEffect(() => {
        const checkDailyReset = () => {
            const lastReset = localStorage.getItem('last_reset');
            
            if (isNewDay(lastReset)) {
                setState(prev => {
                    const newState = {
                        ...prev,
                        user: {
                            ...prev.user,
                            dailyPages: 0,
                            streak: prev.user.dailyPages >= 20 ? prev.user.streak + 1 : 0
                        },
                        habits: prev.habits.map(h => ({ ...h, completed: false }))
                    };
                    
                    if (currentUserId) {
                        DataService.resetDailyCounters(currentUserId);
                    }
                    
                    return newState;
                });
                
                localStorage.setItem('last_reset', new Date().toISOString());
                showNotification('🌅 Nuevo día iniciado. Contadores reseteados.', 'info');
            }
        };

        checkDailyReset();
        const interval = setInterval(checkDailyReset, 60000);
        
        return () => clearInterval(interval);
    }, [currentUserId, showNotification]);

    useEffect(() => {
        setupConsoleAPI(state, setState, showNotification);
    }, [state, showNotification]);

    const toggleHabit = useCallback((index: number) => {
        setState(prev => {
            const newHabits = [...prev.habits];
            const habit = newHabits[index];
            habit.completed = !habit.completed;
            
            if (currentUserId) {
                DataService.toggleHabit(currentUserId, habit.id, habit.completed);
            }
            
            return {
                ...prev,
                habits: newHabits
            };
        });
        
        showNotification('✅ Hábito actualizado', 'success');
    }, [currentUserId, showNotification]);
    
    const updateReadingProgress = useCallback((pages: number) => {
        setState(prev => {
            const currentBook = prev.reading.currentBook;
            const newPage = Math.min(
                currentBook.currentPage + pages,
                currentBook.totalPages
            );
            const progress = (newPage / currentBook.totalPages) * 100;
            
            const bookCompleted = newPage >= currentBook.totalPages;
            
            if (bookCompleted) {
                setTimeout(() => {
                    showNotification('🎉 ¡Libro completado! Excelente trabajo.', 'success');
                }, 500);
            }

            if (currentUserId) {
                DataService.updateReadingProgress(currentUserId, pages);
            }
            
            return {
                ...prev,
                user: {
                    ...prev.user,
                    dailyPages: prev.user.dailyPages + pages
                },
                reading: {
                    ...prev.reading,
                    currentBook: {
                        ...currentBook,
                        currentPage: newPage,
                        progress
                    }
                }
            };
        });
        
        showNotification(`📖 ${pages} páginas registradas`, 'success');
        setShowProgressModal(false);
    }, [currentUserId, showNotification]);
    
    const toggleWorkMode = useCallback(() => {
        setState(prev => ({
            ...prev,
            user: {
                ...prev.user,
                workMode: !prev.user.workMode
            }
        }));
        
        const newMode = !state.user.workMode ? 'Trabajo' : 'Estudio';
        showNotification(`🔄 Modo cambiado a: ${newMode}`, 'info');
    }, [state.user.workMode, showNotification]);
    
    const togglePrivacyTask = useCallback((index: number, enabled: boolean) => {
        setState(prev => {
            const newPrivacy = [...prev.privacy];
            newPrivacy[index] = {
                ...newPrivacy[index],
                enabled
            };
            
            return {
                ...prev,
                privacy: newPrivacy
            };
        });
        
        const message = enabled ? '🔒 Protección activada' : '🔓 Protección desactivada';
        showNotification(message, 'info');
    }, [showNotification]);

    // ROUTING
    const renderPage = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <Dashboard
                        state={state}
                        onToggleHabit={toggleHabit}
                        onLogProgress={() => setShowProgressModal(true)}
                        onToggleWorkMode={toggleWorkMode}
                        onTogglePrivacyTask={togglePrivacyTask}
                    />
                );
            case 'cognitive':
                return <CognitivePage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'reading':
                return <ReadingPage state={state} onUpdateProgress={updateReadingProgress} />;
            case 'habits':
                return <HabitsPage state={state} onToggleHabit={toggleHabit} />;
            case 'schedule':
                return <SchedulePage state={state} onToggleWorkMode={toggleWorkMode} />;
            case 'privacy':
                return <PrivacyPage state={state} onToggleTask={togglePrivacyTask} />;
            case 'settings':
                return <SettingsPage />;
            case 'api':
                return <APIPage />;
            default:
                return (
                    <Dashboard
                        state={state}
                        onToggleHabit={toggleHabit}
                        onLogProgress={() => setShowProgressModal(true)}
                        onToggleWorkMode={toggleWorkMode}
                        onTogglePrivacyTask={togglePrivacyTask}
                    />
                );
        }
    };

    return (
        <div className="App">
            <Sidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                progress={getYearProgress()}
            />
            
            {renderPage()}
            
            {showProgressModal && (
                <ProgressModal
                    onSave={updateReadingProgress}
                    onClose={() => setShowProgressModal(false)}
                />
            )}
            
            <NotificationSystem notifications={notifications} />
        </div>
    );
}

export default App;