import React, { useRef, useEffect } from 'react';
import { X, FileText, Table as TableIcon, Download, AlertCircle } from 'lucide-react';
import Modal from '@/shared/ui/modals/modal';
import { useExport } from '@/shared/contexts/export-context';
import { useExportActions } from '@/shared/hooks/use-export-actions';
import { useAction } from '@/shared/contexts/action-context';

export const ExportModal: React.FC = () => {
    const { isModalOpen, closeModal, exportData } = useExport();
    const { exportCSV, triggerPrint, canExport } = useExportActions();
    const { setPrimaryAction } = useAction();

    useEffect(() => {
        if (isModalOpen) {
            setPrimaryAction({
                label: 'تراجع',
                onClick: closeModal,
                icon: X,
                variant: 'secondary'
            });
        }
        return () => setPrimaryAction(null);
    }, [isModalOpen, closeModal, setPrimaryAction]);

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title="تصدير بيانات النظام مـن الجدول"
            variant="content-fit"
        >
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Standard Export: CSV/Excel */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <TableIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h5 className="text-lg font-black text-gray-900 dark:text-white">تنسيق البيانات (Excel)</h5>
                        </div>

                        {!canExport ? (
                            <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 text-center space-y-4">
                                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400 font-bold leading-relaxed px-4">لا توجد بيانات متاحة حالياً للتصدير بهذا التنسيق.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    onClick={exportCSV}
                                    className="w-full group flex flex-col gap-4 p-8 bg-emerald-50/50 dark:bg-emerald-500/5 border-2 border-emerald-100 dark:border-emerald-500/10 rounded-[2.5rem] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-right shadow-sm hover:shadow-emerald-500/10"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                            <TableIcon className="w-8 h-8" />
                                        </div>
                                        <Download className="w-6 h-6 text-emerald-400 group-hover:translate-y-1 transition-transform" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 dark:text-white text-xl">ملف Excel / CSV</div>
                                        <div className="text-xs text-emerald-600/70 font-bold mt-1">مناسب للعمليات الحسابية والتحليل المتقدم.</div>
                                    </div>
                                </button>
                                <p className="text-[10px] text-gray-400 font-bold px-4 leading-relaxed">يدعم كافة اللغات والتطبيقات الخارجية (UTF-8).</p>
                            </div>
                        )}
                    </div>

                    {/* Visual Export: PDF */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <h5 className="text-lg font-black text-gray-900 dark:text-white">تنسيق الطباعة (PDF)</h5>
                        </div>

                        {!canExport ? (
                            <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 text-center space-y-4">
                                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400 font-bold leading-relaxed px-4">يرجى التأكد مـن وجود بيانات في الجدول للمتابعة.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    onClick={triggerPrint}
                                    className="w-full group flex flex-col gap-4 p-8 bg-blue-50/50 dark:bg-blue-500/5 border-2 border-blue-100 dark:border-blue-500/10 rounded-[2.5rem] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-right shadow-sm hover:shadow-blue-500/10"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <Download className="w-6 h-6 text-blue-400 group-hover:translate-y-1 transition-transform" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 dark:text-white text-xl">تصدير PDF جاهز</div>
                                        <div className="text-xs text-blue-600/70 font-bold mt-1">تنسيق احترافي جاهز للطباعة أو الإرسال.</div>
                                    </div>
                                </button>
                                <p className="text-[10px] text-gray-400 font-bold px-4 leading-relaxed">يتضمن شعار المنصة وتنسيق الجداول العربية.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Local status bar - actions moved to footer */}
                <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-center px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 text-xs font-black text-gray-500 dark:text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                            {canExport ? `جاهز لتصدير سجلات البيانات` : 'بانتظار توفر البيانات...'}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
