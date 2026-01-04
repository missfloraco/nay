import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Trash2, ExternalLink, X, Info, CheckCircle, AlertCircle, AlertTriangle, MessageSquare, DollarSign, Users, Shield, Tag, HelpCircle, Archive, UserPlus, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useText } from '@/shared/contexts/text-context';

export const NotificationBell: React.FC = () => {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        handleNotificationClick
    } = useNotifications();
    const { t } = useText();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch on open
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Close on click outside - account for Portals
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if click is inside the bell trigger
            if (menuRef.current && menuRef.current.contains(target)) {
                return;
            }

            // Check if click is inside the portaled panel
            const panel = document.getElementById('notification-panel');
            if (panel && panel.contains(target)) {
                return;
            }

            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for global navigation events from context
    useEffect(() => {
        const handleNavigate = (e: any) => {
            const { path } = e.detail;
            if (path) {
                navigate(path);
                setIsOpen(false);
            }
        };
        window.addEventListener('app:navigate', handleNavigate as any);
        return () => window.removeEventListener('app:navigate', handleNavigate as any);
    }, [navigate]);

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
                    w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 relative group border
                    ${isOpen
                        ? 'bg-primary/10 text-primary shadow-inner border-primary/20'
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 border-gray-200 dark:border-white/10 hover:border-primary/30'
                    }
                `}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-black bg-red-500 text-white rounded-full px-1 min-w-[18px] h-[18px] border-2 border-white dark:border-dark-900 shadow-sm transition-all">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel & Backdrop - Portaled to Body to avoid Header stacking context */}
            {isOpen && createPortal(
                <>
                    {/* Backdrop - Bounded between Main Header and Footer toolbar */}
                    <div
                        className="fixed inset-x-0 top-[70px] lg:top-[90px] bottom-[70px] lg:bottom-[90px] bg-black/40 z-[999] animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel - Bounded between Main Header and Footer toolbar */}
                    <div
                        id="notification-panel"
                        className="fixed left-0 top-[70px] lg:top-[90px] bottom-[70px] lg:bottom-[90px] w-full lg:w-[320px] bg-white dark:bg-dark-950 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.4)] border-r border-gray-200 dark:border-white/10 z-[1000] animate-in slide-in-from-left duration-300 flex flex-col"
                    >
                        {/* Header - Consolidated Quick Actions */}
                        <div className="px-5 py-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-dark-950 shrink-0">
                            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2 text-[14px] uppercase tracking-tighter">
                                {t('notifications.TITLE', 'الإشعارات')}
                                {unreadCount > 0 && (
                                    <div className="flex items-center justify-center bg-primary/10 px-2 py-0.5 rounded-full">
                                        <span className="text-[10px] text-primary font-black animate-pulse">
                                            {unreadCount} {t('notifications.NEW', 'جديد')}
                                        </span>
                                    </div>
                                )}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Content - Vertical List with Distinct Rows */}
                        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/50 dark:bg-dark-900/20 p-4 flex flex-col gap-4">
                            {loading && notifications.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
                                        جاري البحث...
                                    </p>
                                </div>
                            ) : notifications.length > 0 ? (
                                <>
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                handleNotificationClick(notif);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                p-4 flex flex-col gap-3 transition-all relative group rounded-[20px] border shadow-sm cursor-pointer
                                                ${!notif.is_read
                                                    ? 'bg-white dark:bg-dark-950 border-primary/30 ring-1 ring-primary/5'
                                                    : 'bg-white/80 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-80 hover:opacity-100'
                                                }
                                                hover:shadow-lg hover:-translate-y-0.5 duration-300
                                            `}
                                        >
                                            <div className="flex gap-4">
                                                <div className="shrink-0">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${notif.level === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                                                        notif.level === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                            notif.level === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                                                                'bg-primary/5 dark:bg-primary/20'
                                                        }`}>
                                                        {(() => {
                                                            if (notif.icon) {
                                                                const IconComponent = {
                                                                    MessageSquare, DollarSign, Users, Shield, Tag, HelpCircle, Archive, UserPlus, XCircle, Bell,
                                                                    CheckCircle, AlertCircle, AlertTriangle, Info
                                                                }[notif.icon as string];
                                                                if (IconComponent) return <IconComponent className="w-5 h-5" />;
                                                            }
                                                            return icons[notif.level as keyof typeof icons] || icons.info;
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <p className={`text-[13px] leading-tight ${!notif.is_read ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-600 dark:text-gray-400'}`}>
                                                            {notif.title || (notif.level === 'error' ? 'تنبيه' : 'إشعار')}
                                                        </p>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter whitespace-nowrap pt-1">
                                                            {notif.created_human}
                                                        </span>
                                                    </div>
                                                    <p className={`text-[11px] leading-relaxed ${!notif.is_read ? 'text-gray-700 dark:text-gray-200 font-bold' : 'text-gray-500 dark:text-gray-500 font-medium'}`}>
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3 mt-1 pl-1">
                                                {notif.action_url && (
                                                    <span className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-[10px] font-black text-primary rounded-lg transition-colors flex items-center gap-1.5">
                                                        {t('notifications.VIEW', 'فتح التفاصيل')}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </span>
                                                )}
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notif.id);
                                                        }}
                                                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 text-[10px] font-black text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                                                    >
                                                        {t('notifications.MARK_READ', 'تمت القراءة')}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notif.id);
                                                    }}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {!notif.is_read && (
                                                <div className="absolute top-4 right-0 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                                            )}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 bg-white dark:bg-dark-950 border-4 border-gray-50 dark:border-white/5 rounded-[32px] flex items-center justify-center shadow-xl rotate-12 transition-transform hover:rotate-0 duration-500">
                                            <Bell className="w-10 h-10 text-primary/20" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white dark:border-dark-950">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <h4 className="text-gray-900 dark:text-white font-black text-[16px] mb-3">
                                        {t('notifications.EMPTY_TITLE', 'كل شيء مثالي!')}
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-[12px] leading-relaxed max-w-[200px] mx-auto font-bold">
                                        {t('notifications.EMPTY_DESC', 'لا توجد تنبيهات جديدة حالياً. سنقوم بإخبارك فور ظهور أي جديد.')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions - Unified Action Bar with Dual Buttons */}
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-dark-950 shrink-0 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => markAllAsRead()}
                                disabled={unreadCount === 0}
                                className="py-3.5 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
                            >
                                <Check className="w-4 h-4" />
                                {t('notifications.MARK_ALL_READ_SHORT', 'تحديد كمقروء')}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(window.location.pathname.includes('/admin') ? '/admin/notifications' : '/app/notifications');
                                }}
                                className="py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black rounded-xl hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t('notifications.VIEW_ALL', 'عرض الكل')}
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};
