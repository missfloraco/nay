import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import api, { initializeCsrf } from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { useText } from '@/shared/contexts/text-context';
import { AuthSplitLayout } from '@/features/auth/components/auth-split-layout';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/shared/layout/header/theme-toggle';

import { COUNTRIES } from '@/shared/constants';
import { LoginSchema, RegisterSchema, ForgotPasswordSchema } from '@/shared/utils/validation';
import { PasswordStrengthIndicator } from '@/features/auth/components/passwordstrengthindicator';
import { Lock, Mail, User, Globe, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowLeft, Home } from 'lucide-react';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verification' | 'reset-otp' | 'reset-password';

export default function AuthScreen({ initialMode = 'login' }: { initialMode?: AuthMode }) {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    // Split Auth Contexts
    const adminAuth = useAdminAuth();
    const tenantAuth = useTenantAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useText();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        country: 'PS',
        passwordConfirmation: '',
    });

    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [resendCountdown, setResendCountdown] = useState(0);

    useEffect(() => {
        const pass = formData.password;
        if (pass.length === 0) setPasswordStrength('weak');
        else if (pass.length < 6) setPasswordStrength('weak');
        else if (pass.length < 10) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    }, [formData.password]);

    // Check for Impersonation Token
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Auto-submit when code is full
    useEffect(() => {
        const code = verificationCode.join('');
        if ((mode === 'verification' || mode === 'reset-otp') && code.length === 6 && !loading) {
            handleSubmit({ preventDefault: () => { } } as React.FormEvent);
        }
    }, [verificationCode, mode]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('impersonate_token');
        if (token) {
            setLoading(true);
            tenantAuth.loginWithToken(token)
                .then(() => {
                    navigate('/app');
                })
                .catch((err) => {
                    logger.error('Impersonation failed', err);
                    setError('رابط الدخول غير صالح أو منتهي الصلاحية');
                    setLoading(false);
                });
        }
    }, [location.search, tenantAuth, navigate]);

    /**
     * Handle Unified Login
     */
    const handleUnifiedLogin = async () => {
        try {
            await initializeCsrf();
            const res = (await api.post('/login', {
                email: formData.email,
                password: formData.password
            })) as { user: any, type: string, token?: string };

            if (res.type === 'admin') {
                await adminAuth.refreshUser();
                navigate('/admin');
            } else {
                if (res.token) {
                    sessionStorage.setItem('tenant_token', res.token);
                }
                await tenantAuth.refreshUser();
                navigate('/app');
            }
        } catch (err: any) {
            throw err;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Logic handled by handleUnifiedLogin or registration logic below

        try {
            // Validation
            if (mode === 'login') {
                LoginSchema.parse({ email: formData.email, password: formData.password });
                await handleUnifiedLogin();
            } else if (mode === 'register') {
                RegisterSchema.parse(formData);
                const data = new FormData();
                data.append('name', formData.fullName);
                data.append('email', formData.email);
                data.append('password', formData.password);
                data.append('country', formData.country);
                data.append('currency', 'ILS');

                const res = await tenantAuth.register(data);
                if (res?.require_verification) {
                    setMode('verification');
                    setSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
                    return;
                }
                navigate('/app/dashboard');
            } else if (mode === 'verification') {
                const code = verificationCode.join('');
                if (code.length !== 6) {
                    setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
                    return;
                }
                await tenantAuth.completeRegistration(formData.email, code);
                navigate('/app/dashboard');
            } else if (mode === 'forgot-password') {
                ForgotPasswordSchema.parse({ email: formData.email });
                const res = await tenantAuth.forgotPassword(formData.email);
                if (res?.require_otp) {
                    setMode('reset-otp');
                    setSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
                } else {
                    setSuccess(t('AUTH.FORGOT_PASSWORD.SUCCESS_MESSAGE'));
                }
            } else if (mode === 'reset-otp') {
                const code = verificationCode.join('');
                if (code.length !== 6) {
                    setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
                    return;
                }
                await tenantAuth.verifyResetOTP(formData.email, code);
                setMode('reset-password');
                setSuccess('تم التحقق بنجاح. يرجى تعيين كلمة مرور جديدة.');
            } else if (mode === 'reset-password') {
                if (formData.password.length < 8) {
                    setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
                    return;
                }
                if (formData.password !== formData.passwordConfirmation) {
                    setError('كلمتا المرور غير متطابقتين');
                    return;
                }
                const code = verificationCode.join('');
                await tenantAuth.resetPassword(formData.email, code, formData.password, formData.passwordConfirmation);
                setSuccess('تم تغيير كلمة المرور بنجاح. سيتم تحويلك لصفحة الدخول...');
                setTimeout(() => {
                    setMode('login');
                    setFormData({ ...formData, password: '', passwordConfirmation: '' });
                }, 2000);
            }
        } catch (err: any) {
            logger.error('Auth error', err);
            if (err.errors) {
                // Zod Error
                setError(err.errors[0].message);
            } else if (err.response && err.response.data && err.response.data.message) {
                // API Error - Use specific message from backend
                setError(err.response.data.message);

                // Professional handling: Auto-switch to login if account exists
                if (err.response.status === 409 && err.response.data.action === 'login') {
                    setTimeout(() => {
                        setMode('login');
                        setSuccess('تم تحويلك لصفحة الدخول، يرجى كتابة كلمة المرور');
                        setError('');
                    }, 2000);
                }
            } else {
                // Fallback
                setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError('');
        setSuccess('');
    };

    const countryOptions = COUNTRIES.map(c => ({ value: c.code, label: c.name }));

    return (
        <AuthSplitLayout
            title={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.TITLE`)}
            subtitle={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBTITLE`)}
        >
            {/* Top Toolbar: Home & Theme Toggle (Aligned Right for RTL) */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-3 flex-row-reverse">
                <Link
                    to="/"
                    className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-gray-50 text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-gray-100 transition-all active:scale-95 group shadow-sm hover:shadow-md font-bold text-sm"
                    title="العودة للرئيسية"
                >
                    <span className="hidden sm:inline">الرئيسية</span>
                    <Home size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <ThemeToggle />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

                {/* Status Messages */}
                {(error || success) && (
                    <div
                        role="alert"
                        className={`p-4 border rounded-xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}
                    >
                        {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        <span>{error || success}</span>
                    </div>
                )}

                {/* Form Fields Container */}
                <div className="space-y-6">




                    {/* Registration/Login/ResetPassword Fields - Visible in Verification too (as disabled) */}
                    {(mode !== 'reset-otp' || mode === 'reset-otp') && (
                        <>
                            {/* Full Name Field - Register Only (or Verification context) */}
                            {(mode === 'register' || mode === 'verification') && (
                                <InputField
                                    label={t('AUTH.REGISTER.FULL_NAME_LABEL')}
                                    id="fullName"
                                    type="text"
                                    required
                                    disabled={mode === 'verification'}
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder={t('AUTH.REGISTER.FULL_NAME_PLACEHOLDER')}
                                    icon={User}
                                    autoComplete="name"
                                    className={mode === 'verification' ? 'opacity-70 bg-gray-50' : ''}
                                />
                            )}

                            {/* Email Field - Visible in almost all modes (Disabled in OTP/Reset steps) */}
                            <InputField
                                label={t(`AUTH.${(mode === 'forgot-password' || mode === 'reset-otp') ? 'FORGOT_PASSWORD' : (mode === 'reset-password' ? 'RESET-PASSWORD' : mode.toUpperCase())}.EMAIL_LABEL`)}
                                id="email"
                                type="email"
                                required
                                disabled={mode === 'verification' || mode === 'reset-otp' || mode === 'reset-password'}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t(`AUTH.${mode === 'register' ? 'REGISTER' : 'LOGIN'}.EMAIL_PLACEHOLDER`)}
                                icon={Mail}
                                autoComplete="email"
                                className={mode === 'verification' || mode === 'reset-otp' || mode === 'reset-password' ? 'opacity-70 bg-gray-50' : ''}
                            />

                            {/* Password Field - Not for Forgot Password */}
                            {mode !== 'forgot-password' && (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <InputField
                                            label={t(`AUTH.${mode.toUpperCase()}.PASSWORD_LABEL`)}
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            disabled={mode === 'verification'}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={t(`AUTH.${mode.toUpperCase()}.PASSWORD_PLACEHOLDER`)}
                                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                            className={`!pe-16 ${mode === 'verification' ? 'opacity-70 bg-gray-50' : ''}`} // Space for Eye icon
                                            endContent={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-gray-400 hover:text-primary transition-colors h-5 w-5 flex items-center justify-center p-0"
                                                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            }
                                        />
                                    </div>

                                    {mode === 'reset-password' && (
                                        <div className="relative group">
                                            <InputField
                                                label="تأكيد كلمة المرور"
                                                id="passwordConfirmation"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={formData.passwordConfirmation}
                                                onChange={e => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                                                placeholder="أعد كتابة كلمة المرور"
                                                autoComplete="new-password"
                                                className="!pe-16"
                                            />
                                        </div>
                                    )}

                                    {mode === 'login' && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => toggleMode('forgot-password')}
                                                className="text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                                            >
                                                {t('AUTH.LOGIN.FORGOT_PASSWORD')}
                                            </button>
                                        </div>
                                    )}

                                    {/* Password Strength Indicator */}
                                    {mode === 'register' && (
                                        <PasswordStrengthIndicator
                                            strength={passwordStrength}
                                            passwordLength={formData.password.length}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Country Field - Register Only (or Verification) */}
                            {(mode === 'register' || mode === 'verification') && (
                                <SelectField
                                    label={t('AUTH.REGISTER.COUNTRY_LABEL')}
                                    id="country"
                                    value={formData.country}
                                    disabled={mode === 'verification'}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    options={countryOptions}
                                    icon={Globe}
                                    className={mode === 'verification' ? 'opacity-70 bg-gray-50' : ''}
                                />
                            )}

                            {/* OTP Fields - Inserted visually "inside" the form for progressive flow */}
                            {(mode === 'verification' || mode === 'reset-otp') && (
                                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-gray-200"></div>
                                        <span className="text-sm font-bold text-gray-400">رمز التحقق</span>
                                        <div className="h-px flex-1 bg-gray-200"></div>
                                    </div>
                                    <p className="text-sm text-center font-medium text-gray-500">
                                        تم إرسال رمز التحقق إلى <span className="font-bold text-gray-900 dark:text-white">{formData.email}</span>
                                    </p>

                                    <div className="flex justify-center sm:justify-between gap-2 w-full" dir="ltr">
                                        {verificationCode.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                id={`otp-${idx}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^\d*$/.test(val)) {
                                                        const newCode = [...verificationCode];
                                                        newCode[idx] = val.slice(-1);
                                                        setVerificationCode(newCode);
                                                        if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !digit && idx > 0) {
                                                        document.getElementById(`otp-${idx - 1}`)?.focus();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault();
                                                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                                    if (pastedData) {
                                                        const newCode = [...verificationCode];
                                                        pastedData.split('').forEach((char, i) => { if (i < 6) newCode[i] = char; });
                                                        setVerificationCode(newCode);
                                                        const lastIdx = Math.min(pastedData.length - 1, 5);
                                                        document.getElementById(`otp-${lastIdx}`)?.focus();
                                                    }
                                                }}
                                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white dark:bg-dark-900 border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all outline-none"
                                                autoFocus={idx === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            disabled={resendCountdown > 0 || loading}
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    await tenantAuth.resendOTP(formData.email);
                                                    setSuccess('تم إرسال كود جديد');
                                                    setResendCountdown(60);
                                                } catch (err: any) {
                                                    setError(err.response?.data?.message || 'فشل إرسال الكود');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="text-xs font-bold text-gray-500 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {resendCountdown > 0 ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span>إعادة الإرسال خلال {resendCountdown} ثانية</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>لم يصلك الكود؟</span>
                                                    <span className="text-primary hover:underline">إعادة إرسال</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white rounded-xl font-black text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-transparent"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>جاري المعالجة...</span>
                        </>
                    ) : (
                        mode === 'verification' || mode === 'reset-otp' ? ((mode === 'verification') ? 'تأكيد الحساب' : 'تحقق من الرمز') :
                            mode === 'reset-password' ? 'تغيير كلمة المرور' :
                                t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBMIT`)
                    )}
                </button>



                {/* Mode Toggle Links */}
                <div className="pt-8 text-center">
                    {mode === 'login' ? (
                        <p className="text-gray-500 dark:text-gray-400 font-bold">
                            {t('AUTH.LOGIN.NO_ACCOUNT')}{' '}
                            <button
                                type="button"
                                onClick={() => toggleMode('register')}
                                className="text-primary hover:text-primary-dark font-black hover:underline transition-all"
                            >
                                {t('AUTH.LOGIN.REGISTER_NOW')}
                            </button>
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={() => toggleMode('login')}
                            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5 py-2 px-4 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('AUTH.LOGIN.BACK_TO_LOGIN')}
                        </button>
                    )}
                </div>
            </form >
        </AuthSplitLayout >
    );
}
