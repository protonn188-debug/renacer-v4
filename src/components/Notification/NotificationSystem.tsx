import React, { useEffect, useState } from 'react';

interface Notification {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationSystemProps {
    notifications: Notification[];
}

interface NotificationItemProps {
    notification: Notification;
    index: number;
    onDismiss: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
    notification, 
    index, 
    onDismiss 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Animación de entrada
        setTimeout(() => setIsVisible(true), 100);

        // Barra de progreso
        const duration = 5000;
        const intervalTime = 50;
        const decrement = (100 / duration) * intervalTime;

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrement;
                if (newProgress <= 0) {
                    clearInterval(progressInterval);
                    handleDismiss();
                    return 0;
                }
                return newProgress;
            });
        }, intervalTime);

        return () => clearInterval(progressInterval);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
    };

    const getColorClass = (): string => {
        const colors = {
            info: 'bg-primary border-primary',
            success: 'bg-secondary border-secondary',
            warning: 'bg-warning border-warning',
            error: 'bg-danger border-danger'
        };
        return colors[notification.type];
    };

    const getIcon = (): string => {
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        return icons[notification.type];
    };

    const getEmoji = (): string => {
        const emojis = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return emojis[notification.type];
    };

    return (
        <div 
            className={`relative transform transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            style={{ 
                transitionDelay: `${index * 50}ms`,
                maxWidth: '400px'
            }}
        >
            <div className={`${getColorClass()} text-white p-4 rounded-lg shadow-2xl border-l-4 backdrop-blur-sm bg-opacity-95 relative overflow-hidden`}>
                {/* Barra de progreso */}
                <div 
                    className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-50"
                    style={{ width: `${progress}%` }}
                ></div>

                <div className="flex items-start gap-3 relative z-10">
                    {/* Icono animado */}
                    <div className="text-2xl animate-bounce">
                        {getEmoji()}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                        <div className="font-semibold mb-1 flex items-center gap-2">
                            <i className={`${getIcon()} text-sm`}></i>
                            {notification.type === 'success' && 'Éxito'}
                            {notification.type === 'error' && 'Error'}
                            {notification.type === 'warning' && 'Advertencia'}
                            {notification.type === 'info' && 'Información'}
                        </div>
                        <div className="text-sm opacity-90">
                            {notification.message}
                        </div>
                    </div>

                    {/* Botón cerrar */}
                    <button 
                        onClick={handleDismiss}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"></div>
            </div>
        </div>
    );
};

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
    const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        setActiveNotifications(notifications);
    }, [notifications]);

    const handleDismiss = (id: number) => {
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-toast space-y-3 pointer-events-none">
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
            
            <div className="space-y-2 pointer-events-auto">
                {activeNotifications.map((notification, index) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        index={index}
                        onDismiss={handleDismiss}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationSystem;