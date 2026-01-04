import React, { useState, useEffect } from 'react';
import {
    Users, DollarSign, TrendingUp, Activity, CheckCircle2,
    MapPin, Globe, CreditCard, LayoutDashboard, ArrowUpRight,
    ArrowDownRight, Zap, ShieldCheck, Box, UserPlus, Layers
} from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import RevenueChart from '@/shared/charts/revenuechart';
import CountryStats from '@/shared/charts/countrystats';
import { formatNumber } from '@/shared/utils/helpers';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

const TEXTS_ADMIN = {
    DASHBOARD: {
        TITLE: 'إحصائيات المنصة المركزية',
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
            <AdminLayout title={TEXTS_ADMIN.DASHBOARD.TITLE} icon={LayoutDashboard}>
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
        <AdminLayout title={TEXTS_ADMIN.DASHBOARD.TITLE} icon={LayoutDashboard} noPadding={true}>
            <div className="flex flex-col h-full bg-gray-50/50 dark:bg-dark-950 overflow-hidden relative" dir="rtl">

                {/* Visual Decorations */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -mr-48 -mt-48 z-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] -ml-32 -mb-32 z-0 pointer-events-none" />

                <main className="relative z-10 flex-1 p-6 lg:p-8 flex flex-col min-h-0 overflow-y-auto no-scrollbar">

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(160px,auto)]">

                        {/* 1. Main Revenue Pulse (8/12) */}
                        <div className="lg:col-span-8 lg:row-span-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-blue-500" />
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-1">النمو السحابي (Revenue Pulse)</p>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">تحليل التدفقات النقدية</h2>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp className="w-7 h-7 text-primary" />
                                </div>
                            </div>

                            <div className="flex-1 min-h-[300px] relative">
                                <RevenueChart data={revenueData} />
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-50 dark:border-white/5 grid grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي المحصل</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{formatNumber(stats?.totalRevenue || 0)}</p>
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">متوسط النمو</p>
                                    <p className="text-2xl font-black text-emerald-500 leading-none">+18.4%</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">التحميل الإجمالي</p>
                                    <p className="text-2xl font-black text-blue-500 leading-none">84.2 GB</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Key Metrics Cluster (4/12) */}
                        <div className="lg:col-span-4 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                                        <ArrowUpRight className="w-3 h-3" />
                                        12%
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{TEXTS_ADMIN.DASHBOARD.ACTIVE_TENANTS}</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white truncate">{stats?.activeTenants || 0}</h3>
                        </div>

                        <div className="lg:col-span-4 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Box className="w-6 h-6" />
                                </div>
                                <div className="text-left font-bold text-[10px] text-gray-400 uppercase">System Hub</div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{TEXTS_ADMIN.DASHBOARD.TOTAL_USERS}</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white truncate">{stats?.totalTenants || 0}</h3>
                        </div>

                        {/* 3. Global Activity (4/12) */}
                        <div className="lg:col-span-4 lg:row-span-1 bg-gray-900 border border-gray-800 rounded-[var(--radius-card)] p-6 shadow-2xl shadow-black/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 transition-opacity" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Zap className="w-6 h-6 fill-current" />
                                    </div>
                                    <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-lg uppercase">Active Now</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-1">{stats?.activityRate || 0}%</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">معدل التفاعل الموحد</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Geographic Insights (5/12) */}
                        <div className="lg:col-span-5 lg:row-span-2 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-7 shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden relative group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-gray-900 dark:text-white leading-none">الانتشار الجغرافي</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Global Coverage</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-[11px] font-black text-gray-500">{countryData.length} دول</div>
                            </div>
                            <div className="flex-1 min-h-[220px]">
                                <CountryStats data={countryData} />
                            </div>
                        </div>

                        {/* 5. Additional Management Cards (7/12) */}
                        <div className="lg:col-span-4 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden">
                            <div className="flex items-center gap-4 h-full">
                                <div className="p-4 bg-violet-500/10 rounded-2xl text-violet-500 group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-none">+{stats?.newSubscriptions || 0}</h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">مشتركون جدد (الشهر)</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden">
                            <div className="flex flex-col h-full justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Security Monitor</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">حالة المنصة مستقرة</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-slow-ping" />
                                    <span className="text-[10px] font-bold text-emerald-500">آخر فحص: الآن</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group overflow-hidden">
                            <div className="flex items-center justify-between h-full">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1">إجمالي العمليات المجرية</h4>
                                        <p className="text-xs font-bold text-gray-400">تحليل فوري لكافة أنشطة المشتركين وطلبات النظام</p>
                                    </div>
                                </div>
                                <div className="text-left font-black text-4xl text-primary/20 italic">12.4k</div>
                            </div>
                        </div>

                    </div>

                </main>
            </div>
        </AdminLayout>
    );
}
