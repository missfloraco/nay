<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    protected $fillable = [
        'page_key',
        'title',
        'description',
        'keywords',
        'og_title',
        'og_description',
        'og_image',
        'og_type',
        'twitter_card',
        'twitter_title',
        'twitter_description',
        'twitter_image',
        'canonical_url',
        'robots',
        'schema_markup',
        'is_active',
    ];

    protected $casts = [
        'schema_markup' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get SEO settings by page key
     */
    public static function getByPageKey(string $pageKey)
    {
        return static::where('page_key', $pageKey)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Update or create SEO settings for a page
     */
    public static function updateOrCreateForPage(string $pageKey, array $data)
    {
        return static::updateOrCreate(
            ['page_key' => $pageKey],
            $data
        );
    }
}
