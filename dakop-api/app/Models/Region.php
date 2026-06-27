<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['psgc_code', 'name'];

    public function provinces()
    {
        return $this->hasMany(Province::class);
    }
}
