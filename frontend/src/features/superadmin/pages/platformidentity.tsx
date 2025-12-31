import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, Info, Key, Globe, Layout, Palette, Type, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Link, FileType, Loader2 } from 'lucide-react';
import InputField from '@/shared/ui/forms/input-field';
import FileUpload from '@/shared/ui/forms/file-upload';
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
    // Register Primary Action
    useEffect(() => {
        setPrimaryAction({
            label: saving ? 'جاري الحفظ...' : 'تحديث بيانات المنصة',
            onClick: () => handleSubmit(),
            icon: Save,
            loading: saving,
            disabled: saving,
        });
        return () => setPrimaryAction(null);
    }, [saving, logoFiles, formData, removeLogo, removeFavicon, removeCustomFont, removeCustomHeadingFont]);

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
        <AdminLayout
            title="هوية المنصة"
            icon={Layout}
            noPadding={true}
        >
            <div className="w-full bg-transparent animate-in fade-in duration-500">
                <div className="mx-auto space-y-12 w-full max-w-7xl">

                    <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
                        {/* Visual Identity Column */}
                        <div className="flex flex-col gap-6">
                            {/* System Logo */}
                            <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
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
                            <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
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
                            {/* App Info Card */}
                            <div className="bg-white dark:bg-dark-900 p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-8">
                                <InputField
                                    label="اسم المنصة"
                                    value={formData.app_name}
                                    onChange={e => setFormData({ ...formData, app_name: e.target.value })}
                                    placeholder="أدخل اسم المنصة"
                                    hint="يظهر هذا الاسم في شريط العنوان ورسائل البريد الإلكتروني"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <label className="form-label mr-1">اللون الأساسي</label>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-dark-800/60 focus-within:border-primary/50">
                                            <input type="color" value={formData.primary_color} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                            <span className="text-sm font-black dir-ltr text-gray-600 dark:text-gray-300 uppercase">{formData.primary_color}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="form-label mr-1">اللون الثانوي</label>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-dark-800/60 focus-within:border-secondary/50">
                                            <input type="color" value={formData.secondary_color} onChange={e => setFormData({ ...formData, secondary_color: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                            <span className="text-sm font-black dir-ltr text-gray-600 dark:text-gray-300 uppercase">{formData.secondary_color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Font Selection Section - Dual Fonts */}
                            <div className="space-y-10">
                                {/* Body Font */}
                                <div className="grid lg:grid-cols-[300px_1fr] gap-x-12 gap-y-8 p-8 rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                                            <Type className="w-5 h-5 text-indigo-500" />
                                            خط النصوص والفقرات
                                        </h4>
                                        <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                            يتحكم هذا الخيار بالخط الرئيسي المستخدم في المنصة لجميع النصوص والفقرات والقوائم.
                                        </p>

                                        {!removeCustomFont && (settings.customFontFile || logoFiles.custom_font || formData.custom_font_url) ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                مفعل حالياً
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider">
                                                الخط الافتراضي (Cairo)
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-8">
                                        <FileUpload
                                            label="رفع ملف الخط (Body)"
                                            accept=".ttf,.woff,.woff2,.otf"
                                            initialPreview={settings.customFontFile ? 'font-exists' : undefined}
                                            onChange={(f) => {
                                                if (f) handleLogoChange('custom_font', f);
                                                else handleRemoveLogo('custom_font');
                                            }}
                                            hint="ارفع ملف الخط بتنسيق TTF أو WOFF للهواتف والمتصفحات"
                                        />

                                        <InputField
                                            label="أو رابط خارجي للهاتف (Body URL)"
                                            value={formData.custom_font_url}
                                            onChange={e => setFormData({ ...formData, custom_font_url: e.target.value })}
                                            placeholder="https://example.com/font.ttf"
                                            icon={Link}
                                            className="ltr"
                                            hint="في حال استخدام روابط Google Fonts المباشرة للملفات"
                                        />
                                    </div>
                                </div>

                                {/* Heading Font */}
                                <div className="grid lg:grid-cols-[300px_1fr] gap-x-12 gap-y-8 p-8 rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                                            <FileType className="w-5 h-5 text-pink-500" />
                                            خط العناوين (Headings)
                                        </h4>
                                        <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                            يمكنك تخصيص خط منفصل للعناوين الكبيرة والمتوسطة لإعطاء المنصة طابعاً بصرياً مميزاً.
                                        </p>

                                        {!removeCustomHeadingFont && (settings.customHeadingFontFile || logoFiles.custom_heading_font || formData.custom_heading_font_url) ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                مفعل حالياً
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider">
                                                يتبع خط النصوص
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-8">
                                        <FileUpload
                                            label="رفع ملف الخط (Heading)"
                                            accept=".ttf,.woff,.woff2,.otf"
                                            initialPreview={settings.customHeadingFontFile ? 'font-exists' : undefined}
                                            onChange={(f) => {
                                                if (f) handleLogoChange('custom_heading_font', f);
                                                else handleRemoveLogo('custom_heading_font');
                                            }}
                                            hint="يفضل استخدام النسخة العريضة (Bold) من الخط للعناوين"
                                        />

                                        <InputField
                                            label="أو رابط خارجي للعناوين (Heading URL)"
                                            value={formData.custom_heading_font_url}
                                            onChange={e => setFormData({ ...formData, custom_heading_font_url: e.target.value })}
                                            placeholder="https://example.com/heading.ttf"
                                            icon={Link}
                                            className="ltr"
                                            hint="سيتم تطبيق هذا الخط على جميع العناوين في المنصة"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Company Rights Section - New */}
                            <div className="bg-white dark:bg-dark-900 p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 dark:border-dark-800 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-8">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 px-1">
                                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                    حقوق النشر والملكية
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputField
                                        label="اسم الشركة المالكة"
                                        value={formData.company_name}
                                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                        placeholder="مثال: ناي للحلول التقنية"
                                        hint="سيظهر في ذيل الصفحة: أحد مشاريع شركة [الاسم]"
                                    />

                                    <InputField
                                        label="رابط الشركة (URL)"
                                        value={formData.company_link}
                                        onChange={e => setFormData({ ...formData, company_link: e.target.value })}
                                        onBlur={() => {
                                            if (formData.company_link && !/^https?:\/\//i.test(formData.company_link)) {
                                                setFormData(prev => ({ ...prev, company_link: `https://${formData.company_link}` }));
                                            }
                                        }}
                                        placeholder="https://example.com"
                                        className="ltr"
                                        hint="سيتم توجيه المستخدم لهذا الرابط عند الضغط على اسم الشركة"
                                    />
                                </div >
                            </div >

                        </div >
                    </div >
                </div >
            </div >
        </AdminLayout >
    );
}
