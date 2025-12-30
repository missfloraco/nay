import React, { useState, useEffect } from 'react';
import {
    Save, Play, Ban, CheckCircle, Clock, LogIn, Trash2,
    HardDrive, Users, Shield,
    AlertTriangle, DollarSign, Mail, Fingerprint, Phone, Globe, Image as ImageIcon,
    Loader2, Upload, Key, Calendar, Sparkles, User, LayoutGrid
} from 'lucide-react';
import { formatDate, resolveAssetUrl } from '@/shared/utils/helpers';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { TenantStatusBadge } from './tenantstatusbadge';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import { CircularImageUpload } from '@/shared/components/circularimageupload';
import { COUNTRIES } from '@/shared/constants';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';

interface Tenant {
    id: number;
    uid?: string;
    name: string;
    email?: string;
    whatsapp?: string;
    country_code?: string;
    avatar_url?: string;
    storage_used: string;
    status: 'pending' | 'trial' | 'active' | 'expired' | 'disabled';
    created_at: string;
    users_count?: number;
    trial_expires_at?: string;
    subscription_ends_at?: string;
    onboarding_completed?: boolean;
    admin_email?: string;
    ads_enabled?: boolean;
    email_verified_at?: string;
}

interface TenantDetailsSidebarProps {
    tenant: Tenant | null;
    tenants: Tenant[];
    onSelect: (tenant: Tenant | null) => void;
    onUpdate: () => void;
    onNavigateToPayments: (tenant: Tenant) => void;
}

