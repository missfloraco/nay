import React, { useRef, useEffect } from 'react';
import { X, FileText, Table as TableIcon, Download, AlertCircle } from 'lucide-react';
import Modal from '@/shared/ui/modals/modal';
import { useExport } from '@/shared/contexts/export-context';
import { useExportActions } from '@/shared/hooks/use-export-actions';

export const ExportModal: React.FC = () => {
    const { isModalOpen, closeModal, exportData } = useExport();
    const { exportCSV, triggerPrint, canExport } = useExportActions();

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title="تصدير البيانات"
            size="md"
        >
            <div className="space-y-6">
                {/* Subtitle/Description */}
                <div className="-mt-4 text-xs text-gray-500 font-bold uppercase tracking-widest">
                    اختر التنسيق المناسب للتحميل
                </div>

                {!canExport ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-full text-orange-500">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white">لا توجد بيانات متاحة</h4>
                            <p className="text-xs text-gray-400 font-bold mt-1">يجب أن يحتوي الجدول على بيانات قبل البدء بعملية التصدير</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">

                        {/* CSV Option */}
                        <button
                            onClick={exportCSV}
                            className="w-full group flex items-center gap-6 p-4 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-[1.8rem] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-right"
                        >
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                <TableIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="font-black text-gray-900 dark:text-white text-lg">تحميل ملف Excel / CSV</div>
                                <div className="text-xs text-emerald-600/70 font-bold">متوافق مع جداول البيانات (UTF-8)</div>
                            </div>
                            <Download className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* PDF Option */}
                        <button
                            onClick={triggerPrint}
                            className="w-full group flex items-center gap-6 p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-100/10 rounded-[1.8rem] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-right"
                        >
                            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="font-black text-gray-900 dark:text-white text-lg">تحميل ملف PDF</div>
                                <div className="text-xs text-blue-600/70 font-bold">تصدير عالي الجودة يدعم اللغة العربية</div>
                            </div>
                            <Download className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                )}

                {/* Footer Info */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                        {canExport ? `سيتم تصدير ${exportData?.data.length} عنصر من البيانات الحالية.` : 'يرجى ملء الجدول بالبيانات للمتابعة.'}
                    </p>
                </div>
            </div>
        </Modal>
    );
};
