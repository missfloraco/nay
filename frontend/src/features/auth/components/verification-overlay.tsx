import React, { useState, useEffect } from 'react';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import axios from 'axios';
import { Loader2, Mail, Lock, LogOut, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerificationOverlay() {
    const { user, refreshUser, logout } = useTenantAuth();
    const [code, setCode] = useState<string[]>(new Array(6).fill(""));
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    // Focus management for OTP inputs
    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newCode = [...code];
        newCode[index] = element.value;
        setCode(newCode);

        // Focus next input
        if (element.value && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            // Focus previous input on backspace if current is empty
            const inputs = document.querySelectorAll<HTMLInputElement>('input.otp-input');
            if (inputs[index - 1]) inputs[index - 1].focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.some(char => isNaN(Number(char)))) return;

        const newCode = [...code];
        pastedData.forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);

        // Focus last filled input
        const inputs = document.querySelectorAll<HTMLInputElement>('input.otp-input');
        const lastIndex = Math.min(pastedData.length, 5);
        if (inputs[lastIndex]) inputs[lastIndex].focus();
    };


    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) return;

        setStatus('submitting');
        setErrorMessage('');

        try {
            await axios.post('/api/app/email/verify', { code: fullCode });
            setStatus('success');
            setTimeout(async () => {
                await refreshUser();
                // Overlay will naturally disappear as user.email_verified_at becomes true
            }, 1000);
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
            // Clear code on error? Maybe not all of it.
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            await axios.post('/api/app/email/verification-notification');
            setCountdown(60); // 1 minute cooldown
        } catch (error) {
            console.error(error);
        }
    };

    // Countdown timer effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Auto-submit when all fields are filled
    useEffect(() => {
        if (code.every(digit => digit !== '') && status !== 'submitting' && status !== 'success') {
            handleVerify();
        }
    }, [code]);

    // Don't render if user is verified (Double check, though parent should control this too)
    if (user?.email_verified_at) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden border border-white/20">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center ring-8 ring-blue-50/50 dark:ring-blue-900/10">
                        <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تأكيد الهوية</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    أدخل رمز التحقق المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني
                    <span className="block font-semibold text-gray-700 dark:text-gray-300 mt-1">{user?.email}</span>
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 mb-8" dir="ltr">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-gray-50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none otp-input
                                ${status === 'error'
                                    ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Error Message */}
                {status === 'error' && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg flex items-center gap-2 justify-center animate-in slide-in-from-top-2">
                        <span className="font-bold">خطأ:</span> {errorMessage}
                    </div>
                )}

                {/* Success Message */}
                {status === 'success' && (
                    <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-sm rounded-lg flex items-center gap-2 justify-center animate-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5" /> جاري تفعيل الحساب...
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleVerify}
                        disabled={status === 'submitting' || status === 'success'}
                        className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                    >
                        {status === 'submitting' ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> جاري التحقق...
                            </span>
                        ) : 'تفعيل الحساب'}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> تسجيل خروج
                        </button>

                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || status === 'submitting'}
                            className="text-primary hover:text-primary/80 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {countdown > 0 ? `إعادة الإرسال خلال ${countdown}ث` : 'لم يصلك الرمز؟'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
