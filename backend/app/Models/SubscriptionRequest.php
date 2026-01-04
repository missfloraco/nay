<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class SubscriptionRequest extends Model
{
    use SoftDeletes, HasUid;

    const UID_PREFIX = 'SRQ';
    protected $fillable = [
        'uid',
        'tenant_id',
        'plan_id',
        'billing_cycle',
        'status',
        'notes',
        'admin_notes',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
