import { RenacerStateType } from '../types';

export const setupConsoleAPI = (
    state: RenacerStateType, 
    setState: React.Dispatch<React.SetStateAction<RenacerStateType>>,
    showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
) => {
    (window as any).Renacer = {
        state,
        
        methods: {
            simulateDay() {
                setState(prev => {
                    const newState = { ...prev };
                    
                    // Incrementar racha
                    newState.user.streak++;
                    
                    // Simular páginas
                    newState.user.dailyPages = 20;
                    newState.reading.currentBook.currentPage += 20;
                    
                    // Calcular progreso
                    newState.reading.currentBook.progress = 
                        (newState.reading.currentBook.currentPage / 
                         newState.reading.currentBook.totalPages) * 100;
                    
                    // Marcar primeros 3 hábitos
                    newState.habits = newState.habits.map((h, i) => ({
                        ...h,
                        completed: i < 3
                    }));
                    
                    return newState;
                });
                
                showNotification('Día simulado con éxito', 'success');
                return 'Día simulado exitosamente';
            },
            
            exportData() {
                const data = JSON.stringify(state, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `renacer-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                
                URL.revokeObjectURL(url);
                showNotification('Datos exportados', 'success');
                return 'Datos exportados exitosamente';
            },
            
            importData(jsonData: string) {
                try {
                    const data = JSON.parse(jsonData);
                    setState(data);
                    showNotification('Datos importados', 'success');
                    return 'Datos importados exitosamente';
                } catch (error) {
                    showNotification('Error al importar datos', 'error');
                    return `Error: ${(error as Error).message}`;
                }
            },
            
            resetSystem() {
                // CAMBIO AQUÍ: confirm -> window.confirm
                if (window.confirm('⚠️ ¿Estás seguro de querer reiniciar todo el sistema?')) {
                    localStorage.removeItem('renacer_state_v4');
                    localStorage.removeItem('last_reset');
                    window.location.reload();
                }
            },
            
            help() {
                const habitsCompleted = state.habits.filter(h => h.completed).length;
                
                return `
██████╗ ███████╗███╗   ██╗ █████╗  ██████╗███████╗██████╗ 
██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔════╝██╔══██╗
██████╔╝█████╗  ██╔██╗ ██║███████║██║     █████╗  ██████╔╝
██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║██║     ██╔══╝  ██╔══██╗
██║  ██║███████╗██║ ╚████║██║  ██║╚██████╗███████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝
                                                            
Sistema Renacer v4.0 - Comandos disponibles:

Renacer.methods.simulateDay()      - Simula un día de progreso
Renacer.methods.exportData()       - Exporta todos los datos
Renacer.methods.importData(json)   - Importa datos desde JSON
Renacer.methods.resetSystem()      - Reinicia el sistema
Renacer.methods.help()             - Muestra esta ayuda

Estado actual:
- Usuario: ${state.user.codename}
- Racha: ${state.user.streak} días
- Páginas hoy: ${state.user.dailyPages}/20
- Progreso lectura: ${state.reading.currentBook.progress.toFixed(1)}%
- Hábitos: ${habitsCompleted}/${state.habits.length}
                `;
            }
        }
    };

    // Mensaje de bienvenida en consola
    console.log(`
██████╗ ███████╗███╗   ██╗ █████╗  ██████╗███████╗██████╗ 
██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔════╝██╔══██╗
██████╔╝█████╗  ██╔██╗ ██║███████║██║     █████╗  ██████╔╝
██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║██║     ██╔══╝  ██╔══██╗
██║  ██║███████╗██║ ╚████║██║  ██║╚██████╗███████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝
                                                            
Sistema de Transformación Personal v4.0
Escribe Renacer.methods.help() para ver comandos disponibles
    `);
};