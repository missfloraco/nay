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
import { PasswordStrengthIndicator } from './components/passwordstrengthindicator';
import { Lock, Mail, User, Globe, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowLeft, Home } from 'lucide-react';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verification';

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
        if (mode === 'verification' && code.length === 6 && !loading) {
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
                await tenantAuth.forgotPassword(formData.email);
                setSuccess(t('AUTH.FORGOT_PASSWORD.SUCCESS_MESSAGE'));
            }
        } catch (err: any) {
            logger.error('Auth error', err);
            if (err.errors) {
                // Zod Error
                setError(err.errors[0].message);
            } else if (err.response && err.response.data && err.response.data.message) {
                // API Error - Use specific message from backend
                setError(err.response.data.message);
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
                    {/* Verification OTP Digits - Professional UI */}
                    {mode === 'verification' && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">رمز التحقق</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    أدخل الرمز المكون من 6 أرقام المرسل إلى <br />
                                    <span className="text-gray-900 dark:text-white font-bold">{formData.email}</span>
                                </p>
                            </div>

                            <div className="flex justify-between gap-2" dir="ltr">
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
                                                newCode[idx] = val.slice(-1); // Only take last char if somehow more
                                                setVerificationCode(newCode);
                                                // Auto focus next
                                                if (val && idx < 5) {
                                                    document.getElementById(`otp-${idx + 1}`)?.focus();
                                                }
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
                                                pastedData.split('').forEach((char, i) => {
                                                    if (i < 6) newCode[i] = char;
                                                });
                                                setVerificationCode(newCode);
                                                // Focus last filled or next empty
                                                const lastIdx = Math.min(pastedData.length - 1, 5);
                                                document.getElementById(`otp-${lastIdx}`)?.focus();
                                            }
                                        }}
                                        className="w-12 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-800 rounded-2xl transition-all outline-none"
                                        autoFocus={idx === 0}
                                    />
                                ))}
                            </div>

                            <div className="text-center">
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
                                    className="text-sm font-bold text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                                >
                                    {resendCountdown > 0 ? `إعادة الإرسال خلال ${resendCountdown} ثانية` : 'إعادة إرسال الكود؟'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Registration/Login Fields */}
                    {mode !== 'verification' && (
                        <>
                            {/* Full Name Field - Register Only */}
                            {mode === 'register' && (
                                <InputField
                                    label={t('AUTH.REGISTER.FULL_NAME_LABEL')}
                                    id="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder={t('AUTH.REGISTER.FULL_NAME_PLACEHOLDER')}
                                    icon={User}
                                    autoComplete="name"
                                />
                            )}

                            {/* Email Field - Hide in Verification Mode */}
                            <InputField
                                label={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.EMAIL_LABEL`)}
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t(`AUTH.${mode === 'register' ? 'REGISTER' : 'LOGIN'}.EMAIL_PLACEHOLDER`)}
                                icon={Mail}
                                autoComplete="email"
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
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={t(`AUTH.${mode.toUpperCase()}.PASSWORD_PLACEHOLDER`)}
                                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                            className="!pe-16" // Space for Eye icon
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

                            {/* Country Field - Register Only */}
                            {mode === 'register' && (
                                <SelectField
                                    label={t('AUTH.REGISTER.COUNTRY_LABEL')}
                                    id="country"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    options={countryOptions}
                                    icon={Globe}
                                />
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
                        mode === 'verification' ? 'تأكيد الحساب' :
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
            </form>
        </AuthSplitLayout>
    );
}
