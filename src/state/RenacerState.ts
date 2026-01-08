import { RenacerStateType } from '../types';

export const initialState: RenacerStateType = {
    version: '4.0',
    user: {
        codename: 'Hol',
        goal: 'Primer Puesto 2026',
        level: 'EXPERT',
        workMode: true,
        streak: 0,
        dailyPages: 0
    },
    
    reading: {
        currentBook: {
            title: 'Meditaciones',
            author: 'Marco Aurelio',
            totalPages: 180,
            currentPage: 0,
            progress: 0,
            category: 'Filosofía Estoica',
            quote: '"No actúes como si fueras a vivir diez mil años. La muerte pende sobre ti. Mientras vives, mientras es posible, sé bueno."'
        },
        plan: [
            { period: 'Enero-Febrero', category: 'Filosofía', books: 4, completed: 0 },
            { period: 'Marzo-Abril', category: 'Historia Mundial', books: 4, completed: 0 },
            { period: 'Mayo-Junio', category: 'Historia Peruana', books: 4, completed: 0 },
            { period: 'Julio-Agosto', category: 'Economía Clásica', books: 4, completed: 0 },
            { period: 'Septiembre-Octubre', category: 'Derecho Internacional', books: 4, completed: 0 },
            { period: 'Noviembre-Diciembre', category: 'Geopolítica', books: 4, completed: 0 }
        ]
    },
    
    habits: [
        { id: 1, name: 'Ejercicio Físico', icon: '🏋️', frequency: '3×/semana', completed: false },
        { id: 2, name: 'Lectura Profunda', icon: '📖', frequency: '20 págs/día', completed: false },
        { id: 3, name: 'Estudio Intenso', icon: '🧠', frequency: '5h diarias', completed: false },
        { id: 4, name: 'Ayuno Digital', icon: '🔒', frequency: 'Sin redes', completed: false },
        { id: 5, name: 'Orden del Espacio', icon: '✨', frequency: 'Ambiente óptimo', completed: false }
    ],
    
    privacy: [
        { id: 1, task: 'VPN siempre activo', priority: 'Alta', enabled: false },
        { id: 2, task: 'Brave como navegador principal', priority: 'Alta', enabled: false },
        { id: 3, task: 'Eliminar apps innecesarias', priority: 'Media', enabled: false },
        { id: 4, task: 'Configurar permisos iOS', priority: 'Alta', enabled: false }
    ],
    
    schedule: {
        workMode: [
            { time: '06:00', activity: 'Rutina Matutina + Ejercicio', category: 'SALUD', description: 'Activación física y preparación mental' },
            { time: '07:00', activity: 'Procesamiento Académico', category: 'ACADÉMICO', description: 'Sesión universitaria - Clases' },
            { time: '12:30', activity: 'Adquisición de Recursos', category: 'TRABAJO', description: 'Trabajo - 4 horas de desarrollo' },
            { time: '17:00', activity: 'Estudio Profundo', category: 'ESTUDIO', description: 'Sesión de estudio enfocado' },
            { time: '21:00', activity: 'Procesamiento Filosófico', category: 'DESARROLLO', description: 'Lectura y reflexión' }
        ],
        studyMode: [
            { time: '06:00', activity: 'Rutina Matutina + Ejercicio', category: 'SALUD', description: 'Activación física y preparación mental' },
            { time: '07:00', activity: 'Procesamiento Académico', category: 'ACADÉMICO', description: 'Sesión universitaria - Clases' },
            { time: '12:30', activity: 'Estudio Intensivo (3h)', category: 'ESTUDIO', description: 'Sesión de estudio enfocado' },
            { time: '16:00', activity: 'Investigación Personal', category: 'DESARROLLO', description: 'Desarrollo de conocimiento' },
            { time: '20:00', activity: 'Procesamiento Filosófico', category: 'DESARROLLO', description: 'Lectura y reflexión' }
        ]
    }
};