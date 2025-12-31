import React from 'react';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useNavigate } from 'react-router-dom';

export default function TrialBanner() {
    const navigate = useNavigate();
    const { data: currentSubData } = useQuery({
        queryKey: ['current-subscription'],
        queryFn: () => api.get('/app/subscription/current'),
        retry: false
    });

    const tenant = (currentSubData as any)?.tenant;
    const subscription = (currentSubData as any)?.subscription;

    // Logic: If user is on trial, show how many days left.
    // If user has no subscription or subscription is trial/expired.

    const isTrial = !subscription || subscription.status === 'trial';
    const isExpired = subscription?.status === 'expired' || subscription?.status === 'restricted';

    if (!isTrial && !isExpired) return null;

    // Calculate days left
    const expiryDate = isTrial
        ? new Date(subscription?.trial_ends_at || tenant?.trial_expires_at)
        : new Date(subscription?.ends_at);

    const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

    return (
        <div className={`w-full ${isExpired ? 'bg-red-500' : 'bg-primary'} text-white py-3 px-6 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500`}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    {isExpired ? <AlertCircle className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-right">
                    <p className="text-sm font-black leading-tight">
                        {isExpired
                            ? 'انتهت فترة التجربة المجانية الخاصة بك!'
                            : `أنت الآن في الفترة التجريبية (${daysLeft} أيام). قم بإكمال بيانات حسابك واحصل على 7 أيام أخرى إضافية، أو اختر الباقة المناسبة لك.`}
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate('/app/plans')}
                className="shrink-0 px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-black shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
                <span>الاشتراك الآن</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
