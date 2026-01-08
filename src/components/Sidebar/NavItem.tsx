import React, { useState } from 'react';

interface NavItemProps {
    icon: string;
    label: string;
    section: string;
    badge?: string | number;
    active: boolean;
    onClick: (section: string) => void;
    hasNotification?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
    icon, 
    label, 
    section, 
    badge, 
    active, 
    onClick,
    hasNotification = false
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const getBadgeStyle = () => {
        const badgeStr = String(badge);
        
        if (badgeStr.includes('%')) {
            return {
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(52, 211, 153, 0.2))',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)'
            };
        }
        
        if (badgeStr === 'AI' || badgeStr.includes('v')) {
            return {
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2))',
                color: '#a78bfa',
                border: '1px solid rgba(139, 92, 246, 0.4)'
            };
        }
        
        return {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.2))',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.4)'
        };
    };

    return (
        <a 
            href="#" 
            className={`nav-item ${active ? 'active' : ''} relative group`}
            onClick={(e) => {
                e.preventDefault();
                onClick(section);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Indicador de notificación */}
            {hasNotification && !active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-danger animate-pulse"></div>
            )}

            {/* Icono con animación */}
            <i className={`nav-icon ${icon} transition-transform ${isHovered ? 'scale-110' : ''}`}></i>
            
            {/* Label */}
            <span className="transition-colors">{label}</span>
            
            {/* Badge mejorado */}
            {badge && (
                <span 
                    className={`nav-badge transition-all ${isHovered ? 'scale-110' : ''}`}
                    style={getBadgeStyle()}
                >
                    {badge}
                </span>
            )}

            {/* Tooltip en hover */}
            {isHovered && !active && (
                <div className="absolute left-full ml-2 px-3 py-1 bg-surface-light border border-primary/30 rounded text-xs whitespace-nowrap animate-fade-in z-10">
                    {label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-surface-light border-l border-t border-primary/30 rotate-45"></div>
                </div>
            )}

            {/* Efecto de ripple al click */}
            <div className="absolute inset-0 overflow-hidden rounded">
                <div className={`absolute inset-0 bg-primary/20 rounded-full scale-0 ${active ? 'animate-ripple' : ''}`}></div>
            </div>
        </a>
    );
};

export default NavItem;