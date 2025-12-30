import React, { useState, useEffect } from 'react';
import {
    X, Save, Play, Ban, CheckCircle, Clock, LogIn, Trash2,
    HardDrive, Users, Shield,
    AlertTriangle, DollarSign, Mail, Fingerprint, Phone, Globe, Image as ImageIcon,
    Loader2, Upload, Key, Calendar
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
    onSelect: (tenant: Tenant) => void;
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
                trial_expires_at: tenant.trial_expires_at ? tenant.trial_expires_at.split('T')[0] : '', // Format for date input
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
            formData.append('_method', 'PUT'); // For spoofing PUT in multipart/form-data
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
                // Navigate to tenant app with impersonation token
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

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden relative">
            {/* Sidebar Header: Identity & Selection */}
            {tenant ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">

                    {/* Scrollable Content: Editable Form */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <form id="tenant-details-form" onSubmit={handleUpdateDetails} className="pb-32">
                            {/* Minimal Header with Horizontal Identity: Matches Table Style */}
                            <div className="py-6 px-8 flex items-center gap-4 bg-gray-50/30 dark:bg-gray-900/10 border-b border-gray-100 dark:border-white/5">
                                <CircularImageUpload
                                    image={avatarPreview}
                                    onImageChange={handleAvatarChange}
                                    onRemove={handleRemoveAvatar}
                                    uploadId="tenant-avatar-upload"
                                    size="xs"
                                    variant="square"
                                    className="!gap-0"
                                />
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                    <h2 className="font-black text-gray-900 dark:text-white text-base truncate">{tenant.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                                            <Mail className="w-3 h-3 opacity-50" />
                                            {tenant.email}
                                        </div>
                                        {tenant.email_verified_at ? (
                                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                                <CheckCircle className="w-2 h-2" />
                                                <span>مؤكد</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/20">
                                                <AlertTriangle className="w-2 h-2" />
                                                <span>غير مؤكد</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Sections */}
                            <div className="space-y-0.5 mt-4">
                                {/* Row: Account Status */}
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                                        <Shield className="w-4 h-4" />
                                        حالة الحساب والاشتراك
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, status: 'trial' })}
                                            className={`py-4 rounded-2xl border-2 transition-all font-black text-xs flex items-center justify-center gap-2 ${editForm.status === 'trial' ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}
                                        >
                                            <Clock className="w-4 h-4" />
                                            فترة تجريبية
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, status: 'active' })}
                                            className={`py-4 rounded-2xl border-2 transition-all font-black text-xs flex items-center justify-center gap-2 ${editForm.status === 'active' ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/5' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            اشتراك مفعّل
                                        </button>
                                    </div>
                                </div>

                                {/* Row: Expiration Dates */}
                                <div className="p-8 pt-0 grid grid-cols-1 gap-6">
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

                                {/* Row: Contact Trio */}
                                <div className="p-8 pt-0 flex flex-col gap-6">
                                    <InputField
                                        label="واتساب التواصل"
                                        type="tel"
                                        value={editForm.whatsapp}
                                        onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                                        icon={Phone}
                                        className="ltr"
                                    />
                                    <SelectField
                                        label="الدولة والمنطقة"
                                        value={editForm.country_code}
                                        onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value })}
                                        options={countryOptions}
                                        icon={Globe}
                                    />
                                </div>

                                {/* Row: Ad Control Status */}
                                <div className="mx-8 p-6 rounded-3xl bg-blue-50/30 dark:bg-blue-900/10 flex items-center justify-between border border-blue-100/50 dark:border-blue-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${editForm.ads_enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-dark-700 text-gray-400 opacity-50'}`}>
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-gray-900 dark:text-gray-100">الإعلانات الممولة</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                {editForm.ads_enabled ? 'مفعلة للمشترك' : 'معطلة للمشترك'}
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
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-inner transition-all"></div>
                                    </label>
                                </div>

                                {/* Row: Security / Password */}
                                <div className="p-8">
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
                        </form>
                    </div>

                    {/* Action Buttons: Sticky Bottom Footer */}
                    <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0 z-30">
                        <div className="flex flex-col gap-3">
                            {/* Primary Save Button - Restored Priority */}
                            <button
                                type="submit"
                                form="tenant-details-form"
                                disabled={loading}
                                className="w-full py-4.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black hover:opacity-90 disabled:opacity-50 text-sm flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                                <span className="tracking-wide">حفظ كل التعديلات</span>
                            </button>

                            {/* Secondary Quick Actions */}
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => tenant && onNavigateToPayments(tenant)}
                                    title="سجل الدفعات"
                                    className="aspect-square flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-all group"
                                >
                                    <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={handleImpersonate}
                                    title="دخول كمسؤول (محاكاة)"
                                    className="aspect-square flex flex-col items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl hover:bg-blue-100 transition-all group"
                                >
                                    <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                {tenant.status !== 'disabled' ? (
                                    <button
                                        onClick={() => handleStatusChange('disable')}
                                        title="تعطيل المشترك"
                                        className="aspect-square flex flex-col items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-2xl hover:bg-gray-200 transition-all group"
                                    >
                                        <Ban className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange('enable')}
                                        title="تفعيل المشترك"
                                        className="aspect-square flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-all group"
                                    >
                                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    title="حذف المشترك"
                                    className="aspect-square flex flex-col items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl hover:bg-red-100 transition-all group"
                                >
                                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 text-center p-12">
                    <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-900/50 mb-8 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
                        <Users className="w-10 h-10 opacity-20" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">إدارة المشتركين</h3>
                    <p className="text-sm text-gray-400 max-w-[240px] leading-relaxed font-bold">
                        اختر أحد المشتركين من القائمة لعرض تفاصيل حسابه وإدارة اشتراكاته.
                    </p>
                </div>
            )}
        </div>
    );
}
