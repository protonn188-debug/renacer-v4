import React, { useState, useEffect } from 'react';

interface ProgressModalProps {
    onSave: (pages: number) => void;
    onClose: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ onSave, onClose }) => {
    const [pages, setPages] = useState(20);
    const [customInput, setCustomInput] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [readingTime, setReadingTime] = useState(0);
    const [startTime] = useState(Date.now());

    // Calcular tiempo de lectura
    useEffect(() => {
        const interval = setInterval(() => {
            setReadingTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        // Atajos de teclado
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '1') setPages(10);
            if (e.key === '2') setPages(20);
            if (e.key === '3') setPages(30);
            if (e.key === '4') setPages(40);
            if (e.key === 'Enter' && !showCustom) handleSave();
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keypress', handleKeyPress);
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keypress', handleKeyPress);
        };
    }, [onClose, showCustom, pages]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSave = () => {
        const finalPages = showCustom ? parseInt(customInput) || 0 : pages;
        
        if (finalPages > 0 && finalPages <= 200) {
            // Guardar estadísticas de sesión
            const session = {
                date: new Date().toISOString(),
                pages: finalPages,
                duration: readingTime,
                speed: (finalPages / (readingTime / 60)).toFixed(2) // páginas por minuto
            };

            const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
            sessions.push(session);
            localStorage.setItem('reading_sessions', JSON.stringify(sessions));

            onSave(finalPages);
        } else {
            alert('Por favor ingresa un número válido entre 1 y 200');
        }
    };

    const setQuickPages = (amount: number) => {
        setPages(amount);
        setShowCustom(false);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const estimatedSpeed = pages > 0 && readingTime > 0 
        ? (pages / (readingTime / 60)).toFixed(1) 
        : '0';

    const quickOptions = [
        { pages: 10, icon: '🐢', label: '10 páginas', key: '1', color: 'secondary' },
        { pages: 20, icon: '🎯', label: '20 (meta)', key: '2', color: 'primary' },
        { pages: 30, icon: '🚀', label: '30 páginas', key: '3', color: 'accent' },
        { pages: 40, icon: '👑', label: '40 (extra)', key: '4', color: 'warning' }
    ];

    return (
        <div 
            className="modal-overlay active" 
            onClick={handleOverlayClick}
        >
            <div className="modal" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div>
                        <div className="modal-title">Registrar Progreso de Lectura</div>
                        <div className="text-xs text-tertiary mt-1">
                            ⏱️ Tiempo de sesión: {formatTime(readingTime)} • 
                            📊 Velocidad: {estimatedSpeed} pág/min
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="mb-5">
                    <p className="text-secondary mb-4">
                        ¿Cuántas páginas has leído de "Meditaciones"?
                    </p>

                    {/* Vista de opciones rápidas */}
                    {!showCustom && (
                        <>
                            <div className="input-group">
                                <label className="input-label flex items-center justify-between">
                                    <span>Páginas leídas</span>
                                    <span className="text-xs text-tertiary">Usa el slider o atajos (1, 2, 3, 4)</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="50"
value={pages}
onChange={(e) => setPages(parseInt(e.target.value))}
className="input-field"
/>
<div className="flex justify-between mt-2">
<span className="text-sm text-tertiary">1</span>
<div className="text-center">
<span className="text-3xl font-bold text-primary block">{pages}</span>
<span className="text-xs text-tertiary">
~{Math.ceil(pages * 3)} minutos de lectura
</span>
</div>
<span className="text-sm text-tertiary">50</span>
</div>
</div>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {quickOptions.map((option) => (
                                <button 
                                    key={option.pages}
                                    className={`btn ${pages === option.pages ? 'btn-primary' : 'btn-secondary'} relative overflow-hidden`}
                                    onClick={() => setQuickPages(option.pages)}
                                >
                                    <span className="text-2xl mr-2">{option.icon}</span>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold">{option.label}</div>
                                        <div className="text-xs opacity-75">Atajo: {option.key}</div>
                                    </div>
                                    {pages === option.pages && (
                                        <div className="absolute top-1 right-1">
                                            <i className="fas fa-check-circle text-xs"></i>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="btn btn-secondary w-full mb-3"
                            onClick={() => setShowCustom(true)}
                        >
                            <i className="fas fa-keyboard"></i>
                            Ingresar cantidad personalizada
                        </button>
                    </>
                )}

                {/* Vista de input personalizado */}
                {showCustom && (
                    <div className="mb-5">
                        <div className="input-group">
                            <label className="input-label">Cantidad personalizada</label>
                            <input 
                                type="number"
                                className="input-field"
                                placeholder="Ej: 15"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                autoFocus
                                min="1"
                                max="200"
                            />
                            <div className="text-xs text-tertiary mt-1">
                                Ingresa un número entre 1 y 200 páginas
                            </div>
                        </div>

                        <button 
                            className="btn btn-secondary w-full mt-3"
                            onClick={() => {
                                setShowCustom(false);
                                setCustomInput('');
                            }}
                        >
                            <i className="fas fa-arrow-left"></i>
                            Volver a opciones rápidas
                        </button>
                    </div>
                )}

                {/* Estadísticas de la sesión */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-surface-light rounded">
                    <div className="text-center">
                        <div className="text-xs text-tertiary">Páginas</div>
                        <div className="text-lg font-bold text-primary">
                            {showCustom ? (customInput || '0') : pages}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-tertiary">Tiempo</div>
                        <div className="text-lg font-bold text-secondary">
                            {formatTime(readingTime)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-tertiary">Velocidad</div>
                        <div className="text-lg font-bold text-accent">
                            {estimatedSpeed} p/m
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        className="btn btn-primary flex-1"
                        onClick={handleSave}
                    >
                        <i className="fas fa-save"></i>
                        Guardar Progreso {showCustom && customInput ? `(${customInput}p)` : `(${pages}p)`}
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>

                {/* Hint de atajos */}
                <div className="mt-4 p-3 bg-surface-light rounded text-xs">
                    <div className="font-semibold mb-2 text-primary">
                        <i className="fas fa-keyboard mr-1"></i>
                        Atajos de teclado
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-tertiary">
                        <div>• <kbd className="px-2 py-1 bg-surface rounded">1-4</kbd> Opciones rápidas</div>
                        <div>• <kbd className="px-2 py-1 bg-surface rounded">Enter</kbd> Guardar</div>
                        <div>• <kbd className="px-2 py-1 bg-surface rounded">Esc</kbd> Cancelar</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};
export default ProgressModal;