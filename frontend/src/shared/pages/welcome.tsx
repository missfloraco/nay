import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import {
    Sparkles, Settings, Headset, ShieldCheck,
    Zap, Layout, BarChart3, ArrowLeft, Star,
    Shield, Globe, MessageSquare, CheckCircle,
    User as UserIcon, Bell, Rocket
} from 'lucide-react';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';

export default function WelcomePage() {
    const navigate = useNavigate();
    const isAdmin = window.location.pathname.startsWith('/admin');
    const { user: tenantUser, tenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings } = useSettings();
    const { t } = useText();
    const { isActive, isTrialActive } = useTrialStatus();

    const currentUser = isAdmin ? adminUser : tenantUser;
    const LayoutComponent = isAdmin ? AdminLayout : AppLayout;

    const platformFeatures = [
        {
            title: 'إدارة متكاملة',
            desc: 'بنية تحتية قوية تدعم تعدد المستأجرين مع أداء مستقر وعالٍ.',
            icon: Layout,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'سرعة وكفاءة',
            desc: 'تقنيات حديثة تضمن تجربة مستخدم سريعة ومعالجة بيانات لحظية.',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            title: 'أمان البيانات',
            desc: 'أعلى معايير الحماية والتشفير لبياناتك وبيانات عملائك.',
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        }
    ];

    return (
        <LayoutComponent title="الرئيسية" icon={Sparkles} noPadding={true}>
            <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-dark-950 overflow-hidden relative selection:bg-primary/20" dir="rtl">

                {/* Visual Decorations - Static & Fixed */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 flex flex-col relative z-10 overflow-hidden">

                    {/* HUB GRID: Viewport Optimized */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">

                        {/* LEFT COLUMN: Identity & Story (5/12) */}
                        <div className="lg:col-span-5 flex flex-col justify-between py-4 min-h-0">

                            {/* Identity Section */}
                            <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            {isAdmin ? 'بيئة المدير العام' : 'لوحة تحكم المتجر'}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1]">
                                            مرحباً بك، <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-emerald-500">
                                                {currentUser?.name}
                                            </span>
                                        </h1>
                                        <p className="text-lg lg:text-xl font-bold text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                                            {isAdmin
                                                ? `أنت الآن في مركز التحكم الرئيسي لـ ${settings.appName}. وجهتك لإدارة المنصة بالكامل.`
                                                : `سعداء برؤيتك مرة أخرى. إليك نظرة سريعة على ما يمكنك فعله اليوم في متجرك الخاص.`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Avatar Presence with Premium Border */}
                                <div className="relative inline-block group">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-primary via-emerald-500 to-blue-500 rounded-[var(--radius-card)] blur-md opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative w-32 h-32 lg:w-48 lg:h-48 rounded-[var(--radius-card)] overflow-hidden border-8 border-white dark:border-dark-900 bg-white dark:bg-dark-800 shadow-2xl">
                                        <img
                                            src={resolveAssetUrl(tenant?.avatar_url || currentUser?.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || '')}&background=02aa94&color=fff&size=512`}
                                            alt={currentUser?.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border-4 border-gray-50 dark:border-dark-900 flex items-center justify-center text-emerald-500">
                                        <CheckCircle className="w-6 h-6 fill-current animate-in zoom-in-50 duration-500 delay-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Platform Status Badge */}
                            <div className="pt-8 animate-in fade-in duration-1000 delay-500">
                                <div className="p-5 rounded-[var(--radius-inner)] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-4 group cursor-default">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">حالة النظام الآن</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">المنصة تعمل بأعلى كفاءة مستقرة</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Strategy & Actions (7/12) */}
                        <div className="lg:col-span-7 flex flex-col gap-8 min-h-0">

                            {/* Feature Showcase Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-in slide-in-from-left-10 duration-700">
                                {platformFeatures.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="p-6 rounded-[var(--radius-card)] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-base font-black text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* OPERATIONS HUB: Large Visual Shortcuts */}
                            <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">

                                {/* Settings Shortcut */}
                                <button
                                    onClick={() => navigate(isAdmin ? '/admin/settings' : '/app/settings')}
                                    className="relative group overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-gray-900 to-gray-800 dark:from-dark-900 dark:to-dark-950 p-8 flex flex-col justify-between text-right transition-all duration-500 hover:scale-[1.02] hover:-rotate-1 active:scale-[0.98] shadow-2xl hover:shadow-primary/20"
                                >
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -ml-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute bottom-[-20%] left-[-10%] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
                                        <Settings className="w-64 h-64 rotate-[-15deg]" />
                                    </div>

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="p-4 bg-white/10 rounded-[var(--radius-inner)] backdrop-blur-md border border-white/5 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl">
                                            <Settings className="w-8 h-8 group-hover:rotate-90 transition-transform duration-700" />
                                        </div>
                                        <div className="text-left">
                                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                                                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">إعدادات المنصة</h3>
                                        <p className="text-sm font-bold text-white/50 leading-relaxed">تحكم في البيانات، المظهر، وإعدادات الحساب الشخصية.</p>
                                    </div>
                                </button>

                                {/* Support Shortcut */}
                                <button
                                    onClick={() => navigate(isAdmin ? '/admin/support' : '/app/support/messages')}
                                    className="relative group overflow-hidden rounded-[var(--radius-card)] bg-white dark:bg-dark-900 border-2 border-transparent hover:border-emerald-500/30 p-8 flex flex-col justify-between text-right transition-all duration-500 hover:scale-[1.02] hover:rotate-1 active:scale-[0.98] shadow-2xl hover:shadow-emerald-500/10"
                                >
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute bottom-[-20%] left-[-10%] text-emerald-500/[0.03] group-hover:text-emerald-500/[0.08] transition-all duration-700 pointer-events-none">
                                        <Headset className="w-64 h-64 rotate-[15deg]" />
                                    </div>

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="p-4 bg-emerald-500/10 rounded-[var(--radius-inner)] border border-emerald-500/20 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-xl">
                                            <Headset className="w-8 h-8" />
                                        </div>
                                        <div className="text-left">
                                            <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-white/20 group-hover:text-emerald-500 transition-colors">
                                                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">الدعم الفني</h3>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">تواصل معنا للحصول على المساعدة التقنية وتقديم الاستفسارات.</p>
                                    </div>
                                </button>

                            </div>
                        </div>

                    </div>


                </div>
            </div>
        </LayoutComponent>
    );
}
