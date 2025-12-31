import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity, CheckCircle2, MapPin, Globe, CreditCard, LayoutDashboard } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { StatCard } from '@/shared/ui/cards/card-stat';
import RevenueChart from '@/shared/charts/revenuechart';
import CountryStats from '@/shared/charts/countrystats';
import { formatNumber } from '@/shared/utils/helpers';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

const TEXTS_ADMIN = {
    DASHBOARD: {
        WELCOME: 'لوحة التحكم المركزية',
        SUBTITLE: 'تحليل شامل لأداء المنصة والتدفقات المالية',
        TOTAL_REVENUE: 'إجمالي الأرباح',
        ACTIVE_TENANTS: 'المشتركين النشطين',
        GROWTH: 'نمو المشتركين',
        TOTAL_USERS: 'إجمالي الاشتراكات',
    }
};

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [countryData, setCountryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await api.get('/admin/dashboard') as any;

            setStats(data.stats || null);

            // Format revenue chart data
            if (data.revenueChart) {
                const formattedRevenue = data.revenueChart.labels.map((label: string, index: number) => ({
                    name: label,
                    amt: data.revenueChart.data[index]
                }));
                setRevenueData(formattedRevenue);
            }

            setCountryData(data.countryChart || []);
        } catch (error) {
            logger.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout
                title={TEXTS_ADMIN.DASHBOARD.WELCOME}
                icon={LayoutDashboard}
            >
                <div className="p-10 flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title={TEXTS_ADMIN.DASHBOARD.WELCOME}
            icon={LayoutDashboard}
        >
            <div className="space-y-12 w-full animate-in fade-in duration-500">
                {/* 1. Header (Removed explicit title since it's now in AdminLayout prop) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        {/* Title removed */}
                        <p className="text-sm text-gray-500 font-bold mt-2">{TEXTS_ADMIN.DASHBOARD.SUBTITLE}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">تاريخ اليوم</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* 2. KPI Cards */}
                <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
                    <StatCard
                        title={TEXTS_ADMIN.DASHBOARD.TOTAL_REVENUE}
                        value={`${formatNumber(stats?.totalRevenue || 0)}`}
                        trend={12}
                        icon={CreditCard}
                        trendLabel="ريال سعودي"
                        colorFrom="from-emerald-600"
                        colorTo="to-emerald-400"
                    />

                    <StatCard
                        title={TEXTS_ADMIN.DASHBOARD.ACTIVE_TENANTS}
                        value={stats?.activeTenants || 0}
                        trend={5}
                        icon={CheckCircle2}
                        trendLabel="مشترك نشط حالياً"
                        colorFrom="from-blue-600"
                        colorTo="to-blue-400"
                    />

                    <StatCard
                        title={TEXTS_ADMIN.DASHBOARD.TOTAL_USERS}
                        value={stats?.totalTenants || 0}
                        trend={8}
                        icon={Users}
                        trendLabel="إجمالي الحسابات"
                        colorFrom="from-violet-600"
                        colorTo="to-violet-400"
                    />

                    <StatCard
                        title="معدل النشاط"
                        value={`${stats?.activityRate || 0}%`}
                        trend={stats?.activityRate > 80 ? 2 : -1}
                        icon={Activity}
                        trendLabel="تفاعل النظام"
                        colorFrom="from-orange-600"
                        colorTo="to-orange-400"
                    />
                </div>

                {/* 3. Main Charts Grid */}
                <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <RevenueChart data={revenueData} />
                    </div>
                    <div className="lg:col-span-1">
                        <CountryStats data={countryData} />
                    </div>
                </div>

                {/* 4. Quick Actions / Real-time Info */}
                <div className="dashboard-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="premium-card p-8 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">الانتشار العالمي</p>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{countryData.length} دول نشطة</h4>
                        </div>
                    </div>

                    <div className="premium-card p-8 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">اشتركات الشهر</p>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">+{stats?.newSubscriptions || 0} اشتراك</h4>
                        </div>
                    </div>

                    <div className="premium-card p-8 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">أكثر الدول نمواً</p>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{countryData[0]?.country || '---'}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
