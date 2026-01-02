import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import Modal from '@/shared/ui/modals/modal';

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

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            variant="content-fit"
            title="معاينة الصورة"
        >
            <div className="relative w-full h-full flex flex-col bg-[#0f1117] overflow-hidden rounded-none">
                {/* Image Toolbar Inside Modal */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-[120]">
                    <button
                        onClick={handleZoomIn}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/5 active:scale-95"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/5 active:scale-95"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/5 active:scale-95"
                    >
                        <Maximize className="w-5 h-5" />
                    </button>
                </div>

                {/* Bottom Instruction Hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-black/40 border border-white/5 backdrop-blur-xl rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.25em] z-[120] pointer-events-none">
                    {scale > 1 ? 'انقر واسحب للتحريك • انقر مرتين لتصغير' : 'انقر مرتين لتكبير • اضغط ESC للإغلاق'}
                </div>

                {/* Viewport Area */}
                <div
                    className={`flex-1 flex items-center justify-center ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
                    onMouseDown={handleMouseDown}
                >
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <img
                            ref={imgRef}
                            src={src}
                            alt="Preview"
                            className="max-w-[95%] max-h-[95%] object-contain rounded-xl select-none shadow-2xl"
                            draggable={false}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (scale !== 1) handleReset();
                                else setScale(2);
                            }}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ImagePreview;
