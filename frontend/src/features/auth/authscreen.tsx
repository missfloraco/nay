import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import api, { initializeCsrf } from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { useText } from '@/shared/contexts/text-context';
import { AuthSplitLayout } from '@/features/auth/components/auth-split-layout';
import { Link } from 'react-router-dom';
import {
    Lock, Mail, User, Globe, AlertCircle, CheckCircle2,
    Eye, EyeOff, Loader2, ArrowLeft
} from 'lucide-react';

import { LoginSchema, RegisterSchema, ForgotPasswordSchema } from '@/shared/utils/validation';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import ar from 'react-phone-number-input/locale/ar.json';
import 'react-phone-number-input/style.css';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';

const ALLOWED_COUNTRIES = [
    'PS', 'SA', 'AE', 'EG', 'JO', 'MA', 'KW', 'BH', 'QA', 'OM',
    'LB', 'SY', 'IQ', 'DZ', 'TN', 'LY', 'SD', 'YE', 'SO', 'MR',
    'DJ', 'KM'
];

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verification' | 'reset-otp' | 'reset-password';

// --- Custom Elite Country Selector ---
const CountrySelect = ({ value, onChange, labels }: any) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const countries = ALLOWED_COUNTRIES.map(c => {
        const countryLabels = labels || ar || {};
        return {
            code: c,
            name: countryLabels[c] || c,
            dialCode: getCountryCallingCode(c as any)
        };
    }).filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const SelectedFlag = ({ country }: { country: string }) => (
        <div className="w-7 h-5 rounded-sm overflow-hidden shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
            <img
                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
                alt={country}
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <div className="h-full flex items-center" ref={dropdownRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="h-full px-6 flex items-center gap-2 transition-all outline-none relative z-10"
            >
                <SelectedFlag country={value || 'PS'} />
            </button>

            {open && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                        {countries.map((c) => (
                            <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                    onChange(c.code);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${value === c.code ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-6 rounded-sm overflow-hidden shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
                                        <img
                                            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${c.code}.svg`}
                                            alt={c.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <span className="text-sm font-bold">{c.name}</span>
                                </div>
                                <span className={`text-xs font-black ${value === c.code ? 'text-primary' : 'text-gray-400'}`}>+{c.dialCode}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

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
        phone: '',
        password: '',
        country: 'PS',
        passwordConfirmation: '',
    });

    const [verificationCode, setVerificationCode] = useState('');
    const [resendCountdown, setResendCountdown] = useState(0);

    // Auto-submit when code is full
    useEffect(() => {
        if ((mode === 'verification' || mode === 'reset-otp') && verificationCode.length === 6 && !loading) {
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

        try {
            // Validation
            if (mode === 'login') {
                LoginSchema.parse({ email: formData.email, password: formData.password });
                await handleUnifiedLogin();
            } else if (mode === 'register') {
                if (!isValidPhoneNumber(formData.phone)) {
                    setError('رقم الهاتف غير صالح');
                    setLoading(false);
                    return;
                }

                const registerData = {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    country: formData.country,
                };

                const res = await tenantAuth.register(registerData) as any;
                if (res?.require_verification) {
                    setMode('verification');
                    setSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
                    return;
                }
                navigate('/app/dashboard');
            } else if (mode === 'verification') {
                if (verificationCode.length !== 6) {
                    setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
                    return;
                }
                const code = verificationCode; // It's already a string now
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
                if (verificationCode.length !== 6) {
                    setError('يرجى إدخال رمز التحقق');
                    return;
                }
                const code = verificationCode;
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
                const code = verificationCode;
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

    const handleModeChange = (newMode: AuthMode) => {
        setMode(newMode);
        setError('');
        setSuccess('');
    };

    const handleOtpChange = (idx: number, val: string) => {
        const cleanVal = val.replace(/\D/g, '').slice(-1);
        const newCode = [...verificationCode];
        newCode[idx] = cleanVal;
        setVerificationCode(newCode);

        // Auto focus next
        if (cleanVal && idx < 5) {
            document.getElementById(`otp-${idx + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[idx] && idx > 0) {
            document.getElementById(`otp-${idx - 1}`)?.focus();
        }
    };

    return (
        <AuthSplitLayout
            title={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.TITLE`)}
            subtitle={t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBTITLE`)}
        >
            <Helmet>
                <title>{t(`AUTH.${mode.toUpperCase()}.TITLE`)} | {t('APP.NAME')}</title>
                <meta name="description" content={t(`AUTH.${mode.toUpperCase()}.SUBTITLE`)} />
            </Helmet>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .phone-input-inline {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    direction: ltr; /* Control order via flex properties */
                }
                .phone-input-inline .PhoneInputInput {
                    flex: 1;
                    height: 64px;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 15px;
                    font-weight: 700;
                    padding: 0 20px;
                    color: inherit;
                    order: 2;
                    text-align: right; /* Text typed from right to left */
                }
                .phone-input-inline .PhoneInputCountry {
                    order: 1;
                    margin-left: 0;
                    margin-right: 0;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                }
            `}</style>

            <div className="animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Status Messages */}
                    {(error || success) && (
                        <div
                            role="alert"
                            className={`p-4 border rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                }`}
                        >
                            {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <span>{error || success}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Primary Stack: Name -> Email -> Phone -> Password */}
                        {mode === 'register' && (
                            <InputField
                                id="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder={t('AUTH.REGISTER.FULL_NAME_LABEL')}
                                icon={User}
                                autoComplete="name"
                            />
                        )}

                        <InputField
                            id="email"
                            type="email"
                            required
                            disabled={mode === 'verification' || mode === 'reset-otp' || mode === 'reset-password'}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t('AUTH.LOGIN.EMAIL_LABEL')}
                            icon={Mail}
                            autoComplete="email"
                            className={mode === 'verification' || mode === 'reset-otp' || mode === 'reset-password' ? 'opacity-70 bg-gray-50' : ''}
                        />

                        {mode === 'register' && (
                            <div className="relative group/phone">
                                <div className="w-full h-16 bg-gray-50/50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5 rounded-[1.25rem] transition-all duration-500 hover:bg-white dark:hover:bg-dark-800 hover:border-gray-200 focus-within:bg-white dark:focus-within:bg-dark-800 focus-within:border-primary focus-within:shadow-[0_0_0_1px_var(--primary)] focus-within:ring-8 focus-within:ring-primary/5 flex items-center relative z-[40]">
                                    <PhoneInput
                                        international
                                        addInternationalOption={false}
                                        labels={ar}
                                        country={formData.country as any}
                                        onCountryChange={(v) => {
                                            if (v) setFormData(prev => ({ ...prev, country: v }));
                                        }}
                                        countries={ALLOWED_COUNTRIES as any}
                                        value={formData.phone}
                                        onChange={(val) => setFormData(prev => ({ ...prev, phone: val || '' }))}
                                        className="phone-input-inline"
                                        placeholder="رقم الهاتف (الدولة)"
                                        countrySelectComponent={CountrySelect}
                                        countryCallingCodeEditable={false}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password Section */}
                        {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
                            <div className="space-y-5">
                                <InputField
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={t('AUTH.LOGIN.PASSWORD_LABEL')}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    icon={Lock}
                                />

                                {mode === 'reset-password' && (
                                    <InputField
                                        id="passwordConfirmation"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.passwordConfirmation}
                                        onChange={e => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                                        placeholder="تأكيد كلمة المرور"
                                        icon={Lock}
                                    />
                                )}

                                {mode === 'login' && (
                                    <div className="flex justify-end px-1">
                                        <button
                                            type="button"
                                            onClick={() => handleModeChange('forgot-password')}
                                            className="text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                                        >
                                            {t('AUTH.LOGIN.FORGOT_PASSWORD')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OTP Verification / Reset OTP Section */}
                        {(mode === 'verification' || mode === 'reset-otp') && (
                            <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="space-y-4">
                                    <div className="w-full">
                                        <InputField
                                            type="text"
                                            placeholder="أدخل رمز التحقق (رمز من 6 أرقام)"
                                            value={verificationCode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                                setVerificationCode(val);
                                            }}
                                            className="text-center text-2xl tracking-[0.5em] font-black placeholder:tracking-normal placeholder:text-base placeholder:font-bold"
                                            icon={CheckCircle2}
                                            autoFocus
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <p className="text-xs text-center font-bold text-gray-500 leading-relaxed px-4">
                                        تم إرسال الرمز إلى <span className="text-primary">{formData.email}</span>
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        disabled={resendCountdown > 0 || loading}
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                await tenantAuth.resendOTP(formData.email);
                                                setSuccess('تم إعادة إرسال الرمز بنجاح');
                                                setResendCountdown(60);
                                            } catch (err: any) {
                                                setError(err.response?.data?.message || 'فشل إعادة الإرسال');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="text-xs font-black text-gray-400 hover:text-primary disabled:opacity-50 transition-colors py-2 px-4 rounded-xl hover:bg-primary/5 flex items-center gap-2"
                                    >
                                        {resendCountdown > 0 ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>إعادة الإرسال خلال {resendCountdown} ثانية</span>
                                            </>
                                        ) : (
                                            <span>إعادة إرسال الرمز</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit and Navigation */}
                    <div className="space-y-6 pt-6 border-t border-gray-50 dark:border-white/5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <span>
                                    {mode === 'verification' || mode === 'reset-otp' ? 'تحقق ومتابعة' :
                                        mode === 'reset-password' ? 'تغيير كلمة المرور' :
                                            t(`AUTH.${mode === 'forgot-password' ? 'FORGOT_PASSWORD' : mode.toUpperCase()}.SUBMIT`)}
                                </span>
                            )}
                        </button>

                        <div className="space-y-4">
                            {mode === 'login' && (
                                <p className="text-center text-sm font-bold text-gray-400">
                                    ليس لديك حساب بعد؟{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleModeChange('register')}
                                        className="text-primary hover:underline font-black"
                                    >
                                        إنشاء حساب جديد مجاناً
                                    </button>
                                </p>
                            )}

                            {mode === 'register' && (
                                <p className="text-center text-sm font-bold text-gray-400">
                                    لديك حساب بالفعل؟{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleModeChange('login')}
                                        className="text-primary hover:underline font-black"
                                    >
                                        تسجيل الدخول
                                    </button>
                                </p>
                            )}

                            {(mode === 'forgot-password' || mode === 'verification' || mode === 'reset-otp' || mode === 'reset-password') && (
                                <button
                                    type="button"
                                    onClick={() => handleModeChange('login')}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-black text-gray-400 hover:text-primary transition-all group"
                                >
                                    <span>العودة لتسجيل الدخول</span>
                                    <ArrowLeft size={16} className="transition-transform group-hover:translate-x-1 rotate-180" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AuthSplitLayout>
    );
}
