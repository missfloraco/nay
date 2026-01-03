import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Layout, Save, ImageIcon, Globe, Palette, Type, Link, FileType, Info, ShieldCheck, Fingerprint, Sparkles, Search, Hash, Megaphone, Terminal } from 'lucide-react';
import InputField from '@/shared/ui/forms/input-field';
import { useSettings } from '@/shared/contexts/app-context';
import { useNotifications } from '@/shared/contexts/notification-context';
import { SettingsService } from '@/shared/services/settingsservice';
import { CircularImageUpload } from '@/shared/components/circularimageupload';
import { useAction } from '@/shared/contexts/action-context';
import { logger } from '@/shared/services/logger';
import { GOOGLE_ARABIC_FONTS } from '@/shared/constants/fonts';
import { ChevronDown } from 'lucide-react';
import { Toolbar } from '@/shared/components/toolbar';
import { CSSSettings } from '@/features/superadmin/components/css-settings';
import { SEOSettings } from '@/features/superadmin/components/seo-settings';
import { PrefixSettings } from '@/features/superadmin/components/prefix-settings';
import { ScriptsSettings } from '@/features/superadmin/components/scripts-settings';
import { SecuritySettings } from '@/features/superadmin/components/security-settings';
import AdsTable from '@/features/superadmin/components/adstable';
import FileUpload from '@/shared/ui/forms/file-upload';
import api from '@/shared/services/api';

type TabType = 'identity' | 'css' | 'seo' | 'prefixes' | 'ads' | 'scripts' | 'security';

