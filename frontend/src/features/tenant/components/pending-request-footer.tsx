import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { Clock, MessageSquare, Sparkles } from 'lucide-react';
import Button from '@/shared/ui/buttons/btn-base';
import api from '@/shared/services/api';

export const PendingRequestFooter: React.FC = () => {
    const { tenant } = useTenantAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    // Query to check if there are pending subscription requests
    const { data: requestsData } = useQuery({
        queryKey: ['subscription-requests'],
        queryFn: () => api.get('/app/subscription/requests'),
        enabled: !!tenant,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const hasPendingRequest = (requestsData as any)?.requests?.some(
        (req: any) => req.status === 'pending'
    );

    // Show only when there's an actual pending request
    if (!tenant || !hasPendingRequest) {
        return null;
    }

    return (
        <div
            className="w-[calc(100%+3rem)] lg:w-[calc(100%+6rem)] -mx-6 lg:-mx-12 h-full flex flex-row items-center justify-between ps-6 lg:ps-12 pe-6 lg:pe-12 py-0 gap-3 lg:gap-4 overflow-hidden relative group"
            style={{
                background: `linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)`
            }}
        >
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2500ms] ease-in-out" />

            {/* Pulsing Background Circles */}
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse delay-500" />

            <div className="flex flex-col items-start flex-1 min-w-0 relative z-10 py-1">
                <div className="min-w-0 text-right">
                    <h4 className="text-[10px] sm:text-base font-black text-white truncate drop-shadow-sm leading-tight flex items-center gap-2">
                        <Sparkles className="w-3 h-3 sm:w-5 sm:h-5 text-white animate-pulse" />
                        طلبك قيد المراجعة
                    </h4>
                    <p className="text-[8px] sm:text-xs font-bold truncate text-white/90 drop-shadow-sm leading-tight mt-0.5">
                        نقوم حالياً بمراجعة طلب اشتراكك. سنقوم بإشعارك فور الموافقة عليه.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end shrink-0 relative z-10 gap-2">
                <Button
                    variant="secondary"
                    onClick={() => navigate('/app/support/messages')}
                    className="bg-white/10 !text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg transform hover:translate-y-[-2px] transition-all w-auto h-8 lg:h-10 px-3 sm:px-6 justify-center font-black text-[10px] sm:text-sm"
                >
                    <span className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline !text-white">تواصل معنا</span>
                        <span className="sm:hidden !text-white">دعم</span>
                    </span>
                </Button>
            </div>
        </div>
    );
};
