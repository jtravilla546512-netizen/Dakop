<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Adds "Poblacion" (and a few other universal barangay names) to every
 * city/municipality that currently has zero barangays in the database.
 *
 * Why: Every Philippine LGU has a Poblacion (the town centre). This makes
 * every dropdown selectable while the full PSGC barangay dataset is pending.
 *
 * To get all ~15,000 Mindanao barangays:
 *   1. Download the PSGC Excel from https://psa.gov.ph/classification/psgc
 *   2. Ask to build the psgc:import command to load the full dataset.
 */
class PoblacionSeeder extends Seeder
{
    // Barangay names that exist in virtually every Philippine city/municipality
    private const COMMON_BARANGAYS = [
        'Poblacion',
    ];

    public function run(): void
    {
        $now = now();

        // Get every city that has no barangays yet
        $cityIds = DB::table('cities')
            ->whereNotIn('id', DB::table('barangays')->distinct()->pluck('city_id'))
            ->pluck('id');

        $this->command->info("Adding Poblacion to {$cityIds->count()} cities/municipalities...");

        $rows = [];
        foreach ($cityIds as $cityId) {
            foreach (self::COMMON_BARANGAYS as $name) {
                $rows[] = [
                    'psgc_code'  => null,
                    'city_id'    => $cityId,
                    'name'       => $name,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Insert in chunks of 200 for performance
        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('barangays')->insert($chunk);
        }

        $total = DB::table('barangays')->count();
        $this->command->info("✅ Done. Total barangays in database: {$total}");
    }
}
