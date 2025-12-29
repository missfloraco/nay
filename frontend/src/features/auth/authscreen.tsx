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
        <AuthCard
            title={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.TITLE`)}
            subtitle={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBTITLE`)}
        >
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">

                {/* Status Messages */}
                {(error || success) && (
                    <div
                        role="alert"
                        className={`p-5 border-2 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${error ? 'bg-red-50/50 border-red-500/20 text-red-600' : 'bg-emerald-50/50 border-emerald-500/20 text-emerald-600'
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
                                    icon={Lock}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-6 top-[54px] text-gray-400 hover:text-primary transition-colors z-20"
                                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>

                                {mode === 'login' && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleMode('forgot-password')}
                                            className="text-xs font-black text-primary hover:underline transition-colors px-1"
                                        >
                                            {t('AUTH.LOGIN.FORGOT_PASSWORD')}
                                        </button>
                                    </div>
                                )}
                            </div>

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
                    className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>جاري المعالجة...</span>
                        </>
                    ) : (
                        t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBMIT`)
                    )}
                </button>

                {/* Mode Toggle Links */}
                <div className="pt-8 text-center border-t border-gray-100 dark:border-dark-800">
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
