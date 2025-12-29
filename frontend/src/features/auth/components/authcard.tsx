import React, { ReactNode, useState } from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import { Store, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '@/shared/utils/helpers';

interface AuthCardProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
    const { settings } = useSettings();
    const [logoError, setLogoError] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col items-center justify-center p-6 transition-colors duration-500 font-sans rtl" dir="rtl">

            {/* Background Effects - Matching Onboarding */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl relative animate-in fade-in slide-in-from-bottom-5 duration-500">

                {/* Main Card - Glassmorphism with Onboarding styling */}
                <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white dark:border-dark-800 relative overflow-hidden">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center justify-center mb-8 group">
                            {settings.logoUrl && !logoError ? (
                                <img
                                    src={settings.logoUrl}
                                    alt={settings.appName}
                                    onError={() => setLogoError(true)}
                                    className="h-16 w-auto object-contain transition-all transform group-hover:scale-110 group-hover:rotate-3"
                                />
                            ) : (
                                <div className="px-8 py-3 bg-white/50 dark:bg-dark-800/50 rounded-2xl border border-white/50 dark:border-dark-700 shadow-sm">
                                    <span className="text-2xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                        {settings.appName}
                                    </span>
                                </div>
                            )}
                        </Link>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            {title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};
