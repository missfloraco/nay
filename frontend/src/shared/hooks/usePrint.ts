import React, { useRef, useCallback, RefObject } from 'react';
import { useReactToPrint } from 'react-to-print';
import { logger } from '@/shared/services/logger';

interface UsePrintOptions {
    documentTitle?: string;
    onBeforePrint?: () => Promise<void>;
    onAfterPrint?: () => void;
    pageStyle?: string;
}

interface UsePrintReturn {
    printRef: React.RefObject<HTMLDivElement>;
    handlePrint: () => void;
    isPrinting: boolean;
}

/**
 * Centralized printing hook using react-to-print
 * 
 * @example
 * const { printRef, handlePrint } = usePrint({
 *   documentTitle: 'Invoice #123',
 *   onAfterPrint: () => console.log('Printed!')
 * });
 * 
 * <div style={{ display: 'none' }}>
 *   <PrintableInvoice ref={printRef} data={invoice} />
 * </div>
 * <button onClick={handlePrint}>Print</button>
 */
export function usePrint(options: UsePrintOptions = {}): UsePrintReturn {
    const {
        documentTitle = 'Document',
        onBeforePrint,
        onAfterPrint,
        pageStyle
    } = options;

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle,
        onBeforePrint,
        onAfterPrint,
        pageStyle: pageStyle || `
            @page {
                size: A4;
                margin: 15mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    font-family: var(--theme-font, 'Alexandria', 'RTA', sans-serif) !important;
                }
                * {
                    font-family: var(--theme-font, 'Alexandria', 'RTA', sans-serif) !important;
                }
            }
        `,
    });

    return {
        printRef,
        handlePrint: useCallback(() => {
            if (printRef.current) {
                handlePrint();
            } else {
                logger.error('Print ref is not attached to any element');
            }
        }, [handlePrint]),
        isPrinting: false // react-to-print v3 doesn't expose this, but kept for API consistency
    };
}
