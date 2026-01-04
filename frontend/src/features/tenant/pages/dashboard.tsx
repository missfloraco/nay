import React from 'react';
import AppLayout from '@/features/tenant/pages/applayout';
import {
    ShieldCheck, Database, MessageSquare, Zap, Activity,
    Layout, Cpu, HardDrive, Bell, ArrowUpRight, CheckCircle2,
    Calendar, Clock, Server, Globe, Key, ShieldAlert
} from 'lucide-react';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { formatDate } from '@/shared/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { tenant } = useTenantAuth();

    const { unreadCounts } = useNotifications();
    const navigate = useNavigate();

    const unreadCount = unreadCounts.support || 0;

    return (
        <AppLayout title="لوحة التحكم" icon={Layout} noPadding={true}>
            <div className="flex flex-col h-full bg-gray-50/50 dark:bg-dark-950 overflow-hidden relative" dir="rtl">

                {/* Background Textures */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-48 -mt-48 z-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32 z-0 pointer-events-none" />

                <main className="relative z-10 flex-1 p-6 lg:p-8 flex flex-col min-h-0 overflow-y-auto no-scrollbar">

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                        {/* 1. System Integrity Hero (7/12) */}
                        <div className="lg:col-span-7 lg:row-span-2 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-600" />
                            <div className="flex flex-col h-full justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div className="text-start">
                                            <div className="flex items-center gap-2 mb-1 justify-end">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">متصل ومؤمن</span>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">تاريخ البدء: {formatDate(tenant?.created_at)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">سلامة التطبيق (Integrity)</h2>
                                        <p className="text-sm font-bold text-gray-400 max-w-md">نظام مراقبة الأداء التلقائي يعمل بأعلى درجات الكفاءة لتوفير تجربة برمجية متفوقة.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">وقت الاستجابة</p>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-emerald-500 leading-none">22ms</h3>
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg">مثالي</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">نسخة النظام</p>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">2.4.0</h3>
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg">محدث</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Support Monitor (5/12) */}
                        <div className="lg:col-span-5 lg:row-span-1 bg-gray-900 border border-gray-800 rounded-[var(--radius-card)] p-6 shadow-2xl shadow-black/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md text-rose-400">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div className="text-start py-1 px-3 bg-rose-500/20 rounded-full border border-rose-500/30">
                                        <span className="text-[10px] font-black text-rose-400 uppercase">مركز الدعم</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between mt-4">
                                    <div>
                                        <h4 className="text-5xl font-black text-white leading-none mb-1">{unreadCount}</h4>
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">تذاكر معلقة الآن</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/app/support/messages')}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black text-white border border-white/10 transition-all"
                                    >
                                        متابعة التذاكر
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Storage Analysis (5/12) */}
                        <div className="lg:col-span-5 lg:row-span-2 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group relative overflow-hidden">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-base font-black text-gray-900 dark:text-white">تخزين البيانات</h4>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
                                    <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-2">12%</h2>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Usage Capacity</p>
                                    <svg className="absolute w-40 h-40 -rotate-90 opacity-10">
                                        <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-violet-500" />
                                    </svg>
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المستخدم حالياً</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">1.2 GB / 10 GB</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Real-time CPU Pulse (4/12) */}
                        <div className="lg:col-span-4 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">99.8% Stable</span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">طاقة المعالجة المتوفرة</p>
                            <div className="flex items-end gap-3 h-8">
                                <div className="flex-1 h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[99%] shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                                </div>
                            </div>
                        </div>

                        {/* 5. Security Check (3/12) */}
                        <div className="lg:col-span-3 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden group">
                            <div className="flex flex-col h-full justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 group-hover:rotate-12 transition-transform">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">الأمان</h4>
                                </div>
                                <p className="text-[20px] font-black text-gray-900 dark:text-white leading-tight">محمي بالكامل</p>
                                <p className="text-[10px] font-bold text-emerald-500">منذ 15 دقيقة</p>
                            </div>
                        </div>

                        {/* 6. Active Nodes (4/12) */}
                        <div className="lg:col-span-4 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <Server className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase">Live Metrics</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">العقد السحابية (Nodes)</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-900 bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
                                </div>
                                <span className="text-xs font-bold text-gray-400">3 عقد نشطة حالياً</span>
                            </div>
                        </div>

                        {/* 7. Regional Access (3/12) */}
                        <div className="lg:col-span-3 lg:row-span-1 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-2">
                                <Globe className="w-4 h-4 text-primary" />
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">مصدر الاتصال</h4>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">الرياض، السعودية</h3>
                            <p className="text-[10px] font-bold text-gray-400">Gateway-01 (Primary)</p>
                        </div>

                    </div>

                </main>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
