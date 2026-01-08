import { RenacerStateType } from '../types';
import { initialState } from './RenacerState';

const STORAGE_KEY = 'renacer_state_v4';

export const loadState = (): RenacerStateType | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Validar que tenga todas las propiedades necesarias
            if (!parsed.schedule || !parsed.schedule.workMode || !parsed.schedule.studyMode) {
                console.warn('⚠️ Estado guardado incompleto. Usando estado inicial.');
                return initialState;
            }
            
            // Mezclar con estado inicial para agregar propiedades faltantes
            return {
                ...initialState,
                ...parsed,
                schedule: {
                    workMode: parsed.schedule?.workMode || initialState.schedule.workMode,
                    studyMode: parsed.schedule?.studyMode || initialState.schedule.studyMode
                }
            };
        }
    } catch (error) {
        console.warn('⚠️ No se pudo cargar el estado guardado:', error);
        return initialState;
    }
    return null;
};

export const saveState = (state: RenacerStateType): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('💥 Error al guardar el estado:', error);
    }
};

export const clearState = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};