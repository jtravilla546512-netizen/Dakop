<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL requires redefining the full ENUM when adding a new value
        DB::statement("ALTER TABLE reports MODIFY COLUMN type ENUM('hpg', 'lto', 'speed_gun') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reports MODIFY COLUMN type ENUM('hpg', 'lto') NOT NULL");
    }
};
