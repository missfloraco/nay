import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User, Shield, Loader2, Trash2, Mail, Phone, Globe, Lock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import api from '@/shared/services/api';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';
import { CircularImageUpload } from '@/shared/components/circularimageupload';
import { COUNTRIES } from '@/shared/constants';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

const formSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    whatsapp: z.string().optional(),
    country_code: z.string().optional(),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
}).refine((data) => {
    if (data.password && data.password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirm_password"],
});

type FormData = z.infer<typeof formSchema>;

interface ProfileSettingsFormProps {
    initialData: {
        name: string;
        email: string;
        avatarUrl?: string | null;
        whatsapp?: string;
        country_code?: string;
        [key: string]: any;
    };
    apiEndpoint: string;
    isTenant?: boolean;
    extraFields?: React.ReactNode;
    onSuccess?: (data: any) => void;
    formRef?: React.RefObject<HTMLFormElement>;
    hideAction?: boolean;
}

export default function ProfileSettingsForm({
    initialData,
    apiEndpoint,
    isTenant = false,
    extraFields,
    onSuccess,
    formRef,
    hideAction = false
}: ProfileSettingsFormProps) {
    const { showSuccess, showError, showInfo } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(resolveAssetUrl(initialData.avatarUrl));
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [verifyingOTP, setVerifyingOTP] = useState(false);

    const tenantAuth = useTenantAuth();

    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name || '',
            email: initialData.email || '',
            whatsapp: initialData.whatsapp || '',
            country_code: initialData.country_code || '',
        }
    });

    const emailValue = watch('email');

    // Update form when initialData details change
    useEffect(() => {
        setValue('email', initialData.email || '');
        setValue('name', initialData.name || '');
        if (isTenant) {
            setValue('whatsapp', (initialData as any).whatsapp || '');
            setValue('country_code', (initialData as any).country_code || '');
        }
        setAvatarPreview(resolveAssetUrl(initialData.avatarUrl));
    }, [initialData, isTenant, setValue]);


    const handleImageChange = (file: File) => {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setRemoveAvatar(false);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(true);
    };

    const handleOTPVerify = async (code: string) => {
        if (code.length !== 6 || verifyingOTP) return;
        setVerifyingOTP(true);
        try {
            await tenantAuth.verifyProfileEmail(code);
            showSuccess('تم تحديث البريد الإلكتروني بنجاح');
            setShowOTPModal(false);
            setOtpCode(['', '', '', '', '', '']);
            // Trigger success to update local state in parent
            onSuccess?.({ ...initialData, email: pendingEmail || initialData.email });
        } catch (err: any) {
            showError(err.response?.data?.message || 'رمز التحقق غير صحيح');
        } finally {
            setVerifyingOTP(false);
        }
    };

    // Auto-submit when code is full
    useEffect(() => {
        const fullCode = otpCode.join('');
        if (showOTPModal && fullCode.length === 6) {
            handleOTPVerify(fullCode);
        }
    }, [otpCode, showOTPModal]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', data.email);
            formData.append('name', data.name);

            if (isTenant) {
                formData.append('whatsapp', data.whatsapp || '');
                formData.append('country_code', data.country_code || '');
            }

            if (data.password) {
                if (isTenant) {
                    formData.append('new_password', data.password);
                } else {
                    formData.append('password', data.password);
                }
            }

            if (removeAvatar) {
                formData.append('remove_avatar', '1');
            } else if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await api.post(apiEndpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }) as any;

            if (response.require_verification) {
                setPendingEmail(response.pending_email);
                setShowOTPModal(true);
                showInfo(response.message);
                return;
            }

            if (response.bonus_message) {
                showSuccess(response.bonus_message);
            } else {
                showSuccess('تم تحديث الملف الشخصي بنجاح');
            }

            // Construct the optimistic object
            const optimisticData = { ...data };
            if (avatarFile) {
                optimisticData.avatarUrl = URL.createObjectURL(avatarFile);
            } else if (removeAvatar) {
                optimisticData.avatarUrl = null;
            }

            onSuccess?.(optimisticData);
            reset({ ...data, password: '', confirm_password: '' }); // Clear passwords

        } catch (error: any) {
            const message = error.response?.data?.message || 'حدث خطأ أثناء الحفظ';
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    const countryOptions = COUNTRIES.map(c => ({ value: c.code, label: c.name }));

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-10 w-full">
            {/* 
                ==========================================================================
                SECTION 1: Identity & Profile Photo
                ========================================================================== 
            */}
            <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-10 lg:p-14 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                <div className="relative flex flex-col items-center justify-center gap-10">
                    {/* Floating Avatar Interaction */}
                    <div className="relative group/avatar">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-secondary opacity-20 group-hover/avatar:opacity-40 rounded-full blur-xl transition-opacity animate-pulse" />
                        <CircularImageUpload
                            image={avatarPreview}
                            onImageChange={handleImageChange}
                            onRemove={handleRemoveAvatar}
                            uploadId="profile-avatar-upload"
                            label="تغيير الصورة"
                            size="xl"
                            variant="circle"
                        />
                    </div>

                    <div className="w-full space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InputField
                                label={isTenant ? 'اسم المتجر' : 'الاسم الكامل'}
                                {...register('name')}
                                error={errors.name?.message}
                                icon={User}
                                placeholder="أدخل اسمك هنا"
                                className="bg-gray-50/50 dark:bg-dark-950/50 border-gray-100 dark:border-white/5 rounded-[1.5rem]"
                            />

                            <div className="space-y-4">
                                <InputField
                                    label="البريد الإلكتروني الحساب"
                                    type="email"
                                    {...register('email')}
                                    error={errors.email?.message}
                                    icon={Mail}
                                    placeholder="your@email.com"
                                    className="bg-gray-50/50 dark:bg-dark-950/50 border-gray-100 dark:border-white/5 rounded-[1.5rem]"
                                    labelExtras={
                                        (initialData as any).email_verified_at && emailValue === initialData.email && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20 shadow-sm animate-in fade-in zoom-in-95">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="uppercase tracking-widest">موثق</span>
                                            </div>
                                        )
                                    }
                                />
                                {emailValue !== initialData.email && (
                                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100/50 dark:border-amber-500/10 animate-in slide-in-from-top-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <p className="text-[10px] font-bold leading-tight">تنبيه: سيطلب منك تأكيد البريد الجديد فوراً بعد الحفظ.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tenant-specific Advanced Details */}
                        {isTenant && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50 dark:border-white/5">
                                <InputField
                                    label="رقم الواتساب للتواصل"
                                    type="tel"
                                    {...register('whatsapp')}
                                    className="ltr bg-gray-50/50 dark:bg-dark-950/50 border-gray-100 dark:border-white/5 rounded-[1.5rem]"
                                    placeholder="05xxxxxxx"
                                    icon={Phone}
                                    hint="يستخدم للتواصل البرمجي وأتمتة الطلبات"
                                />
                                <SelectField
                                    label="الدولة / المنطقة الزمنية"
                                    {...register('country_code')}
                                    options={[{ value: '', label: 'اختر الدولة' }, ...countryOptions]}
                                    icon={Globe}
                                    className="bg-gray-50/50 dark:bg-dark-950/50 border-gray-100 dark:border-white/5 rounded-[1.5rem]"
                                />
                            </div>
                        )}

                        {extraFields && (
                            <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                {extraFields}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 
                ==========================================================================
                SECTION 2: Security & Credentials
                ========================================================================== 
            */}
            <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-10 lg:p-14 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none group overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col gap-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4.5 bg-red-50 dark:bg-red-500/10 rounded-[1.75rem] text-red-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">الأمان وكلمة المرور</h3>
                            <p className="text-sm font-bold text-gray-400 dark:text-gray-500">اتركه فارغاً إذا كنت لا ترغب في التغيير</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputField
                            label="كلمة المرور الجديدة"
                            type="password"
                            {...register('password')}
                            placeholder="••••••••••••"
                            icon={Lock}
                            className="bg-gray-50/50 dark:bg-dark-950/50 border-gray-100 dark:border-white/5 rounded-[1.5rem]"
                        />
                        <InputField
                            label="تأكيد كلمة المرور"
                            type="password"
                            {...register('confirm_password')}
                            error={errors.confirm_password?.message}
                            placeholder="••••••••••••"
                            icon={Lock}
                            className="bg-gray-50/50 dark:bg-dark-950/50 border-gray-100 dark:border-white/5 rounded-[1.5rem]"
                        />
                    </div>
                </div>
            </div>

            {!hideAction && (
                <div className="pt-10 flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        variant="primary"
                        className="w-full md:w-auto px-16 h-18 bg-primary hover:bg-primary-hover text-white text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        icon={Save}
                    >
                        تحديث الملف الشخصي
                    </Button>
                </div>
            )}

            {/* 
                ==========================================================================
                OTP VERIFICATION MODAL - High End Experience
                ========================================================================== 
            */}
            {showOTPModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-dark-950/40 animate-in fade-in duration-500">
                    <div className="absolute inset-0" onClick={() => setShowOTPModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-dark-900 rounded-[3.5rem] shadow-3xl border border-gray-100 dark:border-white/10 p-12 lg:p-16 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative text-center space-y-10">
                            <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-[2.5rem] text-primary shadow-inner">
                                <Mail className="w-10 h-10" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">تأكيد البريد الإلكتروني</h3>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 max-w-[300px] mx-auto leading-relaxed">
                                    أدخل الرمز المكون من 6 أرقام المرسل إلى: <br />
                                    <span className="text-gray-900 dark:text-white font-black underline decoration-primary decoration-2 underline-offset-4">{pendingEmail}</span>
                                </p>
                            </div>

                            <div className="flex justify-between gap-3" dir="ltr">
                                {otpCode.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`profile-otp-${idx}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(-1);
                                            const newCode = [...otpCode];
                                            newCode[idx] = val;
                                            setOtpCode(newCode);
                                            if (val && idx < 5) document.getElementById(`profile-otp-${idx + 1}`)?.focus();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !digit && idx > 0) document.getElementById(`profile-otp-${idx - 1}`)?.focus();
                                        }}
                                        className="w-full aspect-[2/3] text-center text-3xl font-black bg-gray-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-800 rounded-2xl transition-all outline-none shadow-sm"
                                        autoFocus={idx === 0}
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    disabled={verifyingOTP || otpCode.join('').length !== 6}
                                    onClick={() => handleOTPVerify(otpCode.join(''))}
                                    className="w-full h-18 bg-primary text-white rounded-[1.75rem] text-lg font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-6"
                                >
                                    {verifyingOTP ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                                    <span>إكمال التأكيد الآن</span>
                                </button>
                                <button
                                    onClick={() => setShowOTPModal(false)}
                                    className="text-xs font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                                >
                                    إلغاء وتعديل البريد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
