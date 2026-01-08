import React, { useState, useEffect } from 'react';

interface ProgressCardProps {
    progress: number;
    month: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ progress, month }) => {
    const [displayProgress, setDisplayProgress] = useState(0);
    const [milestones, setMilestones] = useState({
        quarter: false,
        half: false,
        threeQuarters: false
    });

    useEffect(() => {
        // Animación del progreso
        let current = 0;
        const target = progress;
        const increment = target / 50;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setDisplayProgress(target);
                clearInterval(timer);
            } else {
                setDisplayProgress(current);
            }
        }, 20);

        // Detectar hitos alcanzados
        setMilestones({
            quarter: progress >= 25,
            half: progress >= 50,
            threeQuarters: progress >= 75
        });

        return () => clearInterval(timer);
    }, [progress]);

    const getProgressColor = (): string => {
        if (progress >= 75) return 'from-secondary to-secondary-light';
        if (progress >= 50) return 'from-primary to-accent';
        if (progress >= 25) return 'from-warning to-primary';
        return 'from-danger to-warning';
    };

    const getMilestoneIcon = (): string => {
        if (progress >= 75) return '🏆';
        if (progress >= 50) return '🎯';
        if (progress >= 25) return '🌟';
        return '🚀';
    };

    return (
        <div className="card relative overflow-hidden">
            {/* Efecto de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50"></div>

            <div className="relative z-10">
                {/* Header con icono */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getMilestoneIcon()}</span>
                    <div className="text-sm font-semibold">Progreso Misión 2026</div>
                </div>

                {/* Barra de progreso circular */}
                <div className="relative w-full h-32 flex items-center justify-center mb-3">
                    {/* SVG Circular */}
                    <svg className="w-28 h-28 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 48 * (displayProgress / 100)} ${2 * Math.PI * 48}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Porcentaje central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-primary">
                            {displayProgress.toFixed(1)}%
                        </div>
                        <div className="text-xs text-tertiary">del año</div>
                    </div>
                </div>

                {/* Información del mes */}
                <div className="flex justify-between text-xs text-tertiary mb-2">
                    <span>{month}</span>
                    <span>{Math.ceil((100 - progress) * 3.65)} días restantes</span>
                </div>

                {/* Hitos alcanzados */}
                <div className="flex justify-between mt-3 pt-3 border-t border-surface-lighter">
                    <div className={`text-center flex-1 transition-opacity ${milestones.quarter ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="text-lg">🌟</div>
                        <div className="text-xs text-tertiary">Q1</div>
                    </div>
                    <div className={`text-center flex-1 transition-opacity ${milestones.half ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="text-lg">🎯</div>
                        <div className="text-xs text-tertiary">Q2</div>
                    </div>
                    <div className={`text-center flex-1 transition-opacity ${milestones.threeQuarters ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="text-lg">🏆</div>
                        <div className="text-xs text-tertiary">Q3</div>
                    </div>
                    <div className={`text-center flex-1 transition-opacity ${progress >= 100 ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="text-lg">👑</div>
                        <div className="text-xs text-tertiary">Q4</div>
                    </div>
                </div>

                {/* Mensaje motivacional */}
                {progress < 25 && (
                    <div className="mt-3 p-2 bg-warning/10 border border-warning/30 rounded text-xs text-center">
                        ¡El viaje apenas comienza! 🚀
                    </div>
                )}
                {progress >= 25 && progress < 50 && (
                    <div className="mt-3 p-2 bg-primary/10 border border-primary/30 rounded text-xs text-center">
                        ¡Buen ritmo! Sigue así 💪
                    </div>
                )}
                {progress >= 50 && progress < 75 && (
                    <div className="mt-3 p-2 bg-secondary/10 border border-secondary/30 rounded text-xs text-center">
                        ¡Más de la mitad! 🎯
                    </div>
                )}
                {progress >= 75 && progress < 100 && (
                    <div className="mt-3 p-2 bg-secondary/10 border border-secondary/30 rounded text-xs text-center">
                        ¡La recta final! 🏁
                    </div>
                )}
                {progress >= 100 && (
                    <div className="mt-3 p-2 bg-secondary/10 border border-secondary/30 rounded text-xs text-center font-semibold">
                        🎉 ¡Meta alcanzada! 👑
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressCard;