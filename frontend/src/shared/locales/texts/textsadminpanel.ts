// مركزية نصوص لوحة تحكم المدير (Super Admin)

export const TEXTS_ADMIN = {
    // العناوين الرئيسية
    TITLES: {
        DASHBOARD: 'لوحة التحكم',
        SETTINGS: 'الإعدادات',
        TENANTS: 'إدارة المشتركين',
        TRANSLATIONS: 'الترجمات',
        RECYCLE_BIN: 'سلة المحذوفات',
    },

    // لوحة التحكم
    DASHBOARD: {
        TOTAL_REVENUE: 'إجمالي الإيرادات',
        ACTIVE_TENANTS: 'المستأجرين النشطين',
        NEW_SUBSCRIPTIONS: 'انضمامات مؤخراً',
        ACTIVITY_RATE: 'نسبة النشاط',
        SYSTEM_STATUS: 'حالة النظام',
        LIVE_MONITORING: 'مراقبة حية للأداء',
        SERVERS: 'الخوادم',
        DATABASE: 'قاعدة البيانات',
        EXCELLENT: 'ممتازة',
        CONNECTED: 'متصل',
        LAST_UPDATE: 'آخر تحديث: مؤخراً',
        SYSTEM_SETTINGS: 'إعدادات النظام',
        TOTAL: 'إجمالي',
        LAST_MONTH: 'آخر شهر',
        ONLINE: 'متصل',
        SYSTEM_HEALTH: 'صحة النظام',
        PERFORMANCE_MONITORING: 'مراقبة الأداء',
        TREND_LABEL: 'مقارنة بالشهر الماضي',
        NEW_SUBS_LABEL: 'انضمامات جديدة هذا الأسبوع',
        ACTIVITY_LABEL: 'معدل النشاط الحالي',
        TENANTS_TREND_LABEL: 'زيادة في عدد المشتركين',
    },

    // إدارة المستأجرين
    TENANTS: {
        TENANT: 'المستأجر',
        DOMAIN: 'النطاق',
        STORAGE_USED: 'المساحة المستهلكة',
        STATUS: 'الحالة',
        JOINED_DATE: 'وقت وتاريخ الانضمام',
        ACTIONS: 'إجراءات',
        ACTIVE: 'نشط',
        INACTIVE: 'متوقف',
        USERS_COUNT: 'مستخدمين',
        ADD_TENANT: 'إضافة مستأجر',
        EDIT_TENANT: 'تعديل مستأجر',
        DELETE_TENANT: 'حذف المستأجر',
        CONFIRM_DELETE: 'هل أنت متأكد من حذف هذا المستأجر؟',
        TENANT_NAME: 'اسم المستأجر / الشركة',
        SUBDOMAIN: 'النطاق الفرعي (Domain)',
        ADMIN_EMAIL: 'ايميل المسؤول',
        ADMIN_PASSWORD: 'كلمة مرور المسؤول',
        CREATE_TENANT: 'إنشاء مستأجر جديد',
        UPDATE_TENANT: 'تحديث البيانات',
        LOGIN_AS_TENANT: 'تسجيل الدخول كمستأجر',
        DEACTIVATE_ACCOUNT: 'إيقاف الحساب',
        ACTIVATE_ACCOUNT: 'تفعيل الحساب',
        PERMANENT_DELETE: 'حذف نهائي',
        IMPERSONATE: 'تقمص الهوية',
    },


    // الإعدادات
    SETTINGS: {
        PROFILE: 'الملف الشخصي',
        PROFILE_DESC: 'إدارة معلومات حسابك الشخصي',
        FULL_NAME: 'الاسم الكامل',
        EMAIL: 'البريد الإلكتروني',
        PASSWORD: 'كلمة المرور',
        PASSWORD_HINT: 'كلمة المرور (اتركها فارغة إذا لا تريد التغيير)',
        SUPER_ADMIN_PRIVILEGES: 'بصلاحيات المدير العام',
        CHANGE_AVATAR: 'تغيير الصورة',

        // الهوية والشعار
        IDENTITY_SEO: 'هوية النظام والتحسين',
        IDENTITY_DESC: 'تخصيص الروابط والشعارات ومحركات البحث',
        APP_NAME: 'اسم التطبيق',
        SEO_TITLE: 'عنوان الصفحة (SEO)',
        SEO_DESC: 'وصف الصفحة (SEO)',
        IDENTITY_SYSTEM: 'هوية النظام والشعار',
        SYSTEM_LOGO: 'شعار النظام',
        LOGO_HINT: 'PNG, SVG (بحد أقصى 2MB)',
        LOGO_ALT: 'شعار النظام',
        CHANGE_LOGO: 'تغيير الشعار',
        LOGO_GLOBAL_HINT: 'سيتم تطبيق هذا الشعار في لوحة السوبر أدمن، لوحة المستأجر، وفي صفحة الهبوط.',

        // المظهر
        APPEARANCE: 'المظهر والألوان',
        APPEARANCE_DESC: 'تخصيص الألوان والخطوط عبر النظام',
        PRIMARY_COLOR: 'الأساسي',
        SECONDARY_COLOR: 'الثانوي',

        // Ads & Code
        ADS_CUSTOM: 'الإعلانات والأكواد الإضافية',
        ADS_DESC: 'دمج بكسلات وتتبع وأكواد مخصصة والتحكم بالإعلانات',
        AD_SCRIPTS: 'شفرات الإعلانات',
        CUSTOM_SCRIPTS: 'أكواد التتبع المخصصة (Header/Footer)',
        HEAD_CODE_PLACEHOLDER: 'Header Code (GTM, MetaPixel...)',
        FOOTER_CODE_PLACEHOLDER: 'Footer Code (Analytics, Chat...)',
        ADBLOCK_DETECTION: 'كاشف مانع الإعلانات',
        ADBLOCK_DESC: 'تنبيه المستخدمين عند اكتشاف AdBlock وطرد الزوار أو طلب التعطيل',
        ADBLOCK_ENABLED: 'تفعيل كاشف مانع الإعلانات',
    },

    // سلة المحذوفات
    RECYCLE_BIN: {
        TITLE: 'سلة المحذوفات',
        ITEM: 'العنصر',
        TYPE: 'النوع',
        DELETE_DATE: 'وقت وتاريخ الحذف',
        ACTIONS: 'الإجراءات',
        LOADING: 'جاري تحميل سلة المحذوفات...',
        EMPTY: 'سلة المحذوفات فارغة',
        RESTORE: 'استعادة',
        FORCE_DELETE: 'حذف نهائي',
        CONFIRM_FORCE_DELETE: 'هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.',
        SUCCESS_RESTORE: 'تم استعادة العنصر بنجاح',
        SUCCESS_FORCE_DELETE: 'تم الحذف النهائي بنجاح',
        ERROR_FETCH: 'فشل تحميل سلة المحذوفات',
        ERROR_RESTORE: 'فشل استعادة العنصر',
        ERROR_FORCE_DELETE: 'فشل الحذف النهائي',
        REFERENCE_ABBR: 'REF',
        TYPES: {
            TENANTS: 'متجر',
            FONTS: 'خط',
            LANGUAGES: 'لغة',
            TRANSLATIONS: 'ترجمة',
            USERS: 'مستخدم',
            ADS: 'إعلان',
            SUPPORT_TICKETS: 'تذكرة دعم',
        },
        STATS: {
            SYSTEM_STATS: 'إحصائيات النظام',
            TOTAL_DELETED_ITEMS: 'إجمالي العناصر المحذوفة في النظام ككل',
            CLASSIFICATION: 'تصنيف المحذوفات',
        }
    },

    // أزرار عامة
    BUTTONS: {
        SAVE: 'حفظ التعديلات',
        SAVING: 'جاري الحفظ...',
        CANCEL: 'إلغاء',
        DELETE: 'حذف',
        EDIT: 'تعديل',
        ADD: 'إضافة',
        SEARCH: 'بحث',
        FILTER: 'فلترة',
        EXPORT: 'تصدير',
        IMPORT: 'استيراد',
        UPLOAD: 'رفع',
        DOWNLOAD: 'تحميل',
    },

    // الرسائل
    MESSAGES: {
        SUCCESS: 'تم حفظ جميع التغييرات بنجاح',
        ERROR: 'حدث خطأ أثناء الحفظ',
        LOADING: 'جاري التحميل...',
        NO_DATA: 'لا توجد بيانات',
        CONFIRM: 'هل أنت متأكد؟',
        DELETED_SUCCESSFULLY: 'تم الحذف بنجاح',
        UPDATED_SUCCESSFULLY: 'تم التحديث بنجاح',
        CREATED_SUCCESSFULLY: 'تم الإنشاء بنجاح',
    },

    // Navigation
    NAV: {
        // القائمة الجانبية
        DASHBOARD: 'لوحة التحكم',
        TENANTS: 'المستأجرين',
        ADS: 'إدارة الإعلانات',
        LANDING: 'إدارة الصفحة الرئيسية',
        SUPPORT: 'رسائل الدعم',
        RECYCLE_BIN: 'سلة المحذوفات',
        SETTINGS: 'الإعدادات',
        PAYMENTS: 'طرق الدفع والتكامل',
        TRANSLATIONS: 'الترجمات',
        ANALYTICS: 'التحليلات',
        SYSTEM_STATUS: 'حالة النظام',
        EFFICIENT: 'يعمل بكفاءة',
        ADDITIONAL_ACTIONS: 'إجراءات إضافية',
    },
} as const;
