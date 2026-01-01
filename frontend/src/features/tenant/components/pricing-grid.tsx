import React, { useState } from 'react';
import { Check, Star, Crown, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import Button from '@/shared/ui/buttons/btn-base';

const PLAN_ICONS = {
    'الباقة الأساسية': Shield,
    'الباقة الاحترافية': Star,
    'الباقة المتقدمة': Crown,
    'Default': Star
};

interface PricingGridProps {
    onSelectPlan?: (plan: any) => void;
    currentSub?: any;
    pendingRequest?: any;
    isPublic?: boolean;
}

export const PricingGrid: React.FC<PricingGridProps> = ({
    onSelectPlan,
    currentSub,
    pendingRequest,
    isPublic = false
}) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const { data: plansData, isLoading } = useQuery({
        queryKey: ['public-plans'],
        queryFn: () => api.get(isPublic ? '/public/plans' : '/app/subscription/plans')
    });

    const plans = (plansData as any)?.plans || [];

    // Calculate max discount for the toggle badge
    const maxDiscount = plans.length > 0 ? Math.max(...plans.map((p: any) => {
        const monthlyTotal = p.monthly_price * 12;
        return monthlyTotal > 0 ? Math.round((1 - (p.yearly_price / monthlyTotal)) * 100) : 0;
    })) : 0;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[600px] bg-gray-50 dark:bg-white/5 animate-pulse rounded-[4rem]" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center">
                <div className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center gap-1 border border-gray-200 dark:border-white/10 shadow-inner">
                    <Button
                        onClick={() => setBillingCycle('monthly')}
                        variant={billingCycle === 'monthly' ? 'secondary' : 'ghost'}
                        size="md"
                        className={`px-8 py-3 h-auto shadow-none ${billingCycle === 'monthly' ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 hover:bg-transparent'}`}
                    >
                        اشتراك شهري
                    </Button>
                    <Button
                        onClick={() => setBillingCycle('yearly')}
                        variant={billingCycle === 'yearly' ? 'primary' : 'ghost'}
                        size="md"
                        className={`px-8 py-3 h-auto shadow-none ${billingCycle === 'yearly' ? 'shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-transparent'}`}
                    >
                        <span>اشتراك سنوي</span>
                        {maxDiscount > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-black rounded-lg mr-2">وفر {maxDiscount}%</span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {plans.map((plan: any) => {
                    const Icon = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || PLAN_ICONS.Default;
                    const isCurrent = currentSub?.plan_id === plan.id;
                    const isTrial = isCurrent && currentSub?.status === 'trial';
                    const price = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;

                    return (
                        <div key={plan.id} className={`group relative bg-white dark:bg-dark-900 p-10 rounded-[4rem] border-2 transition-all duration-700 hover:scale-[1.03] ${isCurrent ? 'border-primary shadow-2xl shadow-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent' : 'border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl'}`}>

                            {isCurrent && !isTrial && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-bounce-subtle">
                                    خطتك الحالية
                                </div>
                            )}

                            <div className="text-center space-y-8">
                                <div className={`w-20 h-20 mx-auto ${isCurrent ? 'bg-primary' : 'bg-primary/10'} rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                                    <Icon className={`w-10 h-10 ${isCurrent ? 'text-white' : 'text-primary'}`} />
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Reduced font size for price as requested */}
                                        <span className="text-5xl font-black text-gray-900 dark:text-white">${Math.round(price)}</span>
                                        <span className="text-xs text-gray-400 font-black uppercase tracking-widest">/{billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                                    </div>
                                </div>

                                <div className="space-y-5 text-right w-full pt-8 border-t border-gray-50 dark:border-white/5">
                                    {plan.features?.map((feature: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                            <span className="text-base text-gray-600 dark:text-gray-400 font-bold leading-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => onSelectPlan?.({ ...plan, billing_cycle: billingCycle, price: Math.round(price) })}
                                    disabled={(!isPublic && (isCurrent && !isTrial)) || !!pendingRequest}
                                    variant={isCurrent ? (isTrial ? 'secondary' : 'success') : 'primary'}
                                    size="md"
                                    className={`w-full ${isTrial ? 'text-amber-600 border border-amber-200' : ''}`}
                                >
                                    {isCurrent && !isTrial ? 'مفعل بالكامل' : (isPublic ? 'ابدأ تجربتك المجانية' : (isTrial ? 'ترقية إلى هذه الخطة' : 'اختيار هذه الخطة'))}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
