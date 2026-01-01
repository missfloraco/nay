import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import Button from '@/shared/ui/buttons/btn-base';

export default function Hero() {
    const { settings } = useSettings();
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopIndex, setLoopIndex] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const phrases = [
        'كل ما تحتاجه لـ زيادة مبيعاتك',
        'الحل الأمثل لإدارة تجارتك بذكاء',
        'منصة واحدة.. إمكانيات لا محدودة',
        'مستقبلك التجاري يبدأ من هنا'
    ];

    useEffect(() => {
        const handleTyping = () => {
            const currentIdx = loopIndex % phrases.length;
            const fullText = phrases[currentIdx];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 50 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopIndex(loopIndex + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopIndex, phrases, typingSpeed]);
    return (
        <section className="relative min-h-[90vh] pb-20 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500 flex items-center">
            {/* Grid Background Pattern - Dynamic Opacity */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none text-gray-900 dark:text-white"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-[#0a0a0a] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center text-right">

                    {/* Right Side: Content (Order 1 in RTL = Right) */}
                    <div className="order-1 space-y-10">
                        <div className="space-y-8">
                            <h1 className="text-5xl lg:text-[76px] font-black text-gray-900 dark:text-white tracking-tight leading-[1.05]">
                                {settings.landing_hero_title ? (
                                    <>
                                        {settings.landing_hero_title.split('{{platform}}').map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                {part}
                                                {i < arr.length - 1 && <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-500">{settings.appName}</span>}
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <>منصة <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-500">{settings.appName}</span></>
                                )}
                            </h1>

                            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                {settings.landing_hero_subtitle || 'منصتك الشاملة التي توفر لك جميع الأدوات اللازمة لإدارة وتطوير مشروعك بسهولة. الحل الأمثل للتجار، وأصحاب المحلات والمطاعم، ورواد الأعمال.'}
                            </p>

                            <div className="pt-2">
                                <p
                                    className="text-xl lg:text-2xl font-black flex items-center min-h-[40px] leading-tight"
                                    style={{ color: settings.accentColor2 || 'var(--color-primary)' }}
                                >
                                    <span>{text}</span>
                                    <span className="w-1 h-8 mr-3 animate-pulse" style={{ backgroundColor: settings.accentColor2 || 'var(--color-primary)' }} />
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-start gap-8">
                            <Button
                                to="/register"
                                variant="primary"
                                size="md"
                                className="px-12 shadow-xl shadow-primary/30 w-full lg:w-auto min-w-[260px]"
                            >
                                {settings.landing_hero_cta || 'ابدأ الآن'}
                            </Button>

                            {/* Social Proof - Positioned under button */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center -space-x-3 rtl:space-x-reverse">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg">
                                            <img src={`https://i.pravatar.cc/150?u=saas_user${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                    انضم إلى أكثر من <span className="text-gray-900 dark:text-white font-black">63 شخصاً</span> قاموا بالتسجيل بالفعل!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Left Side: Person Image (Order 2 in RTL = Left) */}
                    <div className="order-2 relative h-full flex items-center justify-center lg:justify-start">
                        <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/5] lg:aspect-auto lg:h-[750px]">
                            <img
                                src="/landing_hero_dashboard.png"
                                alt="Modern Dashboard System"
                                className="w-full h-auto object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_50px_rgba(59,130,246,0.2)] rounded-3xl lg:rotate-[-1deg] scale-95 lg:scale-110 transition-all duration-700 hover:scale-100 lg:hover:scale-115 hover:rotate-0"
                            />
                            {/* Decorative glow behind image - Theme Aware */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/10 dark:bg-blue-600/5 rounded-full blur-[120px] -z-10" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
