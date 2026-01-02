import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink, X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications, AppNotification } from '@/shared/contexts/notification-context';
import { useText } from '@/shared/contexts/text-context';

export const NotificationBell: React.FC = () => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();
    const { t } = useText();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 relative group
                    ${isOpen
                        ? 'bg-primary/10 text-primary shadow-inner'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                `}
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'animate-none' : 'group-hover:animate-bounce'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-black bg-red-500 text-white rounded-full px-1 min-w-[18px] h-[18px] border-2 border-white dark:border-dark-900 shadow-sm transition-all">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white dark:bg-dark-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                        <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {t('notifications.TITLE', 'الإشعارات')}
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-wider">
                                    {unreadCount} {t('notifications.NEW', 'جديد')}
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-[11px] font-bold text-primary hover:underline"
                            >
                                {t('notifications.MARK_ALL_READ', 'تحديد الكل كمقروء')}
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50 dark:divide-white/5">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`
                                            p-4 flex gap-4 transition-colors relative group
                                            ${!notif.is_read ? 'bg-primary/[0.02] dark:bg-primary/[0.05]' : 'hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'}
                                        `}
                                    >
                                        <div className="shrink-0 pt-1">
                                            {icons[notif.level as keyof typeof icons] || icons.info}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className={`text-sm leading-tight ${!notif.is_read ? 'font-black text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                                                    {notif.title || (notif.level === 'error' ? 'تنبيه' : 'إشعار')}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {notif.created_human}
                                                </span>
                                            </div>
                                            <p className={`text-[12px] leading-relaxed mb-2 ${!notif.is_read ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>
                                                {notif.message}
                                            </p>

                                            <div className="flex items-center gap-3">
                                                {notif.action_url && (
                                                    <Link
                                                        to={notif.action_url}
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-[11px] font-black text-primary flex items-center gap-1 hover:underline"
                                                    >
                                                        {t('notifications.VIEW_DETAILS', 'عرض التفاصيل')}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                )}
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="text-[11px] font-black text-emerald-600 flex items-center gap-1 hover:underline"
                                                    >
                                                        {t('notifications.MARK_READ', 'قراءة')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row Actions */}
                                        <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => deleteNotification(notif.id)}
                                                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 hover:scale-110 active:scale-95 transition-all"
                                                title={t('notifications.DELETE', 'حذف')}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                                    {t('notifications.EMPTY', 'لا توجد إشعارات حالياً')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate(window.location.pathname.startsWith('/admin') ? '/admin/notifications' : '/app/notifications');
                            }}
                            className="text-[12px] font-black text-gray-500 hover:text-primary transition-colors"
                        >
                            {t('notifications.VIEW_ALL', 'عرض كافة التنبيهات')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
