import { useExport } from '@/shared/contexts/export-context';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import { useSettings } from '@/shared/contexts/app-context';
import { logger } from '@/shared/services/logger';

export const useExportActions = () => {
    const { exportData, setIsPrinting, closeModal } = useExport();
    const { showSuccess, showError, showWarning } = useFeedback();
    const { settings } = useSettings();

    const sanitizeCSV = (val: string | number): string => {
        let text = String(val);
        // Basic Excel Sanitization - Escape formula triggers (@, =, +, -)
        if (['=', '+', '-', '@'].includes(text.charAt(0))) {
            text = `'${text}`;
        }
        // Escape quotes
        return text.replace(/"/g, '""');
    };

    const exportCSV = () => {
        if (!exportData) return;

        const { data, columns, fileName } = exportData;

        // Row Guardrail
        if (data.length > 1000) {
            showWarning('جارٍ تصدير عدد كبير من الصفوف، قد يستغرق ذلك وقتاً طويلاً');
        }

        try {
            // Generate Header
            const headers = columns.map(col => col.header).join(',');

            // Generate Rows
            const rows = data.map(item =>
                columns.map(col => {
                    const val = col.accessor(item);
                    return `"${sanitizeCSV(val)}"`;
                }).join(',')
            ).join('\n');

            const csvContent = `${headers}\n${rows}`;
            // UTF-8 BOM for Excel compatibility
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showSuccess('تم تحميل ملف CSV بنجاح');
            closeModal();
        } catch (error) {
            logger.error('CSV Export Error:', error);
            showError('فشل تصدير البيانات إلى CSV');
        }
    };

    const triggerPrint = () => {
        if (!exportData) return;

        const { data, columns, fileName } = exportData;

        // Row Guardrail for PDF
        if (data.length > 500) {
            showWarning('الجدول يحتوي على بيانات مكثفة، قد يتم تقسيم الصفحات بشكل تلقائي');
        }

        // Set printing state
        setIsPrinting(true);
        closeModal();

        // Trigger the print using the new system
        // The actual printing will be handled by the component that registered the print data
        // This is just a signal to the export context
        showSuccess('جاري تحضير المستند للطباعة...');

        // The component using useExport should listen to isPrinting state
        // and trigger its print function when isPrinting becomes true
    };

    return {
        exportCSV,
        triggerPrint,
        canExport: !!exportData && exportData.data.length > 0
    };
};
