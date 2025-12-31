<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'monthly_price',
        'yearly_price',
        'currency',
        'features',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($plan) {
            if (!$plan->slug) {
                $plan->slug = Str::slug($plan->name);
            }
        });
    }
}
