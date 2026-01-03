import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity, CheckCircle2, MapPin, Globe, CreditCard, LayoutDashboard, ArrowUpRight, ArrowDownRight, Zap, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
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
        TOTAL_USERS: 'إجمالي الحسابات',
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
            <AdminLayout title={TEXTS_ADMIN.DASHBOARD.WELCOME} icon={LayoutDashboard}>
                <div className="flex-1 flex items-center justify-center bg-gray-50/50 dark:bg-dark-950">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <LayoutDashboard className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={TEXTS_ADMIN.DASHBOARD.WELCOME} icon={LayoutDashboard} noPadding={true}>
            <div className="flex flex-col h-full bg-gray-50/50 dark:bg-dark-950 overflow-hidden relative" dir="rtl">

                {/* Visual Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 z-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-24 -mb-24 z-0 pointer-events-none" />

                <main className="relative z-10 flex-1 p-6 lg:p-8 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                        {/* 1. LEFT COLUMN: KPIs & Secondary Charts (4/12) */}
                        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto no-scrollbar">

                            {/* KPI Cluster */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[var(--radius-card)] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-emerald-500/10 rounded-[var(--radius-inner)] text-emerald-500">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3" />
                                                12%
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{TEXTS_ADMIN.DASHBOARD.TOTAL_REVENUE}</p>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">{formatNumber(stats?.totalRevenue || 0)}</h3>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[var(--radius-card)] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-500">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span className="flex items-center gap-0.5 text-[10px] font-black text-blue-500">
                                                <ArrowUpRight className="w-3 h-3" />
                                                5%
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{TEXTS_ADMIN.DASHBOARD.ACTIVE_TENANTS}</p>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">{stats?.activeTenants || 0}</h3>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[var(--radius-card)] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-violet-500 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-violet-500/10 rounded-2xl text-violet-500">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{TEXTS_ADMIN.DASHBOARD.TOTAL_USERS}</p>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">{stats?.totalTenants || 0}</h3>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[var(--radius-card)] bg-gray-900 dark:bg-black border border-gray-800 shadow-xl shadow-black/20 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-primary/10 rounded-[var(--radius-inner)] text-primary">
                                                <Zap className="w-5 h-5 fill-current" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">معدل التفاعل</p>
                                        <h3 className="text-xl font-black text-white truncate">{stats?.activityRate || 0}%</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Geo Cluster */}
                            <div className="flex-1 min-h-[300px] flex flex-col bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-base font-black text-gray-900 dark:text-white">الانتشار الجغرافي</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-2xl">{countryData.length} دول</span>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <CountryStats data={countryData} />
                                </div>
                            </div>
                        </div>

                        {/* 2. RIGHT COLUMN: Main Growth Pulse (8/12) */}
                        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">

                            {/* Revenue Growth Box */}
                            <div className="flex-1 flex flex-col bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-blue-500" />

                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-1">النمو المالي (Growth Pulse)</p>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">تحليل التدفقات النقدية</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">متوسط النمو</p>
                                            <p className="text-lg font-black text-emerald-500 leading-none">+18.4%</p>
                                        </div>
                                        <div className="w-px h-10 bg-gray-100 dark:bg-white/10" />
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                            <TrendingUp className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 relative">
                                    <RevenueChart data={revenueData} />
                                </div>

                                {/* Bottom Metrics Row */}
                                <div className="pt-6 mt-6 border-t border-gray-50 dark:border-white/5 grid grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">اشتراكات الشهر</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white leading-none">+{stats?.newSubscriptions || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">المساحة الإجمالية</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white leading-none">84.2 GB</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">عمليات النشاط</p>
                                        <p className="text-xl font-black text-emerald-500 leading-none">12.4k</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </main>
            </div>
        </AdminLayout>
    );
}
