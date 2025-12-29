import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, Layout, List, MessageSquare, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import { useAction } from '@/shared/contexts/action-context';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import { SettingsService } from '@/shared/services/settingsservice';
import { logger } from '@/shared/services/logger';

export default function LandingManagement() {
    const { settings, updateSettings } = useSettings();
    const { showToast } = useToast();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);

    // Initial State for Features and FAQ
    const initialFeatures = settings.landing_features ? JSON.parse(settings.landing_features as string) : [];
    const initialFAQ = settings.landing_faq ? JSON.parse(settings.landing_faq as string) : [];

    const [formData, setFormData] = useState({
        landing_hero_title: settings.landing_hero_title || '',
        landing_hero_subtitle: settings.landing_hero_subtitle || '',
        landing_hero_cta: settings.landing_hero_cta || '',
        landing_hero_image: settings.landing_hero_image || '',
        landing_footer_text: settings.landing_footer_text || '',
    });

    const [faqs, setFaqs] = useState<any[]>(initialFAQ);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                landing_features: JSON.stringify(features),
                landing_faq: JSON.stringify(faqs),
            };
            await SettingsService.updateSettings('admin', dataToSave);
            await updateSettings({});
            showToast(TEXTS_ADMIN.MESSAGES.SUCCESS, 'success');
        } catch (error) {
            logger.error('Error loading dashboard data:', error);
            showToast(TEXTS_ADMIN.MESSAGES.ERROR, 'error');
        } finally {
            setSaving(false);
        }
    };
    const [features, setFeatures] = useState<any[]>(initialFeatures);

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
            <div className="h-full w-full bg-white dark:bg-dark-950 p-6 lg:p-12 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12 w-full pb-20">
                    <div className="flex items-center gap-6 border-b border-gray-100 dark:border-dark-800 pb-8 group">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                            <Layout className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">إدارة الصفحة الرئيسية</h3>
                            <p className="text-base font-bold text-gray-400 dark:text-gray-500">تخصيص محتوى الصفحة التعريفية (Landing Page)</p>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-primary/20">
                            <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover/card:rotate-6 transition-all duration-500 shadow-sm">
                                <Layout className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">قسم البرواز (Hero)</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">تعديل المحتوى الرئيسي الذي يظهر في أعلى الصفحة</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">العنوان الرئيسي</label>
                                    <input
                                        type="text"
                                        value={formData.landing_hero_title}
                                        onChange={e => setFormData({ ...formData, landing_hero_title: e.target.value })}
                                        placeholder="مثال: منصة SaaS المتكاملة"
                                        className="input-field text-lg"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">العنوان الفرعي</label>
                                    <textarea
                                        value={formData.landing_hero_subtitle}
                                        onChange={e => setFormData({ ...formData, landing_hero_subtitle: e.target.value })}
                                        placeholder="وصف مختصر للمنصة..."
                                        className="textarea-field h-40"
                                    />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">نص زر الإجراء (CTA)</label>
                                    <input
                                        type="text"
                                        value={formData.landing_hero_cta}
                                        onChange={e => setFormData({ ...formData, landing_hero_cta: e.target.value })}
                                        placeholder="مثال: ابدأ الآن"
                                        className="input-field text-lg"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">رابط الصورة الرئيسية</label>
                                    <input
                                        type="text"
                                        value={formData.landing_hero_image}
                                        onChange={e => setFormData({ ...formData, landing_hero_image: e.target.value })}
                                        placeholder="https://example.com/hero.png"
                                        className="input-field text-lg ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-emerald-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover/card:-rotate-6 transition-all duration-500 shadow-sm">
                                    <List className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">المميزات</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">إدارة قائمة المميزات التي تظهر في الصفحة الرئيسية</p>
                                </div>
                            </div>
                            <button
                                onClick={addFeature}
                                className="w-16 h-16 rounded-[1.5rem] bg-emerald-600 text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center group/btn"
                            >
                                <Plus className="w-8 h-8 group-hover/btn:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-dark-900/30 border border-gray-100 dark:border-dark-800 space-y-6 relative group transition-all hover:border-primary/20 hover:bg-white dark:hover:bg-dark-900">
                                    <button
                                        onClick={() => removeFeature(index)}
                                        className="absolute top-6 left-6 p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/40 rounded-2xl shadow-sm"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                    <div className="space-y-4 pt-4">
                                        <input
                                            type="text"
                                            value={feature.title}
                                            onChange={e => updateFeature(index, 'title', e.target.value)}
                                            placeholder="عنوان الميزة"
                                            className="input-field font-black text-lg"
                                        />
                                        <textarea
                                            value={feature.description}
                                            onChange={e => updateFeature(index, 'description', e.target.value)}
                                            placeholder="وصف الميزة"
                                            className="textarea-field min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-purple-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover/card:rotate-12 transition-all duration-500 shadow-sm">
                                    <MessageSquare className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">الأسئلة الشائعة</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">إدارة الأسئلة والإجابات الأكثر شيوعاً</p>
                                </div>
                            </div>
                            <button
                                onClick={addFAQ}
                                className="w-16 h-16 rounded-[1.5rem] bg-purple-600 text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center group/btn"
                            >
                                <Plus className="w-8 h-8 group-hover/btn:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {faqs.map((faq, index) => (
                                <div key={index} className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-dark-900/30 border border-gray-100 dark:border-dark-800 space-y-6 relative group transition-all hover:border-primary/20 hover:bg-white dark:hover:bg-dark-900">
                                    <button
                                        onClick={() => removeFAQ(index)}
                                        className="absolute top-6 left-6 p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/40 rounded-2xl shadow-sm"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                    <div className="space-y-4 pt-4">
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={e => updateFAQ(index, 'question', e.target.value)}
                                            placeholder="السؤال"
                                            className="input-field font-black text-lg"
                                        />
                                        <textarea
                                            value={faq.answer}
                                            onChange={e => updateFAQ(index, 'answer', e.target.value)}
                                            placeholder="الإجابة"
                                            className="textarea-field min-h-[100px]"
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
