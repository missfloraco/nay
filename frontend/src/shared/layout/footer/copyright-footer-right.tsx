import React from 'react';
import { useSettings } from '@/shared/contexts/app-context';

export const CopyrightFooterRight: React.FC = () => {
    const { settings } = useSettings();

    return (
        <div className="flex w-[250px] h-full border-l border-gray-300 dark:border-dark-600 px-4 items-center justify-center text-center bg-gray-50/10 dark:bg-dark-800/5">
            <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1.5 opacity-80 uppercase leading-none">جميع الحقوق محفوظة</span>
                <span className="text-[11px] font-black text-gray-700 dark:text-gray-400 leading-relaxed text-center">
                    منصة {settings?.appName || 'النظام'} © {new Date().getFullYear()}
                    <br />
                    <span className="text-[10px] opacity-80">
                        {settings?.companyName && <>أحد مشاريع </>}
                        {settings?.companyLink ? (
                            <a href={settings.companyLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4 cursor-pointer">
                                {settings?.companyName || ''}
                            </a>
                        ) : (
                            <span>{settings?.companyName || ''}</span>
                        )}
                    </span>
                </span>
            </div>
        </div>
    );
};
