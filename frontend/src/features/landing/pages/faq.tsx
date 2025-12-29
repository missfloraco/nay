import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

const faqs = [
    {
        question: 'هل النظام يدعم ضريبة القيمة المضافة؟',
        answer: 'نعم، النظام يدعم ضريبة القيمة المضافة بشكل كامل، ويمكنك إصدار فواتير ضريبية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك مع رمز QR.'
    },
    {
        question: 'هل يمكنني استخدامه على أكثر من جهاز؟',
        answer: 'نعم، المنصة هي نظام سحابي يعمل عبر المتصفح، لذا يمكنك تسجيل الدخول والعمل من أي جهاز (كمبيوتر، تابلت، جوال) وفي أي وقت.'
    },
    {
        question: 'ماذا يحدث في حال انقطاع الإنترنت؟',
        answer: 'واجهة POS تدعم العمل المحدود في حال انقطاع الإنترنت، وبمجرد عودة الاتصال يتم مزامنة جميع العمليات والمبيعات تلقائياً مع الخادم.'
    },
    {
        question: 'هل بياناتي آمنة ومحفوظة؟',
        answer: 'بكل تأكيد، نستخدم أفضل معايير التشفير والخدمات السحابية العالمية، ونقوم بعمل نسخ احتياطي تلقائي لبياناتك يومياً لضمان عدم ضياعها.'
    },
    {
        question: 'هل يوجد دعم فني في حال واجهت مشكلة؟',
        answer: 'نعم، فريق الدعم الفني متواجد لمساعدتك عبر الدردشة المباشرة أو البريد الإلكتروني في أي وقت خلال ساعات العمل.'
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { settings } = useSettings();

    return (
        <section id="faq" className="py-24 lg:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-20">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase mb-6">
                        الأسئلة الأكثر شيوعاً
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
                        الإجابات التي تبحث عنها
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl font-medium max-w-2xl mx-auto">
                        كل ما تحتاج معرفته عن نظام {settings.appName || 'SaaS Platform'} وكيف يمكنه مساعدتك في تطوير تجارتك باحترافية.
                    </p>
                </div>

                <div className="space-y-4 lg:space-y-6">
                    {(settings.landing_faq ? JSON.parse(settings.landing_faq as string) : faqs).map((faq: any, index: number) => (
                        <div
                            key={index}
                            className={`rounded-[1.5rem] lg:rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${openIndex === index
                                ? 'bg-primary/5 dark:bg-white/5 border-primary/20 shadow-2xl shadow-primary/5'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-white/10'
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 lg:px-10 py-6 lg:py-8 flex items-center justify-between gap-6 text-right transition-all"
                            >
                                <span className={`text-lg lg:text-xl font-bold transition-colors ${openIndex === index ? 'text-primary' : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {faq.question}
                                </span>
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 ${openIndex === index
                                    ? 'bg-primary text-white rotate-180 shadow-lg shadow-primary/30'
                                    : 'bg-white dark:bg-white/10 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/10'
                                    }`}>
                                    <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                            </button>

                            <div className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="px-6 lg:px-10 pb-8 lg:pb-10 text-gray-600 dark:text-gray-400 leading-relaxed font-normal text-lg lg:text-xl border-t border-gray-200/50 dark:border-white/10 pt-6 lg:pt-8 bg-white/50 dark:bg-transparent">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
