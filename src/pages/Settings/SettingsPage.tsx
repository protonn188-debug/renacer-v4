import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState({
        dailyGoal: 20,
        notifications: true,
        darkMode: true,
        autoSave: true,
        username: 'Jorge Jack',
        goal: 'Primer Puesto 2026'
    });

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-sliders-h"></i>
                    <span>Configuración del Sistema</span>
                </div>
                <h1 className="greeting">
                    Personaliza <span className="text-primary">Renacer</span>
                </h1>
                <p className="greeting-subtitle">
                    Ajusta el sistema a tus preferencias y necesidades.
                </p>
            </header>

            <div className="grid grid-cols-2 gap-5">
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Perfil de Usuario</h3>
                    
                    <div className="input-group">
                        <label className="input-label">Nombre de Usuario</label>
                        <input 
                            type="text"
                            className="input-field"
                            value={settings.username}
                            onChange={(e) => setSettings({...settings, username: e.target.value})}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Meta Principal</label>
                        <input 
                            type="text"
                            className="input-field"
                            value={settings.goal}
                            onChange={(e) => setSettings({...settings, goal: e.target.value})}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Meta Diaria de Páginas</label>
                        <input 
                            type="number"
                            className="input-field"
                            value={settings.dailyGoal}
                            onChange={(e) => setSettings({...settings, dailyGoal: parseInt(e.target.value)})}
                        />
                    </div>

                    <button className="btn btn-primary w-full">
                        <i className="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Preferencias</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-surface-light rounded">
                            <div>
                                <div className="font-medium">Notificaciones</div>
                                <div className="text-xs text-tertiary">Recibir alertas del sistema</div>
                            </div>
                            <div className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications}
                                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                                />
                                <span className="toggle-slider"></span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-surface-light rounded">
                            <div>
                                <div className="font-medium">Modo Oscuro</div>
                                <div className="text-xs text-tertiary">Tema visual de la interfaz</div>
                            </div>
                            <div className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.darkMode}
                                    onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                                />
                                <span className="toggle-slider"></span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-surface-light rounded">
                            <div>
                                <div className="font-medium">Guardado Automático</div>
                                <div className="text-xs text-tertiary">Sincronizar cada 30 segundos</div>
                            </div>
                            <div className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.autoSave}
                                    onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                                />
                                <span className="toggle-slider"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mt-5">
                <h3 className="text-xl font-semibold mb-4 text-danger">
                    <i className="fas fa-exclamation-triangle"></i> Zona de Peligro
                </h3>
                <p className="text-sm text-tertiary mb-4">
                    Estas acciones son irreversibles. Procede con precaución.
                </p>
                <div className="flex gap-3">
                    <button className="btn btn-secondary">
                        <i className="fas fa-download"></i>
                        Exportar Datos
                    </button>
                    <button className="btn btn-secondary">
                        <i className="fas fa-upload"></i>
                        Importar Datos
                    </button>
                    <button 
                        className="btn"
                        style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
                        onClick={() => {
                            if (window.confirm('¿Estás seguro? Esto borrará todos tus datos.')) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}
                    >
                        <i className="fas fa-trash"></i>
                        Resetear Sistema
                    </button>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;