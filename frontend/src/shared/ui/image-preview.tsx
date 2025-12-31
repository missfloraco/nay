import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onClose }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-' || e.key === '_') handleZoomOut();
            if (e.key === '0') handleReset();
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
        };

        window.addEventListener('keydown', handleKeyDown);
        const element = imgRef.current?.parentElement?.parentElement;
        if (element) {
            element.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (element) {
                element.removeEventListener('wheel', handleWheel);
            }
        };
    }, [onClose, handleZoomIn, handleZoomOut, handleReset]);

    // Prevent scrolling when preview is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return createPortal(
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 transition-all"
            onClick={onClose}
        >
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10 shadow-xl group active:scale-95"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10 shadow-xl group active:scale-95"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10 shadow-xl pointer-events-auto group active:scale-95"
                    title="Close"
                >
                    <X className="w-6 h-6 group-hover:scale-110 group-hover:rotate-90 transition-all" />
                </button>
            </div>

            {/* Bottom Info Hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full text-white/40 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none z-[110] animate-in slide-in-from-bottom-4 duration-500">
                {scale > 1 ? 'انقر واسحب للتحريك • انقر خارجاً للإغلاق' : 'انقر خارجاً للإغلاق'}
            </div>

            {/* Image Container */}
            <div
                className={`relative w-full h-full flex items-center justify-center transition-all ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <img
                        ref={imgRef}
                        src={src}
                        alt="Preview"
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] select-none animate-in zoom-in-95 duration-500"
                        draggable={false}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (scale !== 1) handleReset();
                            else setScale(2);
                        }}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ImagePreview;
