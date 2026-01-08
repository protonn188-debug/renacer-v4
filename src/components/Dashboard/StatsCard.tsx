import React, { useState, useEffect } from 'react';

interface StatsCardProps {
    icon: string;
    value: string | number;
    label: string;
    progress: number;
    delay?: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
    icon, 
    value, 
    label, 
    progress, 
    delay = 0,
    trend,
    trendValue
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Animación de contador
        const numericValue = typeof value === 'number' ? value : parseInt(String(value).match(/\d+/)?.[0] || '0');
        let start = 0;
        const duration = 1000;
        const increment = numericValue / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= numericValue) {
                setDisplayValue(numericValue);
                clearInterval(timer);
                setIsAnimating(false);
            } else {
                setDisplayValue(Math.floor(start));
                setIsAnimating(true);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return '📈';
            case 'down': return '📉';
            case 'stable': return '➡️';
            default: return null;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up': return 'text-secondary';
            case 'down': return 'text-danger';
            case 'stable': return 'text-warning';
            default: return 'text-tertiary';
        }
    };

    const getProgressColor = () => {
        if (progress >= 100) return 'from-secondary to-secondary-light';
        if (progress >= 75) return 'from-primary to-accent';
        if (progress >= 50) return 'from-warning to-primary';
        return 'from-danger to-warning';
    };

    return (
        <div 
            className="card stat-card animate-fade-in hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group" 
            style={{ animationDelay: `${delay}s` }}
        >
            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Icono con animación */}
            <div className={`stat-icon relative ${isAnimating ? 'animate-pulse' : ''}`}>
                <i className={icon}></i>
                {progress === 100 && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                        ✨
                    </div>
                )}
            </div>

            {/* Valor principal */}
            <div className="stat-value relative">
                {typeof value === 'number' ? displayValue : value}
                
                {/* Indicador de cambio */}
                {trend && trendValue && (
                    <div className={`absolute -top-1 -right-1 text-xs ${getTrendColor()} flex items-center gap-1`}>
                        <span>{getTrendIcon()}</span>
                        <span className="font-normal">{trendValue}</span>
                    </div>
                )}
            </div>

            {/* Label */}
            <div className="stat-label">{label}</div>

            {/* Barra de progreso mejorada */}
            <div className="progress-bar mt-4 relative">
                <div 
                    className={`progress-fill bg-gradient-to-r ${getProgressColor()} transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                >
                    {/* Brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
            </div>

            {/* Porcentaje */}
            <div className="flex justify-between text-xs mt-2 text-tertiary">
                <span>{progress.toFixed(0)}%</span>
                <span>{progress === 100 ? '🎯 Meta cumplida' : 'En progreso'}</span>
            </div>

            {/* Badge de logro */}
            {progress === 100 && (
                <div className="absolute top-2 right-2 bg-secondary text-white text-xs px-2 py-1 rounded-full animate-bounce">
                    ✓ Completado
                </div>
            )}
        </div>
    );
};

export default StatsCard;