import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { LucideIcon } from 'lucide-react';

export interface Action {
    label: string;
    onClick?: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    form?: string;
    color?: string;
    secondaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'danger' | 'success';
    };
}

export interface ExportConfig {
    headers?: string[];
    getData?: () => any[];
    data?: any[];
    columns?: { header: string; key: string }[];
    filename?: string;
    title?: string;
}

interface ActionContextType {
    primaryAction: Action | null;
    setPrimaryAction: (action: Action | null) => void;
    extraActions: Action[];
    setExtraActions: (actions: Action[]) => void;
    onAdd: (() => void) | null;
    registerAddAction: (action: Action | (() => void), label?: string, icon?: LucideIcon, type?: Action['type'], form?: string) => string;
    unregisterAddAction: () => void;
    addActionLabel: string;
    registerAction: (action: Action) => string;
    unregisterAction: (id: string) => void;
    setActionLoading: (loading: boolean) => void;
    exportConfig: ExportConfig | null;
    registerExportData: (config: ExportConfig) => void;
    unregisterExportData: () => void;
    registerExtraAction: (action: Action) => string;
    unregisterExtraAction: (id: string) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [primaryAction, setPrimaryAction] = useState<Action | null>(null);
    const [exportConfig, setExportConfig] = useState<ExportConfig | null>(null);

    // We will use a ref-like state for extra actions to avoid duplicate renders if possible,
    // but React state is needed for UI updates.
    // We'll use an array of objects with IDs.
    const [extraActionsMap, setExtraActionsMap] = useState<Record<string, Action>>({});

    const extraActions = useMemo(() => Object.values(extraActionsMap), [extraActionsMap]);

    const registerExtraAction = useCallback((action: Action) => {
        const id = Math.random().toString(36).substr(2, 9);
        setExtraActionsMap(prev => ({ ...prev, [id]: action }));
        return id;
    }, []);

    const unregisterExtraAction = useCallback((id: string) => {
        setExtraActionsMap(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    const registerAddAction = useCallback((action: Action | (() => void), label?: string, icon?: LucideIcon, type?: Action['type'], form?: string) => {
        const actionId = Math.random().toString(36).substr(2, 9);

        if (typeof action === 'function') {
            setPrimaryAction({
                onClick: action,
                label: label || 'إضافة جديد',
                icon: icon,
                type: type || 'button',
                form: form
            });
        } else {
            setPrimaryAction(action);
        }

        return actionId;
    }, []);

    const unregisterAddAction = useCallback(() => {
        setPrimaryAction(null);
    }, []);

    const registerAction = useCallback((action: Action & { color?: string }) => {
        const actionId = Math.random().toString(36).substr(2, 9);
        const variant = action.color === 'primary' ? 'primary' : action.variant || 'primary';

        setPrimaryAction({
            ...action,
            variant: variant as any
        });
        return actionId;
    }, []);

    const unregisterAction = useCallback((id: string) => {
        setPrimaryAction(null);
    }, []);

    const setActionLoading = useCallback((loading: boolean) => {
        setPrimaryAction(prev => prev ? { ...prev, loading } : null);
    }, []);

    const registerExportData = useCallback((config: ExportConfig) => {
        setExportConfig(config);
    }, []);

    const unregisterExportData = useCallback(() => {
        setExportConfig(null);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setPrimaryAction(null);
            setExportConfig(null);
        };
    }, []);

    const setExtraActions = useCallback((actions: Action[]) => {
        // Legacy support: overwrite map with new IDs
        const newMap: Record<string, Action> = {};
        actions.forEach(a => {
            const id = Math.random().toString(36).substr(2, 9);
            newMap[id] = a;
        });
        setExtraActionsMap(newMap);
    }, []);

    const contextValue = useMemo(() => ({
        primaryAction,
        setPrimaryAction,
        extraActions,
        setExtraActions,
        registerExtraAction,
        unregisterExtraAction,
        onAdd: primaryAction?.onClick || null,
        registerAddAction,
        unregisterAddAction,
        addActionLabel: primaryAction?.label || 'إضافة جديد',
        registerAction,
        unregisterAction,
        setActionLoading,
        exportConfig,
        registerExportData,
        unregisterExportData
    }), [
        primaryAction,
        extraActions,
        setExtraActions, // Now stable
        registerExtraAction,
        unregisterExtraAction,
        registerAddAction,
        unregisterAddAction,
        registerAction,
        unregisterAction,
        setActionLoading,
        exportConfig,
        registerExportData,
        unregisterExportData
    ]);

    return (
        <ActionContext.Provider value={contextValue}>
            {children}
        </ActionContext.Provider>
    );
};

export const useAction = (): ActionContextType => {
    const context = useContext(ActionContext);
    if (!context) {
        throw new Error('useAction must be used within an ActionProvider');
    }
    return context;
};
