import { Quote } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

const testimonials = [
    {
        name: 'أحمد صالح',
        role: 'صاحب محل سوبر ماركت',
        image: 'https://i.pravatar.cc/150?u=user1',
        content: 'نظام {appName} غير طريقة عملي تماماً. كنت أعاني من جرد المخزون، والآن كل شيء يتم بضغطة زر واحدة. فعلاً منصة استثنائية.'
    },
    {
        name: 'سارة التميمي',
        role: 'مديرة مبيعات',
        image: 'https://i.pravatar.cc/150?u=user2',
        content: 'أكثر ما أعجبني هو سهولة الواجهة والتقارير المالية الدقيقة. أستطيع متابعة أداء محلي من أي مكان وفي أي وقت.'
    },
    {
        name: 'محمد العتيبي',
        role: 'رائد أعمال',
        image: 'https://i.pravatar.cc/150?u=user3',
        content: 'خدمة الدعم الفني سريعة جداً، والمنصة تتطور باستمرار. أنصح كل تاجر يريد تنظيم مبيعاته بالاشتراك فوراً.'
    },
    {
        name: 'خالد العمري',
        role: 'صاحب مطعم',
        image: 'https://i.pravatar.cc/150?u=user4',
        content: 'استخدام الـ POS مريح جداً وسريع، وربط الطابعة والباركود تم بكل سلاسة. وفر علي الكثير من الوقت.'
    },
    {
        name: 'نورة الدوسري',
        role: 'تاجرة عبر الإنترنت',
        image: 'https://i.pravatar.cc/150?u=user5',
        content: 'كنت أستخدم 3 تطبيقات مختلفة لإدارة عملي، الآن {appName} وفّر علي كل ذلك باشتراك واحد بسيط.'
    },
    {
        name: 'عبدالله الحربي',
        role: 'مدير مخازن',
        image: 'https://i.pravatar.cc/150?u=user6',
        content: 'نظام التنبيهات عند نقص المخزون أنقذني من توقف المبيعات أكثر من مرة. دقة عالية جداً في الأداء.'
    }
];

export default function Testimonials() {
    const { settings } = useSettings();
    const appName = settings.appName || 'SaaS Platform';

    return (
        <section className="py-24 lg:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase mb-6">
                        ماذا يقولون عنا؟
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        ثقة آلاف <span className="text-primary italic">التجار</span> في {appName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl font-medium">
                        انضم إلى مجتمع التجار الناجحين الذين طوروا أعمالهم باستخدام أدواتنا الذكية.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((testi, index) => (
                        <div
                            key={index}
                            className="bg-gray-50/50 dark:bg-white/5 p-8 lg:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 group text-right"
                        >
                            <div className="flex items-start justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
                                        <img src={testi.image} alt={testi.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{testi.name}</h4>
                                        <p className="text-sm font-medium text-primary italic uppercase">{testi.role}</p>
                                    </div>
                                </div>
                                <div className="opacity-10 dark:opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Quote className="w-10 h-10 text-primary rotate-180" />
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal text-lg lg:text-xl">
                                "{testi.content.replace(/{appName}/g, appName)}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
