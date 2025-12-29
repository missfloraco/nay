import React from 'react';
import { EditIcon, DeleteIcon, ViewIcon, SaveIcon, CancelIcon } from '@/assets/icons/icons';
import Button from '@/shared/ui/buttons/btn-base';

interface CRUDBtnProps {
    onClick: (e?: any) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
    type?: 'full' | 'icon';
}

export const EditButton: React.FC<CRUDBtnProps> = ({ onClick, label = "تعديل", disabled, className, type = 'full' }) => (
    <Button
        type="button"
        onClick={onClick}
        disabled={disabled}
        variant="secondary"
        size="sm"
        className={`text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 dark:hover:text-blue-500 border border-blue-100 dark:border-blue-900/30 transition-all duration-300 shadow-sm hover:shadow-blue-500/20 group ${type === 'icon' ? 'px-2 min-w-[36px]' : ''} ${className}`}
        title="تعديل"
    >
        <EditIcon className="w-3.5 h-3.5" />
        {type === 'full' && label && <span className="mr-2 font-black">{label}</span>}
    </Button>
);

export const DeleteButton: React.FC<CRUDBtnProps> = ({ onClick, label = "حذف", disabled, className, type = 'full' }) => (
    <Button
        type="button"
        onClick={onClick}
        disabled={disabled}
        variant="secondary"
        size="sm"
        className={`text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-red-500 border border-red-100 dark:border-red-900/30 transition-all duration-300 shadow-sm hover:shadow-red-500/20 group ${type === 'icon' ? 'px-2 min-w-[36px]' : ''} ${className}`}
        title="حذف"
    >
        <DeleteIcon className="w-3.5 h-3.5" />
        {type === 'full' && label && <span className="mr-2 font-black">{label}</span>}
    </Button>
);

export const ViewButton: React.FC<CRUDBtnProps> = ({ onClick, label = "عرض", disabled, className, type = 'full' }) => (
    <Button
        type="button"
        onClick={onClick}
        disabled={disabled}
        variant="secondary"
        size="sm"
        className={`text-emerald-600 hover:text-white hover:bg-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 transition-all duration-300 shadow-sm group ${type === 'icon' ? 'px-2 min-w-[36px]' : ''} ${className}`}
        title="عرض التفاصيل"
    >
        <ViewIcon className="w-3.5 h-3.5" />
        {type === 'full' && label && <span className="mr-2 font-black">{label}</span>}
    </Button>
);

export const SaveButton: React.FC<Partial<CRUDBtnProps> & { isLoading?: boolean }> = ({ onClick, label = "حفظ", disabled, isLoading, className }) => (
    <Button
        type="submit"
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        variant="primary"
        size="md"
        className={`font-black tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 hover:scale-[1.02] border border-primary/20 ${className}`}
    >
        <SaveIcon className="w-4 h-4 ml-2" />
        {label}
    </Button>
);

export const CancelButton: React.FC<CRUDBtnProps> = ({ onClick, label = "إلغاء", disabled, className }) => (
    <Button
        type="button"
        onClick={onClick}
        disabled={disabled}
        variant="ghost"
        size="md"
        className={`text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 font-bold ${className}`}
    >
        <CancelIcon className="w-4 h-4 ml-2" />
        {label}
    </Button>
);
