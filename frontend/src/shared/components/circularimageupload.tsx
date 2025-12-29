import React from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';

interface CircularImageUploadProps {
    image: string | null;
    onImageChange: (file: File) => void;
    onRemove: () => void;
    fallbackIcon?: React.ReactNode;
    uploadId: string;
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'circle' | 'rounded' | 'square';
    accept?: string;
    isImage?: boolean;
    className?: string;
    readOnly?: boolean;
}

export const CircularImageUpload: React.FC<CircularImageUploadProps> = ({
    image,
    onImageChange,
    onRemove,
    fallbackIcon,
    uploadId,
    label,
    size = 'xl',
    variant = 'circle',
    accept = 'image/*',
    isImage = true,
    className = '',
    readOnly = false
}) => {
    // Size mapping
    const sizeClasses = {
        xs: 'w-11 h-11',
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-40 h-40',
        xl: 'w-48 h-48'
    };

    const variantClasses = {
        circle: 'rounded-full',
        rounded: 'rounded-3xl',
        square: 'rounded-xl'
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageChange(e.target.files[0]);
        }
    };

    return (
        <div className={`flex flex-col items-center gap-6 ${className}`}>
            <div className="relative group">
                <div className={`${sizeClasses[size]} ${variantClasses[variant]} bg-gray-50 dark:bg-dark-800 ${size === 'xs' ? 'border-2' : 'border-4'} border-white dark:border-dark-700 shadow-xl flex items-center justify-center relative overflow-hidden ring-4 ring-transparent group-hover:ring-primary/10 transition-all duration-500`}>
                    {image && isImage ? (
                        <img
                            src={image}
                            alt="Upload Preview"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="text-gray-300">
                            {image && !isImage ? (
                                <Upload className={`${size === 'xs' ? 'w-5 h-5' : 'w-12 h-12'} text-primary`} />
                            ) : (
                                fallbackIcon || <Camera className={`${size === 'xs' ? 'w-5 h-5' : 'w-12 h-12'}`} />
                            )}
                        </div>
                    )}

                    {/* Hover Overlay */}
                    {!readOnly && (
                        <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center ${size === 'xs' ? 'gap-0.5' : 'gap-3'} backdrop-blur-sm`}>
                            <button
                                type="button"
                                onClick={() => document.getElementById(uploadId)?.click()}
                                className={`${size === 'xs' ? 'p-1 rounded-md' : 'p-3 rounded-xl'} bg-white hover:bg-gray-100 text-primary hover:scale-110 transition-transform shadow-lg`}
                                title="رفع ملف"
                            >
                                <Upload className={`${size === 'xs' ? 'w-3 h-3' : 'w-5 h-5'}`} />
                            </button>
                            {image && (
                                <button
                                    type="button"
                                    onClick={onRemove}
                                    className={`${size === 'xs' ? 'p-1 rounded-md' : 'p-3 rounded-xl'} bg-red-600 hover:bg-red-700 text-white hover:scale-110 transition-transform shadow-lg`}
                                    title="حذف الملف"
                                >
                                    <Trash2 className={`${size === 'xs' ? 'w-3 h-3' : 'w-5 h-5'}`} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    id={uploadId}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />
            </div>
            {label && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    {label}
                </p>
            )}
        </div>
    );
};
