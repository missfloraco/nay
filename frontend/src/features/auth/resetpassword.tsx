import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from './components/authcard';
import {
    Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound
} from 'lucide-react';
import api, { initializeCsrf } from '@/shared/services/api';
import { PasswordStrengthIndicator } from './components/passwordstrengthindicator';

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
            <AuthCard
                title="تم بنجاح!"
                subtitle="تم إعادة تعيين كلمة المرور بنجاح"
            >
                <div className="text-center py-8 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-accent1/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-accent1/10">
                        <CheckCircle2 className="w-12 h-12 text-accent1 animate-pulse" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-6">
                        سيتم تحويلك إلى صفحة تسجيل الدخول...
                    </p>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="إعادة تعيين كلمة المرور"
            subtitle="أدخل كلمة المرور الجديدة لحسابك"
        >
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">

                {/* Error Message */}
                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="p-4 bg-accent2/10 border-2 border-accent2/20 text-accent2 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Token/Email Info Display */}
                {email && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                            إعادة تعيين كلمة المرور لـ:
                        </p>
                        <p className="text-sm font-black text-primary">
                            {email}
                        </p>
                    </div>
                )}

                {/* New Password Field */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-black text-gray-700 dark:text-gray-300 mr-2">
                        كلمة المرور الجديدة
                    </label>
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors z-10"
                            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="onboarding-input pl-14"
                            aria-label="كلمة المرور الجديدة"
                            aria-required="true"
                            aria-invalid={error ? 'true' : 'false'}
                            minLength={8}
                        />
                    </div>

                    {/* Password Strength Indicator */}
                    <PasswordStrengthIndicator
                        strength={passwordStrength}
                        passwordLength={formData.password.length}
                    />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-black text-gray-700 dark:text-gray-300 mr-2">
                        تأكيد كلمة المرور
                    </label>
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent1 transition-colors z-10"
                            aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="onboarding-input pl-14"
                            aria-label="تأكيد كلمة المرور"
                            aria-required="true"
                            minLength={8}
                        />
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword.length > 0 && (
                        <div className="pt-1 px-1 animate-in fade-in duration-300">
                            {formData.password === formData.confirmPassword ? (
                                <p className="text-xs font-bold text-accent1 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    كلمات المرور متطابقة
                                </p>
                            ) : (
                                <p className="text-xs font-bold text-accent2 flex items-center gap-1.5">
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
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    aria-label="إعادة تعيين كلمة المرور"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>جاري المعالجة...</span>
                        </>
                    ) : (
                        'إعادة تعيين كلمة المرور'
                    )}
                </button>

                {/* Back to Login Link */}
                <div className="pt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-primary transition-colors"
                    >
                        العودة لتسجيل الدخول
                    </button>
                </div>
            </form>
        </AuthCard>
    );
}
