import React, { ReactNode, useState } from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import { Link } from 'react-router-dom';
import { Store, Sparkles } from 'lucide-react';

interface AuthSplitLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children, title, subtitle }) => {
    const { settings } = useSettings();
    const [logoError, setLogoError] = useState(false);

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-dark-950 rtl" dir="rtl">

            {/* Right Side (Branding) - Start in RTL */}
            <div className="hidden lg:flex flex-col relative overflow-hidden bg-gray-50 dark:bg-dark-900 border-e border-gray-100 dark:border-white/5">
                {/* Modern Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />

                {/* Decorative Blobs */}
                <div className="absolute -top-[20%] -right-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-pulse duration-[8s]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-20 text-center">
                    <div className="mb-12 relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        {settings.logoUrl && !logoError ? (
                            <img
                                src={settings.logoUrl}
                                alt={settings.appName}
                                onError={() => setLogoError(true)}
                                className="h-28 w-auto object-contain relative transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-white dark:bg-dark-800 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-100 dark:border-white/10 relative">
                                <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                        أهلاً بك في <br />
                        <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            {settings.appName || 'المنصة'}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 font-bold max-w-md leading-relaxed">
                        بوابتك المتكاملة لإدارة أعمالك بكفاءة واحترافية. انطلق نجو المستقبل اليوم.
                    </p>

                    {/* Footer dynamic copyright */}
                    <div className="absolute bottom-10 inset-x-0 text-center">
                        <p className="text-sm font-bold text-gray-400 opacity-70">
                            {settings.appName} © {new Date().getFullYear()} أحد مشاريع{' '}
                            {settings.companyLink ? (
                                <a href={settings.companyLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                                    {settings.companyName || 'شركة مسلفورا'}
                                </a>
                            ) : (
                                <span>{settings.companyName || 'شركة مسلفورا'}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Side (Form) - End in RTL */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 py-12 relative">
                <div className="w-full max-w-lg mx-auto">
                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="lg:hidden text-center mb-10">
                        {settings.logoUrl && !logoError ? (
                            <img
                                src={settings.logoUrl}
                                alt={settings.appName}
                                className="h-12 w-auto mx-auto"
                            />
                        ) : (
                            <span className="text-2xl font-black text-primary">{settings.appName}</span>
                        )}
                    </div>

                    <div className="mb-10 lg:mb-12">
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
        </div>
    );
};
