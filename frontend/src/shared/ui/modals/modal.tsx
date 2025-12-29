import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]'
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden" style={{ perspective: '1000px' }}>
            {/* Backdrop with premium blur */}
            <div
                className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel - 3D effect and glassmorphism */}
            <div
                className={`
                    relative w-full ${sizes[size]} 
                    bg-white dark:bg-gray-900 
                    rounded-[2rem] 
                    shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]
                    border border-gray-100 dark:border-gray-800
                    transform transition-all duration-300 
                    flex flex-col 
                    animate-in zoom-in-95 slide-in-from-bottom-4
                `}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || onClose) && (
                    <div className="flex items-center justify-between p-6 pb-2">
                        {title ? (
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                                    {title}
                                </h3>
                                <div className="h-1.5 w-12 bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-2/3 rounded-full" />
                                </div>
                            </div>
                        ) : <div />} {/* Spacer if no title */}

                        <button
                            onClick={onClose}
                            className="
                                p-2.5 
                                rounded-full 
                                bg-gray-50 dark:bg-gray-800 
                                text-gray-400 hover:text-gray-900 dark:hover:text-white 
                                hover:bg-gray-100 dark:hover:bg-gray-700 
                                transition-all duration-200 
                                focus:outline-none focus:ring-2 focus:ring-primary/20
                            "
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
