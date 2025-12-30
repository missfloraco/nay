import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

const testimonials = [
    {
        name: 'أحمد صالح',
        role: 'صاحب محل سوبر ماركت',
        image: 'https://i.pravatar.cc/150?u=user1',
        content: 'نظام {appName} غير طريقة عملي تماماً. كنت أعاني من جرد المخزون، والآن كل شيء يتم بضغطة زر واحدة.'
    },
    {
        name: 'سارة التميمي',
        role: 'مديرة مبيعات',
        image: 'https://i.pravatar.cc/150?u=user2',
        content: 'أكثر ما أعجبني هو سهولة الواجهة والتقارير المالية الدقيقة. أستطيع متابعة أداء محلي من أي مكان.'
    },
    {
        name: 'محمد العتيبي',
        role: 'رائد أعمال',
        image: 'https://i.pravatar.cc/150?u=user3',
        content: 'خدمة الدعم الفني سريعة جداً، والمنصة تتطور باستمرار. أنصح كل تاجر بالاشتراك فوراً.'
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
    }
];

export default function Testimonials() {
    const { settings } = useSettings();
    const appName = settings.appName || 'SaaS Platform';
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Create infinite loop by tripling the testimonials
    const infiniteTestimonials = [...testimonials, ...testimonials, ...testimonials];

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current || isScrolling) return;

        setIsScrolling(true);
        const container = scrollContainerRef.current;
        const cardWidth = 384 + 32; // w-96 (384px) + gap (32px)
        const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;

        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });

        setTimeout(() => {
            checkAndResetScroll();
            setIsScrolling(false);
        }, 500);
    };

    const checkAndResetScroll = () => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        // If we're at the end, jump to the beginning (seamless loop)
        if (currentScroll >= maxScroll - 10) {
            container.scrollLeft = container.scrollWidth / 3;
        }
        // If we're at the beginning, jump to the middle
        else if (currentScroll <= 10) {
            container.scrollLeft = (container.scrollWidth / 3) * 2;
        }
    };

    // Initialize scroll position to middle section for seamless looping
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth / 3;
        }
    }, []);

    return (
        <section className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
            {/* Soft decorative background dots */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10">
                {/* Header - Perfectly Centered */}
                <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32 px-4 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center px-6 py-2 rounded-xl bg-primary/10 text-primary font-black text-sm tracking-widest uppercase mb-8 border border-primary/20">
                        ماذا يقولون عنا؟
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-[1.05] tracking-tight">
                        ثقة آلاف <span className="text-primary italic">التجار</span> في {appName}
                    </h2>
                    <p className="text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-bold max-w-3xl mx-auto">
                        انضم إلى مجتمع المشاريع الناجحة التي حققت قفزات نوعية باستخدام أدواتنا الذكية.
                    </p>
                </div>

                {/* Testimonials Carousel with Navigation */}
                <div className="relative group">
                    {/* Modern Navigation Arrows - Always visible on desktop, hidden on mobile */}
                    <button
                        onClick={() => scroll('right')}
                        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white dark:bg-gray-800 backdrop-blur-xl rounded-full shadow-2xl items-center justify-center text-gray-900 dark:text-white hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 border-2 border-gray-200 dark:border-white/10 hover:border-primary"
                        disabled={isScrolling}
                        aria-label="Next testimonial"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>

                    <button
                        onClick={() => scroll('left')}
                        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white dark:bg-gray-800 backdrop-blur-xl rounded-full shadow-2xl items-center justify-center text-gray-900 dark:text-white hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 border-2 border-gray-200 dark:border-white/10 hover:border-primary"
                        disabled={isScrolling}
                        aria-label="Previous testimonial"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto lg:overflow-x-hidden scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8">
                            {infiniteTestimonials.map((testi, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50/50 dark:bg-[#111111] p-8 lg:p-10 rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3 transition-all duration-700 group/card text-center flex flex-col items-center w-80 lg:w-96 flex-shrink-0"
                                >
                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1 mb-8">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold text-base lg:text-lg mb-10 flex-1">
                                        "{testi.content.replace(/{appName}/g, appName)}"
                                    </p>

                                    {/* User Info */}
                                    <div className="flex flex-col items-center gap-4 mt-auto">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-xl transition-transform duration-500 group-hover/card:scale-110">
                                            <img src={testi.image} alt={testi.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-gray-950 dark:text-white group-hover/card:text-primary transition-colors">{testi.name}</h4>
                                            <p className="text-sm font-black text-primary/80 uppercase tracking-wide">{testi.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Hint - Desktop only */}
                    <div className="hidden lg:flex items-center justify-center gap-3 mt-10 text-gray-400 dark:text-gray-600 text-sm font-bold">
                        <ChevronRight className="w-4 h-4" />
                        <span>استخدم الأسهم للتنقل بين الآراء</span>
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <style>{`
                .overflow-x-auto::-webkit-scrollbar,
                .overflow-x-hidden::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
