import React, { forwardRef, ReactNode } from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import '@/shared/styles/print.css';

interface PrintLayoutProps {
    children: ReactNode;
    title?: string;
    showHeader?: boolean;
    showFooter?: boolean;
    showPageNumbers?: boolean;
}

/**
 * Shared print layout wrapper for all printable documents
 * Provides consistent header, footer, and A4 formatting
 */
export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
    ({ children, title, showHeader = true, showFooter = true, showPageNumbers = true }, ref) => {
        const { settings } = useSettings();
        const currentDate = new Date().toLocaleDateString('ar-SA');

        return (
            <div ref={ref} className="print-document" style={{
                direction: 'rtl',
                fontFamily: "var(--theme-font, 'Alexandria', 'RTA', sans-serif)"
            }}>
                {/* Print Header */}
                {showHeader && (
                    <div className="invoice-header avoid-break">
                        <div className="print-flex" style={{ alignItems: 'center', marginBottom: '16pt' }}>
                            {/* Logo */}
                            {settings.logoUrl && (
                                <img
                                    src={settings.logoUrl}
                                    alt={settings.appName}
                                    style={{ height: '60px', objectFit: 'contain' }}
                                />
                            )}

                            {/* Company Info */}
                            <div style={{ textAlign: 'left' }}>
                                <h1 style={{ margin: 0, fontSize: '20pt' }}>{settings.appName}</h1>
                                {settings.companyName && (
                                    <p style={{ margin: '4pt 0 0 0', fontSize: '10pt', color: '#666' }}>
                                        {settings.companyName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Document Title */}
                        {title && (
                            <h2 className="print-text-center" style={{ margin: '16pt 0', fontSize: '18pt' }}>
                                {title}
                            </h2>
                        )}

                        {/* Print Date */}
                        <div className="print-text-left" style={{ fontSize: '9pt', color: '#666' }}>
                            تاريخ الطباعة: {currentDate}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="print-content">
                    {children}
                </div>

                {/* Print Footer */}
                {showFooter && (
                    <div className="invoice-footer avoid-break">
                        <div className="print-flex" style={{ fontSize: '9pt', color: '#666' }}>
                            <div>
                                {settings.companyName && <span>{settings.companyName}</span>}
                            </div>
                            {showPageNumbers && (
                                <div>
                                    صفحة <span className="page-number"></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

PrintLayout.displayName = 'PrintLayout';

export default PrintLayout;
