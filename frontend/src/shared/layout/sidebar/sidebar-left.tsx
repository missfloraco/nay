import React from 'react';
import { Lightbulb, Sparkles, Download } from 'lucide-react';
import { useExport } from '@/shared/contexts/export-context';
import AdSlot from '@/shared/ads/adslot';

interface LeftSidebarProps {
    children?: React.ReactNode;
    contentClassName?: string;
    noPadding?: boolean;
    noBorder?: boolean;
}

/**
 * Left Sidebar - Always positioned on the ACTUAL LEFT side
 * Fixed 250px width matching the main sidebar symmetry
 * Border on the RIGHT (border-r)
 * Same styling as the main navigation sidebar
 * 
 * يظهر دائماً في جميع الصفحات
 * يمكن تخصيصه لأي وظيفة تريدها
 */
export const LeftSidebar: React.FC<LeftSidebarProps> = ({
    children,
    contentClassName = '',
    noPadding = false,
    noBorder = false
}) => {
    const { exportData, openModal } = useExport();

    return (
        <aside
            className={`left-sidebar-root bg-white ${noBorder ? '' : 'border-r border-gray-200'} z-40 transition-all duration-500 ease-in-out flex flex-col w-[250px] ${contentClassName}`}
        >
            {/* Content Area - matches main sidebar nav styling */}
            <div className={`flex-1 overflow-y-auto no-scrollbar ${noPadding ? 'p-0 space-y-0' : 'p-6 space-y-1.5'}`}>
                {children ? (
                    // عرض المحتوى المخصص
                    children
                ) : (
                    // رسالة افتراضية عند عدم وجود محتوى
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                            <Sparkles className="w-8 h-8 text-primary/40" />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">
                                عمود قابل للتخصيص
                            </h3>

                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                <div className="flex items-start gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-blue-600 leading-relaxed text-right">
                                        يمكنك تخصيص هذا العمود لعرض:
                                    </p>
                                </div>
                                <ul className="text-[9px] text-blue-500/80 space-y-1 font-bold text-right">
                                    <li>• فلاتر البحث والتصفية</li>
                                    <li>• إحصائيات سريعة</li>
                                    <li>• قوائم جانبية</li>
                                    <li>• إعدادات وخيارات</li>
                                    <li>• أي محتوى مخصص</li>
                                </ul>
                            </div>

                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                استخدم leftSidebarContent
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Ad Placement - Absolute Bottom, Edge to Edge (Hidden in Admin) */}
            {!window.location.pathname.startsWith('/admin') && (
                <AdSlot
                    placement="ad_sidebar_square"
                    className="w-[250px] h-[250px] aspect-square border-t border-gray-200 mt-auto"
                    showPlaceholder={false}
                />
            )}
        </aside>
    );
};
