import React, { useState, useEffect, useMemo } from 'react';
import { Script, ScriptService } from '@/shared/services/scripts-service';
import { useAction } from '@/shared/contexts/action-context';
import Table from '@/shared/table';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import { Plus, Trash2, Terminal } from 'lucide-react';
import ScriptForm from '../pages/scripts/components/script-form';
import { IdentityCell, ActionCell } from '@/shared/table-cells';
import { EditButton, DeleteButton } from '@/shared/ui/buttons/btn-crud';
import { formatDate } from '@/shared/utils/helpers';
import Modal from '@/shared/ui/modals/modal';

export const ScriptsSettings: React.FC = () => {
    const { showSuccess, showError } = useFeedback();
    const { setPrimaryAction } = useAction();

    const [scripts, setScripts] = useState<Script[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadScripts();
    }, []);

    useEffect(() => {
        setPrimaryAction({
            label: "إضافة سكربت جديد",
            icon: Plus,
            onClick: () => {
                setSelectedScript(null);
                setIsModalOpen(true);
            },
        });

        return () => setPrimaryAction(null);
    }, [setPrimaryAction]);

    const loadScripts = async () => {
        setLoading(true);
        try {
            const data = await ScriptService.getAll();
            setScripts(data);
        } catch (error) {
            showError('فشل تحميل السكربتات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        setActionLoading(true);
        try {
            if (selectedScript) {
                await ScriptService.update(selectedScript.id, data);
                showSuccess('تم تحديث السكربت بنجاح');
            } else {
                await ScriptService.create(data);
                showSuccess('تم إضافة السكربت بنجاح');
            }
            setIsModalOpen(false);
            loadScripts();
        } catch (error) {
            showError('حدث خطأ أثناء الحفظ');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا السكربت؟')) return;
        try {
            await ScriptService.delete(id);
            showSuccess('تم الحذف بنجاح');
            loadScripts();
        } catch (error) {
            showError('فشل الحذف');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await ScriptService.toggleStatus(id);
            showSuccess('تم تغيير الحالة بنجاح');
            loadScripts();
        } catch (error) {
            showError('فشل تغيير الحالة');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'السكربت',
            accessor: (script: Script) => (
                <IdentityCell
                    name={script.name}
                    subtext={`${script.type.toUpperCase()} • ${script.location}`}
                    icon={Terminal}
                    iconColor={script.isActive ? "text-blue-600" : "text-gray-400"}
                    iconBg={script.isActive ? "bg-blue-50 dark:bg-blue-900/10" : "bg-gray-100 dark:bg-dark-800"}
                />
            ),
            sortable: true,
            sortKey: 'name',
            className: 'min-w-[250px]'
        },
        {
            header: 'بيئة العمل',
            accessor: (script: Script) => (
                <div className="flex justify-center">
                    <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border ${script.environment === 'production' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-500/20' :
                        script.environment === 'development' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-500/20' :
                            'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-900/20 dark:border-cyan-500/20'
                        }`}>
                        {script.environment}
                    </span>
                </div>
            ),
            className: 'text-center'
        },
        {
            header: 'الحالة',
            accessor: (script: Script) => (
                <div className="flex justify-center">
                    {script.isActive ? (
                        <button onClick={() => handleToggleStatus(script.id)} className="flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-[1.5rem] text-[10px] font-black border border-green-100 dark:border-green-500/20 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            مفعل
                        </button>
                    ) : (
                        <button onClick={() => handleToggleStatus(script.id)} className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-400 rounded-[1.5rem] text-[10px] font-black border border-gray-200 dark:border-white/5 opacity-60 hover:opacity-100 hover:scale-105 transition-all cursor-pointer">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            متوقف
                        </button>
                    )}
                </div>
            ),
            className: 'text-center w-[120px]'
        },
        {
            header: 'آخر تعديل',
            accessor: (script: Script) => (
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center" dir="ltr">
                    {formatDate(script.updatedAt)}
                </div>
            ),
            sortable: true,
            sortKey: 'updatedAt',
            className: 'w-[150px] text-center'
        },
        {
            header: 'التحكم',
            accessor: (script: Script) => (
                <ActionCell>
                    <div className="flex items-center justify-end gap-2">
                        <EditButton
                            type="icon"
                            onClick={() => {
                                setSelectedScript(script);
                                setIsModalOpen(true);
                            }}
                        />
                        <DeleteButton
                            type="icon"
                            onClick={() => handleDelete(script.id)}
                        />
                    </div>
                </ActionCell>
            ),
            className: 'text-left w-[120px]'
        }
    ], []);

    return (
        <div className="flex flex-col w-full p-8 animate-in fade-in duration-500">

            <Table
                columns={columns}
                data={scripts}
                isLoading={loading}
                emptyMessage="لا توجد سكربتات مضافة حالياً"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedScript ? 'تعديل السكربت' : 'إضافة سكربت جديد'}
                size="xl"
            >
                <ScriptForm
                    initialData={selectedScript}
                    onSubmit={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={actionLoading}
                />
            </Modal>
        </div>
    );
};
