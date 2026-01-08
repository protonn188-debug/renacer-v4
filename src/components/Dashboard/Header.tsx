import React, { useState, useEffect } from 'react';

interface HeaderProps {
    username: string;
    goal: string;
}

const Header: React.FC<HeaderProps> = ({ username, goal }) => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [greeting, setGreeting] = useState('');
    const [motivationalQuote, setMotivationalQuote] = useState('');

    useEffect(() => {
        updateDateTime();
        updateGreeting();
        selectMotivationalQuote();

        const interval = setInterval(() => {
            updateDateTime();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const updateDateTime = () => {
        const now = new Date();
        
        const dateOptions: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        setCurrentDate(now.toLocaleDateString('es-ES', dateOptions));
        setCurrentTime(now.toLocaleTimeString('es-ES'));
    };

    const updateGreeting = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            setGreeting('Buenos días');
        } else if (hour >= 12 && hour < 19) {
            setGreeting('Buenas tardes');
        } else {
            setGreeting('Buenas noches');
        }
    };

    const selectMotivationalQuote = () => {
        const quotes = [
            '"La educación es el arma más poderosa para cambiar el mundo." - Nelson Mandela',
            '"El éxito es la suma de pequeños esfuerzos repetidos día tras día." - Robert Collier',
            '"No cuentes los días, haz que los días cuenten." - Muhammad Ali',
            '"La disciplina es el puente entre metas y logros." - Jim Rohn',
            '"El secreto para salir adelante es comenzar." - Mark Twain'
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setMotivationalQuote(randomQuote);
    };

    const getDayProgress = (): number => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        return ((hour * 60 + minute) / (24 * 60)) * 100;
    };

    return (
        <header className="main-header relative">
            {/* Efecto de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-xl -z-10"></div>

            {/* Fecha y hora */}
            <div className="date-display flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <i className="fas fa-calendar-alt text-primary"></i>
                    <span>{currentDate}</span>
                    <span className="text-tertiary">•</span>
                    <i className="fas fa-clock text-secondary"></i>
                    <span className="font-mono">{currentTime}</span>
                </div>

                {/* Progreso del día */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">Progreso del día:</span>
                    <div className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                            style={{ width: `${getDayProgress()}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-mono text-tertiary">{getDayProgress().toFixed(0)}%</span>
                </div>
            </div>

            {/* Saludo principal */}
            <h1 className="greeting relative">
                {greeting}, <span className="text-primary relative inline-block">
                    {username}
                    <span className="absolute -top-2 -right-6 text-2xl animate-wave">👋</span>
                </span>
            </h1>

            {/* Subtítulo con animación de escritura */}
            <div className="greeting-subtitle">
                <div className="flex items-center gap-2 mb-2">
                    <span>Sistema operativo cargado. Listo para la transformación hacia</span>
                    <span className="text-primary font-semibold">{goal}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    <span className="text-secondary font-medium">Estado: Óptimo</span>
                    <span className="text-tertiary">•</span>
                    <span className="text-tertiary">Todos los sistemas operativos</span>
                </div>
            </div>

            {/* Cita motivacional */}
            <div className="mt-4 p-4 bg-surface-light/50 border-l-4 border-primary rounded-r-lg">
                <div className="flex items-start gap-3">
                    <i className="fas fa-quote-left text-primary text-xl opacity-50"></i>
                    <p className="text-sm text-secondary italic flex-1">{motivationalQuote}</p>
                </div>
            </div>

            {/* Animación de ola */}
            <style>{`
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-20deg); }
                }
                .animate-wave {
                    animation: wave 1.5s ease-in-out infinite;
                    transform-origin: 70% 70%;
                }
            `}</style>
        </header>
    );
};

export default Header;