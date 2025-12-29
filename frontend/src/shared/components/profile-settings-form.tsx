import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User, Shield, Loader2, Trash2, Mail, Phone, Globe, Lock } from 'lucide-react';
import { CircularImageUpload } from '@/shared/components/circularimageupload';
import api from '@/shared/services/api';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { COUNTRIES } from '@/shared/constants';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';

// Props Interface
interface ProfileSettingsFormProps {
    initialData: {
        name?: string;
        email: string;
        avatarUrl?: string | null;
        [key: string]: any;
    };
    apiEndpoint: string;
    isTenant?: boolean; // To handle specific fields like Store Name labelling
    extraFields?: React.ReactNode; // For Country, Whatsapp, etc.
    onSuccess?: (data?: any) => void;
}

// Schemas
const baseObject = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
});

const passwordRefinement = (data: any) => {
    if (data.password && data.password !== data.confirm_password) {
        return false;
    }
    return true;
};

const passwordRefinementOptions = {
    message: "كلمات المرور غير متطابقة",
    path: ["confirm_password"],
};

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
    initialData,
    apiEndpoint,
    isTenant = false,
    extraFields,
    onSuccess
}) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(resolveAssetUrl(initialData.avatarUrl) || null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    // Dynamic Schema based on role
    const formSchema = baseObject.extend({
        name: z.string().min(2, 'الاسم مطلوب'),
        whatsapp: isTenant ? z.string().optional() : z.string().optional(),
        country_code: isTenant ? z.string().optional() : z.string().optional(),
    }).refine(passwordRefinement, passwordRefinementOptions);

    type FormData = z.infer<typeof formSchema>;

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name || '',
            email: initialData.email || '',
            whatsapp: (initialData as any).whatsapp || '',
            country_code: (initialData as any).country_code || '',
        }
    });

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 max-w-6xl mx-auto w-full">
            {/* Section 1: Basic Info */}
            <div className="space-y-10 group">
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

                            <InputField
                                label="البريد الإلكتروني"
                                type="email"
                                {...register('email')}
                                error={errors.email?.message}
                                icon={Mail}
                            />
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
            <div className="space-y-10 group pt-4">
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
        </form>
    );
};
