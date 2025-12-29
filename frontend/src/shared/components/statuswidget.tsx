import React from 'react';
import { formatDate } from '@/shared/utils/helpers';

interface StatusWidgetProps {
    type: 'admin' | 'tenant';
    tenant?: any;
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({ type, tenant }) => {
    const isTenant = type === 'tenant';

    return (
        <div className="w-[250px] h-full bg-gray-50/10 dark:bg-dark-800/5 border-r border-gray-300 dark:border-dark-600 flex items-center justify-center px-4 transition-all group overflow-hidden relative select-none">
            <div className="flex flex-col items-center">
                {isTenant ? (
                    <>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1.5 opacity-80 uppercase leading-none">
                            فترة الاشتراك ونهايتها
                        </span>
                        <div className="text-[11px] font-black text-gray-700 dark:text-gray-400 leading-relaxed text-center">
                            <span>بدأ في {formatDate(tenant?.subscription_started_at || tenant?.created_at, true).split('|')[0]}</span>
                            <br />
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold opacity-90">
                                تاريخ الانتهاء: {formatDate(tenant?.subscription_ends_at || tenant?.trial_expires_at, true).split('|')[0]}
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1.5 opacity-80 uppercase leading-none">
                            حالة النظام والعمليات
                        </span>
                        <div className="text-[11px] font-black text-gray-700 dark:text-gray-400 leading-relaxed text-center">
                            <span className="text-emerald-600 dark:text-emerald-500">جداول البيانات مستقرة</span>
                            <br />
                            <span className="text-[10px] opacity-80">
                                آخر فحص: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
