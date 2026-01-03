<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class Script extends Model
{
    use HasFactory, SoftDeletes, HasUid;

    const UID_PREFIX = 'SCR';

    protected $fillable = [
        'name',
        'type',
        'location',
        'loadingStrategy',
        'content',
        'isActive',
        'environment',
        'trigger',
        'pages',
        'deviceAttributes',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'pages' => 'array',
        'deviceAttributes' => 'array',
    ];
}
