<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Script extends Model
{
    use HasFactory;

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
