import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/shared/contexts/app-context';

export default function Hero() {
    const { settings } = useSettings();
    return (
        <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500 flex items-center">
            {/* Grid Background Pattern - Dynamic Opacity */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none text-gray-900 dark:text-white"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-[#0a0a0a] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center text-right">

                    {/* Right Side: Content (Order 1 in RTL = Right) */}
                    <div className="order-1 space-y-10">
                        {/* Rocket Icon Container - Dynamic Styling */}
                        <div className="flex justify-center lg:justify-start">
                            <div className="w-16 h-16 bg-primary/10 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-white border border-primary/20 dark:border-white/10 shadow-xl backdrop-blur-sm">
                                <span className="text-4xl">🚀</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h1 className="text-5xl lg:text-[76px] font-black text-gray-900 dark:text-white tracking-tight leading-[1.05]">
                                {settings.landing_hero_title ? (
                                    <>
                                        {settings.landing_hero_title.split('{{platform}}').map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                {part}
                                                {i < arr.length - 1 && <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-500">{settings.appName}</span>}
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <>منصة <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-500">{settings.appName}</span></>
                                )}
                            </h1>

                            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                {settings.landing_hero_subtitle || 'منصتك الشاملة التي توفر لك جميع الأدوات اللازمة لإدارة وتطوير مشروعك بسهولة. الحل الأمثل للتجار، وأصحاب المحلات والمطاعم، ورواد الأعمال.'}
                            </p>

                            <div className="pt-2">
                                <p className="text-xl lg:text-2xl font-semibold text-primary dark:text-white px-4 py-2 bg-primary/5 dark:bg-white/5 rounded-xl border-r-4 border-primary inline-block leading-tight">
                                    كل ما تحتاجه لـ زيادة مبيعاتك
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-start gap-10">
                            <Link
                                to="/register"
                                className="px-12 py-5 bg-primary text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-2xl group w-full lg:w-auto min-w-[240px] shadow-2xl shadow-primary/30"
                            >
                                {settings.landing_hero_cta || 'ابدأ الآن'}
                            </Link>

                            {/* Social Proof */}
                            <div className="flex flex-col items-center lg:items-start gap-4">
                                <div className="flex items-center -space-x-4 rtl:space-x-reverse">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-xl shadow-black/5">
                                            <img src={`https://i.pravatar.cc/150?u=saas_user${i}`} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    انضم إلى أكثر من 63 شخصاً قاموا بالتسجيل بالفعل!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Left Side: Person Image (Order 2 in RTL = Left) */}
                    <div className="order-2 relative h-full flex items-center justify-center lg:justify-start">
                        <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/5] lg:aspect-auto lg:h-[750px]">
                            <img
                                src={settings.landing_hero_image as string || "/landing_hero_pos_saas.png"}
                                alt="Modern POS System"
                                className="w-full h-full object-contain relative z-10 drop-shadow-2xl scale-110 lg:scale-125 transition-transform duration-700 hover:scale-115 lg:hover:scale-130"
                            />
                            {/* Decorative glow behind image - Theme Aware */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/10 dark:bg-blue-600/5 rounded-full blur-[120px] -z-10" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
