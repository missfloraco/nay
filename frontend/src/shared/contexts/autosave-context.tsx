import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

export interface AutoSaveContextType {
    save: (key: string, data: Record<string, any>) => void;
    isSaving: boolean;
    lastSaved: Date | null;
}

export const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

export function useAutoSave() {
    const context = useContext(AutoSaveContext);
    if (!context) throw new Error('useAutoSave must be used within AutoSaveProvider');
    return context;
}

export function AutoSaveProvider({ children }: { children: ReactNode }) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const save = useCallback((key: string, data: Record<string, any>) => {
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce save for 1 second
        timeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                // Save to API
                await api.post(`/app/${key}`, data);
                setLastSaved(new Date());
            } catch (error) {
                logger.error('Auto-save failed', error);
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    }, []);

    return (
        <AutoSaveContext.Provider value={{ save, isSaving, lastSaved }}>
            {children}

            {/* Save Indicator */}
            {isSaving && (
                <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
                    جاري الحفظ...
                </div>
            )}

            {lastSaved && !isSaving && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
                    تم الحفظ {lastSaved.toLocaleTimeString('ar-EG')}
                </div>
            )}
        </AutoSaveContext.Provider>
    );
}
