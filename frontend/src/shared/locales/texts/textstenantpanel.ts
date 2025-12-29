// مركزية نصوص لوحة تحكم المستأجر (Tenant)

export const TEXTS_TENANT = {
    // العناوين الرئيسية
    TITLES: {
        DASHBOARD: 'لوحة التحكم',
        SETTINGS: 'الإعدادات',
        RECYCLE_BIN: 'سلة المحذوفات',
        LOGS: 'سجل النشاطات',
    },

    // لوحة التحكم
    DASHBOARD: {
        WELCOME: 'مرحباً',
        SYSTEM_STATUS: 'حالة النظام',
        USERS_COUNT: 'عدد المستخدمين',
        ACTIVITY_COUNT: 'النشاطات الأخيرة',
        QUICK_ACTIONS: 'إجراءات سريعة',
    },

    // الإعدادات
    SETTINGS: {
        PERSONAL_PROFILE: 'الملف الشخصي',
        SYSTEM_PREFERENCES: 'تفضيلات النظام',
        STORE_NAME: 'اسم النظام/المشروع',
        STORE_DESCRIPTION: 'الوصف',
        CURRENCY: 'العملة',
        PHONE: 'رقم الهاتف',
        ADDRESS: 'العنوان',
        CONTACT_INFO: 'معلومات الاتصال',
    },

    // أزرار عامة
    BUTTONS: {
        SAVE: 'حفظ',
        CANCEL: 'إلغاء',
        DELETE: 'حذف',
        EDIT: 'تعديل',
        ADD: 'إضافة جديد',
        SEARCH: 'بحث',
        FILTER: 'فلترة',
        EXPORT: 'تصدير',
        PRINT: 'طباعة',
        UPLOAD: 'رفع',
        DOWNLOAD: 'تحميل',
        BACK: 'رجوع',
        NEXT: 'التالي',
        PREVIOUS: 'السابق',
    },

    // الرسائل
    MESSAGES: {
        SUCCESS: 'تم بنجاح',
        ERROR: 'حدث خطأ',
        LOADING: 'جاري التحميل...',
        NO_DATA: 'لا توجد بيانات',
        CONFIRM_DELETE: 'هل أنت متأكد من الحذف؟',
        SAVED_SUCCESSFULLY: 'تم الحفظ بنجاح',
        DELETED_SUCCESSFULLY: 'تم الحذف بنجاح',
        UPDATED_SUCCESSFULLY: 'تم التحديث بنجاح',
    },

    // Navigation
    NAV: {
        DASHBOARD: 'لوحة التحكم',
        SUPPORT: 'رسائل الدعم',
        RECYCLE_BIN: 'سلة المحذوفات',
        LOGS: 'سجل النشاطات',
        SETTINGS: 'الإعدادات',
        LOGOUT: 'تسجيل الخروج',
    },
} as const;
