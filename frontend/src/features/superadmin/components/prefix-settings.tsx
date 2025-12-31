import React from 'react';
import { Shield, Users, Ticket, Hash, DollarSign, Megaphone } from 'lucide-react';
import InputField from '@/shared/ui/forms/input-field';

interface PrefixSettingsProps {
    settings: any;
    onChange: (key: string, value: string) => void;
}

export const PrefixSettings: React.FC<PrefixSettingsProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Hash className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">نظام التسميات (Prefix System)</h3>
                    <p className="text-sm text-gray-400 font-medium">تحكم في الكود التعريفي للعناصر المختلفة (مثلاً: ADM, TNT, TKT)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin Prefix */}
                <div className="bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-orange-500">
                        <Shield className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">كود المديرين</span>
                    </div>
                    <InputField
                        label="البادئة (Prefix)"
                        value={settings.prefix_admin || 'ADM'}
                        onChange={(e) => onChange('prefix_admin', e.target.value.toUpperCase().substring(0, 3))}
                        placeholder="ADM"
                        className="font-black text-center text-lg tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">مثال: {settings.prefix_admin || 'ADM'}-000001</p>
                </div>

                {/* Tenant Prefix */}
                <div className="bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-blue-500">
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">كود العملاء</span>
                    </div>
                    <InputField
                        label="البادئة (Prefix)"
                        value={settings.prefix_tenant || 'TNT'}
                        onChange={(e) => onChange('prefix_tenant', e.target.value.toUpperCase().substring(0, 3))}
                        placeholder="TNT"
                        className="font-black text-center text-lg tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">مثال: {settings.prefix_tenant || 'TNT'}-000001</p>
                </div>

                {/* Ticket Prefix */}
                <div className="bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <Ticket className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">كود التذاكر</span>
                    </div>
                    <InputField
                        label="البادئة (Prefix)"
                        value={settings.prefix_ticket || 'TKT'}
                        onChange={(e) => onChange('prefix_ticket', e.target.value.toUpperCase().substring(0, 3))}
                        placeholder="TKT"
                        className="font-black text-center text-lg tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">مثال: {settings.prefix_ticket || 'TKT'}-000001</p>
                </div>

                {/* Payment Prefix */}
                <div className="bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-purple-500">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">كود الفواتير</span>
                    </div>
                    <InputField
                        label="البادئة (Prefix)"
                        value={settings.prefix_payment || 'INV'}
                        onChange={(e) => onChange('prefix_payment', e.target.value.toUpperCase().substring(0, 3))}
                        placeholder="INV"
                        className="font-black text-center text-lg tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">مثال: {settings.prefix_payment || 'INV'}-000001</p>
                </div>

                {/* Ad Prefix */}
                <div className="bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-rose-500">
                        <Megaphone className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">كود الإعلانات</span>
                    </div>
                    <InputField
                        label="البادئة (Prefix)"
                        value={settings.prefix_ad || 'ADV'}
                        onChange={(e) => onChange('prefix_ad', e.target.value.toUpperCase().substring(0, 3))}
                        placeholder="ADV"
                        className="font-black text-center text-lg tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">مثال: {settings.prefix_ad || 'ADV'}-000001</p>
                </div>
            </div>

            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-[2rem]">
                <p className="text-xs text-amber-700 dark:text-amber-500 font-bold leading-relaxed text-center">
                    ملاحظة: تغيير البادئة سيؤثر فقط على العناصر الجديدة التي يتم إنشاؤها لاحقاً. العناصر الحالية ستحتفظ بأكوادها القديمة.
                </p>
            </div>
        </div>
    );
};
