import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, Layout, List, MessageSquare, Image as ImageIcon, Plus, Trash2, Home, Type, MousePointer2 } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useAction } from '@/shared/contexts/action-context';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import { SettingsService } from '@/shared/services/settingsservice';
import { logger } from '@/shared/services/logger';
import InputField from '@/shared/ui/forms/input-field';
import TextareaField from '@/shared/ui/forms/textarea-field';

export default function LandingManagement() {
    const { settings, updateSettings } = useSettings();
    const { showSuccess, showError } = useNotifications();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);

    // Initial State for Features and FAQ with safe parsing
    const parseJSON = (str: any, fallback: any) => {
        try {
            if (!str) return fallback;
            const parsed = typeof str === 'string' ? JSON.parse(str) : str;
            return Array.isArray(parsed) ? parsed : fallback;
        } catch (e) {
            logger.error('JSON Parse error:', e);
            return fallback;
        }
    };

    const [formData, setFormData] = useState({
        landing_hero_title: settings.landing_hero_title || '',
        landing_hero_subtitle: settings.landing_hero_subtitle || '',
        landing_hero_cta: settings.landing_hero_cta || '',
        landing_hero_image: settings.landing_hero_image || '',
        landing_footer_text: settings.landing_footer_text || '',
    });

    const [features, setFeatures] = useState<any[]>(() => parseJSON(settings.landing_features, []));
    const [faqs, setFaqs] = useState<any[]>(() => parseJSON(settings.landing_faq, []));

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                landing_features: JSON.stringify(features),
                landing_faq: JSON.stringify(faqs),
            };
            // Directly use updateSettings from useSettings which handles service call and refresh
            await updateSettings(dataToSave);
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
        } catch (error) {
            logger.error('Error saving landing settings:', error);
            showError(TEXTS_ADMIN.MESSAGES.ERROR);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPrimaryAction({
            label: saving ? 'جاري الحفظ...' : 'حفظ إعدادات الصفحة الرئيسية',
            onClick: () => handleSubmit(),
            icon: Save,
            loading: saving,
            variant: 'primary'
        });
        return () => setPrimaryAction(null);
    }, [saving, formData, features, faqs]);

    const addFeature = () => setFeatures([...features, { title: '', description: '' }]);
    const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
    const updateFeature = (index: number, field: string, value: string) => {
        const newFeatures = [...features];
        newFeatures[index][field] = value;
        setFeatures(newFeatures);
    };

    const addFAQ = () => setFaqs([...faqs, { question: '', answer: '' }]);
    const removeFAQ = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
    const updateFAQ = (index: number, field: string, value: string) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    return (
        <AdminLayout title="إدارة الصفحة الرئيسية" noPadding={true}>
            <div className="w-full max-w-[1600px] mx-auto bg-transparent animate-in fade-in duration-500">
                <div className="max-w-7xl mx-auto space-y-12 w-full">
                    <div className="flex items-center gap-6 border-b border-gray-100 dark:border-dark-800 pb-8 group">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                            <Home className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">إدارة الصفحة الرئيسية</h3>
                            <p className="text-base font-bold text-gray-400 dark:text-gray-500">تخصيص محتوى الصفحة التعريفية (Landing Page)</p>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="premium-card p-10 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center gap-6 mb-10 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-primary/20">
                            <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover/card:rotate-6 transition-all duration-500 shadow-sm">
                                <Layout className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">قسم البرواز (Hero)</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-2">تعديل المحتوى الرئيسي الذي يظهر في أعلى الصفحة</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="grid gap-8">
                                <InputField
                                    label="العنوان الرئيسي"
                                    value={formData.landing_hero_title}
                                    onChange={e => setFormData({ ...formData, landing_hero_title: e.target.value })}
                                    placeholder="مثال: منصة SaaS المتكاملة"
                                    icon={Type}
                                />
                                <TextareaField
                                    label="العنوان الفرعي"
                                    value={formData.landing_hero_subtitle}
                                    onChange={e => setFormData({ ...formData, landing_hero_subtitle: e.target.value })}
                                    placeholder="وصف مختصر للمنصة..."
                                    className="min-h-[160px]"
                                    icon={MessageSquare}
                                />
                            </div>
                            <div className="grid gap-8">
                                <InputField
                                    label="نص زر الإجراء (CTA)"
                                    value={formData.landing_hero_cta}
                                    onChange={e => setFormData({ ...formData, landing_hero_cta: e.target.value })}
                                    placeholder="مثال: ابدأ الآن"
                                    icon={MousePointer2}
                                />
                                <InputField
                                    label="رابط الصورة الرئيسية"
                                    value={formData.landing_hero_image}
                                    onChange={e => setFormData({ ...formData, landing_hero_image: e.target.value })}
                                    placeholder="https://example.com/hero.png"
                                    className="ltr"
                                    icon={ImageIcon}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="premium-card p-10 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-10 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-emerald-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover/card:-rotate-6 transition-all duration-500 shadow-sm">
                                    <List className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">المميزات</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-2">إدارة قائمة المميزات التي تظهر في الصفحة الرئيسية</p>
                                </div>
                            </div>
                            <button
                                onClick={addFeature}
                                className="w-14 h-14 rounded-2xl bg-emerald-600 text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center group/btn"
                            >
                                <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="p-8 rounded-[2rem] bg-gray-50/50 dark:bg-dark-900/30 border border-gray-100 dark:border-dark-800 space-y-6 relative group transition-all hover:border-primary/20 hover:bg-white dark:hover:bg-dark-900 overflow-hidden">
                                    <button
                                        onClick={() => removeFeature(index)}
                                        className="absolute top-4 left-4 p-2.5 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl z-20"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="space-y-6">
                                        <InputField
                                            label="عنوان الميزة"
                                            value={feature.title}
                                            onChange={e => updateFeature(index, 'title', e.target.value)}
                                            placeholder="أدخل عنوان الميزة"
                                        />
                                        <TextareaField
                                            label="وصف الميزة"
                                            value={feature.description}
                                            onChange={e => updateFeature(index, 'description', e.target.value)}
                                            placeholder="أدخل وصفاً مفصلاً للميزة"
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="premium-card p-10 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-10 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-purple-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover/card:rotate-12 transition-all duration-500 shadow-sm">
                                    <MessageSquare className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">الأسئلة الشائعة</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-2">إدارة الأسئلة والإجابات الأكثر شيوعاً</p>
                                </div>
                            </div>
                            <button
                                onClick={addFAQ}
                                className="w-14 h-14 rounded-2xl bg-purple-600 text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center group/btn"
                            >
                                <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {faqs.map((faq, index) => (
                                <div key={index} className="p-8 rounded-[2rem] bg-gray-50/50 dark:bg-dark-900/30 border border-gray-100 dark:border-dark-800 space-y-6 relative group transition-all hover:border-primary/20 hover:bg-white dark:hover:bg-dark-900 overflow-hidden">
                                    <button
                                        onClick={() => removeFAQ(index)}
                                        className="absolute top-4 left-4 p-2.5 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl z-20"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="space-y-6">
                                        <InputField
                                            label="السؤال"
                                            value={faq.question}
                                            onChange={e => updateFAQ(index, 'question', e.target.value)}
                                            placeholder="أدخل نص السؤال"
                                        />
                                        <TextareaField
                                            label="الإجابة"
                                            value={faq.answer}
                                            onChange={e => updateFAQ(index, 'answer', e.target.value)}
                                            placeholder="أدخل الإجابة المفصلة"
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
