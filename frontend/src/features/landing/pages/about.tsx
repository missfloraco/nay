import React from 'react';
import { Target, Zap, Users, Shield, TrendingUp, Award } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

export default function AboutUs() {
    const { settings } = useSettings();
    const appName = settings.appName || 'SaaS Platform';

    return (
        <section id="about" className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Right Side: Logo and Visual */}
                    <div className="order-2 lg:order-1 flex items-center justify-center">
                        <div className="relative">
                            {/* Concentric circles design */}
                            <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative">
                                <div className="w-64 h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                    <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-2xl">
                                        {settings.systemLogoUrl ? (
                                            <img src={settings.systemLogoUrl} alt={appName} className="h-24 w-auto object-contain" />
                                        ) : (
                                            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
                                                <Award className="w-12 h-12 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px] -z-10" />
                        </div>
                    </div>

                    {/* Left Side: Content */}
                    <div className="order-1 lg:order-2 text-right space-y-12">
                        <div>
                            <span className="inline-flex items-center px-6 py-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 font-black text-sm tracking-widest uppercase mb-8 border border-blue-500/20">
                                من نحن
                            </span>
                            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                                لماذا <span className="text-primary">{appName}</span>؟
                            </h2>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-4">
                                    لماذا {appName}؟
                                </h3>
                                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    منصتك الشاملة التي توفر لك جميع الأدوات اللازمة لإدارة وتطوير مشروعك بسهولة. الحل الأمثل للتجار، وأصحاب المنشآت والمحلات، ومهندسي الكهرباء، وجوائز الأعمال.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-4">
                                    كيف نعمل؟
                                </h3>
                                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    نستخدم أفضل الممارسات لتوفير تجربة مخصصة تلبي احتياجاتك، من التصميم السريع إلى التكامل التقني مما يجعل كل خطوة فريدة نحو تحقيق أهدافك التسويقية بكفاءة وفعالية.
                                </p>
                            </div>
                        </div>

                        {/* Stats or Features */}
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-black text-primary mb-2">500+</div>
                                <div className="text-sm lg:text-base font-bold text-gray-600 dark:text-gray-400">عميل سعيد</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-black text-primary mb-2">99%</div>
                                <div className="text-sm lg:text-base font-bold text-gray-600 dark:text-gray-400">رضا العملاء</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-black text-primary mb-2">24/7</div>
                                <div className="text-sm lg:text-base font-bold text-gray-600 dark:text-gray-400">دعم فني</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
