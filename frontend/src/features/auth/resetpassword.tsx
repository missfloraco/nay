import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthSplitLayout } from './components/auth-split-layout';
import {
    Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound
} from 'lucide-react';
import api, { initializeCsrf } from '@/shared/services/api';
import { PasswordStrengthIndicator } from './components/passwordstrengthindicator';
import InputField from '@/shared/ui/forms/input-field';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('رابط إعادة تعيين كلمة المرور غير صالح');
        }
    }, [token, email]);

    useEffect(() => {
        const pass = formData.password;
        if (pass.length === 0) setPasswordStrength('weak');
        else if (pass.length < 6) setPasswordStrength('weak');
        else if (pass.length < 10) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    }, [formData.password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        setLoading(true);

        try {
            await initializeCsrf();
            await api.post('/app/reset-password', {
                token,
                email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            });

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ ما. يرجى المحاولة لاحقاً.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthSplitLayout
                title="تم بنجاح!"
                subtitle="تم إعادة تعيين كلمة المرور بنجاح"
            >
                <div className="text-center py-8 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100/50">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-6 font-bold">
                        تم تغيير كلمة المرور بأمان.
                        <br />
                        سيتم تحويلك إلى صفحة تسجيل الدخول...
                    </p>
                </div>
            </AuthSplitLayout>
        );
    }

    return (
        <AuthSplitLayout
            title="إعادة تعيين كلمة المرور"
            subtitle="أدخل كلمة المرور الجديدة لحسابك"
        >
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">

                {/* Status Message */}
                {error && (
                    <div
                        role="alert"
                        className="p-5 bg-red-50/50 border-2 border-red-500/20 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Info Display */}
                {email && (
                    <div className="p-5 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                الحساب المستهدف
                            </p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {email}
                            </p>
                        </div>
                    </div>
                )}

                {/* New Password Field */}
                <div className="space-y-4">
                    <div className="relative group">
                        <InputField
                            label="كلمة المرور الجديدة"
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="!pe-16"
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-primary transition-colors h-5 w-5 flex items-center justify-center p-0"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />
                    </div>

                    {/* Password Strength Indicator */}
                    <PasswordStrengthIndicator
                        strength={passwordStrength}
                        passwordLength={formData.password.length}
                    />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-4">
                    <div className="relative group">
                        <InputField
                            label="تأكيد كلمة المرور"
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="!pe-16"
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-gray-400 hover:text-primary transition-colors h-5 w-5 flex items-center justify-center p-0"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword.length > 0 && (
                        <div className="pt-1 px-1 animate-in fade-in duration-300">
                            {formData.password === formData.confirmPassword ? (
                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    كلمات المرور متطابقة
                                </p>
                            ) : (
                                <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    كلمات المرور غير متطابقة
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !token || !email}
                    className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>جاري المعالجة...</span>
                        </>
                    ) : (
                        'تحديث كلمة المرور'
                    )}
                </button>

                {/* Back to Login Link */}
                <div className="pt-8 text-center border-t border-gray-100 dark:border-dark-800">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-primary transition-colors"
                    >
                        العودة لتسجيل الدخول
                    </button>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
