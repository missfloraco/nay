import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Store, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import ThemeToggle from '@/shared/theme-toggle';
import { UI_TEXT } from '@/shared/locales/texts';
import AdSlot from '@/shared/ads/adslot';
import ShieldOverlay from '@/shared/components/shield-overlay';

interface LandingLayoutProps {
    children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
    const { user: adminUser } = useAdminAuth();
    const { user: appUser } = useTenantAuth();
    const { settings, isAdBlockActive, isCheckingAdBlock } = useSettings();

    const dashboardLink = adminUser ? '/admin' : '/app';
    const finalAppName = settings.appName || 'SaaS Platform';

    const isForceLogout = localStorage.getItem('force_logout') === 'true';
    const isLogoutSuccess = window.location.search.includes('logout=success');
    const showDashboard = (adminUser || appUser) && !isForceLogout && !isLogoutSuccess;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-primary/20 selection:text-primary transition-colors duration-300">
            {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}

            <>
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 lg:h-20">
                            <div className="flex items-center gap-2 lg:gap-3 shrink-0 group">
                                <Link to={showDashboard ? dashboardLink : "/"} className="flex items-center gap-2 lg:gap-3">
                                    {settings.systemLogoUrl || settings.logoUrl ? (
                                        <div className="h-8 lg:h-10 flex items-center">
                                            <img
                                                src={settings.systemLogoUrl || settings.logoUrl || ''}
                                                alt={finalAppName}
                                                className="h-full w-auto max-h-12 object-contain logo-img"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const nameEl = e.currentTarget.nextElementSibling;
                                                    if (nameEl instanceof HTMLElement) nameEl.style.display = 'block';
                                                }}
                                            />
                                            <span
                                                className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tighter"
                                                style={{ display: 'none' }}
                                            >
                                                {finalAppName}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                            {finalAppName}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-gray-100/50 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10 backdrop-blur-md">
                                <a href="#features" className="px-5 py-2 text-xs font-bold text-gray-600 dark:text-white/70 hover:text-primary dark:hover:text-white transition-colors uppercase tracking-widest rounded-xl hover:bg-white dark:hover:bg-white/10">المميزات</a>
                                <a href="#faq" className="px-5 py-2 text-xs font-bold text-gray-600 dark:text-white/70 hover:text-primary dark:hover:text-white transition-colors uppercase tracking-widest rounded-xl hover:bg-white dark:hover:bg-white/10">الأسئلة الشائعة</a>
                            </nav>

                            <div className="flex items-center gap-3 lg:gap-6">
                                <div className="flex items-center gap-1 lg:gap-2">
                                    <ThemeToggle />
                                </div>

                                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />

                                <div className="flex items-center gap-2 lg:gap-4">
                                    <Link to={`/login${isLogoutSuccess ? '?logout=success' : ''}`} className="hidden sm:block text-xs font-bold text-gray-600 dark:text-white/70 hover:text-primary dark:hover:text-white transition-colors uppercase tracking-widest">تسجيل الدخول</Link>
                                    <Link
                                        to={`/register${isLogoutSuccess ? '?logout=success' : ''}`}
                                        className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                                    >
                                        ابدأ الآن
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="pt-20">
                    <AdSlot
                        placement="ad_landing_top"
                        className="w-full h-[90px] my-8"
                    />

                    {children}

                    <AdSlot
                        placement="ad_landing_footer"
                        className="w-full h-[90px] mt-12 mb-8 border-t border-gray-100 dark:border-white/5"
                    />
                </main>

                <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                            <div className="col-span-2 lg:col-span-2 space-y-8">
                                <div className="flex items-center gap-3">
                                    {settings.systemLogoUrl ? (
                                        <img src={settings.systemLogoUrl} alt={finalAppName} className="h-12 w-auto object-contain" />
                                    ) : settings.landingLogoUrl ? (
                                        <img src={settings.landingLogoUrl} alt={finalAppName} className="h-12 w-auto object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black">
                                            <Store className="w-7 h-7" />
                                        </div>
                                    )}
                                    <span className="text-2xl font-black tracking-tight">{finalAppName}</span>
                                </div>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-sm font-medium">
                                    المنصة العربية المتكاملة لإدارة مبيعاتك وتطوير أعمالك بكفاءة أعلى وتكلفة أقل.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-8 text-white">الشركة</h3>
                                <ul className="space-y-4 text-gray-400 font-medium text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">المدونة</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">برنامج الشركاء</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-8 text-white">المنتجات</h3>
                                <ul className="space-y-4 text-gray-400 font-medium text-sm">
                                    <li><a href="#features" className="hover:text-white transition-colors">المميزات</a></li>
                                    <li><a href="#faq" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">التحديثات</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-8 text-white">الدعم الفني</h3>
                                <ul className="space-y-4 text-gray-400 font-medium text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-sm text-gray-500 font-medium">
                                © {new Date().getFullYear()} {finalAppName}. جميع الحقوق محفوظة.
                            </p>
                        </div>
                    </div>
                </footer>
            </>
        </div>
    );
}
