import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { Clock, ShieldAlert, LogOut, MessageCircle, Headset } from 'lucide-react';

export default function ActivationWaiting() {
    const { tenant, logout } = useTenantAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex items-center justify-center py-10" dir="rtl">
            <div className="max-w-md w-full bg-white dark:bg-secondary-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
                        <Clock className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-accent2 text-white p-2 rounded-xl shadow-lg ring-4 ring-white dark:ring-dark-900">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">بانتظار التفعيل</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                        مرحباً <span className="text-primary">{tenant?.name}</span>، تم استلام طلب تسجيلك بنجاح.
                        يجب تفعيل حسابك من قبل الإدارة قبل البدء باستخدام النظام.
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 text-right">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                            <MessageCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-amber-900 dark:text-amber-400">تحتاج مساعدة؟</h4>
                            <p className="text-xs font-bold text-amber-700/80 dark:text-amber-500/80">تواصل مع الدعم الفني لتسريع عملية التفعيل.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/app/support/messages')}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Headset className="w-5 h-5" />
                        فتح تذكرة دعم فني
                    </button>
                    <button
                        onClick={() => window.location.href = `https://wa.me/${settings?.supportWhatsapp || ''}`}
                        className="w-full py-4 bg-[#25D366]/10 text-[#25D366] rounded-2xl font-black hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-3 border border-[#25D366]/20"
                    >
                        تواصل عبر واتساب
                    </button>
                    <button
                        onClick={logout}
                        className="w-full py-4 bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-dark-700 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                    </button>
                </div>

                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
                    شكراً لثقتك بمنصة {settings?.appName}
                </p>
            </div>
        </div>
    );
}
