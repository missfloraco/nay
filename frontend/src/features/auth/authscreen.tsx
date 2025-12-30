import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import api, { initializeCsrf } from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { useText } from '@/shared/contexts/text-context';
import { AuthSplitLayout } from '@/features/auth/components/auth-split-layout';
import { Lock, Mail, User, Globe, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

import { COUNTRIES } from '@/shared/constants';
import { LoginSchema, RegisterSchema, ForgotPasswordSchema } from '@/shared/utils/validation';
import { PasswordStrengthIndicator } from './components/passwordstrengthindicator';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';

type AuthMode = 'login' | 'register' | 'forgot-password';

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

    useEffect(() => {
        const pass = formData.password;
        if (pass.length === 0) setPasswordStrength('weak');
        else if (pass.length < 6) setPasswordStrength('weak');
        else if (pass.length < 10) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    }, [formData.password]);

    // Check for Impersonation Token
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

                await tenantAuth.register(data);
                navigate('/app/dashboard');
            } else if (mode === 'forgot-password') {
                ForgotPasswordSchema.parse({ email: formData.email });
                await tenantAuth.forgotPassword(formData.email);
                setSuccess(t('AUTH.FORGOT_PASSWORD.SUCCESS_MESSAGE'));
            }
        } catch (err: any) {
            if (err.errors) {
                // Zod Error
                setError(err.errors[0].message);
            } else {
                // API Error
                setError(err.response?.data?.message || 'البيانات المدخلة غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.');
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

                    {/* Email Field */}
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
                        t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBMIT`)
                    )}
                </button>

                {/* Social Login Section */}
                {mode !== 'forgot-password' && (
                    <div className="space-y-6 pt-4">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-x-0 h-px bg-gray-100 dark:bg-white/5 top-1/2" />
                            <span className="relative bg-white dark:bg-dark-950 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                أو تابع باستخدام
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-3 h-12 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-dark-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all hover:shadow-md group">
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-3 h-12 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-dark-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all hover:shadow-md group">
                                <svg className="w-5 h-5 text-gray-900 dark:text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.33-.16-1.14-.52-2.18-.54-1.12.02-1.95.42-2.31.59-1.02.48-2.12.57-3.09-.38-1.91-1.89-3.32-6.52-1.39-9.92.97-1.7 2.7-2.83 4.67-2.85 1.09 0 2 .59 2.62.59.57 0 1.63-.64 2.8-.52 1.18.11 2.21.69 2.87 1.65-2.61 1.57-2.18 5.76.62 6.89-.52 1.53-1.22 3.05-2.15 3.99l.62.1zm-3.41-16.5c.66-1.44 2.37-2.22 2.37-2.22-.05 1.95-1.76 3.4-3.14 3.47-.46-1.63 1.11-2.69 1.77-1.25z" />
                                </svg>
                                <span>Apple</span>
                            </button>
                        </div>
                    </div>
                )}


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
