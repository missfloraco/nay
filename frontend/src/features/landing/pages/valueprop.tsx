import { PiggyBank, Target, Zap } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

export default function ValueProp() {
    const { settings } = useSettings();
    const appName = settings.appName || 'SaaS Platform';

    return (
        <section className="py-24 lg:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="bg-primary bg-gradient-to-br from-primary to-blue-700 rounded-[2.5rem] lg:rounded-[4rem] p-10 lg:p-24 relative overflow-hidden shadow-2xl shadow-primary/30">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
                            <h2 className="text-3xl lg:text-7xl font-black mb-8 leading-[1.1] text-white">
                                وفّر مالك وجهدك <span className="text-white/60">بضغطة زر</span>
                            </h2>
                            <p className="text-lg lg:text-2xl text-white/90 leading-relaxed font-medium max-w-3xl mx-auto">
                                بدلاً من دفع مبالغ طائلة لأدوات متعددة، احصل على نظام {appName} المتكامل الذي يغنيك عن كل ذلك بتكلفة ذكية.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                            {[
                                {
                                    icon: PiggyBank,
                                    title: 'توفير مالي ذكي',
                                    description: 'استبدل اشتراكاتك المتعددة بنظام واحد يوفر عليك أكثر من 70% من التكاليف التقنية الشهرية والسنوية.'
                                },
                                {
                                    icon: Zap,
                                    title: 'سرعة وكفاءة مطلقة',
                                    description: 'تخلص من عناء المزامنة اليدوية. كل شيء مرتبط ببعضه البعض لحظة بلحظة وبدقة عالية في جميع فروعك.'
                                },
                                {
                                    icon: Target,
                                    title: 'تركيز على ما يهم',
                                    description: 'اترك تعقيدات الإدارة التقنية لنا، وتفرّغ تماماً لتطوير تجارتك وزيادة مبيعاتك وخدمة عملائك باحتراف.'
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-6 p-10 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 transition-all hover:scale-[1.03] hover:bg-white/15 duration-500 group">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl group-hover:rotate-6 transition-transform">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-bold text-white">{item.title}</h3>
                                    <p className="text-white/80 leading-relaxed font-normal text-base lg:text-lg">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
