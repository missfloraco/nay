<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing plans
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Plan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        Plan::create([
            'name' => 'الباقة الأساسية',
            'slug' => 'basic',
            'monthly_price' => 99.00,
            'yearly_price' => 950.00,
            'currency' => 'USD',
            'features' => [
                'نقاط بيع غير محدودة',
                'إدارة المخزون الأساسية',
                'تقارير مالية شهرية',
                'دعم فني عبر البريد',
                '5 مستخدمين كحد أقصى',
                'نسخ احتياطي أسبوعي'
            ],
            'is_active' => true,
        ]);

        Plan::create([
            'name' => 'الباقة الاحترافية',
            'slug' => 'pro',
            'monthly_price' => 199.00,
            'yearly_price' => 1900.00,
            'currency' => 'USD',
            'features' => [
                'كل مميزات الباقة الأساسية',
                'إدارة فروع متعددة',
                'تقارير تحليلية متقدمة',
                'دعم فني على مدار الساعة',
                'مستخدمين غير محدودين',
                'نسخ احتياطي يومي',
                'تكامل مع الأنظمة الخارجية'
            ],
            'is_active' => true,
        ]);

        Plan::create([
            'name' => 'الباقة المتقدمة',
            'slug' => 'enterprise',
            'monthly_price' => 399.00,
            'yearly_price' => 3800.00,
            'currency' => 'USD',
            'features' => [
                'كل مميزات الباقة الاحترافية',
                'خوادم مخصصة',
                'تخصيص كامل للنظام',
                'مدير حساب مخصص',
                'أولوية في الدعم الفني',
                'تطوير مميزات حسب الطلب'
            ],
            'is_active' => true,
        ]);
    }
}
