import React, { ReactNode, useState } from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import { Link } from 'react-router-dom';
import { Store, Sparkles, Home } from 'lucide-react';
import { useUI } from '@/shared/contexts/ui-context';
import { ThemeToggle } from '@/shared/layout/header/theme-toggle';

interface AuthSplitLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children, title, subtitle }) => {
    const { settings } = useSettings();
    const { darkMode, toggleDarkMode } = useUI();
    const [logoError, setLogoError] = useState(false);

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-dark-950 rtl" dir="rtl">

            {/* Right Side (Branding) - Start in RTL */}
            <div className="hidden lg:flex flex-col relative overflow-hidden bg-primary shadow-2xl z-10">
                {/* Vivid Gradient Background based on Platform Identity */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-primary-900 animate-gradient-xy opacity-90 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.3),transparent_50%)]" />

                {/* Animated Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-white/10 rounded-full blur-[100px] animate-float-slow mix-blend-overlay" />
                    <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-[80px] animate-float-delayed mix-blend-screen" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-20 text-center">
                    <div className="backdrop-blur-xl bg-white/5 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-8 max-w-md hover:bg-white/10 transition-all duration-700 group">
                        <Link to="/" className="relative block mx-auto w-32 h-32">
                            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            {settings.logoUrl && !logoError ? (
                                <img
                                    src={settings.logoUrl}
                                    alt={settings.appName}
                                    onError={() => setLogoError(true)}
                                    className="h-full w-auto object-contain relative transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-white dark:bg-dark-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                                    <Sparkles className="w-16 h-16 text-primary relative z-10 animate-bounce-slow" />
                                </div>
                            )}
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                                مرحباً بك في <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-primary-400 drop-shadow-sm">
                                    {settings.appName || 'ناي'}
                                </span>
                            </h1>

                            <p className="text-lg text-gray-300 font-bold leading-relaxed">
                                نمنحك الأدوات المتكاملة لإدارة أعمالك بلمسة ذكاء. انطلق نحو النجاح مع أقوى منصة عربية.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Left Side (Form) - End in RTL */}
            <div className="flex flex-col min-h-screen relative bg-white dark:bg-dark-950">

                {/* Professional Top Navigation Bar */}
                <div className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-gray-50 dark:border-white/5 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md sticky top-0 z-[100]" style={{ pointerEvents: 'auto' }}>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-3 bg-gray-50 dark:bg-dark-900 rounded-2xl text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-dark-800 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all group"
                            title="الرئيسية"
                        >
                            <Home size={20} className="group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle className="relative w-11 h-11 rounded-2xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-dark-800 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all group shrink-0" iconClassName="w-5 h-5" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 py-12">
                    <div className="w-full max-w-lg mx-auto">
                        {/* Mobile Logo (Visible only on small screens) */}
                        <div className="lg:hidden text-center mb-10">
                            <Link to="/" className="inline-block">
                                {settings.logoUrl && !logoError ? (
                                    <img
                                        src={settings.logoUrl}
                                        alt={settings.appName}
                                        className="h-12 w-auto mx-auto"
                                    />
                                ) : (
                                    <span className="text-2xl font-black text-primary">{settings.appName}</span>
                                )}
                            </Link>
                        </div>

                        <div className="mb-10 lg:mb-12 text-center">
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                                {title}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>

                {/* Professional Dynamic Footer */}
                <footer className="w-full px-6 sm:px-12 py-8 bg-gray-50/50 dark:bg-dark-900/10 border-t border-gray-50 dark:border-white/5">
                    <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-bold text-gray-400">
                            {settings.copyright_text ? (
                                settings.copyright_text
                            ) : (
                                <>منصة {settings.appName} © {new Date().getFullYear()} أحد مشاريع <a href={settings.companyUrl || '#'} className="hover:text-primary transition-colors">{settings.companyName || 'اسم الشركة'}</a></>
                            )}
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="font-bold text-gray-400 hover:text-primary transition-colors text-xs">سياسة الخصوصية</a>
                            <a href="#" className="font-bold text-gray-400 hover:text-primary transition-colors text-xs">الشروط والأحكام</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};
