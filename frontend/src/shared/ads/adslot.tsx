import { useEffect, useRef } from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import { API_ROOT_URL } from '@/core/config';
import { logger } from '@/shared/services/logger';

interface AdSlotProps {
    placement: string;
    className?: string;
    showPlaceholder?: boolean;
    placeholderLabel?: string;
}

export default function AdSlot({
    placement,
    className = '',
    showPlaceholder = false,
    placeholderLabel = 'Leaderboard Ad Area (728 × 90)'
}: AdSlotProps) {
    const { settings } = useSettings();
    const adContent = settings[placement];
    const adRef = useRef<HTMLDivElement>(null);
    const isAdminPath = window.location.pathname.startsWith('/admin');

    useEffect(() => {
        if (isAdminPath) return; // Never render ads in admin
        if (adRef.current) {
            adRef.current.innerHTML = '';
            if (adContent && typeof adContent === 'string') {
                try {
                    const fragment = document.createRange().createContextualFragment(adContent);
                    adRef.current.appendChild(fragment);

                    // AdSense Fix: Trigger push with a slight delay to ensure container is rendered
                    if (adContent.includes('adsbygoogle') && (window as any).adsbygoogle) {
                        const timer = setTimeout(() => {
                            try {
                                const ads = adRef.current?.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
                                ads?.forEach(() => {
                                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                                });
                            } catch (e) {
                                logger.warn('AdSense push failed', e);
                            }
                        }, 50); // Small delay for rendering safety
                        return () => clearTimeout(timer);
                    }
                } catch (e) {
                    logger.error('Ad injection failed', e);
                }

                // Analytics tracking (Impression)
                const trackedElements = adRef.current.querySelectorAll('.ad-tracked');
                trackedElements.forEach(el => {
                    const adId = el.getAttribute('data-ad-id');
                    if (adId) {
                        fetch(`${API_ROOT_URL}/api/public/ads/${adId}/impression`, {
                            method: 'POST',
                            headers: { 'Accept': 'application/json' }
                        }).catch(() => { /* silent fail for analytics */ });
                    }
                });
            }
        }
    }, [adContent, placement, isAdminPath]);

    // If in admin path or (no content and placeholder is disabled), hide completely
    if (isAdminPath || (!adContent && !showPlaceholder)) return null;

    const hasContent = !!adContent;

    return (
        <div className={`ad-slot relative overflow-hidden transition-all duration-700 animate-in fade-in rounded-none ${className} ${!hasContent ? 'bg-[#f8f9fa] dark:bg-dark-800/20 border border-gray-100 dark:border-white/5' : ''}`}>
            <style>
                {`
                    .ad-slot-content, .ad-slot-content > * {
                        width: 100% !important;
                        height: 100% !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                    }
                    .ad-slot-content img {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                    }
                `}
            </style>

            <div
                ref={adRef}
                className={`ad-slot-content w-full h-full p-0 m-0 ${!hasContent ? 'min-h-[90px] flex items-center justify-center' : 'block'}`}
            />

            {/* Placeholder overlay when no content is present */}
            {!adContent && showPlaceholder && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-0 m-0 font-sans">
                    <div className="absolute top-2 right-4 flex items-center gap-1 opacity-20">
                        <span className="text-[9px] text-[#bdbdbd] font-normal uppercase tracking-wider">Ad</span>
                        <div className="w-2.5 h-2.5 rounded-full border border-[#bdbdbd] flex items-center justify-center text-[7px] text-[#bdbdbd]">i</div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400/40 dark:text-gray-500/40 uppercase tracking-[0.2em] text-center px-4">
                        {placeholderLabel}
                    </span>
                </div>
            )}
        </div>
    );
}
