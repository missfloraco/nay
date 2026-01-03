import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Script } from '@/features/superadmin/services/script-service';
import InputField from '@/shared/ui/forms/input-field';
import { Code, Globe, Shield, Smartphone, Zap, AlertTriangle, Layers, Save, RotateCcw, Terminal } from 'lucide-react';

interface ScriptFormProps {
    initialData?: Script | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    hideFooter?: boolean;
}

export interface ScriptFormHandle {
    submit: () => void;
}

const ScriptForm = forwardRef<ScriptFormHandle, ScriptFormProps>(({ initialData, onSubmit, onCancel, isLoading, hideFooter }, ref) => {
    const [formData, setFormData] = useState<Partial<Script>>({
        name: '',
        type: 'analytics',
        location: 'head',
        loadingStrategy: 'async',
        pages: 'all',
        environment: 'production',
        content: '',
        isActive: true,
        deviceAttributes: ['desktop', 'tablet', 'mobile']
    });

    const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
        submit: () => {
            // Trigger validation if needed, or just submit
            // We can programmatically submit the form or call onSubmit directly
            // onSubmit(formData); // This skips HTML5 validation
            // Better to trigger form submission event
            const form = document.getElementById('script-form') as HTMLFormElement;
            if (form) {
                if (form.requestSubmit) form.requestSubmit();
                else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            } else {
                onSubmit(formData);
            }
        }
    }));

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            validateSecurity(initialData.content || '');
        }
    }, [initialData]);

    const validateSecurity = (content: string) => {
        const warnings = [];
        if (content.includes('document.write')) warnings.push('تحذير: استخدام document.write قد يبطئ الموقع بشكل كبير.');
        if (content.includes('eval(')) warnings.push('تحذير أمني: استخدام eval() غير آمن وقد يعرض الموقع للاختراق.');
        if (content.includes('<script') && content.includes('</script>')) warnings.push('ملاحظة: لا حاجة لكتابة وسوم <script>، النظام سيضيفها تلقائياً.');
        setSecurityWarnings(warnings);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const content = e.target.value;
        setFormData({ ...formData, content });
        validateSecurity(content);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const toggleDevice = (device: 'desktop' | 'tablet' | 'mobile') => {
        const current = formData.deviceAttributes || [];
        if (current.includes(device)) {
            setFormData({ ...formData, deviceAttributes: current.filter(d => d !== device) });
        } else {
            setFormData({ ...formData, deviceAttributes: [...current, device] });
        }
    };

    const getImpactLevel = () => {
        if (formData.content?.includes('document.write') || formData.content?.includes('eval')) return 'high';
        if (formData.location === 'head' && !formData.loadingStrategy?.match(/async|defer/)) return 'high';
        if (formData.loadingStrategy === 'lazy' || formData.loadingStrategy === 'interaction') return 'low';
        return 'medium';
    };

    const impact = getImpactLevel();

    return (
        <form
            id="script-form"
            onSubmit={handleSubmit}
            className="flex flex-col bg-white dark:bg-dark-900 h-full"
        >
            {/* 1. Main Responsive Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0 min-w-0 w-full mb-8">

                {/* Left Side: Form Controls */}
                <div className="order-1 lg:col-span-5 min-w-0 space-y-8">

                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <h5 className="text-lg font-black text-gray-900 dark:text-white">المعلومات الأساسية</h5>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <InputField
                                    label="اسم السكربت"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    icon={Code}
                                    required
                                    placeholder="مثال: Google Analytics 4, Hotjar"
                                    className="bg-gray-50/50 dark:bg-gray-800/40 dark:text-white dark:border-white/5"
                                />
                                <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                    أدخل اسماً توضيحياً للسكربت ليساعدك في التعرف عليه لاحقاً داخل لوحة التحكم.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">نوع السكربت</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[1.25rem] px-4 py-3.5 font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer dark:text-white"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="analytics">📊 تحليلات (Analytics)</option>
                                        <option value="ads">📢 إعلانات (Ads)</option>
                                        <option value="pixels">✨ تتبع (Pixels)</option>
                                        <option value="chat">💬 محادثة (Chat)</option>
                                        <option value="custom">🛠️ مخصص (Custom)</option>
                                    </select>
                                    <p className="text-[9px] font-bold text-gray-400 px-2">يساعد تحديد النوع في تنظيم السكربتات وتطبيق إعدادات تحسين الأداء المناسبة.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">بيئة العمل</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[1.25rem] px-4 py-3.5 font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer dark:text-white"
                                        value={formData.environment}
                                        onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                                    >
                                        <option value="production">🚀 الإنتاج (Live Site)</option>
                                        <option value="staging">🧪 التجريب (Staging)</option>
                                        <option value="development">💻 التطوير (Dev)</option>
                                    </select>
                                    <p className="text-[9px] font-bold text-gray-400 px-2">اختر "Live Site" ليظهر السكربت لعملائك، أو "Dev" لاختباره داخلياً أولاً.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Configuration (Touch Friendly Toggles) */}
                    <div className="p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-dark-800/40 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Layers className="w-5 h-5 text-primary" />
                                </div>
                                <h5 className="font-black text-gray-900 dark:text-white">قواعد الاستهداف الذكي</h5>
                            </div>
                            <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase">الاستهداف</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location Context */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">المكان في الصفحة</label>
                                <div className="p-1 bg-gray-100 dark:bg-dark-700/50 rounded-2xl flex">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, location: 'head' })}
                                        className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${formData.location === 'head' ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        HEAD (رأس الصفحة)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, location: 'footer' })}
                                        className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${formData.location === 'footer' ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        FOOTER (تذييل الصفحة)
                                    </button>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 px-2 leading-tight">
                                    {formData.location === 'head' ? 'يستخدم لسكربتات التتبع المهمة التي يجب تحميلها بمجرد فتح الصفحة.' : 'يستخدم لسكربتات المحادثة والأدوات التي لا تحتاج للتحميل الفوري.'}
                                </p>
                            </div>

                            {/* Strategy Select */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">توقيت التحميل</label>
                                <select
                                    className="w-full bg-white dark:bg-dark-700/50 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3.5 font-bold text-xs dark:text-white"
                                    value={formData.loadingStrategy}
                                    onChange={(e) => setFormData({ ...formData, loadingStrategy: e.target.value as any })}
                                >
                                    <option value="async">🚀 Async (تحميل متوازي - سريع)</option>
                                    <option value="defer">⌛ Defer (بعد معالجة الصفحة)</option>
                                    <option value="lazy">💤 Lazy Load (عند اقتراب الظهور)</option>
                                    <option value="interaction">⚡ Interaction (عند النقر فقط)</option>
                                </select>
                                <p className="text-[9px] font-bold text-gray-400 px-2 leading-tight">
                                    {formData.loadingStrategy === 'async' ? 'يتم تحميل السكربت والصفحة معاً لسرعة فائقة.' :
                                        formData.loadingStrategy === 'interaction' ? 'أفضل أداء: لا يتم تحميل السكربت إلا إذا تفاعل المستخدم معه.' :
                                            'يساعد تأخير التحميل في تحسين نقاط سرعة الموقع (SEO).'}
                                </p>
                            </div>
                        </div>

                        {/* Device Target */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                استهداف الأجهزة
                            </label>
                            <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 dark:bg-dark-700/50 rounded-2xl">
                                {['desktop', 'tablet', 'mobile'].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => toggleDevice(d as any)}
                                        className={`py-3 rounded-xl text-[11px] font-black transition-all border-2 ${formData.deviceAttributes?.includes(d as any)
                                            ? 'bg-white dark:bg-dark-600 border-primary/20 text-gray-900 dark:text-white shadow-sm'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {d === 'desktop' ? '🖥️ الحاسوب' : d === 'tablet' ? '📱 التابلت' : '📱 الجوال'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 px-2 italic">حدد الأجهزة التي ترغب بظهور هذا السكربت عليها (مثلاً: إخفاء المحادثة على الجوال).</p>
                        </div>

                        {/* Page Visibility */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                رؤية الصفحات
                            </label>
                            <select
                                className="w-full bg-gray-100 dark:bg-dark-700/50 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 font-bold text-sm dark:text-white"
                                value={formData.pages}
                                onChange={(e) => setFormData({ ...formData, pages: e.target.value as any })}
                            >
                                <option value="all">📍 جميع صفحات الموقع</option>
                                <option value="public">🌐 الصفحات العامة فقط (بدون لوحة التحكم)</option>
                                <option value="auth">🔒 صفحات تسجيل الدخول فقط</option>
                                <option value="custom">⚙️ تصفية مخصصة للروابط...</option>
                            </select>
                            <p className="text-[9px] font-bold text-gray-400 px-2">يمنع السكربت من الظهور في الصفحات غير المرغوبة لخصوصية وأداء أفضل.</p>
                        </div>
                    </div>

                </div>

                {/* Right Side: IDE-Like Code Editor (Order 2 on mobile, 7 cols on lg) */}
                <div className="order-2 lg:col-span-7 min-w-0 w-full flex flex-col h-full mb-6 lg:mb-0">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                <h5 className="text-lg font-black text-gray-900 dark:text-white">محرر السكربت</h5>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 px-4">يدعم Javascript, CSS, HTML</p>
                        </div>
                        {securityWarnings.length > 0 && (
                            <div className="animate-bounce">
                                <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {securityWarnings.length} تنبيهات برمجية
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="relative flex-1 min-h-[300px] lg:min-h-[500px] bg-[#0f1117] rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden border-4 border-gray-100 dark:border-white/5 flex flex-col group">
                        {/* Editor Header */}
                        <div className="h-14 bg-[#1a1d27] flex items-center px-6 gap-2 border-b border-white/5 shrink-0">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_10px_rgba(248,113,113,0.3)]" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
                            </div>
                            <div className="mr-8 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest font-mono uppercase">advanced_injector.js</span>
                            </div>
                            <div className="mr-auto hidden md:flex items-center gap-3">
                                <span className="text-[9px] font-black text-emerald-400/60 font-mono tracking-tighter">READ_WRITE_OK</span>
                                <div className="h-4 w-px bg-white/10" />
                                <span className="text-[9px] font-black text-gray-600 font-mono">UTF-8</span>
                            </div>
                        </div>

                        {/* Textarea disguised as IDE */}
                        <div className="flex-1 relative overflow-hidden flex">
                            {/* Line Numbers Sidebar */}
                            <div className="w-10 bg-[#151821] border-l border-white/5 pt-10 flex flex-col items-center select-none">
                                {[...Array(20)].map((_, i) => (
                                    <span key={i} className="text-[9px] font-mono text-gray-700 h-6 flex items-center">{i + 1}</span>
                                ))}
                            </div>

                            <textarea
                                value={formData.content}
                                onChange={handleContentChange}
                                className="flex-1 bg-transparent text-gray-200 font-mono text-sm p-6 pt-10 outline-none resize-none leading-relaxed selection:bg-primary/20 custom-scrollbar relative z-10 text-left"
                                placeholder="// ادخل السكربت البرمجي هنا...
(function() {
    console.log('Script Initialized');
})();"
                                dir="ltr"
                                spellCheck={false}
                            />

                            {/* Background Overlay Subtle Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                        </div>

                        {/* Editor Footer Status */}
                        <div className="h-10 bg-[#1a1d27] border-t border-white/5 px-6 flex items-center justify-between text-[9px] font-black text-gray-600 font-mono shrink-0">
                            <div className="flex gap-4">
                                <span className="text-primary tracking-widest">LN 34, COL 12</span>
                                <span>SPACES: 4</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span>READY TO SAVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Warnings Overlay Bottom */}
                    {securityWarnings.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {securityWarnings.map((warning, index) => (
                                <div key={index} className="flex items-start gap-3 text-xs font-black text-amber-700 bg-amber-50/80 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-500/20 animate-in slide-in-from-right-4 duration-500">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{warning}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Footer Static Buttons (Only if not using global footer) */}
            {!hideFooter && (
                <div className="flex gap-4 pt-10 mt-8 border-t border-gray-100 dark:border-white/5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.5rem] py-5 font-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        {isLoading ? <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="w-6 h-6" />}
                        حفظ ومتابعة الإعدادات
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 rounded-[1.5rem] py-5 font-black hover:bg-gray-200 dark:hover:bg-dark-700 transition-all"
                    >
                        إلغاء
                    </button>
                </div>
            )}
        </form>
    );
});

export default ScriptForm;
