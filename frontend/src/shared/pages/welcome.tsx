import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import {
    Sparkles, Calendar, Zap, Layout, ShieldCheck,
    User as UserIcon, ArrowLeft, Users, BarChart3,
    Megaphone, Code, Shield, MessageSquare, Trash2,
    LayoutDashboard, Fingerprint, Mail, Globe,
    ChevronLeft
} from 'lucide-react';
import { formatDate, resolveAssetUrl } from '@/shared/utils/helpers';

export default function WelcomePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = location.pathname.startsWith('/admin');
    const { user: tenantUser, tenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings } = useSettings();
    const { t } = useText();

    const user = isAdmin ? adminUser : tenantUser;
    const LayoutComponent = isAdmin ? AdminLayout : AppLayout;

    // Admin Navigation Items for shortcuts
    const adminShortcuts = [
        { icon: LayoutDashboard, label: t('admin.NAV.DASHBOARD', 'لوحة التحكم'), path: '/admin', color: 'text-blue-600', bg: 'bg-blue-500/10' },
        { icon: Layout, label: t('admin.NAV.IDENTITY', 'هوية المنصة'), path: '/admin/identity', color: 'text-purple-600', bg: 'bg-purple-500/10' },
        { icon: Users, label: t('admin.NAV.TENANTS', 'إدارة المشتركين'), path: '/admin/tenants', color: 'text-[#02aa94]', bg: 'bg-[#02aa94]/10' },
        { icon: BarChart3, label: 'إدارة SEO', path: '/admin/seo', color: 'text-blue-600', bg: 'bg-blue-500/10' },
        { icon: Megaphone, label: t('admin.NAV.ADS', 'إدارة الإعلانات'), path: '/admin/ads', color: 'text-[#fb005e]', bg: 'bg-[#fb005e]/10' },
        { icon: Code, label: 'الأكواد والنصوص', path: '/admin/scripts', color: 'text-amber-600', bg: 'bg-amber-500/10' },
        { icon: Shield, label: 'إعدادات الحماية', path: '/admin/security', color: 'text-rose-600', bg: 'bg-rose-500/10' },
        { icon: MessageSquare, label: t('admin.NAV.SUPPORT', 'رسائل الدعم'), path: '/admin/support', color: 'text-[#fb005e]', bg: 'bg-[#fb005e]/10' },
        { icon: Trash2, label: t('admin.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/admin/trash', color: 'text-red-600', bg: 'bg-red-500/10' },
    ];

    return (
        <LayoutComponent title="الرئيسية" icon={Sparkles} noPadding={true}>
            <div className="flex flex-col h-full w-full animate-in fade-in duration-700 bg-white dark:bg-dark-950 overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 z-0"></div>

                <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-8 lg:p-12 space-y-12 text-right rtl">

                        {/* 1. Greeting Section */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                                <Sparkles className="w-4 h-4" />
                                <span>مرحباً بك في نظام الإدارة الذكية</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                                مرحباً بك مرة أخرى، <span className="text-primary">{user?.name}</span> 👋
                            </h1>
                            <p className="text-lg md:text-xl font-bold text-gray-500 dark:text-gray-400 max-w-3xl ml-auto leading-relaxed">
                                {isAdmin
                                    ? `أنت الآن في لوحة الإدارة المركزية لمنصة ${settings.appName}. من هنا يمكنك التحكم في كافة مفاصل النظام وتخصيص تجربة المستخدمين.`
                                    : `سعداء برؤيتك مجدداً. استخدم لوحة التحكم المخصصة لك لإدارة أعمالك واكتشاف المزيد من الميزات الاحترافية.`
                                }
                            </p>
                        </div>

                        {/* 2. Role Specific Content */}
                        {isAdmin ? (
                            /* SUPER ADMIN VIEW: Grid of Shortcuts */
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                        الوصول السريع للأقسام
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {adminShortcuts.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className="premium-card p-8 flex items-center gap-6 group hover:translate-y-[-4px] transition-all hover:border-primary/30"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                                <item.icon className="w-7 h-7" />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.label}</h4>
                                                <p className="text-xs font-bold text-gray-400 mt-1">انتقل إلى الإدارة</p>
                                            </div>
                                            <ChevronLeft className="w-5 h-5 text-gray-300 mr-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* TENANT VIEW: User Identity & Account Specs */
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                                {/* Left Column: Identity Card (4 spans) */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="premium-card p-0 overflow-hidden shadow-2xl border-primary/10">
                                        <div className="h-32 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 relative">
                                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                        </div>
                                        <div className="px-8 pb-10 flex flex-col items-center text-center -mt-16 relative z-10">
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <img
                                                    src={resolveAssetUrl(tenantUser?.avatarUrl) || `https://ui-avatars.com/api/?name=${tenantUser?.name}&background=random&size=256`}
                                                    className="w-32 h-32 rounded-[2.5rem] border-4 border-white dark:border-dark-900 shadow-xl object-cover relative z-10 hover:scale-110 transition-transform duration-500"
                                                    alt={tenantUser?.name}
                                                />
                                            </div>
                                            <h3 className="mt-6 text-2xl font-black text-gray-900 dark:text-white">{tenantUser?.name}</h3>
                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/10">
                                                <ShieldCheck className="w-3 h-3" />
                                                <span>مشترك نشط</span>
                                            </div>

                                            <div className="mt-10 w-full space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800/50 rounded-2xl border border-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-dark-800 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                        <Fingerprint className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">معرف الحساب (UID)</p>
                                                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 select-all tracking-wider">#{tenantUser?.id || '---'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800/50 rounded-2xl border border-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-dark-800 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">البريد الإلكتروني</p>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[180px]">{tenantUser?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Specs & Progress (8 spans) */}
                                <div className="lg:col-span-8 space-y-10">
                                    {/* Subscription Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="premium-card p-10 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-br-full -ml-16 -mt-16 group-hover:bg-emerald-500/10 transition-all"></div>
                                            <div className="relative z-10 space-y-6">
                                                <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                    <Calendar className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">تاريخ بداية الاشتراك</p>
                                                    <h4 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                                                        {formatDate(tenant?.subscription_started_at || tenant?.created_at)}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="premium-card p-10 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-br-full -ml-16 -mt-16 group-hover:bg-rose-500/10 transition-all"></div>
                                            <div className="relative z-10 space-y-6">
                                                <div className="w-16 h-16 rounded-[1.25rem] bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                                    <Zap className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">تاريخ انتهاء الصلاحية</p>
                                                    <h4 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                                                        {formatDate(tenant?.subscription_ends_at || tenant?.trial_expires_at)}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Welcome Message Card */}
                                    <div className="premium-card p-12 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-dark-900 border-indigo-100 dark:border-indigo-900/30">
                                        <div className="flex flex-col md:flex-row items-center gap-10">
                                            <div className="shrink-0">
                                                <div className="w-24 h-24 bg-white dark:bg-dark-950 rounded-3xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-white/5">
                                                    <Globe className="w-12 h-12 animate-spin-slow" />
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-center md:text-right">
                                                <h4 className="text-2xl font-black text-gray-900 dark:text-white">أطلق العنان لتجارتك اليوم</h4>
                                                <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                                                    نحن نعمل دائماً على تحسين نظامنا لضمان أفضل تجربة لك ولعملائك. هل تعلم أنه يمكنك تخصيص هوية متجرك بالكامل من قسم الألوان والشعارات؟
                                                </p>
                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => navigate('/app')}
                                                        className="px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 mr-auto md:mr-0 inline-flex"
                                                    >
                                                        <span>استكشف لوحة التحكم</span>
                                                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </LayoutComponent>
    );
}
