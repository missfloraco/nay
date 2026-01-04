import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import { useNotifications, AppNotification } from '@/shared/contexts/notification-context';
import { useText } from '@/shared/contexts/text-context';
import Table from '@/shared/table';
import { Bell, Check, Trash2, ExternalLink, Info, CheckCircle, AlertCircle, AlertTriangle, MessageSquare, DollarSign, Users, Shield, Tag, HelpCircle, Archive, UserPlus, XCircle } from 'lucide-react';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';

export default function NotificationsPage() {
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick
    } = useNotifications();
    const { t } = useText();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
    };

    const columns = useMemo(() => [
        {
            header: 'الحالة',
            accessor: (notif: AppNotification) => (
                <div className="flex items-center justify-center">
                    {(() => {
                        if (notif.icon) {
                            const IconComponent = {
                                MessageSquare, DollarSign, Users, Shield, Tag, HelpCircle, Archive, UserPlus, XCircle, Bell,
                                CheckCircle, AlertCircle, AlertTriangle, Info
                            }[notif.icon as string];
                            if (IconComponent) return <IconComponent className="w-5 h-5 text-primary" />;
                        }
                        return icons[notif.level as keyof typeof icons] || icons.info;
                    })()}
                </div>
            ),
            width: '10%'
        },
        {
            header: 'الإشعار',
            accessor: (notif: AppNotification) => (
                <IdentityCell
                    name={notif.title || 'إشعار النظام'}
                    subtext={
                        <div className="flex flex-col gap-1">
                            {notif.uid && (
                                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                                    {notif.uid}
                                </span>
                            )}
                            <span className="text-gray-400 font-bold">{notif.message}</span>
                        </div>
                    }
                />
            ),
            width: '45%'
        },
        {
            header: 'التاريخ',
            accessor: (notif: AppNotification) => (
                <DateCell date={notif.created_at || ''} includeTime={true} />
            ),
            width: '25%'
        },
        {
            header: 'الإجراءات',
            accessor: (notif: AppNotification) => (
                <ActionCell>
                    {notif.action_url && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notif);
                            }}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="عرض التفاصيل"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                    {!notif.is_read && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                            }}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="تحديد كمقروء"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                        }}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </ActionCell>
            ),
            width: '20%'
        }
    ], [markAsRead, deleteNotification, handleNotificationClick]);

    const groupedNotifications = useMemo(() => {
        const groups: Record<string, AppNotification[]> = {
            today: [],
            yesterday: [],
            older: []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        notifications.forEach(notif => {
            const date = new Date(notif.created_at || '');
            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) groups.today.push(notif);
            else if (date.getTime() === yesterday.getTime()) groups.yesterday.push(notif);
            else groups.older.push(notif);
        });

        return groups;
    }, [notifications]);

    const { deleteNotifications } = useNotifications();

    const renderGroup = (label: string, items: AppNotification[]) => {
        if (items.length === 0) return null;
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">
                        {label}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/10 to-transparent" />
                </div>
                <div className="bg-white/50 dark:bg-dark-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-primary/5">
                    <Table<AppNotification>
                        columns={columns}
                        data={items}
                        isLoading={loading}
                        onRowClick={handleNotificationClick}
                        emptyMessage="لا توجد إشعارات"
                        showExport={false}
                    />
                </div>
            </div>
        );
    };

    const content = (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner relative">
                        <Bell className="w-7 h-7" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping opacity-20" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {t('notifications.TITLE', 'مركز التنبيهات')}
                        </h2>
                        <p className="text-gray-400 font-bold text-sm">
                            إدارة كافة الإشعارات والتنبيهات المستلمة
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {notifications.length > 0 && (
                        <>
                            <button
                                onClick={markAllAsRead}
                                className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 border border-emerald-100 dark:border-emerald-800/30"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {t('notifications.MARK_ALL_READ', 'تحديد الكل كمقروء')}
                            </button>
                            <button
                                onClick={deleteNotifications}
                                className="px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-[11px] font-black hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 border border-red-100 dark:border-red-800/30"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('notifications.DELETE_ALL', 'مسح الكل')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-12">
                    {renderGroup(t('date.TODAY', 'اليوم'), groupedNotifications.today)}
                    {renderGroup(t('date.YESTERDAY', 'الأمس'), groupedNotifications.yesterday)}
                    {renderGroup(t('date.OLDER', 'سابقاً'), groupedNotifications.older)}
                </div>
            ) : (
                <div className="bg-white/50 dark:bg-dark-900/50 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-20 flex flex-col items-center justify-center text-center shadow-2xl">
                    <div className="w-32 h-32 bg-primary/10 rounded-[40px] flex items-center justify-center mb-8 relative rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Bell className="w-12 h-12 text-primary opacity-20" />
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                        {t('notifications.EMPTY_TITLE', 'لا توجد تنبيهات جديدة')}
                    </h3>
                    <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                        {t('notifications.EMPTY_DESC', 'لقد قمت بمراجعة كافة الإشعارات بنجاح. سنقوم بإبلاغك فور ظهور أي جديد.')}
                    </p>
                </div>
            )}
        </div>
    );

    if (isAdmin) {
        return (
            <AdminLayout title="مركز التنبيهات" icon={Bell}>
                <div className="p-8">
                    {content}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AppLayout title="مركز التنبيهات" icon={Bell}>
            <div className="p-8">
                {content}
            </div>
        </AppLayout>
    );
}
