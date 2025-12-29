<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ad;

class AdSeeder extends Seeder
{
    public function run(): void
    {
        $placements = [
            'ad_landing_top' => 'Landing Hero Leaderboard',
            'ad_landing_footer' => 'Landing Footer Leaderboard',
            'ad_sidebar_square' => 'Sidebar square Promo',
            'ad_footer_leaderboard' => 'Global Platform Footer'
        ];

        foreach ($placements as $placement => $name) {
            $isLeaderboard = str_contains($placement, 'leaderboard') || str_contains($placement, 'top') || str_contains($placement, 'bottom');
            $size = $isLeaderboard ? '728 × 90' : '250 × 250';

            Ad::updateOrCreate(
                ['placement' => $placement],
                [
                    'name' => $name,
                    'type' => 'html',
                    'content' => '
                        <div class="google-ad-unit" style="width:100%; height:' . ($isLeaderboard ? '90px' : '250px') . '; position:relative; overflow:hidden; background:#ffffff; border:1px solid #f0f0f0; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0; padding:0; font-family: Roboto, sans-serif; border-radius:0;">
                            <div style="position:absolute; top:5px; right:10px; display:flex; align-items:center; gap:4px; opacity:0.3;">
                                <span style="font-size:9px; color:#999; font-weight:400; letter-spacing:0.05em;">Ad</span>
                                <div style="width:11px; height:11px; border-radius:50%; border:1px solid #999; display:flex; align-items:center; justify-content:center; font-size:7px; color:#999; font-weight:bold;">i</div>
                            </div>
                            <div style="text-align:center; padding:15px; width:100%; box-sizing:border-box;">
                                <div style="font-size:16px; font-weight:500; color:#1a73e8; margin-bottom:6px; line-height:1.2;">' . $name . '</div>
                                <div style="font-size:12px; color:#70757a; margin-bottom:14px; font-weight:400;">Professional SaaS Management Solutions</div>
                                <div style="display:inline-block; border:1px solid #1a73e8; color:#1a73e8; padding:7px 20px; font-size:13px; font-weight:500; border-radius:0; text-decoration:none;">Visit Website</div>
                            </div>
                        </div>
                    ',
                    'is_active' => true,
                    'stats' => ['impressions' => 0, 'clicks' => 0]
                ]
            );
        }
    }
}
