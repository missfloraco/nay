import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import { useNotifications, AppNotification } from '@/shared/contexts/notification-context';
import { useText } from '@/shared/contexts/text-context';
import Table from '@/shared/table';
import { Bell, Check, Trash2, ExternalLink, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';

export default function NotificationsPage() {
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
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
                    {icons[notif.level as keyof typeof icons] || icons.info}
                </div>
            ),
            width: '10%'
        },
        {
            header: 'الإشعار',
            accessor: (notif: AppNotification) => (
                <IdentityCell
                    name={notif.title || 'إشعار النظام'}
                    subtext={notif.message}
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
                        <Link
                            to={notif.action_url}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="عرض التفاصيل"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    )}
                    {!notif.is_read && (
                        <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="تحديد كمقروء"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </ActionCell>
            ),
            width: '20%'
        }
    ], [markAsRead, deleteNotification]);

    const content = (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            {t('notifications.TITLE', 'مركز التنبيهات')}
                        </h2>
                        <p className="text-gray-400 font-bold text-sm">
                            إدارة كافة الإشعارات والتنبيهات المستلمة
                        </p>
                    </div>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-6 py-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-black text-primary hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        {t('notifications.MARK_ALL_READ', 'تحديد الكل كمقروء')}
                    </button>
                )}
            </div>

            <div className="bg-white/50 dark:bg-dark-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-primary/5">
                <Table<AppNotification>
                    columns={columns}
                    data={notifications}
                    isLoading={loading}
                    emptyMessage="لا توجد إشعارات لعرضها"
                    exportFileName="notifications"
                />
            </div>
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
