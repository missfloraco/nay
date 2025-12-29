import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/services/api';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';

export interface TrashedItem {
    id: number;
    type: string;
    display_name: string;
    deleted_at: string;
    deleted_by?: {
        id: number;
        type: string;
    };
}

export interface TrashStats {
    total: number;
    byType: Record<string, number>;
}

interface UseTrashOptions {
    endpoint: string; // '/admin/trash' or '/app/trash'
}

export function useTrash(options: UseTrashOptions) {
    const { endpoint } = options;
    const { showSuccess, showError, showConfirm } = useFeedback();

    const [items, setItems] = useState<TrashedItem[]>([]);
    const [stats, setStats] = useState<TrashStats>({ total: 0, byType: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<TrashedItem[]>([]);

    // Fetch trashed items
    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            const response: any = await api.get(endpoint);
            setItems(response.data || []);
            setStats(response.stats || { total: 0, byType: {} });
        } catch (error: any) {
            showError(error.response?.data?.error || 'فشل تحميل العناصر المحذوفة');
            setItems([]);
            setStats({ total: 0, byType: {} });
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, showError]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Restore single item
    const restore = async (type: string, id: number) => {
        try {
            await api.post(`${endpoint}/restore`, { type, id });
            showSuccess('تم الاستعادة بنجاح');
            fetchItems();
            setSelected(prev => prev.filter(item => !(item.type === type && item.id === id)));
        } catch (error: any) {
            showError(error.response?.data?.error || 'فشل الاستعادة');
        }
    };

    // Force delete single item
    const forceDelete = async (type: string, id: number) => {
        const confirmed = await showConfirm({
            title: 'حذف نهائي',
            message: 'هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.',
            isDestructive: true
        });

        if (!confirmed) return;

        try {
            await api.delete(`${endpoint}/force`, { data: { type, id } });
            showSuccess('تم الحذف نهائياً');
            fetchItems();
            setSelected(prev => prev.filter(item => !(item.type === type && item.id === id)));
        } catch (error: any) {
            showError(error.response?.data?.error || 'فشل الحذف');
        }
    };

    // Toggle selection
    const toggleSelect = (item: TrashedItem) => {
        setSelected(prev => {
            const isSelected = prev.some(i => i.type === item.type && i.id === item.id);
            if (isSelected) {
                return prev.filter(i => !(i.type === item.type && i.id === item.id));
            } else {
                return [...prev, item];
            }
        });
    };

    // Select all
    const selectAll = () => {
        if (selected.length === items.length) {
            setSelected([]);
        } else {
            setSelected([...items]);
        }
    };

    // Bulk restore
    const bulkRestore = async () => {
        if (selected.length === 0) return;

        try {
            const itemsData = selected.map(item => ({ type: item.type, id: item.id }));
            const response: any = await api.post(`${endpoint}/bulk-restore`, { items: itemsData });
            showSuccess(`تم استعادة ${response.success} عنصر`);
            fetchItems();
            setSelected([]);
        } catch (error: any) {
            showError(error.response?.data?.error || 'فشل الاستعادة الجماعية');
        }
    };

    // Bulk force delete
    const bulkForceDelete = async () => {
        if (selected.length === 0) return;

        const confirmed = await showConfirm({
            title: 'حذف نهائي جماعي',
            message: `هل أنت متأكد من حذف ${selected.length} عنصر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
            isDestructive: true
        });

        if (!confirmed) return;

        try {
            const itemsData = selected.map(item => ({ type: item.type, id: item.id }));
            const response: any = await api.delete(`${endpoint}/bulk-force`, { data: { items: itemsData } });
            showSuccess(`تم حذف ${response.success} عنصر نهائياً`);
            fetchItems();
            setSelected([]);
        } catch (error: any) {
            showError(error.response?.data?.error || 'فشل الحذف الجماعي');
        }
    };

    // Empty trash
    const emptyTrash = async () => {
        const confirmed = await showConfirm({
            title: 'إفراغ سلة المحذوفات',
            message: 'هل أنت متأكد من حذف جميع العناصر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
            isDestructive: true
        });

        if (!confirmed) return;

        try {
            const response: any = await api.delete(`${endpoint}/empty`);
            showSuccess(`تم حذف ${response.count} عنصر نهائياً`);
            fetchItems();
            setSelected([]);
        } catch (error: any) {
            showError(error.response?.data?.error || 'فشل إفراغ السلة');
        }
    };

    return {
        items,
        stats,
        isLoading,
        selected,
        toggleSelect,
        selectAll,
        restore,
        forceDelete,
        bulkRestore,
        bulkForceDelete,
        emptyTrash,
        refresh: fetchItems,
    };
}
