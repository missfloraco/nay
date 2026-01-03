import React from 'react';
import { User, Calendar, CheckCircle2, AlertTriangle, Clock, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { resolveAssetUrl } from '@/shared/utils/helpers';

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
    return (
        <div className="flex flex-col xl:flex-row gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full lg:p-4">
            {/* 
                ==========================================================================
                LEFT COLUMN - Profile Presence & Status
                ========================================================================== 
            */}
            <div className="w-full xl:w-[380px] shrink-0 space-y-8">

                {/* 1. Profile Identity Card - High Premium Style */}
                <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-10 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                    {/* Decorative Background Elements */}
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                    <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-1000" />

                    <div className="relative flex flex-col items-center text-center space-y-6">
                        {/* 0. Profile Photo Presence */}
                        <div className="relative group/photo">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-primary/5 to-secondary/20 rounded-full blur-2xl opacity-0 group-hover/photo:opacity-100 transition-opacity duration-1000" />
                            <div className="w-40 h-40 rounded-full border-4 border-white dark:border-dark-800 shadow-2xl overflow-hidden relative z-10 bg-gray-50 dark:bg-dark-950">
                                <img
                                    src={resolveAssetUrl(userData.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=02aa94&color=fff&size=200`}
                                    alt={userData.name}
                                    className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover/photo:bg-transparent transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-3 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                    {userData.name}
                                </h1>
                                {userData.role && (
                                    <div className="inline-flex items-center px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">
                                        {userData.role}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 font-mono tracking-tight selection:bg-primary/20">
                                {userData.email}
                            </p>
                        </div>

                        {/* Verified Status Tag */}
                        <div className="w-full pt-6 flex justify-center">
                            {userData.email_verified_at ? (
                                <div className="flex items-center gap-2.5 px-6 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm animate-in zoom-in-95 duration-500">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest">حساب موثق بالكامل</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5 px-6 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100/50 dark:border-amber-500/20 shadow-sm">
                                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                                    <span className="text-xs font-black uppercase tracking-widest">انتظار تأكيد البريد</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Trial Experience (Dynamic Slot) */}
                {trialInfo && (
                    <div className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group border border-white/10">
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-white/20 rounded-[1.25rem] backdrop-blur-md shadow-inner border border-white/20">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-black text-xl tracking-tight">الاشتراك التجريبي</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-sm flex items-end justify-between hover:bg-white/20 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">أيام متبقية</p>
                                        <div className="text-5xl font-black">{trialInfo.daysRemaining}</div>
                                    </div>
                                    <span className="text-xs font-black px-4 py-2 bg-emerald-400 text-white rounded-full shadow-lg shadow-emerald-500/20 border border-white/20 uppercase tracking-widest">نشط الآن</span>
                                </div>
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">تاريخ الانتهاء</span>
                                    <span className="text-xs font-bold text-white/80 font-mono">
                                        {new Date(trialInfo.expiresAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Metrics/Details - CLEAN MINIMAL */}
                <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-1 h-6 bg-primary rounded-full" />
                        <h3 className="font-black text-lg text-gray-900 dark:text-white">سجلات الوصول</h3>
                    </div>

                    <div className="space-y-6">
                        {userData.created_at && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-950 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all group/item">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors shadow-sm">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">تاريخ الانضمام</span>
                                </div>
                                <span className="text-xs font-black text-gray-900 dark:text-white font-mono opacity-80">
                                    {new Date(userData.created_at).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        )}

                        {userData.last_login_at && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-950 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all group/item">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors shadow-sm">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">آخر نشاط</span>
                                </div>
                                <span className="text-xs font-black text-gray-900 dark:text-white">
                                    {formatDistanceToNow(new Date(userData.last_login_at), { addSuffix: true, locale: ar })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 
                ==========================================================================
                RIGHT COLUMN - Main Settings Forms
                ========================================================================== 
            */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
};
