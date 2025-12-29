import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div className={`fixed bottom-0 left-0 w-[250px] h-[90px] z-[100] flex items-center gap-4 px-6 shadow-2xl text-white ${bgColor} animate-in fade-in slide-in-from-left-full duration-500 border-r border-white/20`}>
            <div className="bg-white/20 p-2 rounded-xl">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-black text-xs leading-tight flex-1">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Notification;
