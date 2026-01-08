import React from 'react';
import NavItem from './NavItem';
import ProgressCard from './ProgressCard';
import { getCurrentMonth } from '../../utils/dateUtils';

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    progress: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, progress }) => {
    return (
        <aside className="sidebar" id="sidebar">
            <div className="sidebar-header">
                <div className="logo">Renacer</div>
                <div className="logo-subtitle">Sistema Experto de Transformación</div>
            </div>
            
            <div className="nav-section">
                <div className="nav-title">Núcleo</div>
                <NavItem 
                    icon="fas fa-home"
                    label="Dashboard"
                    section="dashboard"
                    active={activeSection === 'dashboard'}
                    onClick={onSectionChange}
                />
                <NavItem 
                    icon="fas fa-brain"
                    label="Entrenamiento Cognitivo"
                    section="cognitive"
                    badge="AI"
                    active={activeSection === 'cognitive'}
                    onClick={onSectionChange}
                />
                <NavItem 
                    icon="fas fa-chart-network"
                    label="Analíticas Avanzadas"
                    section="analytics"
                    active={activeSection === 'analytics'}
                    onClick={onSectionChange}
                />
            </div>
            
            <div className="nav-section">
                <div className="nav-title">Desarrollo</div>
                <NavItem 
                    icon="fas fa-book-open"
                    label="Sistema de Lectura"
                    section="reading"
                    badge="24"
                    active={activeSection === 'reading'}
                    onClick={onSectionChange}
                />
                <NavItem 
                    icon="fas fa-seedling"
                    label="Arquitectura de Hábitos"
                    section="habits"
                    badge="5×7"
                    active={activeSection === 'habits'}
                    onClick={onSectionChange}
                />
                <NavItem 
                    icon="fas fa-calendar-alt"
                    label="Programación Inteligente"
                    section="schedule"
                    active={activeSection === 'schedule'}
                    onClick={onSectionChange}
                />
            </div>
            
            <div className="nav-section">
                <div className="nav-title">Sistema</div>
                <NavItem 
                    icon="fas fa-user-secret"
                    label="Seguridad y Privacidad"
                    section="privacy"
                    badge="100%"
                    active={activeSection === 'privacy'}
                    onClick={onSectionChange}
                />
                <NavItem 
                    icon="fas fa-sliders-h"
                    label="Configuración del Sistema"
                    section="settings"
                    active={activeSection === 'settings'}
                    onClick={onSectionChange}
                />
                <NavItem 
                    icon="fas fa-code"
                    label="API y Desarrollo"
                    section="api"
                    badge="v4.0"
                    active={activeSection === 'api'}
                    onClick={onSectionChange}
                />
            </div>
            
            {/* Card de progreso al final con margen superior automático */}
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <ProgressCard 
                    progress={progress}
                    month={`${getCurrentMonth()} 2026`}
                />
            </div>
        </aside>
    );
};

export default Sidebar;