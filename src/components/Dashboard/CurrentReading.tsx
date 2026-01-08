import React, { useEffect, useState } from 'react';
import { Book } from '../../types';

interface CurrentReadingProps {
    book: Book;
    onLogProgress: () => void;
}

const CurrentReading: React.FC<CurrentReadingProps> = ({ book, onLogProgress }) => {
    const [sessionPages, setSessionPages] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [isReading, setIsReading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);
    const [quotes, setQuotes] = useState<string[]>([]);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    // Timer de sesión de lectura
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isReading) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        
        return () => clearInterval(interval);
    }, [isReading]);

    // Calcular tiempo estimado restante
    useEffect(() => {
        const pagesLeft = book.totalPages - book.currentPage;
        const avgTimePerPage = 3; // 3 minutos por página
        setEstimatedTimeLeft(pagesLeft * avgTimePerPage);
    }, [book.currentPage, book.totalPages]);

    // Cargar citas guardadas
    useEffect(() => {
        const savedQuotes = localStorage.getItem(`quotes_${book.title}`);
        if (savedQuotes) {
            setQuotes(JSON.parse(savedQuotes));
        }
    }, [book.title]);

    // Rotar citas cada 10 segundos
    useEffect(() => {
        if (quotes.length > 0) {
            const interval = setInterval(() => {
                setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
            }, 10000);
            
            return () => clearInterval(interval);
        }
    }, [quotes.length]);

    const startReadingSession = () => {
        setIsReading(true);
        setSessionStartTime(new Date());
        setSessionPages(0);
        setElapsedTime(0);
    };

    const endReadingSession = () => {
        setIsReading(false);
        
        if (sessionPages > 0) {
            // Guardar estadísticas de la sesión
            const session = {
                date: new Date().toISOString(),
                pages: sessionPages,
                duration: elapsedTime,
                pagesPerMinute: (sessionPages / (elapsedTime / 60)).toFixed(2)
            };
            
            const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
            sessions.push(session);
            localStorage.setItem('reading_sessions', JSON.stringify(sessions));
        }
    };

    const saveQuote = () => {
        const quote = window.prompt('Escribe o pega la cita que quieres guardar:');
        if (quote && quote.trim()) {
            const newQuotes = [...quotes, quote.trim()];
            setQuotes(newQuotes);
            localStorage.setItem(`quotes_${book.title}`, JSON.stringify(newQuotes));
            
            // Mostrar notificación
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-secondary text-white p-4 rounded-lg shadow-xl z-toast animate-fade-in';
            notification.textContent = '✓ Cita guardada exitosamente';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m ${secs}s`;
    };

    const progress = (book.currentPage / book.totalPages) * 100;
    const pagesLeft = book.totalPages - book.currentPage;
    const daysToFinish = Math.ceil(pagesLeft / 20);

    return (
        <div className="card col-span-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
                <div>
                    <div className="card-title flex items-center gap-3">
                        Sistema de Lectura Activo
                        {isReading && (
                            <span className="text-sm font-normal">
                                <span className="inline-block w-2 h-2 rounded-full bg-danger animate-pulse mr-2"></span>
                                Leyendo... {formatTime(elapsedTime)}
                            </span>
                        )}
                    </div>
                    <div className="card-subtitle">
                        {book.title} • {book.author} • {book.category}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-tertiary">Bloque 1/12 • Enero 2026</span>
                    <div className="badge bg-surface-light text-primary">EN PROGRESO</div>
                </div>
            </div>
            
            <div className="current-reading">
                <div className="book-cover relative">
                    <i className="book-cover-icon fas fa-scroll"></i>
                    <div className="book-badge">LEYENDO AHORA</div>
                    
                    {/* Indicador de progreso circular */}
                    <svg 
                        className="absolute inset-0" 
                        viewBox="0 0 150 210"
                        style={{ 
                            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
                            pointerEvents: 'none'
                        }}
                    >
                        <circle
                            cx="75"
                            cy="105"
                            r="70"
                            fill="none"
                            stroke="rgba(59, 130, 246, 0.2)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="75"
                            cy="105"
                            r="70"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 70 * (progress / 100)} ${2 * Math.PI * 70}`}
                            strokeLinecap="round"
                            transform="rotate(-90 75 105)"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                
                <div>
                    {/* Estadísticas avanzadas */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-surface-light rounded">
                            <div className="text-2xl font-bold text-primary">{book.currentPage}</div>
                            <div className="text-xs text-tertiary">Leídas</div>
                        </div>
                        <div className="text-center p-3 bg-surface-light rounded">
                            <div className="text-2xl font-bold text-accent">{pagesLeft}</div>
                            <div className="text-xs text-tertiary">Restantes</div>
                        </div>
                        <div className="text-center p-3 bg-surface-light rounded">
                            <div className="text-2xl font-bold text-secondary">{daysToFinish}</div>
                            <div className="text-xs text-tertiary">Días (20p/d)</div>
                        </div>
                    </div>

                    {/* Barra de progreso mejorada */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-tertiary">Progreso de Asimilación Cognitiva</span>
                            <span className="font-mono">{book.currentPage}/{book.totalPages} páginas</span>
                        </div>
                        <div className="progress-bar" style={{ height: '12px' }}>
                            <div 
                                className="progress-fill" 
                                style={{ width: `${progress}%` }}
                            >
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                                    {progress.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span className="text-tertiary">
                                Velocidad: {book.currentPage > 0 ? '~20 pág/día' : 'Sin datos'}
                            </span>
                            <span className="text-tertiary">
                                ETA: {formatTime(estimatedTimeLeft * 60)}
                            </span>
                        </div>
                    </div>

                    {/* Sesión de lectura activa */}
                    {isReading && (
                        <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-primary">
                                    📖 Sesión Activa
                                </span>
                                <span className="text-sm font-mono">{sessionPages} páginas</span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSessionPages(prev => prev + 1)}
                                >
                                    +1 página
                                </button>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSessionPages(prev => prev + 5)}
                                >
                                    +5 páginas
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm ml-auto"
                                    onClick={endReadingSession}
                                >
                                    <i className="fas fa-stop"></i>
                                    Terminar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Cita destacada con rotación */}
                    <div className="mb-4">
                        <blockquote className="text-sm italic text-secondary border-l-4 border-primary pl-4 py-2 relative overflow-hidden">
                            {quotes.length > 0 ? (
                                <>
                                    <div className="transition-all duration-500">
                                        "{quotes[currentQuoteIndex]}"
                                    </div>
                                    <div className="text-xs text-tertiary mt-2">
                                        Cita {currentQuoteIndex + 1} de {quotes.length}
                                    </div>
                                </>
                            ) : (
                                book.quote
                            )}
                        </blockquote>
                    </div>
                    
                    {/* Botones de acción mejorados */}
                    <div className="flex gap-3">
                        {!isReading ? (
                            <>
                                <button 
                                    className="btn btn-primary"
                                    onClick={startReadingSession}
                                >
                                    <i className="fas fa-play"></i>
                                    Iniciar Sesión
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={onLogProgress}
                                >
                                    <i className="fas fa-plus"></i>
                                    Registrar Progreso
                                </button>
                            </>
                        ) : (
                            <button 
                                className="btn btn-primary flex-1"
                                onClick={endReadingSession}
                            >
                                <i className="fas fa-check"></i>
                                Finalizar y Guardar
                            </button>
                        )}
                        <button 
                            className="btn btn-secondary"
                            onClick={saveQuote}
                        >
                            <i className="fas fa-quote-right"></i>
                            Guardar Cita
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => {
                                const sessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]');
                                console.table(sessions);
                                alert(`📊 Total de sesiones: ${sessions.length}\nRevisa la consola para más detalles`);
                            }}
                        >
                            <i className="fas fa-chart-bar"></i>
                            Ver Estadísticas
                        </button>
                    </div>

                    {/* Alertas inteligentes */}
                    {book.currentPage === 0 && (
                        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded text-sm">
                            <i className="fas fa-lightbulb text-warning mr-2"></i>
                            <strong>Consejo:</strong> Inicia una sesión de lectura para trackear tu tiempo y velocidad en tiempo real.
                        </div>
                    )}
                    
                    {progress >= 90 && progress < 100 && (
                        <div className="mt-4 p-3 bg-secondary/10 border border-secondary/30 rounded text-sm">
                            <i className="fas fa-trophy text-secondary mr-2"></i>
                            <strong>¡Casi terminas!</strong> Solo {pagesLeft} páginas para completar este libro.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrentReading;