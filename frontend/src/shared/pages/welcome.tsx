import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import { useAction } from '@/shared/contexts/action-context';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import {
    Sparkles, Calendar, Zap, Layout, ShieldCheck,
    User as UserIcon, ArrowLeft, ArrowRight, Users, BarChart3,
    Megaphone, Code, Shield, MessageSquare, Trash2,
    LayoutDashboard, Fingerprint, Mail, Globe,
    ChevronLeft, Star, FileText, CheckCircle, X, Settings2
} from 'lucide-react';
import { formatDate, resolveAssetUrl } from '@/shared/utils/helpers';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import TrialBanner from '@/features/tenant/components/trial-banner';

export default function WelcomePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = location.pathname.startsWith('/admin');
    const { user: tenantUser, tenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings } = useSettings();
    const { t } = useText();
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

    const { setPrimaryAction } = useAction();

    // Set Footer Action
    React.useEffect(() => {
        setPrimaryAction({
            label: 'الإعدادات',
            onClick: () => navigate(isAdmin ? '/admin/settings' : '/app/settings'),
            icon: Settings2
        });

        return () => setPrimaryAction(null);
    }, [isAdmin, navigate, setPrimaryAction]);

    const currentUser = isAdmin ? adminUser : tenantUser;
    const LayoutComponent = isAdmin ? AdminLayout : AppLayout;

    // Admin Navigation Items for shortcuts - Slightly more compact
    const adminShortcuts = [
        { icon: LayoutDashboard, label: t('admin.NAV.DASHBOARD', 'لوحة التحكم'), path: '/admin', color: 'text-blue-500', bg: 'bg-blue-500/5' },
        { icon: Layout, label: t('admin.NAV.IDENTITY', 'هوية المنصة'), path: '/admin/identity', color: 'text-purple-500', bg: 'bg-purple-500/5' },
        { icon: Users, label: t('admin.NAV.TENANTS', 'إدارة المشتركين'), path: '/admin/tenants', color: 'text-[#02aa94]', bg: 'bg-[#02aa94]/5' },
        { icon: BarChart3, label: 'إدارة SEO', path: '/admin/seo', color: 'text-blue-500', bg: 'bg-blue-500/5' },
        { icon: Megaphone, label: t('admin.NAV.ADS', 'إدارة الإعلانات'), path: '/admin/ads', color: 'text-[#fb005e]', bg: 'bg-[#fb005e]/5' },
        { icon: Code, label: 'الأكواد والنصوص', path: '/admin/scripts', color: 'text-amber-500', bg: 'bg-amber-500/5' },
        { icon: Shield, label: 'إعدادات الحماية', path: '/admin/security', color: 'text-rose-500', bg: 'bg-rose-500/5' },
        { icon: MessageSquare, label: t('admin.NAV.SUPPORT', 'رسائل الدعم'), path: '/admin/support', color: 'text-[#fb005e]', bg: 'bg-[#fb005e]/5' },
        { icon: Trash2, label: t('admin.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/admin/trash', color: 'text-red-500', bg: 'bg-red-500/5' },
    ];

    return (
        <LayoutComponent title="الرئيسية" icon={Sparkles} noPadding={true}>
            <div className="flex flex-col h-full w-full animate-in fade-in duration-700 bg-gray-50/50 dark:bg-dark-950 overflow-hidden relative" dir="rtl">
                {/* Background Decoration - Subtle */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 z-0"></div>

                <main className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 flex flex-col justify-evenly space-y-4 text-right h-full">



                        {/* 1. Slim Greeting Section */}
                        <div className="space-y-4 shrink-0">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/5">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>نظام الإدارة الذكية المتكامل</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                                    مرحباً بك، <span className="text-primary">{currentUser?.name}</span> 👋
                                </h1>
                                <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 max-w-3xl ml-auto leading-relaxed">
                                    {isAdmin
                                        ? `أنت تشاهد لوحة الإدارة المركزية لـ ${settings.appName}. تحكم في المشتركين، الإعلانات، والهوية البصرية بكل سهولة.`
                                        : `سعداء بعودتك. تابع آخر التحديثات في متجرك وأكمل إعداداتك للحصول على أفضل النتائج.`
                                    }
                                </p>
                            </div>

                            {/* Moved System Intro Text */}
                            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                                    {t('dashboard.welcome', 'مرحباً بك في نظام ')} {settings?.appName || 'SaaS Platform'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">
                                    هذه النسخة الأساسية من النظام جاهزة للتطوير. تم إزالة جميع الوحدات التجارية (المبيعات، المنتجات، إلخ) مع الحفاظ على البنية التحتية للنظام متعدد المستأجرين.
                                </p>
                            </div>
                        </div>

                        {/* 2. Role Specific Content - Balanced for Viewport */}
                        <div className="flex-1 min-h-0 py-2 flex flex-col justify-center overflow-hidden">
                            {isAdmin ? (
                                /* SUPER ADMIN VIEW: Command Center Grid */
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <LayoutDashboard className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white">مركز التحكم</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 content-start">
                                        {adminShortcuts.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className="group relative overflow-hidden bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent dark:from-white/5 rounded-bl-[100px] -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50"></div>

                                                <div className="relative z-10 flex justify-between items-start mb-4">
                                                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors rtl:rotate-180" />
                                                </div>

                                                <div className="relative z-10">
                                                    <h4 className="text-base font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{item.label}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400">وصول سريع</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* TENANT VIEW: Modern Bento Grid */
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full auto-rows-[minmax(100px,auto)]">

                                    {/* NEW: Dedicated Trial Banner as a Bento Card */}
                                    <div className="md:col-span-12 shrink-0">
                                        <TrialBanner />
                                    </div>

                                    {/* Main Identity Card - Large Block */}
                                    <div className="md:col-span-8 md:row-span-2 relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 group">
                                        {/* Dynamic Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                                        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-4">
                                                    <div className="relative inline-block">
                                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                                        <img
                                                            src={resolveAssetUrl(tenant?.avatar_url || currentUser?.avatar_url) || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=random&size=256`}
                                                            className="w-24 h-24 rounded-[2rem] shadow-xl border-4 border-white dark:border-dark-800 object-cover relative z-10"
                                                            alt={currentUser?.name}
                                                        />
                                                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white dark:border-dark-800 shadow-lg" title="نشط">
                                                            <CheckCircle className="w-4 h-4 fill-current" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                                                            {currentUser?.name}
                                                        </h2>
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-xs font-bold text-gray-500">
                                                                ID: #{tenant?.uid || currentUser?.id}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                            <span className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{currentUser?.email}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block text-left">
                                                    <Globe className="w-32 h-32 text-gray-50 dark:text-white/5 absolute top-4 left-4 rotate-12" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-8">
                                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">نوع الاشتراك</p>
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-5 h-5 text-amber-500 fill-current" />
                                                        <span className="text-lg font-black text-gray-900 dark:text-white">الباقة الاحترافية</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">حالة المتجر</p>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-5 h-5 text-emerald-500" />
                                                        <span className="text-lg font-black text-gray-900 dark:text-white">متصل بالإنترنت</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Column */}
                                    <div className="md:col-span-4 grid grid-rows-2 gap-6">
                                        {/* Time Remaining */}
                                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-6 flex flex-col justify-center shadow-xl group">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                                        <Calendar className="w-6 h-6 text-white" />
                                                    </div>
                                                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">باقي للاشتراك</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-4xl font-black mb-1">
                                                        {Math.ceil((new Date(tenant?.subscription_ends_at || tenant?.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}
                                                    </h3>
                                                    <p className="text-white/60 text-sm font-bold">يوم للإنتهاء</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Action */}
                                        <button
                                            onClick={() => navigate('/app/settings')}
                                            className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 p-6 flex flex-col justify-center shadow-xl hover:shadow-2xl transition-all group text-right"
                                        >
                                            <div className="absolute inset-0 bg-gray-50 dark:bg-white/5 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                                        <Settings2 className="w-6 h-6" />
                                                    </div>
                                                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors rtl:rotate-180" />
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">إعدادات المتجر</h3>
                                                <p className="text-xs text-gray-500 font-bold">تخصيص الهوية والبيانات</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Global Action Footer (Simplified) - Removed Button, kept text */}
                        <div className="text-center pt-2">
                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] mb-4">انطلق نحو آفاق جديدة</p>
                        </div>
                    </div>
                </main>
            </div>
        </LayoutComponent>
    );
}
