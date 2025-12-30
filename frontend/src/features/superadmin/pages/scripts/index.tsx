import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Script, ScriptService } from '@/features/superadmin/services/script-service';
import Table from '@/shared/table';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import { Plus, Code, Trash2, Edit, Play, Pause, ShieldCheck, AlertTriangle, Terminal, Settings } from 'lucide-react';
import ScriptForm from './components/script-form';
import { formatDate } from '@/shared/utils/helpers';
import Modal from '@/shared/ui/modals/modal';
import { useAction } from '@/shared/contexts/action-context';

export default function ScriptsManager() {
    const { showSuccess, showError } = useFeedback();
    const { registerAddAction, unregisterAddAction } = useAction();

    const [scripts, setScripts] = useState<Script[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadScripts();
    }, []);

    // Register FAB for Mobile
    useEffect(() => {
        registerAddAction(() => {
            setSelectedScript(null);
            setIsModalOpen(true);
        }, 'إضافة سكربت', Plus);
        return () => unregisterAddAction();
    }, [registerAddAction, unregisterAddAction]);

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
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${script.isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-500'}`}>
                        <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {script.name}
                            {script.isActive ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100">نشط</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black border border-gray-200">معطل</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100 dark:border-white/5 uppercase">{script.type}</span>
                            <span className="text-gray-300">•</span>
                            <span>{script.location}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            sortKey: 'name'
        },
        {
            header: 'بيئة العمل',
            accessor: (script: Script) => (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${script.environment === 'production' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    script.environment === 'development' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-cyan-50 text-cyan-600 border border-cyan-100'
                    }`}>
                    {script.environment}
                </span>
            ),
            className: 'w-[120px]'
        },
        {
            header: 'آخر تعديل',
            accessor: (script: Script) => (
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400" dir="ltr">
                    {formatDate(script.updatedAt)}
                </div>
            ),
            sortable: true,
            sortKey: 'updatedAt',
            className: 'w-[150px]'
        },
        {
            header: 'الإجراءات',
            accessor: (script: Script) => (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => handleToggleStatus(script.id)}
                        className={`p-2 rounded-xl transition-colors ${script.isActive
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20'
                            }`}
                        title={script.isActive ? 'تعطيل' : 'تفعيل'}
                    >
                        {script.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => {
                            setSelectedScript(script);
                            setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors"
                        title="تعديل"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => handleDelete(script.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
            className: 'w-[180px]'
        }
    ], []);

    return (
        <AdminLayout
            title="إدارة النصوص البرمجية (Scripts)"
            hideLeftSidebar={true}
            actions={
                <button
                    onClick={() => {
                        setSelectedScript(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>إضافة سكربت جديد</span>
                </button>
            }
        >
            <div className="flex flex-col h-full">
                {/* Warning Banner */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl mb-6 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">منطقة حساسة</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            هذه الأكواد تعمل بصلاحيات كاملة على الموقع. أي خطأ برمجي هنا قد يؤدي إلى توقف الموقع أو ثغرات أمنية.
                            يرجى المراجعة الدقيقة قبل التفعيل.
                        </p>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-dark-900 rounded-[2rem] border border-gray-100 dark:border-dark-800 shadow-sm overflow-hidden flex flex-col">
                    <Table
                        columns={columns}
                        data={scripts}
                        isLoading={loading}
                        emptyMessage="لا توجد سكربتات مضافة حالياً"
                    />
                </div>
            </div>

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
        </AdminLayout>
    );
}
