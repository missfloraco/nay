import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export interface ExportColumn {
    header: string;
    accessor: (item: any) => string | number;
}

export interface ExportData {
    data: any[];
    columns: ExportColumn[];
    fileName: string;
}

interface ExportContextType {
    exportData: ExportData | null;
    setExportData: (data: any[] | null, columns?: ExportColumn[], fileName?: string) => void;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    isPrinting: boolean;
    setIsPrinting: (printing: boolean) => void;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export const ExportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [exportData, setExportState] = useState<ExportData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const setExportData = useCallback((data: any[] | null, columns: ExportColumn[] = [], fileName: string = 'export') => {
        if (!data || data.length === 0) {
            setExportState(current => current === null ? null : null);
            return;
        }

        // Avoid updating if the content is functionally identical (at least by reference or size)
        // This prevents the infinite loop when Table re-registers on every render
        setExportState(current => {
            if (current &&
                current.data === data &&
                current.fileName === fileName &&
                current.columns.length === columns.length) {
                return current;
            }
            return { data, columns, fileName };
        });
    }, []);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);
    const handleSetIsPrinting = useCallback((printing: boolean) => setIsPrinting(printing), []);

    const contextValue = useMemo(() => ({
        exportData,
        setExportData,
        isModalOpen,
        openModal,
        closeModal,
        isPrinting,
        setIsPrinting: handleSetIsPrinting
    }), [exportData, setExportData, isModalOpen, openModal, closeModal, isPrinting, handleSetIsPrinting]);

    return (
        <ExportContext.Provider value={contextValue}>
            {children}
        </ExportContext.Provider>
    );
};

export const useExport = () => {
    const context = useContext(ExportContext);
    if (context === undefined) {
        throw new Error('useExport must be used within an ExportProvider');
    }
    return context;
};
