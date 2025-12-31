import React from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import { PricingGrid } from '@/features/tenant/components/pricing-grid';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const { settings } = useSettings();
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-24 lg:py-40 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
                {/* Header - Centered */}
                <div className="text-center max-w-4xl mx-auto mb-10">
                    <span
                        className="inline-flex items-center px-6 py-2 rounded-xl font-black text-sm tracking-widest uppercase mb-8 border"
                        style={{
                            backgroundColor: settings.accentColor2 ? `${settings.accentColor2}15` : undefined,
                            color: settings.accentColor2,
                            borderColor: settings.accentColor2 ? `${settings.accentColor2}30` : undefined,
                        }}
                    >
                        الأسعار
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                        اختر الباقة <span className="text-primary">المناسبة</span> لك
                    </h2>
                    <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 font-bold">
                        باقات مرنة تناسب جميع احتياجاتك مع إمكانية الترقية في أي وقت
                    </p>
                </div>

                <PricingGrid
                    isPublic={true}
                    onSelectPlan={() => navigate('/register')}
                />

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
