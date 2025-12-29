import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, Image as ImageIcon, Layout, Loader2, Trash2, Type } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import { SettingsService } from '@/shared/services/settingsservice';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { CircularImageUpload } from '@/shared/components/circularimageupload';
import { useText } from '@/shared/contexts/text-context';
import { useAction } from '@/shared/contexts/action-context';
import { logger } from '@/shared/services/logger';

export default function PlatformIdentity() {
    const { settings, updateSettings, refreshSettings, loading: contextLoading } = useSettings();
    const { showToast } = useToast();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [formData, setFormData] = useState({
        app_name: settings.appName || '',
        primary_color: settings.primaryColor || '#2a8cff',
        secondary_color: settings.secondaryColor || '#ffc108',
        font_family: settings.fontFamily || 'Default',
        company_name: settings.companyName || '',
        company_link: settings.companyLink || '',
        custom_font_url: settings.customFontUrl || '',
        custom_heading_font_url: settings.customHeadingFontUrl || '',
    });

    const [logoFiles, setLogoFiles] = useState<{ [key: string]: File | null }>({
        system_logo: null,
        favicon: null,
        custom_font: null,
        custom_heading_font: null,
    });

    // Auto-select Custom type when font file is chosen
    useEffect(() => {
        if (logoFiles.custom_font || logoFiles.custom_heading_font || formData.custom_font_url || formData.custom_heading_font_url) {
            setFormData(prev => ({ ...prev, font_family: 'Custom' }));
        }
    }, [logoFiles.custom_font, logoFiles.custom_heading_font, formData.custom_font_url, formData.custom_heading_font_url]);

    const [removeLogo, setRemoveLogo] = useState(false);
    const [removeFavicon, setRemoveFavicon] = useState(false);
    const [removeCustomFont, setRemoveCustomFont] = useState(false);
    const [removeCustomHeadingFont, setRemoveCustomHeadingFont] = useState(false);

    // Sync state
    useEffect(() => {
        if (!contextLoading && settings) {
            setFormData({
                app_name: settings.appName || '',
                primary_color: settings.primaryColor || '#2a8cff',
                secondary_color: settings.secondaryColor || '#ffc108',
                font_family: settings.fontFamily || 'Default',
                company_name: settings.companyName || '',
                company_link: settings.companyLink || '',
                custom_font_url: settings.customFontUrl || '',
                custom_heading_font_url: settings.customHeadingFontUrl || '',
            });
        }
    }, [settings, contextLoading]);

    // Clear sidebar action
    useEffect(() => {
        setPrimaryAction(null);
    }, [setPrimaryAction]);

    const handleLogoChange = (key: string, file: File) => {
        setLogoFiles(prev => ({ ...prev, [key]: file }));
        if (key === 'system_logo') setRemoveLogo(false);
        if (key === 'favicon') setRemoveFavicon(false);
        if (key === 'custom_font') setRemoveCustomFont(false);
        if (key === 'custom_heading_font') setRemoveCustomHeadingFont(false);
    };

    const handleRemoveLogo = (key: string) => {
        setLogoFiles(prev => ({ ...prev, [key]: null }));
        if (key === 'system_logo') setRemoveLogo(true);
        if (key === 'favicon') setRemoveFavicon(true);
        if (key === 'custom_font') setRemoveCustomFont(true);
        if (key === 'custom_heading_font') setRemoveCustomHeadingFont(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const hasFiles = logoFiles.system_logo || logoFiles.favicon || logoFiles.custom_font || logoFiles.custom_heading_font || removeLogo || removeFavicon || removeCustomFont || removeCustomHeadingFont;

            const finalFontFamily = (
                logoFiles.custom_font ||
                logoFiles.custom_heading_font ||
                (!removeCustomFont && settings.customFontFile) ||
                (!removeCustomHeadingFont && settings.customHeadingFontFile) ||
                formData.custom_font_url ||
                formData.custom_heading_font_url
            ) ? 'Custom' : 'Default';

            if (hasFiles) {
                const logoData = new FormData();
                if (logoFiles.system_logo) {
                    logoData.append('logo_url', logoFiles.system_logo);
                } else if (removeLogo) {
                    logoData.append('remove_logo_url', '1');
                }

                if (logoFiles.favicon) {
                    logoData.append('favicon_url', logoFiles.favicon);
                } else if (removeFavicon) {
                    logoData.append('remove_favicon_url', '1');
                }

                if (logoFiles.custom_font) {
                    logoData.append('custom_font_file', logoFiles.custom_font);
                } else if (removeCustomFont) {
                    logoData.append('remove_custom_font_file', '1');
                }

                if (logoFiles.custom_heading_font) {
                    logoData.append('custom_heading_font_file', logoFiles.custom_heading_font);
                } else if (removeCustomHeadingFont) {
                    logoData.append('remove_custom_heading_font_file', '1');
                }

                // Add text data
                Object.entries(formData).forEach(([key, value]) => {
                    if (key === 'font_family') {
                        logoData.append(key, finalFontFamily);
                    } else {
                        logoData.append(key, value as string);
                    }
                });

                await SettingsService.updateSettings('admin', logoData);
            } else {
                await SettingsService.updateSettings('admin', { ...formData, font_family: finalFontFamily });
            }

            // Sync global context
            await refreshSettings();

            setRefreshKey(prev => prev + 1);
            setLogoFiles({ system_logo: null, favicon: null, custom_font: null, custom_heading_font: null });
            setRemoveLogo(false);
            setRemoveFavicon(false);
            setRemoveCustomFont(false);
            setRemoveCustomHeadingFont(false);

            showToast('تم تحديث هوية المنصة بنجاح', 'success');
        } catch (error: any) {
            logger.error(error);
            const message = error.response?.data?.message || 'حدث خطأ أثناء الحفظ';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="هوية المنصة" noPadding={true}>
            <div className="h-full w-full bg-white dark:bg-dark-950 p-6 lg:p-12 animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-44">
                <div className="max-w-6xl mx-auto space-y-12 w-full">
                    <div className="flex items-center gap-6 border-b border-gray-100 dark:border-dark-800 pb-8 group">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                            <Layout className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">هوية المنصة</h3>
                            <p className="text-base font-bold text-gray-400 dark:text-gray-500">تخصيص الاسم والشعار والخطوط العامة للمنصة</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
                        {/* Visual Identity Column */}
                        <div className="flex flex-col gap-6">
                            {/* System Logo */}
                            <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-dark-900/40 border border-gray-100 dark:border-dark-800 backdrop-blur-sm">
                                <CircularImageUpload
                                    image={removeLogo ? null : (logoFiles.system_logo ? URL.createObjectURL(logoFiles.system_logo) : (settings.systemLogoUrl || settings.logoUrl))}
                                    onImageChange={(f) => handleLogoChange('system_logo', f)}
                                    onRemove={() => handleRemoveLogo('system_logo')}
                                    uploadId="system-logo-upload"
                                    label="شعار النظام"
                                    size="xl"
                                    variant="circle"
                                    accept=".svg,.png,.jpg,.jpeg,.gif,.webp"
                                    fallbackIcon={<ImageIcon className="w-12 h-12" />}
                                />
                                <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">شعار النظام</span>
                            </div>

                            {/* Favicon - Moved Here */}
                            <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-dark-900/40 border border-gray-100 dark:border-dark-800 backdrop-blur-sm">
                                <CircularImageUpload
                                    image={removeFavicon ? null : (logoFiles.favicon ? URL.createObjectURL(logoFiles.favicon) : (settings.faviconUrl || null))}
                                    onImageChange={(f) => handleLogoChange('favicon', f)}
                                    onRemove={() => handleRemoveLogo('favicon')}
                                    uploadId="favicon-upload"
                                    label="Favicon"
                                    size="md"
                                    variant="square" // Favicons are usually square
                                    accept=".svg,.png,.jpg,.jpeg,.ico"
                                    fallbackIcon={<ImageIcon className="w-8 h-8 text-gray-400" />}
                                />
                                <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">أيقونة المتصفح</span>
                            </div>
                        </div>

                        <div className="space-y-8 w-full py-2">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">اسم المنصة</label>
                                <input
                                    type="text"
                                    value={formData.app_name}
                                    onChange={e => setFormData({ ...formData, app_name: e.target.value })}
                                    className="input-field"
                                    placeholder="أدخل اسم المنصة"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">اللون الأساسي</label>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-dark-900 border-2 border-gray-200 dark:border-dark-700 transition-all hover:border-primary/30">
                                        <input type="color" value={formData.primary_color} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                        <span className="text-sm font-black dir-ltr text-gray-600 dark:text-gray-300">{formData.primary_color}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">اللون الثانوي</label>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-dark-900 border-2 border-gray-200 dark:border-dark-700 transition-all hover:border-secondary/30">
                                        <input type="color" value={formData.secondary_color} onChange={e => setFormData({ ...formData, secondary_color: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                        <span className="text-sm font-black dir-ltr text-gray-600 dark:text-gray-300">{formData.secondary_color}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Font Selection Section - Dual Fonts */}
                            <div className="pt-8 border-t border-gray-50 dark:border-dark-800 space-y-8">
                                {/* Body Font */}
                                <div className="flex items-center gap-10 p-8 rounded-[2rem] bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 animate-in slide-in-from-top-4 duration-500">
                                    <CircularImageUpload
                                        image={removeCustomFont ? null : (logoFiles.custom_font ? 'font-uploaded' : (settings.customFontFile ? 'font-existing' : null))}
                                        onImageChange={(f) => handleLogoChange('custom_font', f)}
                                        onRemove={() => handleRemoveLogo('custom_font')}
                                        uploadId="custom-font-upload"
                                        label="ملف الخط"
                                        size="md"
                                        variant="square"
                                        isImage={false}
                                        accept=".ttf,.woff,.woff2,.otf"
                                        fallbackIcon={<Type className="w-8 h-8 text-indigo-400" />}
                                    />
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white">خط النصوص والفقرات (Body Font)</h4>
                                            <p className="text-sm font-medium text-gray-500 mt-1.5">قم برفع ملف الخط (.ttf, .woff, .otf) أو أدخل رابط مباشر لملف الخط.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">رابط خط خارجي (اختياري)</label>
                                            <input
                                                type="url"
                                                value={formData.custom_font_url}
                                                onChange={e => setFormData({ ...formData, custom_font_url: e.target.value })}
                                                placeholder="https://example.com/fonts/my-font.woff2"
                                                className="input-field text-left dir-ltr"
                                                dir="ltr"
                                            />
                                            <p className="text-[10px] text-gray-400">إذا تم رفع ملف، سيتم تجاهل الرابط.</p>
                                        </div>

                                        {logoFiles.custom_font && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                                                تم اختيار ملف: {logoFiles.custom_font.name}
                                            </div>
                                        )}
                                        {/* Status Indicator */}
                                        {!removeCustomFont && (settings.customFontFile || logoFiles.custom_font || formData.custom_font_url) ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-black">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                خط النصوص مفعل
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-black">
                                                يتم استخدام الخط الافتراضي للنصوص
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Heading Font */}
                                <div className="flex items-center gap-10 p-8 rounded-[2rem] bg-pink-50/30 dark:bg-pink-900/10 border border-pink-100/50 dark:border-pink-900/20 animate-in slide-in-from-top-4 duration-500 delay-100">
                                    <CircularImageUpload
                                        image={removeCustomHeadingFont ? null : (logoFiles.custom_heading_font ? 'font-uploaded' : (settings.customHeadingFontFile ? 'font-existing' : null))}
                                        onImageChange={(f) => handleLogoChange('custom_heading_font', f)}
                                        onRemove={() => handleRemoveLogo('custom_heading_font')}
                                        uploadId="custom-heading-font-upload"
                                        label="ملف خط العناوين"
                                        size="md"
                                        variant="square"
                                        isImage={false}
                                        accept=".ttf,.woff,.woff2,.otf"
                                        fallbackIcon={<Type className="w-8 h-8 text-pink-400" />}
                                    />
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white">خط العناوين (Heading Font)</h4>
                                            <p className="text-sm font-medium text-gray-500 mt-1.5">قم برفع ملف الخط أو أدخل رابط مباشر لاستخدامه للعناوين.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">رابط خط خارجي (اختياري)</label>
                                            <input
                                                type="url"
                                                value={formData.custom_heading_font_url}
                                                onChange={e => setFormData({ ...formData, custom_heading_font_url: e.target.value })}
                                                placeholder="https://example.com/fonts/heading-font.ttf"
                                                className="input-field text-left dir-ltr"
                                                dir="ltr"
                                            />
                                            <p className="text-[10px] text-gray-400">إذا تم رفع ملف، سيتم تجاهل الرابط.</p>
                                        </div>

                                        {logoFiles.custom_heading_font && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 text-xs font-black">
                                                تم اختيار ملف: {logoFiles.custom_heading_font.name}
                                            </div>
                                        )}
                                        {/* Status Indicator */}
                                        {!removeCustomHeadingFont && (settings.customHeadingFontFile || logoFiles.custom_heading_font || formData.custom_heading_font_url) ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-black">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                خط العناوين مفعل
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-black">
                                                سيتم استخدام خط النصوص للعناوين أيضاً
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Company Rights Section - New */}
                            <div className="pt-8 border-t border-gray-50 dark:border-dark-800 space-y-6">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                    حقوق النشر والملكية
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">اسم الشركة المالكة</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={formData.company_name}
                                                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="مثال: اسم الشركة المالكة"
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 mr-1">سيظهر في ذيل الصفحة: أحد مشاريع شركة [الاسم]</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">رابط الشركة (اختياري)</label>
                                        <div className="relative group">
                                            <input
                                                type="url"
                                                value={formData.company_link}
                                                onChange={e => setFormData({ ...formData, company_link: e.target.value })}
                                                onBlur={() => {
                                                    if (formData.company_link && !/^https?:\/\//i.test(formData.company_link)) {
                                                        setFormData(prev => ({ ...prev, company_link: `https://${formData.company_link}` }));
                                                    }
                                                }}
                                                className="input-field pl-10 text-left"
                                                dir="ltr"
                                                placeholder="https://example.com"
                                            />
                                        </div >
                                        <p className="text-[10px] font-bold text-gray-400 mr-1">عند الضغط على اسم الشركة سيتم التوجيه لهذا الرابط.</p>
                                    </div >
                                </div >
                            </div >

                            <div className="pt-12 border-t border-gray-100 dark:border-dark-800 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="w-full md:w-auto px-12 h-16 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white rounded-[1.5rem] font-black shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 min-w-[240px] text-lg"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    <span>حفظ التعديلات</span>
                                </button>
                            </div>
                        </div >
                    </div >
                </div >
            </div >
        </AdminLayout >
    );
}
