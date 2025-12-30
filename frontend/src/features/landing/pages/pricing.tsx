import React from 'react';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/shared/contexts/app-context';

const plans = [
    {
        name: 'الباقة الأساسية',
        price: '99',
        period: 'شهرياً',
        description: 'مثالية للمشاريع الصغيرة والمتوسطة',
        features: [
            'نقاط بيع غير محدودة',
            'إدارة المخزون الأساسية',
            'تقارير مالية شهرية',
            'دعم فني عبر البريد',
            '5 مستخدمين كحد أقصى',
            'نسخ احتياطي أسبوعي'
        ],
        popular: false,
        stars: 4
    },
    {
        name: 'الباقة الاحترافية',
        price: '199',
        period: 'شهرياً',
        description: 'الأنسب للشركات المتنامية',
        features: [
            'كل مميزات الباقة الأساسية',
            'إدارة فروع متعددة',
            'تقارير تحليلية متقدمة',
            'دعم فني على مدار الساعة',
            'مستخدمين غير محدودين',
            'نسخ احتياطي يومي',
            'تكامل مع الأنظمة الخارجية',
            'تطبيق الجوال'
        ],
        popular: true,
        stars: 5
    },
    {
        name: 'الباقة المتقدمة',
        price: '399',
        period: 'شهرياً',
        description: 'للمؤسسات الكبيرة والمتطلبات الخاصة',
        features: [
            'كل مميزات الباقة الاحترافية',
            'خوادم مخصصة',
            'تخصيص كامل للنظام',
            'مدير حساب مخصص',
            'تدريب متقدم للفريق',
            'SLA مضمون 99.9%',
            'أولوية في الدعم الفني',
            'تطوير مميزات حسب الطلب'
        ],
        popular: false,
        stars: 5
    }
];

export default function Pricing() {
    const { settings } = useSettings();

    return (
        <section id="pricing" className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header - Centered */}
                <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32">
                    <span className="inline-flex items-center px-6 py-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 font-black text-sm tracking-widest uppercase mb-8 border border-blue-500/20">
                        الأسعار
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                        اختر الباقة <span className="text-primary">المناسبة</span> لك
                    </h2>
                    <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 font-bold">
                        باقات مرنة تناسب جميع احتياجاتك مع إمكانية الترقية في أي وقت
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white dark:bg-[#1a1c1e] rounded-2xl p-10 border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${plan.popular
                                ? 'border-primary shadow-2xl shadow-primary/10 dark:shadow-primary/20'
                                : 'border-gray-200 dark:border-white/5 hover:border-primary/30'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-white text-sm font-black rounded-full shadow-lg">
                                    الأكثر شعبية
                                </div>
                            )}

                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < plan.stars
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Plan Name */}
                            <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white text-center mb-4">
                                {plan.name}
                            </h3>

                            {/* Description */}
                            <p className="text-center text-gray-600 dark:text-gray-400 font-bold mb-8">
                                {plan.description}
                            </p>

                            {/* Price */}
                            <div className="text-center mb-10">
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl lg:text-6xl font-black text-primary">{plan.price}</span>
                                    <span className="text-xl font-bold text-gray-600 dark:text-gray-400">ر.س</span>
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 font-bold mt-2">{plan.period}</div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-right">
                                        <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-bold">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <Link
                                to="/register"
                                className={`block w-full py-4 text-center font-black text-lg rounded-2xl transition-all hover:scale-105 ${plan.popular
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-primary hover:text-white'
                                    }`}
                            >
                                ابدأ الآن
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Bottom Note */}
                <div className="text-center mt-16 lg:mt-20">
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-bold">
                        جميع الباقات تشمل تجربة مجانية لمدة 7 أيام • إلغاء في أي وقت • بدون رسوم خفية
                    </p>
                </div>
            </div>
        </section>
    );
}
