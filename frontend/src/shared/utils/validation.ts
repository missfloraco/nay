import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
    password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

export const RegisterSchema = z.object({
    fullName: z.string().min(3, { message: "الاسم الكامل يجب أن يكون 3 أحرف على الأقل" }),
    email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
    phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
    password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    country: z.string().min(2, { message: "الرجاء اختيار الدولة" }),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
});

export const SettingsSchema = z.object({
    name: z.string().min(2, { message: "الاسم مطلوب" }),
    email: z.string().email({ message: "بريد إلكتروني غير صحيح" }),
    whatsapp: z.string().regex(/^\+?[0-9]{7,15}$/, { message: "رقم الهاتف غير صالح" }).optional().or(z.literal('')),
    country_code: z.string().optional(),
    new_password: z.string().min(6, { message: "كلمة المرور الجديدة قصيرة جداً" }).optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.new_password && data.new_password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirm_password"],
});
