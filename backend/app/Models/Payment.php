<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;

class Payment extends Model
{
    use Filterable;

    // Filterable trait configuration
    protected $searchable = ['transaction_id', 'notes'];
    protected $sortable = ['id', 'amount', 'paid_at', 'created_at', 'status'];
    protected $fillable = [
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
