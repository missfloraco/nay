// نصوص مشتركة بين جميع صفحات التطبيق

export const TEXTS_COMMON = {
    // نصوص عامة
    APP_NAME: '',

    // Authentication
    AUTH: {
        LOGIN: 'تسجيل الدخول',
        REGISTER: 'إنشاء حساب',
        LOGOUT: 'تسجيل الخروج',
        FORGOT_PASSWORD: 'نسيت كلمة المرور؟',
        EMAIL: 'البريد الإلكتروني',
        PASSWORD: 'كلمة المرور',
        REMEMBER_ME: 'تذكرني',
        DONT_HAVE_ACCOUNT: 'لا تملك حساب؟',
        ALREADY_HAVE_ACCOUNT: 'لديك حساب بالفعل؟',
    },

    // أيام وشهور
    DAYS: {
        MONDAY: 'الإثنين',
        TUESDAY: 'الثلاثاء',
        WEDNESDAY: 'الأربعاء',
        THURSDAY: 'الخميس',
        FRIDAY: 'الجمعة',
        SATURDAY: 'السبت',
        SUNDAY: 'الأحد',
    },

    MONTHS: {
        JANUARY: 'يناير',
        FEBRUARY: 'فبراير',
        MARCH: 'مارس',
        APRIL: 'أبريل',
        MAY: 'مايو',
        JUNE: 'يونيو',
        JULY: 'يوليو',
        AUGUST: 'أغسطس',
        SEPTEMBER: 'سبتمبر',
        OCTOBER: 'أكتوبر',
        NOVEMBER: 'نوفمبر',
        DECEMBER: 'ديسمبر',
    },

    // Validation
    VALIDATION: {
        REQUIRED: 'هذا الحقل مطلوب',
        INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
        PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة جداً',
        PASSWORDS_DONT_MATCH: 'كلمات المرور غير متطابقة',
        INVALID_PHONE: 'رقم الهاتف غير صحيح',
    },

    // Placeholders
    PLACEHOLDERS: {
        SEARCH: 'ابحث...',
        SELECT: 'اختر...',
        ENTER: 'أدخل...',
        UPLOAD: 'رفع ملف...',
    },
} as const;
