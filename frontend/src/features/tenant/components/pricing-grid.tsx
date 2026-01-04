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
                    <div key={i} className="h-[600px] bg-gray-50 dark:bg-white/5 animate-pulse rounded-[var(--radius-card)]" />
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
                    const isPendingApproval = pendingRequest?.plan_id === plan.id;
                    const price = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;

                    return (
                        <div key={plan.id} className={`group relative bg-white dark:bg-dark-900 p-10 rounded-[var(--radius-card)] border-2 transition-all duration-700 hover:scale-[1.03] flex flex-col min-h-[720px] ${isCurrent || isPendingApproval ? 'border-primary shadow-2xl shadow-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent' : 'border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl'}`}>

                            {isCurrent && !isTrial && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-bounce-subtle z-20">
                                    خطتك الحالية
                                </div>
                            )}

                            {isPendingApproval && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-pulse z-20 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    قيد المراجعة الفنية
                                </div>
                            )}

                            <div className="flex flex-col flex-grow h-full">
                                <div className="text-center space-y-8 mb-8">
                                    <div className={`w-20 h-20 mx-auto ${isCurrent || isPendingApproval ? 'bg-primary' : 'bg-primary/10'} rounded-[var(--radius-inner)] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                                        <Icon className={`w-10 h-10 ${isCurrent || isPendingApproval ? 'text-white' : 'text-primary'}`} />
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h3>

                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 mb-6 font-black text-[10px] uppercase tracking-wider">
                                            <Check className="w-3 h-3" />
                                            وصول كامل لكافة المميزات
                                        </div>
                                        <div className="flex items-center justify-center gap-2 min-h-[80px]">
                                            {plan.billing_type === 'lifetime' ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">دفع لمرة واحدة مدى الحياة</span>
                                                    {plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end) && plan.offer_lifetime_price ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xl font-bold text-gray-400 line-through opacity-50">${Math.round(plan.lifetime_price)}</span>
                                                            <span className="text-5xl font-black text-primary animate-pulse-subtle">${Math.round(plan.offer_lifetime_price)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-5xl font-black text-gray-900 dark:text-white">${Math.round(plan.lifetime_price)}</span>
                                                    )}
                                                </div>
                                            ) : plan.billing_type === 'fixed_term' ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">دفع لمرة واحدة ({plan.fixed_term_duration} {plan.fixed_term_unit === 'years' ? 'سنة' : 'شهر'})</span>
                                                    {plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end) && plan.offer_fixed_term_price ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xl font-bold text-gray-400 line-through opacity-50">${Math.round(plan.fixed_term_price)}</span>
                                                            <span className="text-5xl font-black text-primary animate-pulse-subtle">${Math.round(plan.offer_fixed_term_price)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-5xl font-black text-gray-900 dark:text-white">${Math.round(plan.fixed_term_price)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end) ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xl font-bold text-gray-400 line-through opacity-50">${Math.round(billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price)}</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-5xl font-black text-primary animate-pulse-subtle">${Math.round(billingCycle === 'monthly' ? plan.offer_monthly_price : plan.offer_yearly_price)}</span>
                                                                <span className="text-xs text-gray-400 font-black uppercase tracking-widest">/{billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-5xl font-black text-gray-900 dark:text-white">${Math.round(price)}</span>
                                                            <span className="text-xs text-gray-400 font-black uppercase tracking-widest">/{billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end) && (
                                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20 font-black text-[11px] animate-bounce-subtle mx-auto">
                                                <Sparkles className="w-3 h-3" />
                                                عرض خاص لفترة محدودة!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative flex-grow group/features overflow-hidden">
                                    {/* Top scroll indicator fade */}
                                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white dark:from-dark-900 to-transparent z-10 pointer-events-none opacity-0 group-hover/features:opacity-100 transition-opacity duration-500" />

                                    <div className="space-y-5 text-right w-full pt-8 pb-12 border-t border-gray-50 dark:border-white/5 h-full overflow-y-auto custom-scrollbar pr-2 max-h-[220px]">
                                        {plan.features?.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-4">
                                                <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                </div>
                                                <span className="text-base text-gray-600 dark:text-gray-400 font-bold leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom scroll indicator fade */}
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-dark-900 to-transparent z-10 pointer-events-none opacity-60 group-hover/features:opacity-100 transition-opacity duration-500" />
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
                                    <Button
                                        onClick={() => {
                                            let selectedPrice = price;
                                            let selectedCycle = billingCycle;

                                            if (plan.billing_type === 'lifetime') {
                                                const hasOffer = plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end);
                                                selectedPrice = hasOffer && plan.offer_lifetime_price ? plan.offer_lifetime_price : plan.lifetime_price;
                                                selectedCycle = 'lifetime';
                                            } else if (plan.billing_type === 'fixed_term') {
                                                const hasOffer = plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end);
                                                selectedPrice = hasOffer && plan.offer_fixed_term_price ? plan.offer_fixed_term_price : plan.fixed_term_price;
                                                selectedCycle = 'fixed_term';
                                            } else {
                                                const hasOffer = plan.offer_start && plan.offer_end && new Date() >= new Date(plan.offer_start) && new Date() <= new Date(plan.offer_end);
                                                if (hasOffer) {
                                                    selectedPrice = billingCycle === 'monthly' ? plan.offer_monthly_price : plan.offer_yearly_price;
                                                }
                                            }

                                            onSelectPlan?.({ ...plan, billing_cycle: selectedCycle, price: Math.round(selectedPrice) });
                                        }}
                                        disabled={(!isPublic && (isCurrent && !isTrial)) || !!pendingRequest}
                                        variant={isPendingApproval ? 'secondary' : (isCurrent ? (isTrial ? 'secondary' : 'success') : 'primary')}
                                        size="md"
                                        className={`w-full h-14 !text-lg !font-black ${isTrial || isPendingApproval ? 'text-blue-600 border border-blue-200' : ''}`}
                                    >
                                        {isPendingApproval ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                                                طلبك قيد المراجعة
                                            </span>
                                        ) : (
                                            isCurrent && !isTrial ? 'مفعل بالكامل' : (isPublic ? 'ابدأ تجربتك المجانية' : (isTrial ? 'ترقية إلى هذه الخطة' : 'اختيار هذه الخطة'))
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
