<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class Plan extends Model
{
    use SoftDeletes, HasUid;

    const UID_PREFIX = 'PLN';
    protected $fillable = [
        'uid',
        'name',
        'slug',
        'billing_type',
        'monthly_price',
        'yearly_price',
        'lifetime_price',
        'offer_lifetime_price',
        'fixed_term_price',
        'offer_fixed_term_price',
        'fixed_term_duration',
        'fixed_term_unit',
        'offer_monthly_price',
        'offer_yearly_price',
        'offer_start',
        'offer_end',
        'currency',
        'features',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'lifetime_price' => 'decimal:2',
        'offer_lifetime_price' => 'decimal:2',
        'fixed_term_price' => 'decimal:2',
        'offer_fixed_term_price' => 'decimal:2',
        'offer_monthly_price' => 'decimal:2',
        'offer_yearly_price' => 'decimal:2',
        'offer_start' => 'datetime',
        'offer_end' => 'datetime',
    ];

    public function isOfferActive()
    {
        if (!$this->offer_start || !$this->offer_end) {
            return false;
        }

        $now = now();
        return $now->between($this->offer_start, $this->offer_end);
    }

    public function getActiveMonthlyPrice()
    {
        return ($this->isOfferActive() && $this->offer_monthly_price !== null)
            ? $this->offer_monthly_price
            : $this->monthly_price;
    }

    public function getActiveYearlyPrice()
    {
        return ($this->isOfferActive() && $this->offer_yearly_price !== null)
            ? $this->offer_yearly_price
            : $this->yearly_price;
    }

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
