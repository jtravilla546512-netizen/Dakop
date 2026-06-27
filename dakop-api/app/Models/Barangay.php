<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    protected $fillable = ['psgc_code', 'city_id', 'name'];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
