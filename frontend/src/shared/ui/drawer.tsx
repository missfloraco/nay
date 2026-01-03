import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    side?: 'right' | 'left';
    children: React.ReactNode;
    title?: string;
    branding?: React.ReactNode;
    width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    side = 'right',
    children,
    title,
    branding,
    width = '100%'
}) => {
    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <aside
                className={`fixed top-0 bottom-0 bg-white dark:bg-dark-900 z-[70] shadow-2xl transition-transform duration-300 ease-in-out ${side === 'right'
                    ? (isOpen ? 'translate-x-0' : 'translate-x-[100%]')
                    : (isOpen ? 'translate-x-0' : '-translate-x-[100%]')
                    } ${side === 'right' ? 'right-0' : 'left-0'}`}
                style={{ width: width }}
                dir="rtl"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 overflow-hidden">
                            {branding}
                            {title && (
                                <span className="text-lg font-black text-gray-900 dark:text-white truncate">
                                    {title}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-red-500 transition-colors shrink-0"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {children}
                    </div>
                </div>
            </aside>
        </>
    );
};
