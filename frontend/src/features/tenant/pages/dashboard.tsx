import React from 'react';
import AppLayout from '@/features/tenant/pages/applayout';
import { useSettings } from '@/shared/contexts/app-context';
import { Clock, Calendar, AlertCircle, ShieldCheck, Layers, Database, Sparkles, Zap, ArrowRight, CheckCircle, X } from 'lucide-react';
import { StatCard } from '@/shared/ui/cards/card-stat';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { formatDate } from '@/shared/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { MessageSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { t, settings } = useSettings();

    const { data: notificationData } = useQuery({
        queryKey: ['support-notifications-count'],
        queryFn: () => api.get('/app/support/notifications/support'),
        refetchInterval: 5000,
    });

    const unreadCount = (notificationData as unknown as { count: number })?.count || 0;

    return (
        <AppLayout title={t('dashboard.title', 'لوحة التحكم')} icon={Layers}>
            <div className="animate-in fade-in duration-700 h-full flex flex-col space-y-10">


                {/* System Status Area */}
                <div className="dashboard-grid grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <StatCard
                        title="حالة النظام"
                        value="نشط"
                        icon={ShieldCheck}
                        colorFrom="from-emerald-600"
                        colorTo="to-emerald-400"
                        trend={100}
                        trendLabel="System is online"
                    />
                    <StatCard
                        title="المساحة المستخدمة"
                        value="1.2 GB"
                        icon={Database}
                        colorFrom="from-blue-600"
                        colorTo="to-blue-400"
                        trend={12}
                        trendLabel="من أصل 10 GB"
                    />
                    <StatCard
                        title="طلبات الدعم"
                        value={unreadCount.toString()}
                        icon={MessageSquare}
                        colorFrom="from-rose-600"
                        colorTo="to-rose-400"
                        trend={unreadCount > 0 ? -5 : 0}
                        trendLabel="تذكرة مفتوحة"
                    />
                    <StatCard
                        title="الجلسات النشطة"
                        value="3"
                        icon={Zap}
                        colorFrom="from-amber-600"
                        colorTo="to-amber-400"
                        trend={2}
                        trendLabel="في آخر 24 ساعة"
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