export function TenantDetailsSidebar({ tenant, tenants, onSelect, onUpdate, onNavigateToPayments }: TenantDetailsSidebarProps) {
    const { showSuccess, showError, showConfirm } = useFeedback();
    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        whatsapp: '',
        country_code: '',
        status: '' as any,
        trial_expires_at: '',
        subscription_ends_at: '',
        password: '',
        ads_enabled: true
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    // Update edit form when tenant changes
    useEffect(() => {
        if (tenant) {
            setEditForm({
                name: tenant.name,
                email: tenant.email || '',
                whatsapp: tenant.whatsapp || '',
                country_code: tenant.country_code || '',
                status: tenant.status,
                trial_expires_at: tenant.trial_expires_at ? tenant.trial_expires_at.split('T')[0] : '',
                subscription_ends_at: tenant.subscription_ends_at ? tenant.subscription_ends_at.split('T')[0] : '',
                password: '',
                ads_enabled: tenant.ads_enabled ?? true
            });
            setAvatarPreview(resolveAssetUrl(tenant.avatar_url));
            setAvatarFile(null);
            setRemoveAvatar(false);
        }
    }, [tenant]);


    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            formData.append('whatsapp', editForm.whatsapp);
            formData.append('country_code', editForm.country_code);

            if (editForm.trial_expires_at) {
                formData.append('trial_expires_at', editForm.trial_expires_at);
            }

            if (editForm.subscription_ends_at) {
                formData.append('subscription_ends_at', editForm.subscription_ends_at);
            }

            if (editForm.status) {
                formData.append('status', editForm.status);
            }

            if (editForm.password) {
                formData.append('admin_password', editForm.password);
            }

            formData.append('ads_enabled', editForm.ads_enabled ? '1' : '0');

            if (removeAvatar) {
                formData.append('remove_avatar', '1');
            } else if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await api.post(`/admin/tenants/${tenant.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
            onUpdate();
        } catch (error: any) {
            showError(error.response?.data?.message || TEXTS_ADMIN.MESSAGES.ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async () => {
        if (!tenant) return;

        const confirmed = await showConfirm({
            title: 'الدخول كمسؤول للنظام (محاكاة)',
            message: `هل أنت متأكد من رغبتك في الدخول إلى نظام المستأجر "${tenant.name}" كمسؤول؟ ستتمكن من عرض لوحة التحكم والبيانات الخاصة به.`,
            confirmLabel: 'دخول ومحاكاة',
            cancelLabel: 'إلغاء'
        });

        if (!confirmed) return;

        try {
            const response = (await api.post(`/admin/tenants/${tenant.id}/impersonate`)) as any;

            if (response.token) {
                window.location.href = `/login?impersonate_token=${response.token}`;
            } else {
                showError('لم يتم الحصول على رمز الدخول');
            }
        } catch (error: any) {
            showError(error.response?.data?.message || 'فشل عملية المحاكاة');
        }
    };

    const handleStatusChange = async (action: 'enable' | 'disable') => {
        if (!tenant) return;
        const confirmResult = await showConfirm({
            title: action === 'enable' ? 'تفعيل المشترك؟' : 'تعطيل المشترك؟',
            message: action === 'enable' ? 'سيتمكن المشترك من الدخول للنظام' : 'سيتم منع المشترك من الدخول للنظام'
        });
        if (!confirmResult) return;

        try {
            await api.post(`/admin/tenants/${tenant.id}/${action}`);
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
            onUpdate();
        } catch (error: any) {
            showError(error.response?.data?.message || TEXTS_ADMIN.MESSAGES.ERROR);
        }
    };

    const handleDelete = async () => {
        if (!tenant) return;
        const confirmResult = await showConfirm({
            title: 'حذف المشترك؟',
            message: 'سيتم نقل المشترك إلى سلة المحذوفات',
            isDestructive: true
        });
        if (!confirmResult) return;

        try {
            await api.delete(`/admin/tenants/${tenant.id}`);
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
            onUpdate();
            onSelect(null); // Close modal on delete
        } catch (error: any) {
            showError(error.response?.data?.message || TEXTS_ADMIN.MESSAGES.ERROR);
        }
    };

    const handleAvatarChange = (file: File) => {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setRemoveAvatar(false);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(true);
    };

    const countryOptions = [
        ...COUNTRIES.map(c => ({ value: c.code, label: c.name })),
        { value: 'other', label: 'أخرى' }
    ];

    if (!tenant) return null;

    return (
        <form onSubmit={handleUpdateDetails} className="flex flex-col h-full">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">

                {/* Right Column: Identity & Actions (5 units) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Identity Card */}
                    <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 flex flex-col items-center text-center gap-4">
                        <CircularImageUpload
                            image={avatarPreview}
                            onImageChange={handleAvatarChange}
                            onRemove={handleRemoveAvatar}
                            uploadId="tenant-avatar-upload"
                            size="md"
                            variant="square"
                        />
                        <div className="space-y-1">
                            <h2 className="font-black text-gray-900 dark:text-white text-lg">{tenant.name}</h2>
                            <div className="flex items-center justify-center gap-2">
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    {tenant.email}
                                </div>
                                {tenant.email_verified_at ? (
                                    <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        مؤكد
                                    </div>
                                ) : (
                                    <div className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                        غير مؤكد
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ad Control Section */}
                        <div className="w-full mt-2 p-4 rounded-2xl bg-white dark:bg-dark-900 shadow-sm border border-gray-100/50 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${editForm.ads_enabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400 opacity-50'}`}>
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">الإعلانات الممولة</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                        {editForm.ads_enabled ? 'مفعلة' : 'معطلة'}
                                    </div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editForm.ads_enabled}
                                    onChange={(e) => setEditForm({ ...editForm, ads_enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">إجراءات سريعة</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => tenant && onNavigateToPayments(tenant)}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all text-xs font-bold font-black"
                            >
                                <DollarSign className="w-4 h-4" />
                                سجل الدفعات
                            </button>
                            <button
                                type="button"
                                onClick={handleImpersonate}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all text-xs font-bold font-black"
                            >
                                <LogIn className="w-4 h-4" />
                                محاكاة المسؤول
                            </button>
                            {tenant.status !== 'disabled' ? (
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('disable')}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all text-xs font-bold font-black"
                                >
                                    <Ban className="w-4 h-4" />
                                    تعطيل الحساب
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('enable')}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all text-xs font-bold font-black"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    تفعيل الحساب
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all text-xs font-bold font-black"
                            >
                                <Trash2 className="w-4 h-4" />
                                حذف المشترك
                            </button>
                        </div>
                    </div>

                </div>

                {/* Left Column: Form Sections (7 units) */}
                <div className="lg:col-span-7 space-y-8 overflow-y-auto custom-scrollbar p-1">

                    {/* Account Details */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                            <User className="w-5 h-5 text-primary" />
                            بيانات الحساب الأساسية
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="اسم المتجر / المؤسسة"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                icon={LayoutGrid}
                                required
                            />
                            <InputField
                                label="البريد الإلكتروني"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                icon={Mail}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="واتساب التواصل"
                                type="tel"
                                value={editForm.whatsapp}
                                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                                icon={Phone}
                                className="ltr"
                            />
                            <SelectField
                                label="الدولة"
                                value={editForm.country_code}
                                onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value })}
                                options={countryOptions}
                                icon={Globe}
                            />
                        </div>
                    </div>

                    {/* Subscription & Password */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            الاشتراك والأمان
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setEditForm({ ...editForm, status: 'trial' })}
                                className={`py-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${editForm.status === 'trial' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-gray-50/50 text-gray-400 opacity-60'}`}
                            >
                                <Clock className="w-4 h-4" />
                                فترة تجريبية
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditForm({ ...editForm, status: 'active' })}
                                className={`py-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${editForm.status === 'active' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-gray-50 bg-gray-50/50 text-gray-400 opacity-60'}`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                اشتراك نشط
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="تاريخ نهاية التجربة"
                                type="date"
                                value={editForm.trial_expires_at}
                                onChange={(e) => setEditForm({ ...editForm, trial_expires_at: e.target.value })}
                                icon={Calendar}
                            />
                            <InputField
                                label="تاريخ نهاية الاشتراك"
                                type="date"
                                value={editForm.subscription_ends_at}
                                onChange={(e) => setEditForm({ ...editForm, subscription_ends_at: e.target.value })}
                                icon={Calendar}
                            />
                        </div>

                        <div className="pt-2">
                            <InputField
                                label="تغيير كلمة المرور"
                                type="password"
                                placeholder="اتركه فارغاً للتجاهل"
                                value={editForm.password}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                icon={Key}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-white/5">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-4 font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 group"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    حفظ التعديلات
                </button>
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className="px-8 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl py-4 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                    إلغاء
                </button>
            </div>
        </form>
    );
}
