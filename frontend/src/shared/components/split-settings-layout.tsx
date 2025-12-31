import React from 'react';
import { User, Calendar, CheckCircle2, AlertTriangle, Clock, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SplitSettingsLayoutProps {
    children: React.ReactNode;
    userData: {
        name: string;
        email: string;
        avatarUrl?: string | null;
        role?: string;
        email_verified_at?: string | null;
        created_at?: string;
        last_login_at?: string;
    };
    trialInfo?: {
        isActive: boolean;
        daysRemaining: number;
        expiresAt: string;
    };
}

export const SplitSettingsLayout: React.FC<SplitSettingsLayoutProps> = ({
    children,
    userData,
    trialInfo
}) => {
    const resolveAvatarUrl = (url?: string | null) => {
        if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=02aa94&color=fff&size=200`;
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${url}`;
    };

    return (
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 animate-in fade-in duration-500">
            {/* Left Column - Profile Summary */}
            <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <img
                                src={resolveAvatarUrl(userData.avatarUrl)}
                                alt={userData.name}
                                className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-dark-800 shadow-xl object-cover"
                            />
                            {userData.role && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-xs font-black rounded-full shadow-lg whitespace-nowrap">
                                    {userData.role}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 w-full">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                                {userData.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {userData.email}
                            </p>
                        </div>

                        {/* Email Verification Status */}
                        <div className="w-full pt-4 border-t border-gray-100 dark:border-dark-800">
                            {userData.email_verified_at ? (
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-bold">البريد الإلكتروني مؤكد</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-bold">البريد الإلكتروني غير مؤكد</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trial Info (if applicable) */}
                {trialInfo && (
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-[2.5rem] p-8 border border-primary/20 dark:border-primary/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-gray-900 dark:text-white">حالة التجربة</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">معلومات الاشتراك التجريبي</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-dark-900/50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">الحالة</span>
                                <span className={`text-sm font-black ${trialInfo.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {trialInfo.isActive ? 'نشط' : 'منتهي'}
                                </span>
                            </div>
                            {trialInfo.isActive && (
                                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-dark-900/50 rounded-2xl">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">الأيام المتبقية</span>
                                    <span className="text-2xl font-black text-primary">
                                        {trialInfo.daysRemaining}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Account Info */}
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-800">
                        <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-2xl text-gray-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">معلومات الحساب</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">تفاصيل النشاط والأمان</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {userData.created_at && (
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">تاريخ الإنشاء</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">
                                        {formatDistanceToNow(new Date(userData.created_at), { addSuffix: true, locale: ar })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {userData.last_login_at && (
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">آخر تسجيل دخول</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">
                                        {formatDistanceToNow(new Date(userData.last_login_at), { addSuffix: true, locale: ar })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Settings Form */}
            <div className="min-w-0">
                {children}
            </div>
        </div>
    );
};
