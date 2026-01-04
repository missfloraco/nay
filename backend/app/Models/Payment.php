<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use App\Traits\HasUid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use Filterable, HasUid, SoftDeletes;

    const UID_PREFIX = 'INV';

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($payment) {
            if ($payment->isForceDeleting()) {
                // Clean up associated notifications
                \App\Models\Notification::whereJsonContains('data->payment_id', $payment->id)
                    ->orWhereJsonContains('data->action_url', "/admin/payments?id={$payment->id}")
                    ->orWhereJsonContains('data->action_url', "/app/billing?tab=payments&id={$payment->id}")
                    ->delete();
            }
        });
    }

    // Filterable trait configuration
    protected $searchable = ['transaction_id', 'notes'];
    protected $sortable = ['id', 'amount', 'paid_at', 'created_at', 'status'];
    protected $fillable = [
        'uid',
        'tenant_id',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'payment_method',
        'paid_at',
        'notes'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount' => 'decimal:2'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
