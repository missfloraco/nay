import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8 animate-in fade-in duration-500">
                    <ShieldAlert className="w-24 h-24 mx-auto text-accent2" strokeWidth={1.5} />
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
                    403
                </h1>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    غير مصرح لك بالوصول
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                    ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالمسؤول.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-500 delay-300">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        العودة للخلف
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                    >
                        <Home className="w-5 h-5" />
                        الصفحة الرئيسية
                    </button>
                </div>
            </div>
        </div>
    );
}
