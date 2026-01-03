import React from 'react';
import AppLayout from '@/features/tenant/pages/applayout';
import { useSettings } from '@/shared/contexts/app-context';
import {
    ShieldCheck, Database, MessageSquare, Zap, Activity,
    Layout, Cpu, HardDrive, Bell, ArrowUpRight, CheckCircle2,
    Calendar, Clock
} from 'lucide-react';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { formatDate } from '@/shared/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';

const Dashboard: React.FC = () => {
    const { t, settings } = useSettings();
    const { tenant, user } = useTenantAuth();

    const { data: notificationData } = useQuery({
        queryKey: ['support-notifications-count'],
        queryFn: () => api.get('/app/support/notifications/support'),
        refetchInterval: 5000,
    });

    const unreadCount = (notificationData as unknown as { count: number })?.count || 0;

    return (
        <AppLayout title={t('dashboard.title', 'لوحة التحكم')} icon={Layout} noPadding={true}>
            <div className="flex flex-col h-full bg-gray-50/50 dark:bg-dark-950 overflow-hidden relative" dir="rtl">

                {/* Decorative Layers */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32 z-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] -ml-24 -mb-24 z-0 pointer-events-none" />

                <main className="relative z-10 flex-1 p-6 lg:p-8 flex flex-col min-h-0 overflow-hidden">

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                        {/* 1. MAIN HEALTH HUB (8/12) */}
                        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">

                            {/* App Integrity Hero */}
                            <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 flex-1 flex flex-col justify-between group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-600" />
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">حالة النظام: يعمل بكفاءة تامة</span>
                                            </div>
                                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight">سلامة التطبيق (App Integrity)</h2>
                                        </div>
                                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/5 group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-[var(--radius-inner)] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group/kpi">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Cpu className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-500">مستقر</span>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">المعالج المتوفر</p>
                                            <div className="flex items-end gap-3">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">99.8%</h3>
                                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mb-2.5 overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-[99.8%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-[var(--radius-inner)] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group/kpi">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400">22ms</span>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">وقت الاستجابة</p>
                                            <div className="flex items-end gap-3">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">ممتاز</h3>
                                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mb-2.5 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-8 mt-8 border-t border-gray-50 dark:border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">تاريخ الاشتراك</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {formatDate(tenant?.created_at)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الجلسات النشطة</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <Zap className="w-4 h-4 text-amber-500 fill-current" />
                                            3 متصلين الآن
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex flex-col">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">نسخة النظام</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Build 2.4.0
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex flex-col">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">آخر فحص أمني</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 text-left">
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                            منذ 15 دقيقة
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. SIDE CLUSTERS (4/12) */}
                        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto no-scrollbar">

                            {/* Support Cluster */}
                            <div className="p-8 rounded-[var(--radius-card)] bg-gray-900 border border-gray-800 shadow-2xl shadow-black/20 text-white relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-50 transition-opacity duration-700 group-hover:opacity-100" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md text-rose-400">
                                            <MessageSquare className="w-7 h-7" />
                                        </div>
                                        <Bell className="w-5 h-5 text-white/30 animate-swing origin-top" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-1">تذاكر الدعم</h3>
                                    <p className="text-white/40 text-[11px] font-bold mb-6">مركز المراسلات الفنية والدعم</p>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h4 className="text-5xl font-black text-white leading-none mb-1">{unreadCount}</h4>
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">تذكرة مفتوحة</p>
                                        </div>
                                        <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all border border-white/10 backdrop-blur-sm">أكمل المتابعة</button>
                                    </div>
                                </div>
                            </div>

                            {/* Storage Indicator */}
                            <div className="flex-1 min-h-[250px] p-8 rounded-[var(--radius-card)] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 group relative overflow-hidden">
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                            <HardDrive className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-gray-900 dark:text-white leading-none">تخزين البيانات</h4>
                                            <p className="text-[10px] font-bold text-gray-400">Data usage metrics</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="relative flex items-center justify-center py-4">
                                            <div className="text-center">
                                                <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-none">12%</h2>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">مستنفذ من الباقة</p>
                                            </div>
                                            {/* Minimalist Progress Circle using SVG placeholder representation */}
                                            <svg className="absolute w-32 h-32 -rotate-90 opacity-10">
                                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary" />
                                            </svg>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المستخدم حالياً</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">1.2 GB / 10 GB</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </main>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
