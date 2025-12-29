import { useState, useEffect, useRef } from 'react';

/**
 * Custom Hook for AdBlock Detection
 * Extracted from AppContext for better code organization
 */
export function useAdBlockDetection(adblockEnabled: boolean | string | number) {
    const [isAdBlockActive, setIsAdBlockActive] = useState(false);
    const [isCheckingAdBlock, setIsCheckingAdBlock] = useState(true);
    const adBlockActiveRef = useRef(isAdBlockActive);

    useEffect(() => {
        adBlockActiveRef.current = isAdBlockActive;
        if (isAdBlockActive) {
            document.body.classList.add('adblock-active');
        } else {
            document.body.classList.remove('adblock-active');
        }
    }, [isAdBlockActive]);

    useEffect(() => {
        const isEnabled = adblockEnabled === 'true' ||
            adblockEnabled === true ||
            adblockEnabled === '1' ||
            adblockEnabled === 1;

        const isAdmin = window.location.pathname.startsWith('/admin');

        if (!isEnabled || isAdmin) {
            if (isAdBlockActive) setIsAdBlockActive(false);
            setIsCheckingAdBlock(false);
            return;
        }

        let isMounted = true;
        let firstCheckStarted = false;

        const checkAdBlock = async () => {
            try {
                const isEnabled = String(adblockEnabled) === 'true' || adblockEnabled === '1' || adblockEnabled === 1 || adblockEnabled === true;

                if (!isEnabled || isAdmin) {
                    setIsAdBlockActive(false);
                    setIsCheckingAdBlock(false);
                    return;
                }

                const results = await Promise.all([
                    // 1. Local Sentry Multi-Check
                    ...['ads.js', 'adframe.js', 'sentry.js'].map(name => {
                        return new Promise<boolean>((resolve) => {
                            const script = document.createElement('script');
                            script.src = `/js/${name}?v=${Date.now()}`;
                            script.onload = () => {
                                const success = (window as any).__shield_integrity__ === true;
                                script.remove(); resolve(!success);
                            };
                            script.onerror = () => { script.remove(); resolve(true); };
                            document.head.appendChild(script);
                            setTimeout(() => { if (script.parentNode) { script.remove(); resolve(true); } }, 2000);
                        });
                    }),
                    // 2. Google Ads Decoy (Remote)
                    new Promise<boolean>((resolve) => {
                        const script = document.createElement('script');
                        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?v=${Date.now()}`;
                        script.async = true;
                        script.onload = () => { script.remove(); resolve(false); };
                        script.onerror = () => { script.remove(); resolve(true); };
                        document.head.appendChild(script);
                        setTimeout(() => { if (script.parentNode) { script.remove(); resolve(true); } }, 2500);
                    }),
                    // 3. DOM Bait (CSS-based)
                    (async () => {
                        const bait = document.createElement('div');
                        bait.id = 'ad_container_728x90';
                        bait.className = 'adsbygoogle ad-placement ad-content advertisement ad-unit ad_300x250';
                        bait.setAttribute('style', 'width:1px!important;height:1px!important;position:absolute!important;left:-2000px!important;top:-2000px!important;display:block!important;visibility:visible!important;');
                        document.body.appendChild(bait);
                        await new Promise(r => setTimeout(r, 800));
                        const s = window.getComputedStyle(bait);
                        const blocked = s.display === 'none' || s.visibility === 'hidden' || bait.offsetHeight === 0;
                        if (bait.parentNode) document.body.removeChild(bait);
                        return blocked;
                    })()
                ]);

                const detected = results.some(r => r === true);

                if (isMounted && adBlockActiveRef.current !== detected) {
                    setIsAdBlockActive(detected);
                }
                if (isMounted) setIsCheckingAdBlock(false);
            } catch (e) {
                if (isMounted) setIsCheckingAdBlock(false);
            }
        };

        if (!firstCheckStarted) {
            firstCheckStarted = true;
            checkAdBlock();
        }

        const interval = setInterval(checkAdBlock, 10000);

        // MutationObserver: Correctly initialized and observing
        const observer = new MutationObserver(() => {
            if (!isAdmin && adBlockActiveRef.current) {
                const overlay = document.querySelector('[data-shield-overlay="true"]');
                if (!overlay || window.getComputedStyle(overlay).display === 'none') {
                    window.location.reload();
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, attributes: true });

        return () => {
            isMounted = false;
            clearInterval(interval);
            observer.disconnect();
        };
    }, [adblockEnabled]); // REMOVED isAdBlockActive and isCheckingAdBlock from dependencies!

    return { isAdBlockActive, isCheckingAdBlock };
}
