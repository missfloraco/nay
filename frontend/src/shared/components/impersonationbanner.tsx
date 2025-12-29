import React from 'react';
import { ShieldAlert, LogOut, AlertTriangle } from 'lucide-react';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';

interface ImpersonationBannerProps {
    tenantName: string;
    onExit: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ tenantName, onExit }) => {
    const { isImpersonating } = useTenantAuth();

    if (!isImpersonating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[10000] animate-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-accent2 to-red-600 text-white px-4 py-2.5 shadow-2xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight flex items-center gap-2">
                            وضع محاكاة النظام (Impersonation Mode)
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase">للعرض فقط</span>
                        </p>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">أنت تشاهد الآن متجر: <span className="underline">{tenantName}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">الأمان</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold leading-none text-white/90">
                            <AlertTriangle className="w-3 h-3 text-white animate-pulse" />
                            وصول محدود للمشرف (للعرض فقط)
                        </div>
                    </div>
                    <button
                        onClick={onExit}
                        className="bg-white text-accent2 px-5 py-2 rounded-xl font-black text-xs hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        إنهاء المحاكاة
                    </button>
                </div>
            </div>
            {/* Subtle glow effect */}
            <div className="h-[2px] w-full bg-white/20 blur-[1px]" />
        </div>
    );
};
