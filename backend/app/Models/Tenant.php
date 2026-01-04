<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;
use App\Traits\Filterable;

class Tenant extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, HasUid, Filterable;

    /**
     * Override the notifications relationship to use the custom class.
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable')->latest();
    }

    const UID_PREFIX = 'TNT';

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($tenant) {
            if ($tenant->isForceDeleting()) {
                // Cascading deletion for notifications
                $tenant->notifications()->delete();
                // Also clean up related payments and subscriptions
                if ($tenant->payments())
                    $tenant->payments()->forceDelete();
                if ($tenant->subscriptions())
                    $tenant->subscriptions()->forceDelete();
            }
        });
    }

    // Filterable trait configuration
    protected $searchable = ['name', 'email', 'phone', 'whatsapp'];
    protected $sortable = ['id', 'name', 'email', 'created_at', 'status'];

    protected $fillable = [
        'uid',
        'name',
        'email',
        'phone',
        'password',
        'whatsapp',
        'avatar_url',
        'country_code',
        'currency_code',
        'settings',
        'subscription_started_at',
        'subscription_ends_at',
        'trial_expires_at',
        'ads_enabled',
        'trial_bonus_applied',
        'verification_code',
        'verification_code_expires_at',
        'email_verified_at',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
        'verification_code_expires_at',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function currentSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            })
            ->latestOfMany();
    }

    protected $casts = [
        'password' => 'hashed',
        'trial_expires_at' => 'datetime',
        'subscription_started_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'settings' => 'array',
        'ads_enabled' => 'boolean',
        'trial_bonus_applied' => 'boolean',
        'verification_code_expires_at' => 'datetime',
    ];

    /**
     * Get the tenant status dynamically.
     * 
     * WARNING: This accessor queries the activeSubscription relationship.
     * To avoid N+1 queries when loading multiple tenants, use:
     * Tenant::with('activeSubscription')->get()
     */
    public function getStatusAttribute($value)
    {
        // 1. Critical overrides (Suspended/Restricted) from database value take priority
        if (in_array($value, ['suspended', 'restricted', 'archived'])) {
            return $value;
        }

        // 2. Check active subscription relation
        $activeSub = $this->activeSubscription;
        if ($activeSub && $activeSub->status === 'active') {
            return 'active';
        }

        // 3. Check Trial state
        if ($value === 'trial' || $value === 'pending') {
            if ($this->trial_expires_at && $this->trial_expires_at->isPast()) {
                return 'expired';
            }
            return $value;
        }

        // 4. Default to expired if no active subscription and it was previously active
        if ($value === 'active') {
            return 'expired';
        }

        return $value;
    }
}
