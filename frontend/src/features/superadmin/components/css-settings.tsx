import React, { useState, useEffect } from 'react';
import { Sparkles, Save, RotateCcw, Info, Layout, Code } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { SettingsService } from '@/shared/services/settingsservice';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useAction } from '@/shared/contexts/action-context';

export const CSSSettings: React.FC = () => {
    const { settings, refreshSettings, loading: contextLoading } = useSettings();
    const [customCss, setCustomCss] = useState('');
    const [uiTweaks, setUiTweaks] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { showSuccess, showError, showInfo } = useNotifications();
    const { setPrimaryAction } = useAction();

    useEffect(() => {
        if (!contextLoading && settings) {
            setCustomCss(settings.custom_css || '');
            setUiTweaks(settings.ui_tweaks || {});
        }
    }, [settings, contextLoading]);

    useEffect(() => {
        setPrimaryAction({
            label: isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات',
            onClick: handleSave,
            icon: Save,
            loading: isSaving,
            disabled: isSaving
        });
        return () => setPrimaryAction(null);
    }, [isSaving, customCss, uiTweaks]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const tweaksPayload = JSON.stringify(uiTweaks);

            await SettingsService.updateSettings('admin', {
                custom_css: customCss,
                ui_tweaks: tweaksPayload
            });

            await refreshSettings();
            showSuccess('تم حفظ تغييرات المظهر بنجاح');
        } catch (error) {
            console.error('Save failed:', error);
            showError('فشل حفظ التغييرات');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('هل أنت متأكد من استعادة الإعدادات الأصلية؟')) {
            setCustomCss(settings.custom_css || '');
            setUiTweaks(settings.ui_tweaks || {});
            showInfo('تمت استعادة الإعدادات الأصلية');
        }
    };

    const toggleTweak = (key: string) => {
        setUiTweaks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const TweakCard = ({ id, title, description, icon: Icon, colorClass }: any) => {
        const isActive = uiTweaks[id];
        return (
            <div
                onClick={() => toggleTweak(id)}
                className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${isActive ? 'bg-primary/5 border-primary shadow-lg scale-[1.02]' : 'bg-white dark:bg-dark-900 border-gray-100 dark:border-white/5 hover:border-gray-200'}`}
            >
                <div className={`p-3 rounded-2xl ${colorClass} ${isActive ? 'scale-110 rotate-6 shadow-md' : ''} transition-all`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-black text-sm ${isActive ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
                        <div className={`w-10 h-5 rounded-full transition-all relative flex items-center px-1 ${isActive ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-800'}`}>
                            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-all ${isActive ? '-translate-x-[20px]' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed">{description}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto p-8 space-y-12 animate-in fade-in duration-700">
            {/* Section 1: Quick Tweaks */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 shadow-sm">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">تعديلات بضغطة واحدة</h2>
                        <p className="text-sm font-bold text-gray-400">فعل الميزات التي تريدها دون كتابة أي كود برمجى</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TweakCard
                        id="hide_scrollbar"
                        title="إخفاء شريط التمرير"
                        description="إخفاء شريط التمرير (Scrollbar) في جميع الصفحات لمظهر أكثر نظافة."
                        icon={Layout}
                        colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                    />
                    <TweakCard
                        id="rounded_images"
                        title="صور دائرية فائقة"
                        description="جعل جميع الصور في المنصة ذات زوايا دائرية كبيرة بأسلوب عصري."
                        icon={Code}
                        colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                    />
                    <TweakCard
                        id="glass_effect"
                        title="تأثير الزجاج (Glassmorphism)"
                        description="تطبيق تأثير التغبيش والشفافية على بطاقات النظام."
                        icon={Sparkles}
                        colorClass="bg-pink-50 dark:bg-pink-900/20 text-pink-600"
                    />
                    <TweakCard
                        id="grayscale_ads"
                        title="إعلانات هادئة"
                        description="جعل الإعلانات تظهر باللون الرمادي وتعود لألوانها عند تمرير الفأرة."
                        icon={Info}
                        colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                    />
                    <TweakCard
                        id="smooth_animations"
                        title="حركات ناعمة"
                        description="إضافة تأثيرات انتقال (Transition) ناعمة لجميع العناصر التفاعلية."
                        icon={RotateCcw}
                        colorClass="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                    />
                </div>
            </div>

            <hr className="border-gray-100 dark:border-white/5" />

            {/* Section 2: Advanced CSS */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 shadow-xl">
                            <Code size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">محرر CSS المتقدم</h2>
                            <p className="text-sm font-bold text-gray-400">للمحترفين: أضف أكواد CSS الخاصة بك هنا</p>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 font-black text-xs transition-all border border-gray-100 dark:border-white/5"
                    >
                        <RotateCcw size={14} />
                        استعادة الأصلي
                    </button>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative">
                        <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 pointer-events-none z-10">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Editor</span>
                        </div>
                        <textarea
                            value={customCss}
                            onChange={e => setCustomCss(e.target.value)}
                            placeholder="/* اكتب أكواد CSS هنا... */"
                            className="w-full min-h-[400px] p-10 pt-16 rounded-[2.5rem] bg-slate-950 text-slate-100 font-mono text-sm border-2 border-slate-900 focus:border-primary/50 focus:outline-none transition-all resize-y shadow-2xl text-left custom-scrollbar"
                            dir="ltr"
                            spellCheck={false}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/5 border border-blue-100/50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-lg">Target:</span>
                        <code className="text-[10px] font-bold text-blue-600 dark:text-blue-400">.is-landing</code>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-lg">Target:</span>
                        <code className="text-[10px] font-bold text-blue-600 dark:text-blue-400">.is-admin</code>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-lg">Target:</span>
                        <code className="text-[10px] font-bold text-blue-600 dark:text-blue-400">.is-tenant</code>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-lg">Target:</span>
                        <code className="text-[10px] font-bold text-blue-600 dark:text-blue-400">.is-auth</code>
                    </div>
                </div>
            </div>
        </div>
    );
};
