import React, { useState } from 'react';
import {
    X, Save, Play, Pause, Ban, CheckCircle, Clock, LogIn, Trash2,
    ExternalLink, HardDrive, Users, Calendar, Shield,
    AlertTriangle, DollarSign
} from 'lucide-react';
import { formatDate } from '@/shared/utils/helpers';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { TenantStatusBadge } from './tenantstatusbadge';
import { TEXTS_ADMIN } from '@/shared/locales/texts';

interface Tenant {
    id: number;
    name: string;
    domain: string;
    storage_used: string;
    status: 'pending' | 'trial' | 'active' | 'expired' | 'disabled';
    created_at: string;
    users_count?: number;
    trial_expires_at?: string;
    onboarding_completed?: boolean;
}

interface TenantActionModalProps {
    tenant: Tenant;
    onClose: () => void;
    onUpdate: () => void;
    onRecordPayment: () => void;
}

export function TenantActionModal({ tenant, onClose, onUpdate, onRecordPayment }: TenantActionModalProps) {
    const { showSuccess, showError, showConfirm } = useFeedback();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: tenant.name,
        domain: tenant.domain,
        password: ''
    });

    const handleImpersonate = async () => {
        const confirmed = await showConfirm({
            title: 'دخول بصلاحية المستأجر',
            message: TEXTS_ADMIN.TENANTS.LOGIN_AS_TENANT,
            confirmLabel: 'دخول الآن'
        });

        if (!confirmed) return;

        try {
            const response: any = await api.post(`/admin/tenants/${tenant.id}/impersonate`);
            if (response && response.token) {
                sessionStorage.setItem('tenant_token', response.token);
                sessionStorage.setItem('is_impersonating', 'true');
                window.location.href = '/app/dashboard';
            }
        } catch (error) {
            showError(TEXTS_ADMIN.MESSAGES.ERROR);
        }
    };

    const handleStatusChange = async (action: 'activate' | 'disable' | 'enable') => {
        let endpoint = '';
        let confirmMsg = '';

        switch (action) {
            case 'activate':
                endpoint = 'activate';
                confirmMsg = 'هل تريد تفعيل هذا المستأجر وإزالة فترة التجربة؟';
                break;
            case 'disable':
                endpoint = 'disable';
                confirmMsg = 'هل تريد تعطيل هذا المستأجر؟ لن يتمكن من الوصول إلى النظام.';
                break;
            case 'enable':
                endpoint = 'enable';
                confirmMsg = 'هل تريد إعادة تفعيل هذا المستأجر؟';
                break;
        }

        const confirmed = await showConfirm({
            title: 'تغيير حالة المستأجر',
            message: confirmMsg,
            confirmLabel: 'تأكيد',
            isDestructive: action === 'disable'
        });

        if (!confirmed) return;

        try {
            setLoading(true);
            await api.post(`/admin/tenants/${tenant.id}/${endpoint}`);
            showSuccess('تم تحديث حالة المستأجر بنجاح');
            onUpdate();
        } catch (error: any) {
            showError(error.response?.data?.message || 'فشل تحديث الحالة');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload: any = {
                name: editForm.name,
                domain: editForm.domain
            };
            if (editForm.password) {
                payload.admin_password = editForm.password;
            }

            await api.put(`/admin/tenants/${tenant.id}`, payload);
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
            onUpdate();
        } catch (error: any) {
            showError(error.response?.data?.message || TEXTS_ADMIN.MESSAGES.ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'حذف الحساب نهائياً',
            message: TEXTS_ADMIN.MESSAGES.CONFIRM,
            isDestructive: true,
            confirmLabel: 'حذف نهائي'
        });

        if (!confirmed) return;

        try {
            setLoading(true);
            await api.delete(`/admin/tenants/${tenant.id}`);
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
            onUpdate();
            onClose();
        } catch (error) {
            showError(TEXTS_ADMIN.MESSAGES.ERROR);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {tenant.name}
                            </h2>
                            <TenantStatusBadge status={tenant.status} />
                        </div>
                        <a
                            href={`https://${tenant.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
                        >
                            {tenant.domain}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-8 pb-4 pt-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2.5 px-5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 border ${activeTab === 'overview'
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-gray-700/50 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Shield className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-gray-400'}`} />
                        نظرة عامة
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-2.5 px-5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 border ${activeTab === 'settings'
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-gray-700/50 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Play className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`} />
                        الإعدادات
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">

                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {tenant.users_count || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">المستخدمين</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <HardDrive className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white" dir="ltr">
                                            {tenant.storage_used || '0 MB'}
                                        </div>
                                        <div className="text-sm text-gray-500">مساحة التخزين</div>
                                    </div>
                                </div>
                            </div>

                            {/* Trial/Status Alert */}
                            {(tenant.status === 'trial' || tenant.status === 'expired') && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <div className="font-bold text-amber-800 dark:text-amber-400">حالة التجربة</div>
                                        <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                            {tenant.trial_expires_at ? (
                                                <>تنتهي التجربة في: <span className="font-bold">{formatDate(tenant.trial_expires_at)}</span></>
                                            ) : 'فترة التجربة غير محددة'}
                                        </div>
                                        <button
                                            onClick={() => handleStatusChange('activate')}
                                            className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                                        >
                                            تفعيل الحساب (تخطي التجربة)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">إجراءات سريعة</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={onRecordPayment}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-right group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">تسجيل دفعة / تمديد</div>
                                            <div className="text-xs text-gray-500">تمديد الاشتراك يدوياً</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleImpersonate}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-right group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <LogIn className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">دخول كمسؤول</div>
                                            <div className="text-xs text-gray-500">تصفح النظام بصلاحيات هذا المستأجر</div>
                                        </div>
                                    </button>

                                    {tenant.status !== 'disabled' ? (
                                        <button
                                            onClick={() => handleStatusChange('disable')}
                                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-right group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Ban className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">تعطيل الحساب</div>
                                                <div className="text-xs text-gray-500">إيقاف صلاحية الوصول للمستأجر</div>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusChange('enable')}
                                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-right group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">تفعيل الحساب</div>
                                                <div className="text-xs text-gray-500">إعادة تفعيل صلاحية الوصول</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8">
                            <form onSubmit={handleUpdateDetails} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم المستأجر</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الدومين الفرعي</label>
                                    <input
                                        type="text"
                                        value={editForm.domain}
                                        onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تغيير كلمة المرور (اختياري)</label>
                                    <input
                                        type="password"
                                        placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50"
                                >
                                    حفظ التغييرات
                                </button>
                            </form>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    منطقة الخطر
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">حذف المستأجر سيؤدي إلى حذف جميع البيانات المرتبطة به ولا يمكن التراجع عن هذا الإجراء.</p>
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-3 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    حذف المستأجر نهائياً
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
