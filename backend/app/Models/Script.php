<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Script extends Model
{
    use HasFactory, SoftDeletes;

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
