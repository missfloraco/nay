export const TEXTS_AUTH = {
    login: {
        title: 'تسجيل الدخول',
        subtitle: 'مرحباً بك مجدداً، يرجى إدخال بياناتك',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: 'example@domain.com',
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: '••••••••',
        forgotPassword: 'نسيت كلمة المرور؟',
        submit: 'دخول',
        noAccount: 'ليس لديك حساب؟',
        registerNow: 'أنشئ حساباً جديداً',
        backToLogin: 'العودة لتسجيل الدخول',
    },
    register: {
        title: 'إنشاء حساب جديد',
        subtitle: 'ابدأ رحلتك معنا اليوم واصل على تجربة مجانية',
        fullNameLabel: 'الاسم الكامل',
        fullNamePlaceholder: 'محمد أحمد',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: 'example@domain.com',
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: '••••••••',
        countryLabel: 'الدولة',
        submit: 'إنشاء الحساب',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        loginNow: 'سجل دخولك',
        strength: {
            weak: 'ضعيفة',
            medium: 'متوسطة',
            strong: 'قوية',
        }
    },
    forgotPassword: {
        title: 'استعادة كلمة المرور',
        subtitle: 'أدخل بريدك الإلكتروني لإرسال رابط الاستعادة',
        emailLabel: 'البريد الإلكتروني',
        submit: 'إرسال رابط التحقق',
        success: 'تم إرسال الرابط بنجاح، يرجى تفقد بريدك',
    },
    'forgot-password': {
        title: 'استعادة كلمة المرور',
        subtitle: 'أدخل بريدك الإلكتروني لإرسال رابط الاستعادة',
        emailLabel: 'البريد الإلكتروني',
        submit: 'إرسال رابط التحقق',
        success: 'تم إرسال الرابط بنجاح، يرجى تفقد بريدك',
    },
    onboarding: {
        skip: 'تخطي الآن',
        next: 'التالي',
        back: 'السابق',
        finish: 'ابدأ الآن',
        steps: {
            welcome: {
                title: 'مرحباً بك في نظامنا!',
                description: 'نحن سعداء بانضمامك إلينا. دعنا نخصص تجربتك في خطوات بسيطة.',
            },
            businessInfo: {
                title: 'معلومات المتجر',
                description: 'أخبرنا المزيد عن طبيعة عملك لنقدم لك أفضل الأدوات.',
                storeNameLabel: 'اسم المتجر / الشركة',
                storeNamePlaceholder: 'اسم مشروعك المميز',
                whatsappLabel: 'رقم الواتساب',
                whatsappPlaceholder: '599000000',
            },
            accountType: {
                title: 'نوع الحساب',
                description: 'ما هو الهدف الرئيسي من استخدامك للنظام؟',
                options: [
                    { id: 'pos', label: 'نقطة بيع وإدارة مخزون', desc: 'لإدارة المحلات التجارية والمستودعات' },
                    { id: 'ecommerce', label: 'متجر إلكتروني', desc: 'لبيع المنتجات عبر الإنترنت' },
                    { id: 'both', label: 'نظام متكامل', desc: 'إدارة شاملة (نقطة بيع + متجر)' },
                ]
            },
            final: {
                title: 'كل شيء جاهز!',
                description: 'لقد قمنا بإعداد لوحة التحكم الخاصة بك. يمكنك البدء في استكشاف النظام الآن.',
            }
        }
    },
    validation: {
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'البريد الإلكتروني غير صحيح',
        passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
        passwordsDontMatch: 'كلمات المرور غير متطابقة',
        numericOnly: 'يرجى إدخال أرقام فقط',
    }
};
