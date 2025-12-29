import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ShieldOverlay() {
    return (
        <div
            data-shield-overlay="true"
            className="fixed inset-0 z-[999999] flex items-center justify-center p-6 sm:p-10 overflow-hidden font-sans select-none"
            dir="rtl"
        >
            {/* Ultra Glassmorphic Background */}
            <div className="absolute inset-0 bg-white/70 dark:bg-dark-950/80 backdrop-blur-[80px] transition-all duration-700" />

            {/* Animated Ambient Orbs */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />

            {/* Content Card */}
            <div className="relative w-full max-w-xl bg-white/95 dark:bg-dark-900/95 backdrop-blur-3xl border border-white dark:border-white/10 p-10 sm:p-20 rounded-[4rem] shadow-[0_64px_200px_-32px_rgba(0,0,0,0.25)] dark:shadow-[0_64px_200px_-32px_rgba(0,0,0,0.8)] flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-16 duration-1000">

                {/* Visual Identity */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/40 rounded-[2.5rem] blur-3xl animate-pulse" />
                    <div className="relative w-28 h-28 bg-white dark:bg-dark-800 rounded-[3rem] border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-2xl">
                        <ShieldCheck className="w-14 h-14 text-primary" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-full border-4 border-white dark:border-dark-950 flex items-center justify-center shadow-lg animate-bounce">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        تجربة استخدام <span className="text-primary italic">آمنة ومستقرة</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 font-bold text-xl sm:text-2xl leading-relaxed max-w-md mx-auto">
                        لضمان أفضل أداء للمنصة واستمرارية خدماتنا المتميزة، نرجو منك تعطيل <span className="text-gray-900 dark:text-white underline decoration-primary decoration-4 underline-offset-4 pointer-events-none">برامج حجب الإعلانات</span> للمتابعة.
                    </p>
                </div>

                <div className="w-full space-y-8">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-7 bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-2xl font-black rounded-[2.5rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 group overflow-hidden relative"
                    >
                        <span className="relative z-10">إعادة التحميل الآن</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>

                    <div className="flex items-center justify-center gap-4 text-sm font-black text-gray-400 uppercase tracking-[0.3em]">
                        <div className="h-px w-12 bg-gray-200 dark:bg-dark-700" />
                        <span>نحن نقدر تعاونكم</span>
                        <div className="h-px w-12 bg-gray-200 dark:bg-dark-700" />
                    </div>
                </div>
            </div>
        </div>
    );
}
