import React, { useState, useEffect } from 'react';

interface Exercise {
    id: string;
    title: string;
    icon: string;
    description: string;
    difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
    duration: string;
    category: string;
    completed: number;
    total: number;
    lastScore?: number;
    bestScore?: number;
}

interface ExerciseSession {
    exerciseId: string;
    date: string;
    duration: number;
    score: number;
    accuracy: number;
}

const CognitivePage: React.FC = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [activeExercise, setActiveExercise] = useState<string | null>(null);
    const [isTraining, setIsTraining] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [weeklyStats, setWeeklyStats] = useState({
        totalSessions: 0,
        totalTime: 0,
        avgScore: 0,
        improvement: 0
    });

    useEffect(() => {
        loadExercises();
        loadWeeklyStats();
    }, []);

    // Timer para sesión activa
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTraining) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTraining]);

    const loadExercises = () => {
        const savedSessions = JSON.parse(localStorage.getItem('cognitive_sessions') || '[]');
        
        const exerciseList: Exercise[] = [
            {
                id: 'memory',
                title: 'Entrenamiento de Memoria',
                icon: '🧠',
                description: 'Ejercicios para mejorar retención y recall. Secuencias de números, patrones visuales y asociaciones.',
                difficulty: 'Intermedio',
                duration: '15 min',
                category: 'Memoria',
                completed: savedSessions.filter((s: ExerciseSession) => s.exerciseId === 'memory').length,
                total: 50,
                lastScore: getLastScore(savedSessions, 'memory'),
                bestScore: getBestScore(savedSessions, 'memory')
            },
            {
                id: 'focus',
                title: 'Concentración Profunda',
                icon: '🎯',
                description: 'Técnicas de enfoque y atención plena. Meditación guiada, ejercicios de respiración y mindfulness.',
                difficulty: 'Avanzado',
                duration: '20 min',
                category: 'Atención',
                completed: savedSessions.filter((s: ExerciseSession) => s.exerciseId === 'focus').length,
                total: 40,
                lastScore: getLastScore(savedSessions, 'focus'),
                bestScore: getBestScore(savedSessions, 'focus')
            },
            {
                id: 'logic',
                title: 'Razonamiento Lógico',
                icon: '🧩',
                description: 'Problemas y acertijos de lógica. Sudokus, rompecabezas y desafíos matemáticos.',
                difficulty: 'Básico',
                duration: '10 min',
                category: 'Lógica',
                completed: savedSessions.filter((s: ExerciseSession) => s.exerciseId === 'logic').length,
                total: 60,
                lastScore: getLastScore(savedSessions, 'logic'),
                bestScore: getBestScore(savedSessions, 'logic')
            },
            {
                id: 'speed',
                title: 'Lectura Rápida',
                icon: '⚡',
                description: 'Aumenta tu velocidad de lectura sin perder comprensión. Técnicas de skimming y scanning.',
                difficulty: 'Intermedio',
                duration: '15 min',
                category: 'Velocidad',
                completed: savedSessions.filter((s: ExerciseSession) => s.exerciseId === 'speed').length,
                total: 45,
                lastScore: getLastScore(savedSessions, 'speed'),
                bestScore: getBestScore(savedSessions, 'speed')
            },
            {
                id: 'spatial',
                title: 'Inteligencia Espacial',
                icon: '🎲',
                description: 'Visualización 3D, rotación mental y percepción espacial avanzada.',
                difficulty: 'Avanzado',
                duration: '18 min',
                category: 'Espacial',
                completed: savedSessions.filter((s: ExerciseSession) => s.exerciseId === 'spatial').length,
                total: 35,
                lastScore: getLastScore(savedSessions, 'spatial'),
                bestScore: getBestScore(savedSessions, 'spatial')
            },
            {
                id: 'verbal',
                title: 'Fluidez Verbal',
                icon: '💬',
                description: 'Vocabulario, sinónimos, analogías y comprensión lingüística avanzada.',
                difficulty: 'Intermedio',
                duration: '12 min',
                category: 'Verbal',
                completed: savedSessions.filter((s: ExerciseSession) => s.exerciseId === 'verbal').length,
                total: 50,
                lastScore: getLastScore(savedSessions, 'verbal'),
                bestScore: getBestScore(savedSessions, 'verbal')
            }
        ];

        setExercises(exerciseList);
    };

    const getLastScore = (sessions: ExerciseSession[], exerciseId: string): number | undefined => {
        const exerciseSessions = sessions.filter((s: ExerciseSession) => s.exerciseId === exerciseId);
        return exerciseSessions.length > 0 ? exerciseSessions[exerciseSessions.length - 1].score : undefined;
    };

    const getBestScore = (sessions: ExerciseSession[], exerciseId: string): number | undefined => {
        const exerciseSessions = sessions.filter((s: ExerciseSession) => s.exerciseId === exerciseId);
        return exerciseSessions.length > 0 
            ? Math.max(...exerciseSessions.map((s: ExerciseSession) => s.score))
            : undefined;
    };

    const loadWeeklyStats = () => {
        const sessions: ExerciseSession[] = JSON.parse(localStorage.getItem('cognitive_sessions') || '[]');
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        const recentSessions = sessions.filter((s: ExerciseSession) => 
            last7Days.includes(s.date)
        );

        const totalTime = recentSessions.reduce((sum, s) => sum + s.duration, 0);
        const avgScore = recentSessions.length > 0
            ? recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length
            : 0;

        // Calcular mejora (comparar primera mitad vs segunda mitad de la semana)
        const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
        const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));
        
        const avgFirst = firstHalf.length > 0 
            ? firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length 
            : 0;
        const avgSecond = secondHalf.length > 0 
            ? secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length 
            : 0;

        const improvement = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

        setWeeklyStats({
            totalSessions: recentSessions.length,
            totalTime,
            avgScore,
            improvement
        });
    };

    const startExercise = (exerciseId: string) => {
        setActiveExercise(exerciseId);
        setIsTraining(true);
        setSessionTime(0);
    };

    const completeExercise = () => {
        if (!activeExercise) return;

        // Simular score (en producción vendría del ejercicio real)
        const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100

        const session: ExerciseSession = {
            exerciseId: activeExercise,
            date: new Date().toISOString().split('T')[0],
            duration: sessionTime,
            score: randomScore,
            accuracy: Math.floor(Math.random() * 20) + 80
        };

        const sessions = JSON.parse(localStorage.getItem('cognitive_sessions') || '[]');
        sessions.push(session);
        localStorage.setItem('cognitive_sessions', JSON.stringify(sessions));

        // Mostrar notificación de logro
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-secondary text-white p-4 rounded-lg shadow-xl z-toast animate-fade-in';
        notification.innerHTML = `
            <div class="text-center">
                <div class="text-3xl mb-2">🎉</div>
                <div class="font-semibold">¡Ejercicio Completado!</div>
                <div class="text-sm opacity-90">Score: ${randomScore}/100</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);

        setIsTraining(false);
        setActiveExercise(null);
        loadExercises();
        loadWeeklyStats();
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
            case 'Básico': return 'text-secondary';
            case 'Intermedio': return 'text-warning';
            case 'Avanzado': return 'text-danger';
            default: return 'text-tertiary';
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-brain"></i>
                    <span>Entrenamiento Cognitivo</span>
                </div>
                <h1 className="greeting">
                    Potencia tu <span className="text-primary">Mente</span>
                </h1>
                <p className="greeting-subtitle">
                    Ejercicios científicamente diseñados para mejorar memoria, concentración y velocidad de procesamiento.
                </p>
            </header>

            {/* Estadísticas semanales */}
            <div className="grid grid-cols-4 gap-5 mb-6">
                <div className="card stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{weeklyStats.totalSessions}</div>
                    <div className="stat-label">Sesiones esta semana</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-value">{Math.floor(weeklyStats.totalTime / 60)}min</div>
                    <div className="stat-label">Tiempo total</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{weeklyStats.avgScore.toFixed(0)}</div>
                    <div className="stat-label">Score promedio</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon">{weeklyStats.improvement >= 0 ? '📈' : '📉'}</div>
                    <div className={`stat-value ${weeklyStats.improvement >= 0 ? 'text-secondary' : 'text-danger'}`}>
                        {weeklyStats.improvement >= 0 ? '+' : ''}{weeklyStats.improvement.toFixed(1)}%
                    </div>
                    <div className="stat-label">Mejora semanal</div>
                </div>
            </div>

            {/* Modal de ejercicio activo */}
            {isTraining && (
                <div className="card mb-6 bg-primary/10 border-2 border-primary">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-danger animate-pulse"></div>
                            <h3 className="text-xl font-semibold">Sesión en Progreso</h3>
                        </div>
                        <div className="text-3xl font-mono text-primary">{formatTime(sessionTime)}</div>
                    </div>
                    
                    <div className="bg-surface-light p-6 rounded-lg mb-4">
                        <div className="text-center">
                            <div className="text-6xl mb-4">
                                {exercises.find(e => e.id === activeExercise)?.icon}
                            </div>
                            <h4 className="text-2xl font-semibold mb-2">
                                {exercises.find(e => e.id === activeExercise)?.title}
                            </h4>
                            <p className="text-tertiary mb-6">
                                Completa los ejercicios con atención y concentración máxima.
                            </p>
                            
                            {/* Simulación de ejercicio en progreso */}
                            <div className="space-y-4">
                                <div className="p-4 bg-surface rounded">
                                    <div className="text-left space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-sm">✓</div>
                                            <span>Fase 1: Calentamiento cognitivo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-sm">✓</div>
                                            <span>Fase 2: Ejercicios principales</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary animate-pulse flex items-center justify-center text-sm">→</div>
                                            <span>Fase 3: Desafíos avanzados</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="progress-bar" style={{ height: '12px' }}>
                                    <div 
                                        className="progress-fill bg-gradient-to-r from-primary to-secondary"
                                        style={{ width: `${Math.min((sessionTime / 900) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            className="btn btn-secondary flex-1"
                            onClick={() => {
                                setIsTraining(false);
                                setActiveExercise(null);
                            }}
                        >
                            <i className="fas fa-pause"></i>
                            Pausar Sesión
                        </button>
                        <button 
                            className="btn btn-primary flex-1"
                            onClick={completeExercise}
                        >
                            <i className="fas fa-check"></i>
                            Completar Ejercicio
                        </button>
                    </div>
                </div>
            )}

            {/* Grid de ejercicios */}
            <div className="grid grid-cols-3 gap-5 mb-6">
                {exercises.map((exercise) => (
                    <div 
                        key={exercise.id}
                        className="card animate-fade-in cursor-pointer group hover:shadow-xl transition-all"
                    >
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                            {exercise.icon}
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
                        <p className="text-sm text-tertiary mb-4 line-clamp-2">{exercise.description}</p>
                        
                        {/* Estadísticas del ejercicio */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {exercise.lastScore !== undefined && (
                                <div className="text-center p-2 bg-surface-light rounded">
                                    <div className="text-xs text-tertiary">Último</div>
                                    <div className="text-lg font-bold text-primary">{exercise.lastScore}</div>
                                </div>
                            )}
                            {exercise.bestScore !== undefined && (
                                <div className="text-center p-2 bg-surface-light rounded">
                                    <div className="text-xs text-tertiary">Mejor</div>
                                    <div className="text-lg font-bold text-secondary">{exercise.bestScore}</div>
                                </div>
                            )}
                        </div>

                        {/* Progreso de completado */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-tertiary">Progreso</span>
                                <span className="font-mono">{exercise.completed}/{exercise.total}</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${(exercise.completed / exercise.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mb-4">
                            <span className={`badge ${getDifficultyColor(exercise.difficulty)}`}>
                                {exercise.difficulty}
                            </span>
                            <span className="badge bg-surface-light text-secondary">
                                <i className="fas fa-clock mr-1"></i>
                                {exercise.duration}
                            </span>
                        </div>

                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => startExercise(exercise.id)}
                            disabled={isTraining}
                        >
                            <i className="fas fa-play"></i>
                            {isTraining ? 'Ejercicio en curso...' : 'Comenzar Ejercicio'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Progreso semanal detallado */}
            <div className="card">
                <h3 className="text-xl font-semibold mb-4">Progreso Semanal por Categoría</h3>
                <div className="space-y-4">
                    {['Memoria', 'Atención', 'Lógica', 'Velocidad', 'Espacial', 'Verbal'].map((category) => {
                        const categoryExercises = exercises.filter(e => e.category === category);
                        const avgProgress = categoryExercises.length > 0
                            ? categoryExercises.reduce((sum, e) => sum + (e.completed / e.total) * 100, 0) / categoryExercises.length
                            : 0;

                        return (
                            <div key={category}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>{category}</span>
                                    <span className="font-mono">{avgProgress.toFixed(0)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${avgProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};

export default CognitivePage;