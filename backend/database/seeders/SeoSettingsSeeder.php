<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SeoSetting;

class SeoSettingsSeeder extends Seeder
{
    public function run(): void
    {
        SeoSetting::updateOrCreate(
            ['page_key' => 'landing'],
            [
                'title' => 'منصة خاتل بي - نظام إدارة مبيعات ذكي',
                'description' => 'منصتك الشاملة التي توفر لك جميع الأدوات اللازمة لإدارة وتطوير مشروعك بسهولة. أفضل الحلول للتجار وأصحاب المحلات والمطاعم.',
                'keywords' => 'نظام نقاط البيع, إدارة المبيعات, SaaS, POS, إدارة المخزون, نظام المحاسبة',

                // Open Graph
                'og_title' => 'منصة خاتل بي - كل ما تحتاجه لإدارة مشروعك',
                'og_description' => 'منصتك الشاملة التي توفر لك جميع الأدوات اللازمة لإدارة وتطوير مشروعك بسهولة',
                'og_image' => null,
                'og_type' => 'website',

                // Twitter
                'twitter_card' => 'summary_large_image',
                'twitter_title' => 'منصة خاتل بي - نظام إدارة مبيعات ذكي',
                'twitter_description' => 'منصتك الشاملة التي توفر لك جميع الأدوات اللازمة لإدارة وتطوير مشروعك بسهولة',
                'twitter_image' => null,

                // Technical
                'canonical_url' => null,
                'robots' => 'index,follow',
                'schema_markup' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'SoftwareApplication',
                    'name' => 'منصة خاتل بي',
                    'applicationCategory' => 'BusinessApplication',
                    'offers' => [
                        '@type' => 'Offer',
                        'price' => '0',
                        'priceCurrency' => 'USD',
                    ],
                ],

                'is_active' => true,
            ]
        );
    }
}
