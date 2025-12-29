<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Traits\HasUid;

class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable, HasUid;

    const UID_PREFIX = 'ADM';

    protected $fillable = [
        'uid',
        'name',
        'email',
        'password',
        'avatar_url',
        'settings',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'settings' => 'array',
    ];
}
