import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import api, { initializeCsrf } from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { User as UserModel, Tenant } from '@/core/models/index';
import { useText } from '@/shared/contexts/text-context';
import { AuthCard } from '@/features/auth/components/authcard';
import { Store, UserCircle2, ArrowRightLeft, Lock, Mail, User, ShieldCheck, Sparkles, LayoutDashboard, Database, Terminal, Globe, Search, Bell, Settings, Languages, HelpCircle, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

import { UI_TEXT } from '@/shared/locales/texts';
import { COUNTRIES } from '@/shared/constants';
import { LoginSchema, RegisterSchema, ForgotPasswordSchema } from '@/shared/utils/validation';
import { PasswordStrengthIndicator } from './components/passwordstrengthindicator';

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function AuthScreen({ initialMode = 'login' }: { initialMode?: AuthMode }) {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    // Split Auth Contexts
    const adminAuth = useAdminAuth();
    const tenantAuth = useTenantAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname.includes('/login');

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
                // Manually update admin context since we bypassed his login method
                // We'll just refresh him to be sure
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

    return (
        <AuthCard
            title={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.TITLE`)}
            subtitle={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBTITLE`)}
        >
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">

                {/* Error Message - Enhanced with Onboarding styling */}
                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="p-5 bg-accent2/10 border-2 border-accent2/20 text-accent2 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Message - Enhanced with Onboarding styling */}
                {success && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="p-5 bg-accent1/10 border-2 border-accent1/20 text-accent1 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300"
                    >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Form Fields Container */}
                <div className="space-y-6">
                    {/* Full Name Field - Register Only */}
                    {mode === 'register' && (
                        <div className="space-y-3">
                            <label htmlFor="fullName" className="block text-sm font-black text-gray-700 dark:text-gray-300">
                                {t('AUTH.REGISTER.FULL_NAME_LABEL')}
                            </label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder={t('AUTH.REGISTER.FULL_NAME_PLACEHOLDER')}
                                    className="onboarding-input pl-14"
                                    aria-label={t('AUTH.REGISTER.FULL_NAME_LABEL')}
                                    aria-required="true"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-3">
                        <label htmlFor="email" className="block text-sm font-black text-gray-700 dark:text-gray-300">
                            {t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.EMAIL_LABEL`)}
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" aria-hidden="true" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t(`AUTH.${mode === 'register' ? 'REGISTER' : 'LOGIN'}.EMAIL_PLACEHOLDER`)}
                                className="onboarding-input pl-14"
                                aria-label={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.EMAIL_LABEL`)}
                                aria-required="true"
                                aria-invalid={error ? 'true' : 'false'}
                            />
                        </div>
                    </div>

                    {/* Password Field - Not for Forgot Password */}
                    {mode !== 'forgot-password' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-black text-gray-700 dark:text-gray-300">
                                    {t(`AUTH.${mode.toUpperCase()}.PASSWORD_LABEL`)}
                                </label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => toggleMode('forgot-password')}
                                        className="text-xs font-bold text-primary hover:underline transition-colors"
                                        aria-label="نسيت كلمة المرور"
                                    >
                                        {t('AUTH.LOGIN.FORGOT_PASSWORD')}
                                    </button>
                                )}
                            </div>
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
                                    placeholder={t(`AUTH.${mode.toUpperCase()}.PASSWORD_PLACEHOLDER`)}
                                    className="onboarding-input pl-14"
                                    aria-label={t(`AUTH.${mode.toUpperCase()}.PASSWORD_LABEL`)}
                                    aria-required="true"
                                    aria-invalid={error ? 'true' : 'false'}
                                />
                            </div>

                            {/* Password Strength Indicator - Enhanced */}
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
                        <div className="space-y-3">
                            <label htmlFor="country" className="block text-sm font-black text-gray-700 dark:text-gray-300">
                                {t('AUTH.REGISTER.COUNTRY_LABEL')}
                            </label>
                            <div className="relative group">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                <select
                                    id="country"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    className="onboarding-input pl-14 appearance-none cursor-pointer"
                                    aria-label={t('auth.register.countryLabel')}
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button - Enhanced with Onboarding styling */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-8"
                    aria-label={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBMIT`)}
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

                {/* Mode Toggle Links - Enhanced */}
                <div className="pt-6 text-center border-t border-gray-200 dark:border-dark-800">
                    {mode === 'login' ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                            {t('AUTH.LOGIN.NO_ACCOUNT')}{' '}
                            <button
                                type="button"
                                onClick={() => toggleMode('register')}
                                className="text-primary hover:underline font-black transition-colors"
                            >
                                {t('AUTH.LOGIN.REGISTER_NOW')}
                            </button>
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={() => toggleMode('login')}
                            className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-primary flex items-center justify-center gap-2 mx-auto transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            {t('AUTH.LOGIN.BACK_TO_LOGIN')}
                        </button>
                    )}
                </div>
            </form>
        </AuthCard>
    );
}
