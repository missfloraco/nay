import React from 'react';
import { PiggyBank, Target, Zap } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

export default function ValueProp() {
    const { settings } = useSettings();
    const appName = settings.appName || 'SaaS Platform';

    return (
        <section className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Premium Gradient Container */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 dark:from-blue-600/20 dark:via-blue-700/10 dark:to-indigo-900/20 rounded-2xl lg:rounded-2xl p-10 lg:p-24 relative overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/10">

                    {/* Atmospheric Glows */}
                    <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-400 opacity-20 dark:opacity-10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-indigo-500 opacity-20 dark:opacity-10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

                    <div className="relative z-10">
                        {/* Section Header - Bold & Centralized */}
                        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-28">
                            <span className="inline-flex items-center px-6 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-sm tracking-widest uppercase mb-8 border border-white/20">
                                القيمة المضافة
                            </span>
                            <h2 className="text-5xl lg:text-[72px] font-black mb-8 leading-[1.05] text-white tracking-tighter">
                                وفّر مالك وجهدك <span className="text-white/40">بضغطة زر واحدة</span>
                            </h2>
                            <p className="text-xl lg:text-3xl text-white/80 leading-relaxed font-bold max-w-3xl mx-auto">
                                بدلاً من دفع مبالغ طائلة لأدوات متعددة، احصل على نظام {appName} المتكامل الذي يغنيك عن كل ذلك بتكلفة ذكية.
                            </p>
                        </div>

                        {/* Modern Value Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                            {[
                                {
                                    icon: PiggyBank,
                                    title: 'توفير مالي ذكي',
                                    description: 'استبدل اشتراكاتك المتعددة بنظام واحد يوفر عليك أكثر من 70% من التكاليف التقنية.'
                                },
                                {
                                    icon: Zap,
                                    title: 'سرعة وكفاءة مطلقة',
                                    description: 'تخلص من عناء المزامنة اليدوية. كل شيء مرتبط ببعضه البعض لحظة بلحظة وبدقة عالية.'
                                },
                                {
                                    icon: Target,
                                    title: 'تركيز على ما يهم',
                                    description: 'اترك تعقيدات الإدارة التقنية لنا، وتفرّغ تماماً لتطوير تجارتك وزيادة مبيعاتك.'
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center space-y-8 p-10 bg-white/5 dark:bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 transition-all hover:scale-[1.05] hover:bg-white/20 duration-500 group">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-2xl shadow-black/20 group-hover:rotate-12 transition-all duration-700">
                                        <item.icon className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl lg:text-3xl font-black text-white">{item.title}</h3>
                                        <p className="text-white/70 leading-relaxed font-bold text-lg">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
