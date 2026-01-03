import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';

import { formatDate } from '@/shared/utils/helpers';

export default function TrialExpired() {
    const { user, logout } = useTenantAuth();
    const { isTrialExpired, isDisabled, trialExpiresAt } = useTrialStatus();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };



    return (
        <div className="flex-1 flex items-center justify-center py-10 px-4" dir="rtl">
            <div className="max-w-2xl w-full">
                <div className="bg-white dark:bg-secondary-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 p-12">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className={`p-6 rounded-3xl ${isDisabled ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                            {isDisabled ? (
                                <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
                            ) : (
                                <Clock className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white text-center mb-4">
                        {isDisabled ? 'تم تعطيل الحساب' : 'انتهت فترة التجربة المجانية'}
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        {isDisabled ? (
                            'تم تعطيل حسابك من قبل الإدارة. يرجى التواصل مع فريق الدعم للحصول على المساعدة.'
                        ) : (
                            <>
                                انتهت فترة التجربة المجانية لحسابك في <span className="font-bold text-gray-900 dark:text-white">{formatDate(trialExpiresAt)}</span>.
                                <br />
                                للاستمرار في استخدام النظام، يرجى التواصل مع الإدارة لتفعيل حسابك.
                            </>
                        )}
                    </p>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">معلومات الحساب</h3>
                                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <p><span className="font-bold">البريد الإلكتروني:</span> {user?.email}</p>
                                    <p><span className="font-bold">اسم المتجر:</span> {user?.name}</p>
                                    {!isDisabled && trialExpiresAt && (
                                        <p><span className="font-bold">تاريخ انتهاء التجربة:</span> {formatDate(trialExpiresAt)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <a
                            href="mailto:support@example.com"
                            className="w-full py-4 px-6 bg-primary text-white rounded-2xl font-black text-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            التواصل مع الدعم الفني
                        </a>
                        <button
                            onClick={handleLogout}
                            className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            تسجيل الخروج
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                    © {new Date().getFullYear()} جميع الحقوق محفوظة
                </p>
            </div>
        </div>
    );
}
