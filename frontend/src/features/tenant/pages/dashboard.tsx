import React from 'react';
import AppLayout from '@/features/tenant/pages/applayout';
import { useSettings } from '@/shared/contexts/app-context';
import { Clock, Calendar, AlertCircle, ShieldCheck, Layers, Database, Sparkles, Zap, ArrowRight, CheckCircle, X } from 'lucide-react';
import { StatCard } from '@/shared/ui/cards/card-stat';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { formatDate } from '@/shared/utils/helpers';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';

const Dashboard: React.FC = () => {
    const { t, settings } = useSettings();
    const { isActive, isTrialActive } = useTrialStatus();
    const [isBannerDismissed, setIsBannerDismissed] = React.useState(false);

    React.useEffect(() => {
        const dismissed = localStorage.getItem('active_banner_dismissed');
        if (dismissed === 'true') {
            setIsBannerDismissed(true);
        }
    }, []);

    const dismissBanner = () => {
        localStorage.setItem('active_banner_dismissed', 'true');
        setIsBannerDismissed(true);
    };

    return (
        <AppLayout title={t('dashboard.title', 'لوحة التحكم')}>
            <div className="animate-in fade-in duration-700 h-full flex flex-col space-y-10">
                {/* Bonus Trial Banner - Gift Version */}
                {settings?.currentUser?.tenant &&
                    !isActive &&
                    !settings.currentUser.tenant.trial_bonus_applied && (
                        <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 md:p-8 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-1000 min-h-[220px] flex items-center">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                            <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-10">
                                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                                    <div className="relative shrink-0">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-inner border border-white/30 transition-transform">
                                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                        </div>
                                        <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                            <span className="text-white text-[10px] font-black">+7</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase border border-white/10">
                                            <Zap className="w-2.5 h-2.5 fill-current text-yellow-300" />
                                            مكافأة حصرية
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black leading-tight">
                                            هديتك بانتظارك: <span className="underline decoration-orange-400 decoration-2 underline-offset-4">7 أيام مجاناً!</span> 🎁
                                        </h3>
                                        <p className="text-white/80 font-bold text-sm max-w-lg leading-relaxed">
                                            أضف لمستك الشخصية! قم برفع صورتك وإضافة رقم الواتساب لتمديد فترة تجربتك فوراً.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.location.href = '/app/settings'}
                                    className="shrink-0 group px-8 py-4 bg-white text-blue-700 rounded-xl font-black text-lg hover:bg-blue-50 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                                >
                                    <span>أكمل الملف الآن</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform transform rtl:rotate-180" />
                                </button>
                            </div>
                        </div>
                    )}

                {/* Active Subscription Banner - Welcome Version */}
                {settings?.currentUser?.tenant && (isActive || (isTrialActive && settings.currentUser.tenant.trial_bonus_applied)) && !isBannerDismissed && (
                    <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 md:p-8 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-1000 min-h-[220px] flex items-center">
                        <button
                            onClick={dismissBanner}
                            className="absolute top-4 left-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-all z-20 group"
                            title="إغلاق للأبد"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-10">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-inner border border-white/30 transition-transform">
                                        <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase border border-white/10">
                                        <Zap className="w-2.5 h-2.5 fill-current text-emerald-300" />
                                        حساب مفعل - اشتراك نشط
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black leading-tight">
                                        اشتراكك <span className="underline decoration-emerald-300 decoration-2 underline-offset-4">نشط بالكامل</span> ومؤمن 🛡️
                                    </h3>
                                    <p className="text-white/80 font-bold text-sm max-w-lg leading-relaxed">
                                        بإمكانك الآن الاستمتاع بكافة مزايا النظام الاحترافية. شكراً لثقتك بنا.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="text-center px-6 py-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl min-w-[140px]">
                                    <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">بدأ في</div>
                                    <div className="text-lg font-black text-white">
                                        {formatDate(settings.currentUser.tenant.subscription_started_at || settings.currentUser.tenant.created_at)}
                                    </div>
                                </div>
                                <div className="text-center px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl min-w-[140px]">
                                    <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1 text-emerald-100">ينتهي في</div>
                                    <div className="text-lg font-black text-emerald-300">
                                        {formatDate(settings.currentUser.tenant.subscription_ends_at || settings.currentUser.tenant.trial_expires_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="premium-card p-10 bg-gradient-to-br from-primary/10 to-blue-500/5 border-primary/20">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                        {t('dashboard.welcome', 'مرحباً بك في نظام ')} {settings?.appName || 'SaaS Platform'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                        هذه النسخة الأساسية من النظام جاهزة للتطوير. تم إزالة جميع الوحدات التجارية (المبيعات، المنتجات، إلخ) مع الحفاظ على البنية التحتية للنظام متعدد المستأجرين.
                    </p>
                </div>

                {/* System Status Area */}
                <div className="dashboard-grid grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <StatCard
                        title="حالة النظام"
                        value="نشط"
                        icon={ShieldCheck}
                        colorFrom="from-green-600"
                        colorTo="to-green-400"
                        trend={100}
                        trendLabel="System is online"
                    />
                    <StatCard
                        title="إصدار النظام"
                        value="v2.0 Core"
                        icon={Layers}
                        colorFrom="from-blue-600"
                        colorTo="to-blue-400"
                        trend={20}
                        trendLabel="Core architecture"
                    />
                    <StatCard
                        title="قاعدة البيانات"
                        value="Connected"
                        icon={Database}
                        colorFrom="from-purple-600"
                        colorTo="to-purple-400"
                        trend={100}
                        trendLabel="Stable connection"
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
