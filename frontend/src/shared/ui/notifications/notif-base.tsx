import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertCircle;

    return (
        <div className="fixed bottom-0 left-0 z-[200] w-[250px] h-[90px] animate-in fade-in slide-in-from-left-full duration-500 overflow-hidden">
            <div className={`
                relative w-full h-full flex items-center gap-4 px-6 
                ${isSuccess ? 'bg-emerald-600' : 'bg-red-600'}
                border-r border-t border-white/10
                shadow-[10px_0_30px_rgba(0,0,0,0.2)]
                pointer-events-auto group
            `}>
                {/* Status Indicator Icon */}
                <div className="shrink-0 p-2 rounded-xl bg-white/20 text-white">
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60 truncate">
                        {isSuccess ? 'نجاح العملية' : 'تنبيه النظام'}
                    </p>
                    <p className="text-[11px] font-black text-white leading-tight line-clamp-2">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-4 h-4 text-white" />
                </button>

            </div>
        </div>
    );
};

export default Notification;
