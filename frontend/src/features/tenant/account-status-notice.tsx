import { AlertTriangle, Clock, XCircle, ShieldAlert, CreditCard, Headset, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { formatDate } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

export default function AccountStatusNotice() {
    const { user, logout, tenant } = useTenantAuth();
    const { isTrialExpired, isDisabled, status, noticeDate, noticeType } = useTrialStatus();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getModeConfig = () => {
        if (isDisabled) {
            return {
                title: 'تم تعطيل الحساب',
                description: 'تم تعطيل حسابك من قبل الإدارة لمخالفة الشروط أو لأسباب إدارية. يرجى التواصل معنا للاستيضاح.',
                icon: XCircle,
                accent: 'red',
                dateLabel: null,
                dateValue: null,
            };
        }
        if (noticeType === 'trial') {
            return {
                title: 'انتهت فترة التجربة المجانية',
                description: 'لقد استمتعت بفترة تجربة مميزة، والآن حان الوقت للانتقال للمستوى التالي وتفعيل اشتراكك الدائم.',
                icon: Clock,
                accent: 'amber',
                dateLabel: 'تاريخ انتهاء التجربة',
                dateValue: noticeDate,
            };
        }
        return {
            title: 'انتهت صلاحية الاشتراك',
            description: 'نأمل أن تكون تجربتك مع المنصة مثمرة. يرجى تجديد اشتراكك لمتابعة إدارة أعمالك بدون انقطاع.',
            icon: CreditCard,
            accent: 'orange',
            dateLabel: 'تاريخ انتهاء الاشتراك',
            dateValue: noticeDate,
        };
    };

    const config = getModeConfig();
    const Icon = config.icon;

    return (
        <div className="flex-1 flex items-center justify-center py-10 px-4 min-h-[80vh]" dir="rtl">
            <div className="max-w-2xl w-full">
                <div className="bg-white dark:bg-secondary-900/40 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 p-8 md:p-14 overflow-hidden relative">

                    {/* Background Decorative Element */}
                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${config.accent}-500/5 rounded-full blur-3xl`} />
                    <div className={`absolute -bottom-24 -left-24 w-64 h-64 bg-${config.accent}-500/5 rounded-full blur-3xl`} />

                    {/* Icon Section */}
                    <div className="flex justify-center mb-10 relative">
                        <div className={`p-8 rounded-[2.5rem] shadow-xl ${config.accent === 'red' ? 'bg-red-50 text-red-600 ring-8 ring-red-50/50' :
                            config.accent === 'amber' ? 'bg-amber-50 text-amber-600 ring-8 ring-amber-50/50' :
                                'bg-orange-50 text-orange-600 ring-8 ring-orange-50/50'
                            }`}>
                            <Icon className="w-16 h-16 animate-in zoom-in-50 duration-500" />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="text-center space-y-4 mb-10 relative">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                            {config.title}
                        </h1>
                        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-lg mx-auto">
                            {config.description}
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-8 mb-10 border border-gray-100 dark:border-white/5 shadow-inner">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 border-b border-gray-200/50 dark:border-white/5 pb-4">
                                <ShieldAlert className="w-5 h-5 text-gray-400" />
                                <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-widest">معلومات الحساب</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المشترك / المتجر</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">{tenant?.name || user?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">البريد الإلكتروني</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">{user?.email}</p>
                                </div>
                                {config.dateLabel && config.dateValue && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{config.dateLabel}</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{formatDate(config.dateValue)}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">حالة الحساب</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${config.accent}-500 animate-pulse`} />
                                        <p className={`font-black text-sm text-${config.accent}-600`}>
                                            {isDisabled ? 'معطل مؤقتاً' : 'بحاجة للتجديد'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/app/billing')}
                            className="flex-1 h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20"
                        >
                            {isDisabled ? 'تواصل معنا للتفعيل' : 'تجديد الاشتراك الآن'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/app/support/messages')}
                            className="flex-1 h-14 rounded-2xl font-black text-base bg-gray-100 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300"
                        >
                            <Headset className="w-5 h-5 ml-2" />
                            تحدث مع الدعم
                        </Button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-8 text-xs font-black text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج من الحساب
                    </button>
                </div>

                <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-10 opacity-50">
                    جميع الحقوق محفوظة © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
