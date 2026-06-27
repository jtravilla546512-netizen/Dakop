<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id', 'barangay_id', 'type',
        'latitude', 'longitude', 'description', 'landmark', 'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'latitude'   => 'float',
        'longitude'  => 'float',
    ];

    // Scope: only reports that have not expired yet
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }

    public function confirmations()
    {
        return $this->hasMany(ReportConfirmation::class);
    }

    public function isActive(): bool
    {
        return $this->expires_at->isFuture();
    }
}
