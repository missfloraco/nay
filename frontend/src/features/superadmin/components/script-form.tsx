import React, { useState, useEffect } from 'react';
import { Script } from '@/features/superadmin/services/script-service';
import InputField from '@/shared/ui/forms/input-field';
import { Code, Globe, Shield, Smartphone, Zap, AlertTriangle, Layers, Save, RotateCcw } from 'lucide-react';

interface ScriptFormProps {
    initialData?: Script | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export default function ScriptForm({ initialData, onSubmit, onCancel, isLoading }: ScriptFormProps) {
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
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header Impact Badge */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border mb-6 ${impact === 'high' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' :
                    impact === 'medium' ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' :
                        'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'
                }`}>
                <div className={`p-2 rounded-full ${impact === 'high' ? 'bg-red-100 text-red-600' :
                        impact === 'medium' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                    }`}>
                    <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        {impact === 'high' ? 'تأثير عالي على الأداء' :
                            impact === 'medium' ? 'تأثير متوسط' :
                                'آمن / تأثير منخفض'}
                    </h4>
                    <p className="text-xs opacity-70">
                        {impact === 'high' ? 'قد يسبب بطء في التحميل.' :
                            impact === 'medium' ? 'تأثير مقبول.' :
                                'لن يؤثر على السرعة.'}
                    </p>
                </div>

                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                    <RotateCcw className="w-3 h-3" />
                    Archive
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-visible">

                {/* Right Column: Settings (7 cols) */}
                <div className="lg:col-span-5 space-y-6 overflow-y-auto custom-scrollbar pr-1">

                    <div className="space-y-4">
                        <InputField
                            label="اسم السكربت"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            icon={Code}
                            required
                            placeholder="مثال: Google Analytics 4"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">النوع</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 font-bold text-sm outline-none focus:border-primary"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="analytics">Analytics</option>
                                    <option value="ads">Ads</option>
                                    <option value="pixels">Pixels</option>
                                    <option value="chat">Chat</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">البيئة</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 font-bold text-sm outline-none focus:border-primary"
                                    value={formData.environment}
                                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                                >
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                    <option value="development">Dev</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-4 h-4 text-primary" />
                            <h5 className="font-bold text-sm">التكوين التقني</h5>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400">المكان</label>
                                <div className="flex flex-col gap-2">
                                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${formData.location === 'head' ? 'bg-white border-primary shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                                        <input type="radio" name="loc" checked={formData.location === 'head'} onChange={() => setFormData({ ...formData, location: 'head' })} className="text-primary" />
                                        <span className="text-xs font-bold">Head</span>
                                    </label>
                                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${formData.location === 'footer' ? 'bg-white border-primary shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                                        <input type="radio" name="loc" checked={formData.location === 'footer'} onChange={() => setFormData({ ...formData, location: 'footer' })} className="text-primary" />
                                        <span className="text-xs font-bold">Footer</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400">التحميل</label>
                                <select
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-xs font-medium"
                                    value={formData.loadingStrategy}
                                    onChange={(e) => setFormData({ ...formData, loadingStrategy: e.target.value as any })}
                                >
                                    <option value="async">Async</option>
                                    <option value="defer">Defer</option>
                                    <option value="lazy">Lazy Load</option>
                                    <option value="interaction">On Interaction</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            الاستهداف
                        </label>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            {['desktop', 'tablet', 'mobile'].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleDevice(d as any)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.deviceAttributes?.includes(d as any)
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {d === 'desktop' ? 'PC' : d === 'tablet' ? 'Tablet' : 'Mobile'}
                                </button>
                            ))}
                        </div>

                        <select
                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 font-bold text-sm outline-none focus:border-primary"
                            value={formData.pages}
                            onChange={(e) => setFormData({ ...formData, pages: e.target.value as any })}
                        >
                            <option value="all">جميع الصفحات</option>
                            <option value="public">الصفحات العامة</option>
                            <option value="auth">تسجيل الدخول</option>
                            <option value="custom">تخصيص...</option>
                        </select>
                    </div>

                </div>

                {/* Left Column: Code Editor (7 cols) */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Code className="w-3 h-3" />
                            الكود (Javascript / HTML)
                        </label>
                        {securityWarnings.length > 0 && (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {securityWarnings.length} تنبيهات
                            </span>
                        )}
                    </div>

                    <div className="relative flex-1 group rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 focus-within:border-primary transition-colors bg-gray-900">
                        <div className="absolute top-0 right-0 left-0 h-8 bg-gray-800 flex items-center px-4 gap-2 border-b border-gray-700">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            <span className="mr-auto text-[10px] font-mono text-gray-400">script-editor</span>
                        </div>
                        <textarea
                            value={formData.content}
                            onChange={handleContentChange}
                            className="w-full h-full bg-transparent text-gray-100 font-mono text-xs p-4 pt-10 outline-none resize-none leading-relaxed selection:bg-primary/30 custom-scrollbar"
                            placeholder="// اكتب الكود هنا..."
                            dir="ltr"
                            spellCheck={false}
                        />
                    </div>

                    {securityWarnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {securityWarnings.map((warning, index) => (
                                <div key={index} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    {warning}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-white/5">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-4 font-black hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ ومتابعة
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-xl py-4 font-bold hover:bg-gray-200 transition-colors"
                >
                    إلغاء
                </button>
            </div>
        </form>
    );
}