export default function PlatformIdentity() {
    const [activeTab, setActiveTab] = useState<TabType>('identity');
    const { settings, refreshSettings, updateLocalSettings, loading: contextLoading } = useSettings();
    const { showSuccess, showError } = useNotifications();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);

    // Identity Form State
    const [formData, setFormData] = useState({
        app_name: settings.appName || '',
        primary_color: settings.primaryColor || '#2a8cff',
        secondary_color: settings.secondaryColor || '#ffc108',
        font_family: settings.fontFamily || 'Default',
        company_name: settings.companyName || '',
        company_link: settings.companyLink || '',
        accent_color1: settings.accentColor1 || '#02aa94',
        accent_color2: settings.accentColor2 || '#fb005e',
        custom_font_url: settings.customFontUrl || '',
        custom_heading_font_url: settings.customHeadingFontUrl || '',
    });

    const [logoFiles, setLogoFiles] = useState<{ [key: string]: File | null }>({
        system_logo: null,
        favicon: null,
        custom_font: null,
        custom_heading_font: null,
    });

    const [removeLogo, setRemoveLogo] = useState(false);
    const [removeFavicon, setRemoveFavicon] = useState(false);
    const [removeCustomFont, setRemoveCustomFont] = useState(false);
    const [removeCustomHeadingFont, setRemoveCustomHeadingFont] = useState(false);

    // Prefixes Local State
    const [localPrefixes, setLocalPrefixes] = useState<any>({});

    useEffect(() => {
        if (!contextLoading && settings) {
            setFormData({
                app_name: settings.appName || '',
                primary_color: settings.primaryColor || '#2a8cff',
                secondary_color: settings.secondaryColor || '#ffc108',
                font_family: settings.fontFamily || 'Default',
                company_name: settings.companyName || '',
                company_link: settings.companyLink || '',
                accent_color1: settings.accentColor1 || '#02aa94',
                accent_color2: settings.accentColor2 || '#fb005e',
                custom_font_url: settings.customFontUrl || '',
                custom_heading_font_url: settings.customHeadingFontUrl || '',
            });

            if (settings.branding) {
                setLocalPrefixes({
                    prefix_admin: settings.branding.prefix_admin,
                    prefix_tenant: settings.branding.prefix_tenant,
                    prefix_ticket: settings.branding.prefix_ticket,
                    prefix_payment: settings.branding.prefix_payment,
                    prefix_ad: settings.branding.prefix_ad,
                });
            }
        }
    }, [settings, contextLoading]);

    // Handle Reset/Cleanup on tab change
    useEffect(() => {
        setPrimaryAction(null);
    }, [activeTab]);

    // Identity Tab Submission
    const handleIdentitySubmit = async () => {
        setSaving(true);
        try {
            const hasFiles = logoFiles.system_logo || logoFiles.favicon || logoFiles.custom_font || logoFiles.custom_heading_font || removeLogo || removeFavicon || removeCustomFont || removeCustomHeadingFont;
            const isCustomFontActive = (
                logoFiles.custom_font ||
                logoFiles.custom_heading_font ||
                (!removeCustomFont && settings.customFontFile) ||
                (!removeCustomHeadingFont && settings.customHeadingFontFile) ||
                (formData.custom_font_url && !(removeCustomFont && formData.custom_font_url === settings.customFontUrl)) ||
                (formData.custom_heading_font_url && !(removeCustomHeadingFont && formData.custom_heading_font_url === settings.customHeadingFontUrl))
            );
            const finalFontFamily = isCustomFontActive ? 'Custom' : (formData.font_family || 'Default');

            if (hasFiles) {
                const logoData = new FormData();
                if (logoFiles.system_logo) logoData.append('logo_url', logoFiles.system_logo);
                else if (removeLogo) logoData.append('remove_logo_url', '1');

                if (logoFiles.favicon) logoData.append('favicon_url', logoFiles.favicon);
                else if (removeFavicon) logoData.append('remove_favicon_url', '1');

                if (logoFiles.custom_font) logoData.append('custom_font_file', logoFiles.custom_font);
                else if (removeCustomFont) logoData.append('remove_custom_font_file', '1');

                if (logoFiles.custom_heading_font) logoData.append('custom_heading_font_file', logoFiles.custom_heading_font);
                else if (removeCustomHeadingFont) logoData.append('remove_custom_heading_font_file', '1');

                Object.entries(formData).forEach(([key, value]) => {
                    let finalValue = value;
                    if (key === 'custom_font_url' && removeCustomFont && value === settings.customFontUrl) finalValue = '';
                    if (key === 'custom_heading_font_url' && removeCustomHeadingFont && value === settings.customHeadingFontUrl) finalValue = '';
                    logoData.append(key, key === 'font_family' ? finalFontFamily : finalValue as string);
                });
                await SettingsService.updateSettings('admin', logoData);
            } else {
                const payload = { ...formData, font_family: finalFontFamily };
                if (!payload.custom_font_url) payload.custom_font_url = null;
                if (!payload.custom_heading_font_url) payload.custom_heading_font_url = null;
                await SettingsService.updateSettings('admin', payload);
            }

            await refreshSettings();
            setLogoFiles({ system_logo: null, favicon: null, custom_font: null, custom_heading_font: null });
            setRemoveLogo(false); setRemoveFavicon(false); setRemoveCustomFont(false); setRemoveCustomHeadingFont(false);
            showSuccess('تم تحديث هوية المنصة بنجاح');
        } catch (error: any) {
            logger.error(error);
            showError('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    // Prefixes Tab Submission
    const handlePrefixesSubmit = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings', localPrefixes);
            updateLocalSettings({
                branding: { ...settings.branding, ...localPrefixes }
            });
            showSuccess('تم حفظ إعدادات التسميات بنجاح');
        } catch (error) {
            console.error('Save failed', error);
            showError('حدث خطأ أثناء حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    // Global Primary Action Effect
    useEffect(() => {
        if (activeTab === 'identity') {
            setPrimaryAction({
                label: saving ? 'جاري الحفظ...' : 'حفظ التغييرات',
                onClick: handleIdentitySubmit,
                icon: Save,
                loading: saving,
                disabled: saving,
            });
        } else if (activeTab === 'prefixes') {
            setPrimaryAction({
                label: saving ? 'جاري الحفظ...' : 'حفظ التغييرات',
                onClick: handlePrefixesSubmit,
                icon: Save,
                loading: saving,
                disabled: saving,
            });
        }
        // Ads doesn't have a primary action, CSS and SEO have their own within components
    }, [activeTab, saving, formData, logoFiles, removeLogo, removeFavicon, removeCustomFont, removeCustomHeadingFont, localPrefixes]);

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

    const IdentityTab = () => (
        <div className="grid lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
            <div className="space-y-8">
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-dark-800 shadow-premium overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                            <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">الهوية البصرية</h3>
                            <p className="text-sm font-bold text-gray-400">الشعارات والأيقونات الأساسية</p>
                        </div>
                    </div>
                    <div className="p-8 lg:p-12">
                        <div className="flex flex-wrap items-center justify-center gap-12">
                            <div className="flex flex-col items-center gap-4">
                                <CircularImageUpload
                                    image={removeLogo ? null : (logoFiles.system_logo ? URL.createObjectURL(logoFiles.system_logo) : (settings.systemLogoUrl || settings.logoUrl))}
                                    onImageChange={(f) => handleLogoChange('system_logo', f)}
                                    onRemove={() => handleRemoveLogo('system_logo')}
                                    uploadId="system-logo"
                                    size="xl"
                                    label="شعار النظام"
                                    fallbackIcon={<ImageIcon className="w-12 h-12 text-gray-300" />}
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">شعار النظام</span>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <CircularImageUpload
                                    image={removeFavicon ? null : (logoFiles.favicon ? URL.createObjectURL(logoFiles.favicon) : (settings.faviconUrl || null))}
                                    onImageChange={(f) => handleLogoChange('favicon', f)}
                                    onRemove={() => handleRemoveLogo('favicon')}
                                    uploadId="favicon"
                                    size="md"
                                    variant="square"
                                    label="أيقونة المتصفح"
                                    fallbackIcon={<Globe className="w-8 h-8 text-gray-300" />}
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">أيقونة المتصفح</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-dark-800 shadow-premium p-8 lg:p-12 space-y-8">
                    <InputField
                        label="اسم المنصة"
                        value={formData.app_name}
                        onChange={e => setFormData({ ...formData, app_name: e.target.value })}
                        placeholder="أدخل اسم المنصة"
                        hint="يظهر في العناوين والرسائل"
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="form-label mr-1">اللون الأساسي</label>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-950 border border-gray-100 dark:border-white/5 transition-all focus-within:border-primary/50">
                                <input type="color" value={formData.primary_color} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                <span className="text-xs font-black dir-ltr text-gray-600 dark:text-gray-300 uppercase">{formData.primary_color}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="form-label mr-1">اللون الثانوي</label>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-950 border border-gray-100 dark:border-white/5 transition-all focus-within:border-secondary/50">
                                <input type="color" value={formData.secondary_color} onChange={e => setFormData({ ...formData, secondary_color: e.target.value })} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                <span className="text-xs font-black dir-ltr text-gray-600 dark:text-gray-300 uppercase">{formData.secondary_color}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="form-label mr-1">اللون الجمالي 1 (Accent)</label>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-950 border border-gray-100 dark:border-white/5 transition-all focus-within:border-primary/50">
                                <input type="color" value={formData.accent_color1} onChange={e => setFormData({ ...formData, accent_color1: e.target.value })} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                <span className="text-xs font-black dir-ltr text-gray-600 dark:text-gray-300 uppercase">{formData.accent_color1}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="form-label mr-1">اللون الجمالي 2 (Accent)</label>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-950 border border-gray-100 dark:border-white/5 transition-all focus-within:border-primary/50">
                                <input type="color" value={formData.accent_color2} onChange={e => setFormData({ ...formData, accent_color2: e.target.value })} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden" />
                                <span className="text-xs font-black dir-ltr text-gray-600 dark:text-gray-300 uppercase">{formData.accent_color2}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-dark-800 shadow-premium p-8 lg:p-12 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">حقوق النشر والملكية</h3>
                            <p className="text-xs font-bold text-gray-400">بيانات الشركة المالكة</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <InputField
                            label="اسم الشركة المالكة"
                            value={formData.company_name}
                            onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                            placeholder="مثال: ناي للحلول التقنية"
                        />
                        <InputField
                            label="رابط الشركة (URL)"
                            icon={Link}
                            value={formData.company_link}
                            onChange={e => setFormData({ ...formData, company_link: e.target.value })}
                            placeholder="https://example.com"
                            className="ltr"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-dark-800 shadow-premium overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                <Type className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">نظام الخطوط</h3>
                                <p className="text-sm font-bold text-gray-400">تخصيص خطوط النصوص والعناوين</p>
                            </div>
                        </div>
                        {(!removeCustomFont && (settings.customFontFile || logoFiles.custom_font)) && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                مخصص
                            </div>
                        )}
                    </div>
                    <div className="p-8 lg:p-12 space-y-12">
                        <div className="space-y-4">
                            <label className="form-label">نوع الخط المعتمد</label>
                            <div className="relative">
                                <select
                                    value={(!removeCustomFont && (settings.customFontFile || logoFiles.custom_font)) ? 'Custom' : formData.font_family}
                                    onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                                    disabled={(!removeCustomFont && (!!settings.customFontFile || !!logoFiles.custom_font))}
                                    className="select-field w-full appearance-none relative z-10 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="Default">الخط الافتراضي (IBM Plex Sans Arabic)</option>
                                    <optgroup label="خطوط جوجل العربية">
                                        {GOOGLE_ARABIC_FONTS.map(font => (
                                            <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>{font.label}</option>
                                        ))}
                                    </optgroup>
                                    {((!removeCustomFont && (settings.customFontFile || logoFiles.custom_font))) && <option value="Custom">خط مخصص (تم رفع ملف)</option>}
                                </select>
                                <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-0" />
                            </div>
                        </div>
                        <hr className="border-gray-100 dark:border-white/5" />
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                                <h4 className="text-base font-black text-gray-900 dark:text-white">خط النصوص والفقرات (Body)</h4>
                            </div>
                            <div className="grid gap-6">
                                <FileUpload
                                    label="رفع ملف الخط"
                                    accept=".ttf,.woff,.woff2,.otf"
                                    initialFileName={settings.customFontFile ? 'ملف الخط الحالي' : undefined}
                                    onChange={(f) => f ? handleLogoChange('custom_font', f) : handleRemoveLogo('custom_font')}
                                />
                                <InputField
                                    label="أو رابط ملف الخط (URL)"
                                    icon={Link}
                                    value={formData.custom_font_url}
                                    onChange={e => setFormData({ ...formData, custom_font_url: e.target.value })}
                                    placeholder="https://fonts.gstatic.com/..."
                                    className="ltr"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-pink-500 rounded-full" />
                                <h4 className="text-base font-black text-gray-900 dark:text-white">خط العناوين (Headings)</h4>
                            </div>
                            <div className="grid gap-6">
                                <FileUpload
                                    label="رفع ملف الخط"
                                    accept=".ttf,.woff,.woff2,.otf"
                                    initialFileName={settings.customHeadingFontFile ? 'ملف الخط الحالي' : undefined}
                                    onChange={(f) => f ? handleLogoChange('custom_heading_font', f) : handleRemoveLogo('custom_heading_font')}
                                />
                                <InputField
                                    label="أو رابط ملف الخط (URL)"
                                    icon={Link}
                                    value={formData.custom_heading_font_url}
                                    onChange={e => setFormData({ ...formData, custom_heading_font_url: e.target.value })}
                                    placeholder="https://fonts.gstatic.com/..."
                                    className="ltr"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 transition-transform group-hover:scale-110 duration-1000">
                        <Palette className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="bg-white/20 p-3 rounded-2xl self-start">
                            <Info className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-black">نصيحة التصميم</h3>
                        <p className="text-indigo-100 font-bold leading-relaxed opacity-90">
                            للحصول على أفضل تجربة بصرية، ننصح باستخدام ملفات الخطوط بتنسيق WOFF2 كونها أخف وزناً وأسرع في التحميل.
                            <br /><br />
                            تذكر أن الألوان المختارة سيتم تطبيقها تلقائياً على جميع مكونات النظام، مما يضمن اتساق الهوية البصرية.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout
            title="هوية المنصة"
            icon={Layout}
            noPadding={true}
            toolbar={
                <Toolbar
                    activeValue={activeTab}
                    onChange={(val) => setActiveTab(val as TabType)}
                    variant="pills"
                    options={[
                        { id: 'identity', label: 'الهوية الأساسية', icon: Layout },
                        { id: 'css', label: 'CSS المخصص', icon: Sparkles },
                        { id: 'seo', label: 'إعدادات SEO', icon: Search },
                        { id: 'scripts', label: 'الأكواد والنصوص', icon: Terminal },
                        { id: 'security', label: 'إعدادات الحماية', icon: ShieldCheck },
                        { id: 'prefixes', label: 'نظام التسميات', icon: Hash },
                        { id: 'ads', label: 'الإعلانات', icon: Megaphone }
                    ]}
                />
            }
        >
            <div className="flex flex-col h-full w-full bg-white dark:bg-dark-950 shadow-sm border-x border-gray-100/50 dark:border-white/5">
                <div className="flex-1 bg-gray-50/50 dark:bg-dark-900/50">
                    {activeTab === 'identity' && <IdentityTab />}
                    {activeTab === 'css' && <CSSSettings />}
                    {activeTab === 'seo' && <SEOSettings />}
                    {activeTab === 'scripts' && <ScriptsSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'prefixes' && (
                        <div className="w-full max-w-4xl mx-auto py-12 px-8">
                            <PrefixSettings
                                settings={localPrefixes}
                                onChange={(key, value) => setLocalPrefixes(prev => ({ ...prev, [key]: value }))}
                            />
                        </div>
                    )}
                    {activeTab === 'ads' && <div className="p-8"><AdsTable /></div>}
                </div>
            </div>
        </AdminLayout>
    );
}
