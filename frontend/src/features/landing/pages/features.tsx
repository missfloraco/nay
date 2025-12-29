import { BarChart3, ShoppingCart, Users, Layers, ShieldCheck, Zap, Store } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

const features = [
    {
        icon: ShoppingCart,
        title: 'نقاط بيع سريعة POS',
        description: 'واجهة بيع متطورة تدعم الباركود والطباعة الحرارية وتعمل حتى في حال انقطاع الإنترنت.'
    },
    {
        icon: Layers,
        title: 'إدارة المخزون الذكية',
        description: 'تتبع الكميات، تنبيهات النواقص، وإدارة الموردين وعمليات الجرد في مكان واحد.'
    },
    {
        icon: BarChart3,
        title: 'تقارير مالية دقيقة',
        description: 'رسوم بيانية تفاعلية توضح الأرباح، المصاريف، وأداء المبيعات اليومي والشهري بدقة عالية.'
    },
    {
        icon: Users,
        title: 'نظام ولاء العملاء',
        description: 'إدارة بيانات العملاء، تتبع سجل مشترياتهم، وبرامج النقاط والخصومات لزيادة المبيعات.'
    },
    {
        icon: ShieldCheck,
        title: 'أمان وحماية البيانات',
        description: 'تشفير كامل للبيانات مع نسخ احتياطي دوري لضمان سلامة معلوماتك وتجارتك.'
    },
    {
        icon: Zap,
        title: 'سرعة وكفاءة عالية',
        description: 'نظام خفيف وسريع جداً يضمن إتمام عمليات البيع في ثوانٍ معدودة دون أي تأخير.'
    },
    {
        icon: Store,
        title: 'إدارة فروع متعددة',
        description: 'إدارة جميع فروعك ومخازنك من لوحة تحكم واحدة مع مزامنة فورية للبيانات.'
    },
    {
        icon: ShoppingCart,
        title: 'الفواتير الإلكترونية',
        description: 'إصدار فواتير ضريبية متوافقة مع متطلبات هيئة الزكاة والدخل مع رمز الاستجابة السريع QR.'
    },
    {
        icon: BarChart3,
        title: 'إدارة المصاريف',
        description: 'تتبع جميع مصاريفك التشغيلية (إيجار، رواتب، كهرباء) لحساب صافي الأرباح بدقة.'
    },
    {
        icon: Layers,
        title: 'تعدد العملات والضرائب',
        description: 'دعم كامل لمختلف العملات وإعدادات الضرائب المخصصة بما يتناسب مع قوانين بلدك.'
    },
    {
        icon: Zap,
        title: 'تكامل مع الأنظمة',
        description: 'إمكانية الربط مع الطابعات، الموازين الإلكترونية، وأجهزة الدفع لضمان سير العمل بسلاسة.'
    }
];

export default function Features() {
    const { settings } = useSettings();
    return (
        <section id="features" className="py-24 lg:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase mb-6">
                        لماذا تختار منصة {settings.appName || 'SaaS Platform'}؟
                    </span>
                    <h2 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1]">
                        كل ما تحتاجه <span className="text-primary italic">في مكان واحد</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl font-medium leading-relaxed">
                        بدلاً من استخدام عدة تطبيقات، جمعنا لك كل الأدوات اللازمة لإدارة مشروعك باحترافية وسهولة تامة.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {(settings.landing_features ? JSON.parse(settings.landing_features as string) : features).map((feature: any, index: number) => (
                        <div
                            key={index}
                            className="bg-gray-50/50 dark:bg-white/5 p-8 lg:p-10 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group text-right"
                        >
                            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 group-hover:-rotate-3">
                                {feature.icon ? <feature.icon className="w-7 h-7 lg:w-8 lg:h-8" /> : <Zap className="w-7 h-7 lg:w-8 lg:h-8" />}
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal text-base lg:text-lg">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
