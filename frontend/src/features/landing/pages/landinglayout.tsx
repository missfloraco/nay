import React, { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Sparkles, Facebook, Instagram, MessageCircle } from 'lucide-react';
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

    // Auto-hide header on scroll
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show header when scrolling up, hide when scrolling down
            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHeaderVisible(false);
            }

            setLastScrollY(currentScrollY);

            // Auto-hide after 2 seconds of no scrolling
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 100) {
                    setIsHeaderVisible(false);
                }
            }, 2000);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [lastScrollY]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-primary/20 selection:text-primary transition-colors duration-300">
            {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}

            <>
                <header className={`fixed top-8 left-0 right-0 z-50 pointer-events-none transition-transform duration-500 ease-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
                        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 px-6 sm:px-10">
                            <div className="flex items-center justify-between h-20 lg:h-24">
                                <div className="flex items-center gap-2 lg:gap-3 shrink-0 group">
                                    <Link to={showDashboard ? dashboardLink : "/"} className="flex items-center gap-2 lg:gap-3">
                                        {settings.systemLogoUrl || settings.logoUrl ? (
                                            <div className="h-10 lg:h-12 flex items-center">
                                                <img
                                                    src={settings.systemLogoUrl || settings.logoUrl || ''}
                                                    alt={finalAppName}
                                                    className="h-full w-auto max-h-14 object-contain logo-img transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const nameEl = e.currentTarget.nextElementSibling;
                                                        if (nameEl instanceof HTMLElement) nameEl.style.display = 'block';
                                                    }}
                                                />
                                                <span
                                                    className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tighter"
                                                    style={{ display: 'none' }}
                                                >
                                                    {finalAppName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                {finalAppName}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                <nav className="hidden xl:flex items-center gap-2">
                                    <a href="/" className="px-5 py-2.5 text-[13px] font-black text-gray-900 dark:text-white/70 hover:text-primary dark:hover:text-white transition-all uppercase tracking-[0.15em] rounded-xl">الرئيسية</a>
                                    <a href="#features" className="px-5 py-2.5 text-[13px] font-black text-gray-900 dark:text-white/70 hover:text-primary dark:hover:text-white transition-all uppercase tracking-[0.15em] rounded-xl">المميزات</a>
                                    <a href="#faq" className="px-5 py-2.5 text-[13px] font-black text-gray-900 dark:text-white/70 hover:text-primary dark:hover:text-white transition-all uppercase tracking-[0.15em] rounded-xl">الأسعار</a>
                                    <a href="#faq" className="px-5 py-2.5 text-[13px] font-black text-gray-900 dark:text-white/70 hover:text-primary dark:hover:text-white transition-all uppercase tracking-[0.15em] rounded-xl">لماذا نحن ؟</a>
                                    <a href="#faq" className="px-5 py-2.5 text-[13px] font-black text-gray-900 dark:text-white/70 hover:text-primary dark:hover:text-white transition-all uppercase tracking-[0.15em] rounded-xl">الأسئلة الشائعة</a>
                                </nav>

                                <div className="flex items-center gap-3 lg:gap-8">
                                    <div className="flex items-center gap-2">
                                        <ThemeToggle />
                                    </div>

                                    <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />

                                    <div className="flex items-center gap-4 lg:gap-8">
                                        <Link to={`/login${isLogoutSuccess ? '?logout=success' : ''}`} className="hidden sm:block text-[11px] font-black text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors uppercase tracking-[0.15em]">تسجيل الدخول</Link>
                                        <Link
                                            to={`/register${isLogoutSuccess ? '?logout=success' : ''}`}
                                            className="px-8 py-4 bg-primary text-white text-xs font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 uppercase tracking-[0.1em]"
                                        >
                                            ابدأ الآن
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="pt-32 sm:pt-40 lg:pt-48">
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

                <footer className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white pt-20 pb-10 border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Central Logo and Socials */}
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 mb-6 shadow-2xl">
                                {settings.systemLogoUrl ? (
                                    <img src={settings.systemLogoUrl} alt={finalAppName} className="h-12 w-auto object-contain" />
                                ) : (
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black">
                                        <Store className="w-7 h-7" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-8 text-gray-400 dark:text-white/30">
                                <a href="#" className="hover:text-blue-500 transition-all hover:scale-125"><Facebook className="w-7 h-7" /></a>
                                <a href="#" className="hover:text-pink-500 transition-all hover:scale-125"><Instagram className="w-7 h-7" /></a>
                                <a href="#" className="hover:text-green-500 transition-all hover:scale-125"><MessageCircle className="w-7 h-7" /></a>
                            </div>
                        </div>

                        {/* Premium CTA Banner */}
                        <div className="bg-gradient-to-l from-blue-50 via-indigo-50 to-blue-50 dark:from-[#0c1425] dark:via-[#0a0a1a] dark:to-black rounded-2xl p-10 lg:p-14 mb-16 flex flex-col lg:flex-row items-center justify-between gap-10 border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <h2 className="text-4xl lg:text-[56px] font-black text-gray-900 dark:text-white relative z-10 leading-none tracking-tight">النجاح يبدأ بخطوة</h2>
                            <Link to="/register" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-110 active:scale-95 relative z-10">ابدأ الآن</Link>
                        </div>

                        {/* Footer Link Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 mb-20 text-center">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">الدعم الفني</h3>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-base">
                                    <li><a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">طرق الدفع</a></li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">الدعم الفني</h3>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-base">
                                    <li><a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">طرق الدفع</a></li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">المنتجات</h3>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-base">
                                    <li><a href="#" className="hover:text-primary transition-colors">أكاديمية مسلفورا</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">{finalAppName}</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">تسجيل الشركات</a></li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">الشركة</h3>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-base">
                                    <li><a href="#" className="hover:text-primary transition-colors">الباقات والأسعار</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">المدونة</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">من نحن</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Copyright Bar */}
                        <div className="pt-10 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                            <p className="text-base text-gray-600 dark:text-gray-400 font-bold order-last md:order-first">
                                {finalAppName} © {new Date().getFullYear()} أحد مشاريع <span className="text-blue-500">شركة مسلفورا</span>
                            </p>
                            <div className="flex gap-8 text-gray-600 dark:text-gray-400 font-black text-xs md:mr-auto">
                                <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
                                <a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </>
        </div>
    );
}
