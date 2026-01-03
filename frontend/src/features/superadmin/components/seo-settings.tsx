import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Globe, Loader2, Image as ImageIcon, Twitter, Facebook, Search, Hash, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useAction } from '@/shared/contexts/action-context';
import api from '@/shared/services/api';
import { useSEO } from '@/shared/hooks/useSEO';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';
import TextareaField from '@/shared/ui/forms/textarea-field';

export const SEOSettings: React.FC = () => {
    const { showSuccess, showError } = useNotifications();
    const queryClient = useQueryClient();
    const { setPrimaryAction } = useAction();
    const { data: seoData, isLoading } = useSEO('landing');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
        twitter_title: '',
        twitter_description: '',
        twitter_image: '',
        canonical_url: '',
        robots: 'index,follow',
    });

    useEffect(() => {
        if (seoData) {
            setFormData({
                title: seoData.title || '',
                description: seoData.description || '',
                keywords: seoData.keywords || '',
                og_title: seoData.og_title || '',
                og_description: seoData.og_description || '',
                og_image: seoData.og_image || '',
                twitter_title: seoData.twitter_title || '',
                twitter_description: seoData.twitter_description || '',
                twitter_image: seoData.twitter_image || '',
                canonical_url: seoData.canonical_url || '',
                robots: seoData.robots || 'index,follow',
            });
        }
    }, [seoData]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            return await api.put('/admin/seo/landing', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seo', 'landing'] });
            showSuccess('تم تحديث إعدادات SEO بنجاح');
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || 'فشل تحديث إعدادات SEO');
        },
    });

    useEffect(() => {
        setPrimaryAction({
            label: updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات',
            onClick: () => updateMutation.mutate(formData),
            icon: Save,
            loading: updateMutation.isPending,
            disabled: updateMutation.isPending,
        });

        return () => setPrimaryAction(null);
    }, [updateMutation.isPending, formData, setPrimaryAction]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto p-8 bg-transparent animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic SEO Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-dark-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white">معلومات SEO الأساسية</h4>
                                <p className="text-xs font-bold text-gray-400 mt-1">إعدادات الظهور في محركات البحث</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <InputField
                                label="عنوان الصفحة (Title)"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="منصة SaaS - نظام إدارة ذكي"
                                maxLength={60}
                                hint={`الطول الموصى به: 50-60 حرف (${formData.title.length}/60)`}
                            />

                            <TextareaField
                                label="الوصف (Description)"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="منصتك الشاملة لإدارة وتطوير مشروعك بسهولة..."
                                maxLength={160}
                                hint={`الطول الموصى به: 150-160 حرف (${formData.description.length}/160)`}
                            />

                            <InputField
                                label="الكلمات المفتاحية (Keywords)"
                                value={formData.keywords}
                                onChange={(e) => handleChange('keywords', e.target.value)}
                                placeholder="نظام نقاط البيع, إدارة المبيعات, SaaS, POS"
                                icon={Hash}
                                hint="افصل الكلمات بفاصلة (,)"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField
                                    label="Canonical URL"
                                    type="url"
                                    value={formData.canonical_url}
                                    onChange={(e) => handleChange('canonical_url', e.target.value)}
                                    className="ltr text-left"
                                    placeholder="https://example.com"
                                    icon={LinkIcon}
                                />

                                <SelectField
                                    label="Robots"
                                    value={formData.robots}
                                    onChange={(e) => handleChange('robots', e.target.value)}
                                    icon={Globe}
                                    options={[
                                        { value: 'index,follow', label: 'Index, Follow (موصى به)' },
                                        { value: 'noindex,follow', label: 'No Index, Follow' },
                                        { value: 'index,nofollow', label: 'Index, No Follow' },
                                        { value: 'noindex,nofollow', label: 'No Index, No Follow' }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Open Graph Card */}
                    <div className="bg-white dark:bg-dark-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm animate-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                                <Facebook className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white">Open Graph (Facebook)</h4>
                                <p className="text-xs font-bold text-gray-400 mt-1">تخصيص الظهور عند المشاركة في فيسبوك</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <InputField
                                label="OG Title"
                                value={formData.og_title}
                                onChange={(e) => handleChange('og_title', e.target.value)}
                                placeholder="اتركه فارغاً لاستخدام العنوان الأساسي"
                            />

                            <TextareaField
                                label="OG Description"
                                value={formData.og_description}
                                onChange={(e) => handleChange('og_description', e.target.value)}
                                placeholder="اتركه فارغاً لاستخدام الوصف الأساسي"
                            />

                            <InputField
                                label="OG Image URL"
                                type="url"
                                value={formData.og_image}
                                onChange={(e) => handleChange('og_image', e.target.value)}
                                className="ltr text-left"
                                placeholder="https://example.com/image.jpg"
                                icon={ImageIcon}
                                hint="الحجم الموصى به: 1200x630 بكسل"
                            />
                        </div>
                    </div>

                    {/* Twitter Card */}
                    <div className="bg-white dark:bg-dark-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl text-cyan-500 dark:text-cyan-400">
                                <Twitter className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white">Twitter Card</h4>
                                <p className="text-xs font-bold text-gray-400 mt-1">تخصيص الظهور عند المشاركة في تويتر/X</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <InputField
                                label="Twitter Title"
                                value={formData.twitter_title}
                                onChange={(e) => handleChange('twitter_title', e.target.value)}
                                placeholder="اتركه فارغاً لاستخدام العنوان الأساسي"
                            />

                            <TextareaField
                                label="Twitter Description"
                                value={formData.twitter_description}
                                onChange={(e) => handleChange('twitter_description', e.target.value)}
                                placeholder="اتركه فارغاً لاستخدام الوصف الأساسي"
                            />

                            <InputField
                                label="Twitter Image URL"
                                type="url"
                                value={formData.twitter_image}
                                onChange={(e) => handleChange('twitter_image', e.target.value)}
                                className="ltr text-left"
                                placeholder="https://example.com/image.jpg"
                                icon={ImageIcon}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
