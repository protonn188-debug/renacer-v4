import React, { useState } from 'react';

const APIPage: React.FC = () => {
    const [consoleOutput, setConsoleOutput] = useState<string[]>([
        '> Renacer v4.0 Console',
        '> Escribe Renacer.methods.help() para ver comandos disponibles'
    ]);

    const commands = [
        {
            command: 'Renacer.methods.simulateDay()',
            description: 'Simula un día completo de progreso'
        },
        {
            command: 'Renacer.methods.exportData()',
            description: 'Exporta todos los datos del sistema'
        },
        {
            command: 'Renacer.state',
            description: 'Ver estado completo del sistema'
        },
        {
            command: 'Renacer.methods.resetSystem()',
            description: 'Reiniciar el sistema completo'
        }
    ];

    const runCommand = (cmd: string) => {
        setConsoleOutput(prev => [...prev, `> ${cmd}`, '✓ Comando ejecutado correctamente']);
        try {
            eval(cmd);
        } catch (error) {
            setConsoleOutput(prev => [...prev, `✗ Error: ${error}`]);
        }
    };

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-code"></i>
                    <span>API y Desarrollo</span>
                </div>
                <h1 className="greeting">
                    Consola de <span className="text-primary">Desarrollo</span>
                </h1>
                <p className="greeting-subtitle">
                    Accede a funciones avanzadas y API del sistema Renacer.
                </p>
            </header>

            <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Comandos Disponibles</h3>
                    <div className="space-y-3">
                        {commands.map((cmd, index) => (
                            <div 
                                key={index}
                                className="p-3 bg-surface-light rounded cursor-pointer hover:bg-surface-lighter transition"
                                onClick={() => runCommand(cmd.command)}
                            >
                                <code className="text-primary text-sm">{cmd.command}</code>
                                <p className="text-xs text-tertiary mt-1">{cmd.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Consola Interactiva</h3>
                    <div 
                        className="bg-black p-4 rounded font-mono text-sm h-80 overflow-y-auto"
                        style={{ backgroundColor: '#000', color: '#0f0' }}
                    >
                        {consoleOutput.map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="text-xl font-semibold mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-tertiary mb-1">Versión</div>
                        <div className="font-mono">v4.0.0</div>
                    </div>
                    <div>
                        <div className="text-tertiary mb-1">Almacenamiento</div>
                        <div className="font-mono">LocalStorage</div>
                    </div>
                    <div>
                        <div className="text-tertiary mb-1">Estado</div>
                        <div className="font-mono text-secondary">✓ Operativo</div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default APIPage;