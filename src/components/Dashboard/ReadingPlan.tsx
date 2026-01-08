import React, { useState, useEffect } from 'react';
import { ReadingPlanBlock } from '../../types';

interface ReadingPlanProps {
    plan: ReadingPlanBlock[];
}

interface MonthDetails {
    block: ReadingPlanBlock;
    booksList: string[];
    daysInMonth: number;
    pagesPerDay: number;
}

const ReadingPlan: React.FC<ReadingPlanProps> = ({ plan }) => {
    const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
    const [monthDetails, setMonthDetails] = useState<MonthDetails[]>([]);

    useEffect(() => {
        // Generar detalles para cada bloque
        const details = plan.map((block, index) => {
            const booksList = generateBooksList(block.category);
            const daysInMonth = 60; // 2 meses aproximadamente
            const totalPages = booksList.reduce((sum, book) => sum + estimatePages(book), 0);
            const pagesPerDay = Math.ceil(totalPages / daysInMonth);

            return {
                block,
                booksList,
                daysInMonth,
                pagesPerDay
            };
        });

        setMonthDetails(details);
    }, [plan]);

    const generateBooksList = (category: string): string[] => {
        const books: { [key: string]: string[] } = {
            'Filosofía': [
                'Meditaciones - Marco Aurelio',
                'Apología de Sócrates - Platón',
                'El Príncipe - Maquiavelo',
                'Ética a Nicómaco - Aristóteles'
            ],
            'Historia Mundial': [
                'Breve historia del mundo - H.G. Wells',
                'Sapiens - Yuval Noah Harari',
                'El mundo de ayer - Stefan Zweig',
                'Guns, Germs and Steel - Jared Diamond'
            ],
            'Historia Peruana': [
                'Historia del Perú - Basadre',
                'Los Incas - María Rostworowski',
                'Perú: Hombre e Historia - Carlos Contreras',
                'La conquista del Perú - Hemming'
            ],
            'Economía Clásica': [
                'La riqueza de las naciones - Adam Smith',
                'Principios de economía - Mankiw',
                'El capital en el siglo XXI - Piketty',
                'Freakonomics - Levitt & Dubner'
            ],
            'Derecho Internacional': [
                'Derecho Internacional Público',
                'Tratados Internacionales',
                'ONU y Relaciones Internacionales',
                'Derecho Humanitario'
            ],
            'Geopolítica': [
                'Prisioneros de la geografía - Tim Marshall',
                'El choque de civilizaciones - Huntington',
                'El arte de la guerra - Sun Tzu',
                'Estrategia - Lawrence Freedman'
            ]
        };

        return books[category] || ['Libro 1', 'Libro 2', 'Libro 3', 'Libro 4'];
    };

    const estimatePages = (bookTitle: string): number => {
        // Estimación aproximada basada en libros conocidos
        const estimates: { [key: string]: number } = {
            'Meditaciones': 180,
            'Apología': 80,
            'El Príncipe': 150,
            'Ética': 200
        };

        for (const key in estimates) {
            if (bookTitle.includes(key)) {
                return estimates[key];
            }
        }

        return 200; // Valor por defecto
    };

    const totalBooks = plan.reduce((sum, block) => sum + block.books, 0);
    const completedBooks = plan.reduce((sum, block) => sum + block.completed, 0);
    const overallProgress = (completedBooks / totalBooks) * 100;

    const getCurrentBlockIndex = (): number => {
        const month = new Date().getMonth();
        return Math.floor(month / 2);
    };

    const currentBlockIndex = getCurrentBlockIndex();

    return (
        <div className="card col-span-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="card-header">
                <div>
                    <div className="card-title">Plan de Lectura 2026</div>
                    <div className="card-subtitle">
                        24 libros para transformación cognitiva • Meta: 20 páginas/día
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{completedBooks}/{totalBooks}</div>
                    <div className="text-xs text-tertiary">Libros completados</div>
                </div>
            </div>

            {/* Progreso general */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-tertiary">Progreso Anual</span>
                    <span className="font-mono">{overallProgress.toFixed(1)}%</span>
                </div>
                <div className="progress-bar" style={{ height: '12px' }}>
                    <div 
                        className="progress-fill" 
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Bloques de lectura */}
            <div className="space-y-3">
                {plan.map((block, index) => {
                    const progress = (block.completed / block.books) * 100;
                    const isExpanded = expandedBlock === index;
                    const isCurrent = index === currentBlockIndex;
                    const details = monthDetails[index];

                    return (
                        <div 
                            key={index}
                            className={`border rounded-lg transition-all ${
                                isCurrent 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-surface-lighter'
                            }`}
                        >
                            <div 
                                className="p-4 cursor-pointer hover:bg-surface-light/50 transition-all"
                                onClick={() => setExpandedBlock(isExpanded ? null : index)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            progress === 100 
                                                ? 'bg-secondary text-white' 
                                                : isCurrent
                                                ? 'bg-primary text-white'
                                                : 'bg-surface-light text-tertiary'
                                        }`}>
                                            {progress === 100 ? (
                                                <i className="fas fa-check"></i>
                                            ) : (
                                                <span className="font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{block.period}</div>
                                            <div className="text-sm text-tertiary">{block.category}</div>
                                        </div>
                                        {isCurrent && (
                                            <span className="badge bg-primary text-white text-xs">
                                                En curso
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-mono text-lg font-bold">
                                                {block.completed}/{block.books}
                                            </div>
                                            <div className="text-xs text-tertiary">libros</div>
                                        </div>
                                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-tertiary`}></i>
                                    </div>
                                </div>

                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Contenido expandible */}
                            {isExpanded && details && (
                                <div className="px-4 pb-4 border-t border-surface-lighter animate-fade-in">
                                    <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
                                        <div className="text-center p-3 bg-surface-light rounded">
                                            <div className="text-xs text-tertiary mb-1">Total Páginas (est.)</div>
                                            <div className="text-xl font-bold text-primary">
                                                {details.booksList.reduce((sum, book) => sum + estimatePages(book), 0)}
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-surface-light rounded">
                                            <div className="text-xs text-tertiary mb-1">Páginas/Día</div>
                                            <div className="text-xl font-bold text-secondary">
                                                {details.pagesPerDay}
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-surface-light rounded">
                                            <div className="text-xs text-tertiary mb-1">Duración</div>
                                            <div className="text-xl font-bold text-accent">
                                                {details.daysInMonth}d
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-semibold text-tertiary mb-2">
                                            Lista de Lectura:
                                        </div>
                                        {details.booksList.map((book, bookIndex) => (
                                            <div 
                                                key={bookIndex}
                                                className="flex items-center gap-3 p-2 bg-surface-light rounded hover:bg-surface-lighter transition-all"
                                            >
                                                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                                                    bookIndex < block.completed 
                                                        ? 'bg-secondary text-white' 
                                                        : 'bg-surface text-tertiary'
                                                }`}>
                                                    {bookIndex < block.completed ? (
                                                        <i className="fas fa-check"></i>
                                                    ) : (
                                                        bookIndex + 1
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm ${
                                                        bookIndex < block.completed 
                                                            ? 'line-through opacity-50' 
                                                            : ''
                                                    }`}>
                                                        {book}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-tertiary font-mono">
                                                    ~{estimatePages(book)}p
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-5 pt-4 border-t border-surface-lighter">
                <div className="flex gap-3">
                    <button className="btn btn-secondary flex-1">
                        <i className="fas fa-list"></i>
                        Ver Todos los Libros
                    </button>
                    <button className="btn btn-primary flex-1">
                        <i className="fas fa-plus"></i>
                        Agregar Libro
                    </button>
                    <button className="btn btn-secondary">
                        <i className="fas fa-download"></i>
                        Exportar Plan
                    </button>
                </div>
            </div>

            {/* Alerta de progreso */}
            {overallProgress < 10 && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded text-sm">
                    <i className="fas fa-info-circle text-warning mr-2"></i>
                    <strong>Recuerda:</strong> Mantén un ritmo constante de 20 páginas diarias para cumplir tu meta anual.
                </div>
            )}
        </div>
    );
};

export default ReadingPlan;