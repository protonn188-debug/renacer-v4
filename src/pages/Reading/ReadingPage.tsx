import React, { useState } from 'react';
import { RenacerStateType } from '../../types';

interface ReadingPageProps {
    state: RenacerStateType;
    onUpdateProgress: (pages: number) => void;
}

const ReadingPage: React.FC<ReadingPageProps> = ({ state, onUpdateProgress }) => {
    const [selectedBook, setSelectedBook] = useState<any>(state.reading.currentBook);

    const allBooks = [
        { ...state.reading.currentBook, status: 'reading' },
        { title: 'Apología de Sócrates', author: 'Platón', totalPages: 80, currentPage: 0, progress: 0, category: 'Filosofía', status: 'pending' },
        { title: 'El Príncipe', author: 'Maquiavelo', totalPages: 150, currentPage: 0, progress: 0, category: 'Filosofía', status: 'pending' },
        { title: 'Ética a Nicómaco', author: 'Aristóteles', totalPages: 200, currentPage: 0, progress: 0, category: 'Filosofía', status: 'pending' }
    ];

    return (
        <main className="main-content">
            <header className="main-header">
                <div className="date-display">
                    <i className="fas fa-book-open"></i>
                    <span>Sistema de Lectura</span>
                </div>
                <h1 className="greeting">
                    Tu <span className="text-primary">Biblioteca</span> 2026
                </h1>
                <p className="greeting-subtitle">
                    24 libros para transformación cognitiva. Meta: 20 páginas/día.
                </p>
            </header>

            <div className="grid grid-cols-3 gap-5 mb-6">
                {allBooks.map((book, index) => (
                    <div 
                        key={index}
                        className={`card cursor-pointer ${book.status === 'reading' ? 'border-primary' : ''}`}
                        onClick={() => setSelectedBook(book)}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">📖</div>
                            <div className="flex-1">
                                <h4 className="font-semibold">{book.title}</h4>
                                <p className="text-xs text-tertiary">{book.author}</p>
                            </div>
                            {book.status === 'reading' && (
                                <span className="badge bg-primary">Leyendo</span>
                            )}
                        </div>

                        <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-tertiary">{book.category}</span>
                                <span className="font-mono">{book.currentPage}/{book.totalPages}</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${book.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {book.status === 'reading' && (
                            <div className="flex gap-2">
                                <button 
                                    className="btn btn-primary btn-sm flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateProgress(10);
                                    }}
                                >
                                    +10p
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateProgress(20);
                                    }}
                                >
                                    +20p
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="card">
                <h3 className="text-xl font-semibold mb-4">Plan Anual de Lectura</h3>
                <div className="space-y-3">
                    {state.reading.plan.map((block, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-sm mb-2">
                                <span>{block.period} - {block.category}</span>
                                <span className="font-mono">{block.completed}/{block.books} libros</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${(block.completed / block.books) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default ReadingPage;