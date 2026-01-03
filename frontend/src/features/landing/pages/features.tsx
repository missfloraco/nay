import React from 'react';
import {
    BarChart3,
    ShoppingCart,
    Users,
    Layers,
    ShieldCheck,
    Zap,
    Store,
    Monitor,
    Layout,
    FileText,
    Calendar,
    MessagesSquare,
    CreditCard,
    Settings,
    SearchCheck,
    Truck,
    Smartphone,
    Heart,
    Headphones,
    UserCog,
    LineChart,
    Globe
} from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

const features = [
    {
        icon: ShoppingCart,
        title: 'نظام نقاط البيع POS',
        description: 'واجهة سريعة وسهلة لإتمام المبيعات، تدعم الباركود والطباعة الحرارية بكفاءة.'
    },
    {
        icon: Layers,
        title: 'إدارة المخزون',
        description: 'تتبع كمياتك، تنبيهات النواقص، وإدارة الموردين وعمليات الجرد في مكان واحد.'
    },
    {
        icon: BarChart3,
        title: 'التقارير المتقدمة',
        description: 'تحليلات عميقة لمبيعاتك وأرباحك مع رسوم بيانية تفاعلية تدعم اتخاذ القرار.'
    },
    {
        icon: Users,
        title: 'إدارة العملاء CRM',
        description: 'بناء قاعدة بيانات شاملة لعملائك وتتبع سجل مشترياتهم وتفضيلاتهم بدقة.'
    },
    {
        icon: Globe,
        title: 'المتجر الإلكتروني',
        description: 'حول نشاطك إلى منصة أونلاين متكاملة واستقبل الطلبات من عملائك في كل مكان.'
    },
    {
        icon: Heart,
        title: 'نظام الولاء',
        description: 'كافئ عملائك الدائمين بنقاط وخصومات مخصصة تزيد من مبيعاتك وارتباطهم بك.'
    },
    {
        icon: FileText,
        title: 'الفوترة الإلكترونية',
        description: 'إصدار فواتير ضريبية متوافقة بالكامل مع المتطلبات القانونية ورمز الاستجابة QR.'
    },
    {
        icon: UserCog,
        title: 'إدارة الموظفين',
        description: 'صلاحيات مخصصة لكل موظف، تتبع الأداء، وتنظيم ورديات العمل بكل سهولة.'
    },
    {
        icon: Truck,
        title: 'تطبيقات التوصيل',
        description: 'ربط مباشر مع شركات الشحن والتوصيل لضمان وصول طلباتك لعملائك بسرعة.'
    },
    {
        icon: CreditCard,
        title: 'بوابات الدفع',
        description: 'استقبال المدفوعات عبر البطاقات الائتمانية، مدى، وآبل باي بكل أمان.'
    },
    {
        icon: Smartphone,
        title: 'تطبيق الإدارة',
        description: 'تابع أداء عملك من أي مكان عبر تطبيق خاص للملاك والمشرفين على الجوال.'
    },
    {
        icon: Headphones,
        title: 'الدعم والتحديثات',
        description: 'دعم فني متواصل وتحديثات دورية مجانية تضمن بقاء نظامك في القمة دائماً.'
    }
];

export default function Features() {
    const { settings } = useSettings();

    const displayFeatures = settings.landing_features
        ? JSON.parse(settings.landing_features as string)
        : features;

    return (
        <section id="features" className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header - Perfectly Centered */}
                <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32">
                    <span
                        className="inline-flex items-center px-6 py-2 rounded-2xl font-black text-sm tracking-widest uppercase mb-8 border shadow-lg"
                        style={{
                            backgroundColor: settings.accentColor2 ? `${settings.accentColor2}15` : undefined,
                            color: settings.accentColor2,
                            borderColor: settings.accentColor2 ? `${settings.accentColor2}30` : undefined,
                            boxShadow: settings.accentColor2 ? `0 0 20px ${settings.accentColor2}20` : undefined
                        }}
                    >
                        مميزات مبتكرة
                    </span>
                    <h2 className="text-5xl lg:text-[72px] font-black text-gray-900 dark:text-white mb-8 leading-[1.05] tracking-tight">
                        استكشف جميع الأدوات والميزات التي نقدمها
                    </h2>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                    {displayFeatures.map((feature: any, index: number) => (
                        <div
                            key={index}
                            className="bg-white/50 dark:bg-[#1a1c1e] p-10 lg:p-12 rounded-[var(--radius-card)] border border-gray-200 dark:border-white/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group text-center flex flex-col items-center"
                        >
                            <div
                                className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[var(--radius-inner)] flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner border border-gray-100 dark:border-white/10 group-hover:scale-110 group-hover:rotate-6"
                                style={{ color: settings.accentColor1 }}
                            >
                                {feature.icon ? <feature.icon className="w-10 h-10" /> : <Zap className="w-10 h-10" />}
                            </div>

                            <h3 className="text-2xl font-black text-gray-950 dark:text-white mb-6 group-hover:text-primary transition-colors duration-300">
                                {feature.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-bold text-lg">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
