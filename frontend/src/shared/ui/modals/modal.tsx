import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useUI } from '@/shared/contexts/ui-context';
import { useExport } from '@/shared/contexts/export-context';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    variant?: 'default' | 'content-fit';
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    variant = 'default'
}) => {
    const { isSidebarCollapsed } = useUI();
    const { setAnyModalOpen } = useExport();

    // Track modal state for content-fit variant
    useEffect(() => {
        if (variant === 'content-fit') {
            setAnyModalOpen(isOpen);
        }
        return () => {
            if (variant === 'content-fit') {
                setAnyModalOpen(false);
            }
        };
    }, [isOpen, variant, setAnyModalOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-[1600px] w-full mx-auto h-[calc(100vh-2rem)]'
    };

    // Default Overlay Styles
    let overlayClasses = "fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden";
    let backdropClasses = "fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in";
    let panelClasses = `relative w-full ${sizes[size]} bg-white dark:bg-gray-900 rounded-[var(--radius-card)] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] border border-gray-100 dark:border-gray-800 transform transition-all duration-300 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4`;
    let panelStyles: React.CSSProperties = {};

    // Content-Fit Override for Desktop
    if (variant === 'content-fit') {
        // Mobile: Full screen, z-high (9999)
        // Desktop: Content-fit, z-low (35) to sit under toolbars/header

        overlayClasses = `
            fixed inset-0 flex items-center justify-center p-0
            z-[60] lg:z-[60]
            lg:block lg:overflow-hidden 
        `;

        backdropClasses = `
            fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in
        `;

        // Panel:
        // Mobile: Full width, dynamic height based on overlay
        // Desktop: Content-fit logic applies via style tag
        panelClasses = `
            relative bg-white dark:bg-gray-900 
            max-w-none rounded-none
            shadow-none border-none
            flex flex-col 
        `;
    }

    // Helper for Content-Fit Style
    const contentFitStyle: React.CSSProperties = variant === 'content-fit' ? {
        top: '0',
        bottom: window.innerWidth < 1024 ? '70px' : '90px',
        left: '0',
        right: isSidebarCollapsed ? '88px' : '250px',
        position: 'fixed',
        zIndex: 60,
        backgroundColor: 'white'
    } : {};

    return createPortal(
        <div
            className={`fixed z-[60] flex flex-col ${variant === 'content-fit' ? 'content-fit-root' : overlayClasses}`}
            style={variant !== 'content-fit' ? { perspective: '1000px' } : {}}
        >
            {/* Unified Styles for Content Fit */}
            {variant === 'content-fit' && (
                <style>{`
                    .content-fit-root {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        z-index: 60 !important;
                        pointer-events: none;
                    }

                    .content-fit-panel-wrapper {
                        position: absolute !important;
                        top: 140px !important; /* Header (70px) + Top Toolbar (70px) */
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 70px !important; /* Bottom Toolbar height */
                        display: flex !important;
                        flex-direction: column !important;
                        pointer-events: auto;
                        background: #ffffff;
                        overflow: hidden !important;
                        width: auto !important;
                        min-width: 0 !important;
                        border: 1.5px solid #000000 !important;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                        z-index: 60;
                    }

                    @media (min-width: 1024px) {
                        .content-fit-panel-wrapper {
                            top: 180px !important; /* Header (90px) + Top Toolbar (90px) */
                            right: ${isSidebarCollapsed ? '88px' : '250px'} !important;
                            left: 0 !important;
                            bottom: 90px !important; /* Desktop bottom toolbar height */
                            border: 1.5px solid #000000 !important;
                        }
                    }

                    .dark .content-fit-panel-wrapper {
                        background: #0f1117;
                    }

                    /* Ensure the panel takes full space accurately */
                    .content-fit-panel-wrapper { 
                        display: flex !important;
                        flex-direction: column !important;
                    }

                    .content-fit-panel-wrapper > *:not(.modal-body) {
                        flex-shrink: 0 !important;
                    }

                    .content-fit-panel-wrapper .modal-body {
                        flex: 1 !important;
                        min-width: 0 !important;
                        overflow-y: auto !important;
                        padding: 1.5rem !important;
                        scrollbar-width: none !important; /* Hide for Firefox */
                        -ms-overflow-style: none !important; /* Hide for IE/Edge */
                    }

                    .content-fit-panel-wrapper .modal-body::-webkit-scrollbar {
                        display: none !important; /* Hide for Chrome/Safari */
                    }

                    /* Compact header for content-fit */
                    .content-fit-panel-wrapper > div:first-child {
                        padding: 1rem 1.5rem !important; /* Compact p-4 lg:p-6 equivalent */
                    }

                    .content-fit-panel-wrapper h3 {
                        font-size: 1.25rem !important; /* Slightly smaller title */
                    }

                    /* Blur entire sidebar when modal is open - Re-refined for no shadow edges */
                    aside {
                        filter: blur(12px) !important;
                        transition: filter 0.4s ease-out !important;
                        pointer-events: none !important;
                        border: none !important;
                        box-shadow: none !important;
                    }

                    /* Ensure background of sidebar doesn't bleed shadow when open */
                    aside::before, aside::after {
                        display: none !important;
                    }

                    /* Refine backdrop to only cover the content area, leaving header/toolbars sharp */
                    .content-fit-backdrop {
                        position: fixed !important;
                        top: 140px !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 70px !important;
                        z-index: 55 !important;
                        pointer-events: auto !important;
                        background: rgba(17, 24, 39, 0.4) !important; /* Darker overlay but NO BLUR */
                    }

                    @media (min-width: 1024px) {
                        .content-fit-backdrop {
                            top: 180px !important;
                            right: ${isSidebarCollapsed ? '88px' : '250px'} !important;
                            left: 0 !important;
                            bottom: 90px !important;
                        }
                    }

                    /* Explicitly ensure Footer toolbar remains sharp and interactive */
                    .layout-footer-toolbar {
                        filter: none !important;
                        backdrop-filter: blur(24px) !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                        z-index: 70 !important;
                    }
                `}</style>
            )}

            {/* Backdrop */}
            <div
                className={`${variant === 'content-fit' ? 'content-fit-backdrop' : backdropClasses} fixed inset-0 transition-all duration-300 animate-in fade-in`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                className={`${variant === 'content-fit' ? 'content-fit-panel-wrapper' : panelClasses}`}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={panelStyles}
            >
                {/* Header */}
                {(title || onClose) && (
                    <div className="flex items-center justify-between p-4 pb-2 shrink-0">
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
                <div className={`modal-body ${variant !== 'content-fit' ? 'p-6 md:p-8' : ''} overflow-y-auto custom-scrollbar flex-1`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
