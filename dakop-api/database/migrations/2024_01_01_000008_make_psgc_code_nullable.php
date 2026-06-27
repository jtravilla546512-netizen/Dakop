<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // MySQL allows multiple NULL values in a UNIQUE column, so nullable + unique
    // is the right combination when PSGC codes are optional/unknown.
    public function up(): void
    {
        foreach (['regions', 'provinces', 'cities', 'barangays'] as $table) {
            DB::statement("ALTER TABLE `{$table}` MODIFY COLUMN `psgc_code` VARCHAR(10) NULL DEFAULT NULL");
        }
    }

    public function down(): void
    {
        foreach (['regions', 'provinces', 'cities', 'barangays'] as $table) {
            DB::statement("ALTER TABLE `{$table}` MODIFY COLUMN `psgc_code` VARCHAR(10) NOT NULL DEFAULT ''");
        }
    }
};
