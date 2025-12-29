<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Basic Stats
        $activeTenantsCount = Tenant::where('status', 'active')->count();

        // Real Revenue (Total)
        $totalRevenue = \App\Models\Payment::where('status', 'completed')->sum('amount');

        // New Subscriptions (This month)
        $newSubscriptions = Tenant::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // 2. Revenue Chart Data (Last 6 Months)
        $labels = [];
        $data = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            // Arabic Month Names
            $monthName = $date->translatedFormat('F'); // Requires locale set to ar
            // Fallback if needed, but let's assume locale or just use numeric for now if simpler, 
            // but user wants "January" etc in Arabic.
            // Let's hardcode a map or use intl if available. 
            // For safety/portability:
            $monthsMap = [
                1 => 'يناير',
                2 => 'فبراير',
                3 => 'مارس',
                4 => 'أبريل',
                5 => 'مايو',
                6 => 'يونيو',
                7 => 'يوليو',
                8 => 'أغسطس',
                9 => 'سبتمبر',
                10 => 'أكتوبر',
                11 => 'نوفمبر',
                12 => 'ديسمبر'
            ];
            $monthName = $monthsMap[$date->month];

            $labels[] = $monthName;

            $monthlyRevenue = \App\Models\Payment::where('status', 'completed')
                ->whereYear('paid_at', $date->year)
                ->whereMonth('paid_at', $date->month)
                ->sum('amount');

            $data[] = (float) $monthlyRevenue;
        }

        // 3. Country Statistics
        $countryStats = Tenant::whereNotNull('country_code')
            ->select('country_code', \DB::raw('count(*) as count'))
            ->groupBy('country_code')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($stat) {
                // Potential improvement: map country codes to names
                return [
                    'country' => $stat->country_code,
                    'count' => $stat->count
                ];
            });

        return response()->json([
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'activeTenants' => (int) $activeTenantsCount,
                'newSubscriptions' => (int) $newSubscriptions,
                'totalTenants' => (int) Tenant::count(),
                'activityRate' => 85
            ],
            'revenueChart' => [
                'labels' => $labels,
                'data' => $data
            ],
            'countryChart' => $countryStats
        ]);
    }
}
