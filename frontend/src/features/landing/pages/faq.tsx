import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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

    const displayFAQs = settings.landing_faq
        ? JSON.parse(settings.landing_faq as string)
        : faqs;

    return (
        <section id="faq" className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header - Right Aligned like Hero */}
                <div className="text-right max-w-4xl mb-20 lg:mb-32">
                    <span className="inline-flex items-center px-6 py-2 rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 font-black text-sm tracking-widest uppercase mb-8 border border-blue-500/20">
                        الأسئلة الشائعة
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
                        هنا تجد إجابات للأسئلة التي قد تراودك
                    </h2>
                </div>

                {/* FAQ List - Simple Accordion */}
                <div className="space-y-4">
                    {displayFAQs.map((faq: any, index: number) => (
                        <div
                            key={index}
                            className="bg-gray-50/50 dark:bg-[#1a1c1e] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary/20 dark:hover:border-primary/20"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-8 lg:px-10 py-6 lg:py-7 flex items-center justify-between gap-8 text-right transition-all outline-none group"
                            >
                                <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white text-right flex-1">
                                    {faq.question}
                                </span>
                                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-400 dark:text-white/50 group-hover:text-primary transition-colors">
                                    <Plus className={`w-6 h-6 transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`} />
                                </div>
                            </button>

                            <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${openIndex === index ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-8 lg:px-10 pb-6 lg:pb-7 text-gray-600 dark:text-gray-400 leading-relaxed font-normal text-base lg:text-lg text-right border-t border-gray-200 dark:border-white/5 pt-6">
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
