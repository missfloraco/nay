import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User, Shield, Loader2, Trash2, Mail, Phone, Globe, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '@/shared/services/api';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';
import { CircularImageUpload } from '@/shared/components/circularimageupload';
import { COUNTRIES } from '@/shared/constants';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';

const resolveAssetUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path}`;
};

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
    const { showToast } = useFeedback();
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

    const { isTrialActive } = useTrialStatus();

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
            showToast('تم تحديث البريد الإلكتروني بنجاح', 'success');
            setShowOTPModal(false);
            setOtpCode(['', '', '', '', '', '']);
            // Trigger success to update local state in parent
            onSuccess?.({ ...initialData, email: pendingEmail || initialData.email });
        } catch (err: any) {
            showToast(err.response?.data?.message || 'رمز التحقق غير صحيح', 'error');
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
                showToast(response.message, 'info');
                return;
            }

            if (response.bonus_message) {
                showToast(response.bonus_message, 'success');
            } else {
                showToast('تم تحديث الملف الشخصي بنجاح', 'success');
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
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const countryOptions = COUNTRIES.map(c => ({ value: c.code, label: c.name }));

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-12 w-full">
            {/* Section 1: Basic Info */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none group space-y-10">
                <div className="flex items-center gap-6 border-b border-gray-50 dark:border-dark-800 pb-8 transition-colors group-hover:border-primary/20">
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-[2rem] text-primary shadow-inner">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">المعلومات الشخصية</h3>
                        <p className="text-base font-bold text-gray-400 group-hover:text-gray-500 dark:text-gray-500 transition-colors">تحديث بياناتك الشخصية وصورة الحساب</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
                    <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-dark-900/40 border border-gray-100 dark:border-dark-800 backdrop-blur-sm">
                        <CircularImageUpload
                            image={avatarPreview}
                            onImageChange={handleImageChange}
                            onRemove={handleRemoveAvatar}
                            uploadId="profile-avatar-upload"
                            label="صورة الحساب"
                            size="xl"
                            variant="circle"
                        />
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">انقر لتغيير الصورة</span>
                    </div>

                    <div className="space-y-8 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField
                                label={isTenant ? 'اسم المتجر' : 'الاسم الكامل'}
                                {...register('name')}
                                error={errors.name?.message}
                                icon={User}
                            />

                            <div className="space-y-4">
                                <InputField
                                    label="البريد الإلكتروني"
                                    type="email"
                                    {...register('email')}
                                    error={errors.email?.message}
                                    icon={Mail}
                                    labelExtras={
                                        (initialData as any).email_verified_at && emailValue === initialData.email ? (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-500/20 whitespace-nowrap animate-in fade-in zoom-in-95" title="البريد الإلكتروني مؤكد">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>مؤكد</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full border border-amber-100 dark:border-amber-500/20 whitespace-nowrap animate-in fade-in zoom-in-95" title="البريد الإلكتروني غير مؤكد">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>غير مؤكد</span>
                                            </div>
                                        )
                                    }
                                />

                                {emailValue !== initialData.email && (
                                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-in fade-in slide-in-from-top-1">
                                        * سيتم إرسال رمز تحقق للبريد الجديد لتأكيد التغيير
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tenant-specific fields */}
                        {isTenant && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50 dark:border-dark-800/50">
                                <InputField
                                    label="رقم الواتساب"
                                    type="tel"
                                    {...register('whatsapp')}
                                    className="ltr"
                                    placeholder="059xxxxxxx"
                                    icon={Phone}
                                />
                                <SelectField
                                    label="الدولة"
                                    {...register('country_code')}
                                    options={[{ value: '', label: 'اختر الدولة' }, ...countryOptions]}
                                    icon={Globe}
                                />
                            </div>
                        )}

                        {/* Extra Fields Slot */}
                        {extraFields && (
                            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                {extraFields}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Security */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none group space-y-10">
                <div className="flex items-center gap-6 border-b border-gray-50 dark:border-dark-800 pb-8 transition-colors group-hover:border-red-500/20">
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-[2rem] text-red-600 shadow-inner">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">الأمان وكلمة المرور</h3>
                        <p className="text-base font-bold text-gray-400 group-hover:text-gray-500 dark:text-gray-500 transition-colors">تحديث بيانات الدخول وحماية الحساب</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    <InputField
                        label="كلمة المرور الجديدة"
                        type="password"
                        {...register('password')}
                        placeholder="••••••••"
                        icon={Lock}
                    />
                    <InputField
                        label="تأكيد كلمة المرور"
                        type="password"
                        {...register('confirm_password')}
                        error={errors.confirm_password?.message}
                        placeholder="••••••••"
                        icon={Lock}
                    />
                </div>
            </div>

            {!hideAction && (
                <div className="pt-12 border-t border-gray-100 dark:border-dark-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-12 h-16 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-black shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 min-w-[240px] text-lg"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        <span>حفظ التعديلات</span>
                    </button>
                </div>
            )}
            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-md" onClick={() => setShowOTPModal(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-dark-800 p-10 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-[1.5rem] text-primary">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">تأكيد البريد الإلكتروني</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                أدخل الرمز المرسل إلى بريدك الجديد <br />
                                <span className="text-gray-900 dark:text-white font-bold">{pendingEmail}</span>
                            </p>
                        </div>

                        <div className="mt-10 flex justify-between gap-2" dir="ltr">
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
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                        if (pastedData) {
                                            const newCode = [...otpCode];
                                            pastedData.split('').forEach((char, i) => {
                                                if (i < 6) newCode[i] = char;
                                            });
                                            setOtpCode(newCode);
                                            // Focus last filled or next empty
                                            const lastIdx = Math.min(pastedData.length - 1, 5);
                                            document.getElementById(`profile-otp-${lastIdx}`)?.focus();
                                        }
                                    }}
                                    className="w-12 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-800 rounded-2xl transition-all outline-none"
                                    autoFocus={idx === 0}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            disabled={verifyingOTP || otpCode.join('').length !== 6}
                            onClick={() => handleOTPVerify(otpCode.join(''))}
                            className="w-full mt-10 h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {verifyingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span>تأكيد التغيير</span>
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
