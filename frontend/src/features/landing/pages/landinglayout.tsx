import React, { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Sparkles, Facebook, Instagram, MessageCircle, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { UI_TEXT } from '@/shared/locales/texts';
import AdSlot from '@/shared/ads/adslot';
import ShieldOverlay from '@/shared/components/shield-overlay';
import { ThemeToggle } from '@/shared/layout/header/theme-toggle';
import Button from '@/shared/ui/buttons/btn-base';

interface LandingLayoutProps {
    children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
    const { user: adminUser } = useAdminAuth();
    const { user: appUser } = useTenantAuth();
    const { settings, isAdBlockActive, isCheckingAdBlock } = useSettings();

    const dashboardLink = adminUser ? '/admin' : '/app';
    const finalAppName = settings.appName || '';

    const isForceLogout = localStorage.getItem('force_logout') === 'true';
    const isLogoutSuccess = window.location.search.includes('logout=success');
    const showDashboard = (adminUser || appUser) && !isForceLogout && !isLogoutSuccess;

    // Auto-hide header on scroll
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Mobile Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-white text-gray-900 selection:bg-primary/20 selection:text-primary transition-colors duration-300">
            {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}

            <>
                <header className="fixed top-4 sm:top-8 left-0 right-0 z-[60] pointer-events-auto transition-all duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
                        <div className="bg-white/90 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 px-6 sm:px-10">
                            <div className="flex items-center justify-between h-20"> {/* Fixed 80px Height */}
                                <div className="flex items-center gap-2 lg:gap-3 shrink-0 group">
                                    <Link to={showDashboard ? dashboardLink : "/"} className="flex items-center gap-2 lg:gap-3">
                                        {settings.systemLogoUrl || settings.logoUrl ? (
                                            <div className="h-10 flex items-center">
                                                <img
                                                    src={settings.systemLogoUrl || settings.logoUrl || ''}
                                                    alt={finalAppName}
                                                    className="h-full w-auto max-h-12 object-contain logo-img transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const nameEl = e.currentTarget.nextElementSibling;
                                                        if (nameEl instanceof HTMLElement) nameEl.style.display = 'block';
                                                    }}
                                                />
                                                <span
                                                    className="text-xl font-black text-gray-900 tracking-tighter"
                                                    style={{ display: 'none' }}
                                                >
                                                    {finalAppName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                {finalAppName}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                <nav className="hidden xl:flex items-center gap-2">
                                    <a href="/" className="px-5 py-2.5 text-sm font-black text-gray-900 hover:text-primary transition-all uppercase tracking-[0.1em] rounded-xl">الرئيسية</a>
                                    <a href="#features" className="px-5 py-2.5 text-sm font-black text-gray-900 hover:text-primary transition-all uppercase tracking-[0.1em] rounded-xl">المميزات</a>
                                    <a href="#pricing" className="px-5 py-2.5 text-sm font-black text-gray-900 hover:text-primary transition-all uppercase tracking-[0.1em] rounded-xl">الأسعار</a>
                                    <a href="#about" className="px-5 py-2.5 text-sm font-black text-gray-900 hover:text-primary transition-all uppercase tracking-[0.1em] rounded-xl">لماذا نحن ؟</a>
                                    <a href="#faq" className="px-5 py-2.5 text-sm font-black text-gray-900 hover:text-primary transition-all uppercase tracking-[0.1em] rounded-xl">الأسئلة الشائعة</a>
                                </nav>

                                <div className="flex items-center gap-4 lg:gap-6">
                                    <Link to={`/login${isLogoutSuccess ? '?logout=success' : ''}`} className="hidden md:block text-[13px] font-black text-gray-500 hover:text-primary transition-colors uppercase tracking-[0.15em]">تسجيل الدخول</Link>
                                    <Button
                                        to={`/register${isLogoutSuccess ? '?logout=success' : ''}`}
                                        variant="primary"
                                        size="md"
                                        className="px-8 shadow-lg shadow-primary/20"
                                    >
                                        ابدأ الآن
                                    </Button>

                                    {/* Mobile Menu Button */}
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="xl:hidden p-2.5 text-gray-600 hover:text-primary transition-colors"
                                    >
                                        <div className="w-5 h-5 flex flex-col justify-between items-center relative">
                                            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                                            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Navigation Drawer - Matches Control Panel Sidebar */}
                <div
                    className={`fixed inset-0 bg-black/50 z-[60] xl:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                <aside
                    className={`fixed inset-y-0 right-0 z-[70] flex flex-col bg-white dark:bg-dark-900 border-l border-black transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-[250px]
                        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}
                >
                    {/* 1. Header Section */}
                    <div className="h-[70px] flex items-center shrink-0 border-b border-black px-6 gap-3">
                        {settings.systemLogoUrl || settings.logoUrl ? (
                            <img
                                src={settings.systemLogoUrl || settings.logoUrl || ''}
                                alt={finalAppName}
                                className="w-10 h-10 object-contain"
                            />
                        ) : null}
                        <span className="text-xl font-black text-gray-900 dark:text-white truncate tracking-tight">
                            {finalAppName}
                        </span>
                        <div className="mr-auto">
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <RotateCcw className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                    </div>

                    {/* 2. Content Section */}
                    <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
                        {[
                            { label: 'الرئيسية', href: '/' },
                            { label: 'المميزات', href: '#features' },
                            { label: 'الأسعار', href: '#pricing' },
                            { label: 'لماذا نحن ؟', href: '#about' },
                            { label: 'الأسئلة الشائعة', href: '#faq' }
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center h-14 px-4 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* 3. Footer Section */}
                    <div className="p-4 border-t border-black bg-white dark:bg-dark-900 flex gap-3">
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex-1 flex items-center justify-center h-12 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
                        >
                            تسجيل الدخول
                        </Link>
                        <Button
                            to={`/register${isLogoutSuccess ? '?logout=success' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                            variant="primary"
                            className="flex-[1.5] h-12 shadow-lg shadow-primary/20"
                        >
                            ابدأ الآن
                        </Button>
                    </div>
                </aside>

                <main className="pt-28 sm:pt-32">
                    {children}
                </main>

                {/* Floating Controls */}
                <div className="fixed bottom-8 left-0 right-0 z-[70] px-8 pointer-events-none flex justify-between items-center">
                    {/* Right: Scroll to top/bottom (First in RTL DOM = Right side) */}
                    <div className="pointer-events-auto">
                        <button
                            onClick={() => {
                                if (window.scrollY > 300) {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }
                            }}
                            className={`w-14 h-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group ${window.scrollY > 300 || window.scrollY < 100 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
                            title={window.scrollY > 300 ? 'للأعلى' : 'للأسفل'}
                        >
                            <div className="flex items-center justify-center w-7 h-7">
                                {window.scrollY > 300 ? (
                                    <ChevronUp className="w-full h-full" />
                                ) : (
                                    <ChevronDown className="w-full h-full" />
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Left: Dark Mode Toggle (Second in RTL DOM = Left side) */}
                    <div className="pointer-events-auto">
                        <ThemeToggle
                            invertedFloating
                            iconClassName="w-7 h-7"
                        />
                    </div>
                </div>

                <footer className="bg-white text-gray-900 pb-10 border-t border-gray-200 transition-colors duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Central Logo and Socials */}
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-20 h-20 bg-gray-100 backdrop-blur-3xl rounded-full flex items-center justify-center border border-gray-200 mb-6 shadow-2xl">
                                {settings.systemLogoUrl ? (
                                    <img src={settings.systemLogoUrl} alt={finalAppName} className="h-12 w-auto object-contain" />
                                ) : (
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black">
                                        <Store className="w-7 h-7" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-8 text-gray-400">
                                <a href="#" className="hover:text-blue-500 transition-all hover:scale-125"><Facebook className="w-7 h-7" /></a>
                                <a href="#" className="hover:text-pink-500 transition-all hover:scale-125"><Instagram className="w-7 h-7" /></a>
                                <a href="#" className="hover:text-green-500 transition-all hover:scale-125"><MessageCircle className="w-7 h-7" /></a>
                            </div>
                        </div>

                        {/* Premium CTA Banner */}
                        <div className="bg-gradient-to-l from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-10 lg:p-14 mb-16 flex flex-col lg:flex-row items-center justify-between gap-10 border border-gray-200 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <h2 className="text-4xl lg:text-[56px] font-black text-gray-900 relative z-10 leading-none tracking-tight">النجاح يبدأ بخطوة</h2>
                            <Button
                                to="/register"
                                variant="primary"
                                size="md"
                                className="px-10 shadow-xl shadow-blue-500/20 relative z-10 bg-blue-600 hover:bg-blue-500"
                            >
                                ابدأ الآن
                            </Button>
                        </div>

                        {/* Footer Link Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 mb-20 text-center">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900">الدعم الفني</h3>
                                <ul className="space-y-4 text-gray-600 font-bold text-base">
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
                                <h3 className="text-xl font-black text-gray-900">المنتجات</h3>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-base">
                                    <li><a href="#" className="hover:text-primary transition-colors">أكاديمية مسلفورا</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">{finalAppName}</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">تسجيل الشركات</a></li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900">الشركة</h3>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-bold text-base">
                                    <li><a href="#" className="hover:text-primary transition-colors">الباقات والأسعار</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">المدونة</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">من نحن</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Copyright Bar - Simplified Single Line */}
                        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center justify-center gap-2 text-gray-400 font-bold text-xs">
                                <span>{finalAppName} © {new Date().getFullYear()}</span>
                                {settings.companyName && (
                                    <>
                                        <span className="opacity-30">|</span>
                                        <span>أحد مشاريع شركة {settings.companyName}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-8 text-gray-400 font-black text-xs md:mr-auto">
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
