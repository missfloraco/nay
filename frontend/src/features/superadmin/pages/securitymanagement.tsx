import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Shield, Save, Loader2, MousePointer2, Type, Move, Copy, Terminal, Info, Users, Globe, ShieldAlert } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import { useAction } from '@/shared/contexts/action-context';
import { SettingsService } from '@/shared/services/settingsservice';
import { logger } from '@/shared/services/logger';

export default function SecurityManagement() {
    const { settings, refreshSettings, loading: contextLoading } = useSettings();
    const { showToast } = useToast();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        protect_right_click_admin: false, protect_right_click_app: false, protect_right_click_landing: false,
        protect_selection_admin: false, protect_selection_app: false, protect_selection_landing: false,
        protect_drag_admin: false, protect_drag_app: false, protect_drag_landing: false,
        protect_copy_paste_admin: false, protect_copy_paste_app: false, protect_copy_paste_landing: false,
        protect_devtools_admin: false, protect_devtools_app: false, protect_devtools_landing: false,
    });

    useEffect(() => {
        if (!contextLoading && settings) {
            const newFormData: any = {};
            const features = ['right_click', 'selection', 'drag', 'copy_paste', 'devtools', 'adblock'];
            const scopes = ['admin', 'app', 'landing'];

            features.forEach(f => {
                scopes.forEach(s => {
                    const key = `protect_${f}_${s}`;
                    newFormData[key] = settings[key] === '1' || settings[key] === true;
                });
            });
            setFormData(newFormData);
        }
    }, [settings, contextLoading]);

    const handleToggle = (key: string) => {
        setFormData(prev => ({ ...prev, [key]: !(prev as any)[key] }));
    };

    useEffect(() => {
        setPrimaryAction({
            label: saving ? 'جاري الحفظ...' : 'حفظ إعدادات الحماية',
            onClick: () => handleSubmit(),
            icon: Save,
            loading: saving,
            disabled: saving,
        });

        return () => setPrimaryAction(null);
    }, [saving, formData]);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Convert boolean to '1' or '0' for backend
            const payload = Object.entries(formData).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value ? '1' : '0'
            }), {});

            await SettingsService.updateSettings('admin', payload);
            await refreshSettings();
            showToast('تم تحديث إعدادات الحماية بنجاح', 'success');
        } catch (error: any) {
            logger.error(error);
            showToast(error.response?.data?.message || 'حدث خطأ أثناء الحفظ', 'error');
        } finally {
            setSaving(false);
        }
    };

    const SecurityCard = ({
        id,
        title,
        description,
        icon: Icon,
        featureKey,
        colorClass
    }: {
        id: string,
        title: string,
        description: string,
        icon: any,
        featureKey: string,
        colorClass: string
    }) => {
        const adminKey = `protect_${featureKey}_admin`;
        const appKey = `protect_${featureKey}_app`;
        const landingKey = `protect_${featureKey}_landing`;

        const isAnythingEnabled = (formData as any)[adminKey] || (formData as any)[appKey] || (formData as any)[landingKey];

        return (
            <div
                className={`
                    group relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-700 overflow-hidden
                    ${isAnythingEnabled
                        ? `bg-white dark:bg-dark-900 border-primary shadow-2xl shadow-primary/10`
                        : 'bg-gray-50/50 dark:bg-dark-950/40 border-gray-100 dark:border-dark-800 hover:border-gray-200 dark:hover:border-dark-700'}
                `}
            >
                <div className="flex items-start justify-between mb-8">
                    <div className={`p-4 rounded-2xl ${colorClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isAnythingEnabled ? 'text-primary' : 'text-gray-400'}`}>
                        {isAnythingEnabled ? 'مفعل في بعض الأقسام' : 'غير مفعل بالكامل'}
                    </div>
                </div>

                <div className="space-y-4 relative z-10 mb-8">
                    <h3 className={`text-xl font-black transition-colors duration-500 ${isAnythingEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {title}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 leading-relaxed group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                        {description}
                    </p>
                </div>

                {/* Granular Controls Matrix */}
                <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-dark-800">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">تطبيق على:</span>

                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { key: adminKey, label: 'لوحة تحكم المدير', icon: Shield },
                            { key: appKey, label: 'لوحة المشتركين', icon: Users },
                            { key: landingKey, label: 'الموقع التعريفي', icon: Globe }
                        ].map((scope) => (
                            <label
                                key={scope.key}
                                className={`
                                    flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                                    ${(formData as any)[scope.key]
                                        ? 'bg-primary/5 border-primary/20 text-primary uppercase'
                                        : 'bg-white dark:bg-dark-950 border-gray-100 dark:border-dark-800 text-gray-400 hover:border-gray-200'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <scope.icon size={14} className={(formData as any)[scope.key] ? 'text-primary' : 'text-gray-300'} />
                                    <span className="text-xs font-black">{scope.label}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={(formData as any)[scope.key]}
                                    onChange={() => handleToggle(scope.key)}
                                />
                                <div className={`
                                    w-10 h-5 rounded-full transition-all duration-300 relative flex items-center px-1
                                    ${(formData as any)[scope.key] ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-800'}
                                `}>
                                    <div className={`
                                        w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300
                                        ${(formData as any)[scope.key] ? '-translate-x-[20px]' : 'translate-x-0'}
                                    `} />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {isAnythingEnabled && (
                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] transition-transform duration-1000 group-hover:scale-150 group-hover:rotate-12 pointer-events-none">
                        <Icon size={180} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout
            title="إعدادات الحماية"
            icon={Shield}
            noPadding={true}
        >
            <div className="w-full bg-transparent animate-in fade-in duration-500">
                <div className="mx-auto space-y-12 w-full">
                    {/* Header Removed */}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <SecurityCard
                            id="right-click"
                            featureKey="right_click"
                            title="حماية النقر بالزر الأيمن"
                            description="منع المستخدمين من النقر بالزر الأيمن داخل المنصة لإيقاف الوصول لخيارات النسخ والمعاينة."
                            icon={MousePointer2}
                            colorClass="bg-blue-50 dark:bg-blue-900/10 text-blue-600"
                        />
                        <SecurityCard
                            id="selection"
                            featureKey="selection"
                            title="منع تحديد النصوص"
                            description="منع المستخدمين من تحديد الكلمات والفقرات داخل صفحات المنصة لحماية المحتوى المكتوب."
                            icon={Type}
                            colorClass="bg-purple-50 dark:bg-purple-900/10 text-purple-600"
                        />
                        <SecurityCard
                            id="drag"
                            featureKey="drag"
                            title="منع سحب العناصر"
                            description="إيقاف إمكانية سحب الصور والعناصر التفاعلية لإحباط عمليات الحفظ غير المصرح بها."
                            icon={Move}
                            colorClass="bg-orange-50 dark:bg-orange-900/10 text-orange-600"
                        />
                        <SecurityCard
                            id="copy-paste"
                            featureKey="copy_paste"
                            title="حماية النسخ واللصق"
                            description="تعطيل أوامر النسخ (Ctrl+C) والقص (Ctrl+X) واللصق لمنع تداول البيانات خارج المنصة."
                            icon={Copy}
                            colorClass="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                        />
                        <SecurityCard
                            id="devtools"
                            featureKey="devtools"
                            title="حماية أدوات المطورين"
                            description="منع فتح شاشة الفحص (Inspect) عن طريق تعطيل (F12) ومجموعات أزرار التحكم البرمجية."
                            icon={Terminal}
                            colorClass="bg-rose-50 dark:bg-rose-900/10 text-rose-600"
                        />
                        <SecurityCard
                            id="adblock"
                            featureKey="adblock"
                            title="كاشف مانع الإعلانات"
                            description="منع المستخدمين من الوصول للمحتوى إلا بعد تعطيل مانع الإعلانات، مما يضمن استمرارية دعم المنصة."
                            icon={ShieldAlert}
                            colorClass="bg-red-50 dark:bg-red-900/10 text-red-600"
                        />
                    </div>

                    {/* Bottom Action Bar */}
                </div>
            </div>
        </AdminLayout >
    );
}
