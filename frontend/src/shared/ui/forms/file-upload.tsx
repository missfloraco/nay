import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
    label: string;
    accept?: string;
    onChange: (file: File | null) => void;
    error?: string;
    hint?: string;
    initialPreview?: string;
    initialFileName?: string;
    className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    accept = "image/*",
    onChange,
    error,
    hint,
    initialPreview,
    initialFileName,
    className = ''
}) => {
    const [preview, setPreview] = useState<string | null>(initialPreview || null);
    const [fileName, setFileName] = useState<string | null>(initialFileName || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        processFile(file);
    };

    const processFile = (file: File | null) => {
        if (file) {
            setFileName(file.name);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
            onChange(file);
        } else {
            setFileName(null);
            setPreview(null);
            onChange(null);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onChange(null);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] || null;
        processFile(file);
    };

    return (
        <div className={`space-y-2.5 group w-full ${className}`}>
            <label className="form-label group-focus-within:text-primary">
                {label}
            </label>

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    relative cursor-pointer min-h-[140px] rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-6
                    ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-dark-900/40 hover:bg-white dark:hover:bg-dark-800/60 hover:border-slate-300 dark:hover:border-white/20'}
                    ${error ? 'border-red-500 bg-red-50/10' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />

                {preview ? (
                    <div className="relative w-full h-full flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-[120px] rounded-xl shadow-lg border-4 border-white dark:border-dark-800 ring-1 ring-gray-100 dark:ring-white/5 object-contain"
                        />
                        <div className="flex items-center gap-2 bg-white/90 dark:bg-dark-900/90 backdrop-blur px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/10 shadow-sm">
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                {fileName || 'تم رفع الصورة'}
                            </span>
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : fileName ? (
                    <div className="flex flex-col items-center gap-3 animate-in fade-in">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <FileText size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{fileName}</span>
                        <button
                            onClick={handleClear}
                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                        >
                            مسح الملف
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-center transition-all duration-500 group-hover:scale-105">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500">
                            <Upload size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-gray-700 dark:text-gray-200">اضغط للرفع أو اسحب الملف هنا</p>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                {accept.includes('image') ? 'PNG, JPG, SVG بمساحة قصوى 2MB' : 'جميع صيغ الملفات مدعومة'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error ? (
                <p className="text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            ) : hint ? (
                <p className="text-[10px] text-gray-400 font-bold px-2">{hint}</p>
            ) : null}
        </div>
    );
};

export default FileUpload;
