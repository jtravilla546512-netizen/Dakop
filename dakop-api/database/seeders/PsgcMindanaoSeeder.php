<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds all Mindanao PSGC location data:
 *   - 5 regions
 *   - 26 provinces
 *   - All cities and municipalities across Mindanao (~450 entries)
 *   - Davao City barangays as sample data (182 barangays)
 *
 * To add more barangays later, copy the pattern in the barangays() method.
 * Official PSGC data can be downloaded from: https://psa.gov.ph/classification/psgc
 */
class PsgcMindanaoSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::table('barangays')->truncate();
        DB::table('cities')->truncate();
        DB::table('provinces')->truncate();
        DB::table('regions')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Seeding regions...');
        $this->seedRegions();

        $this->command->info('Seeding provinces...');
        $this->seedProvinces();

        $this->command->info('Seeding cities and municipalities...');
        $this->seedCities();

        $this->command->info('Seeding Davao City barangays (sample)...');
        $this->seedBarangays();

        $this->command->info('✅ PSGC Mindanao seeding complete.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // REGIONS
    // ──────────────────────────────────────────────────────────────────────────

    private function seedRegions(): void
    {
        $now = now();
        DB::table('regions')->insert([
            ['psgc_code' => '100000000', 'name' => 'Region X – Northern Mindanao',                                  'created_at' => $now, 'updated_at' => $now],
            ['psgc_code' => '110000000', 'name' => 'Region XI – Davao Region',                                      'created_at' => $now, 'updated_at' => $now],
            ['psgc_code' => '120000000', 'name' => 'Region XII – SOCCSKSARGEN',                                     'created_at' => $now, 'updated_at' => $now],
            ['psgc_code' => '160000000', 'name' => 'Region XIII – Caraga',                                          'created_at' => $now, 'updated_at' => $now],
            ['psgc_code' => '190000000', 'name' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao',       'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PROVINCES
    // ──────────────────────────────────────────────────────────────────────────

    private function seedProvinces(): void
    {
        // Build a name → id lookup so we can reference region IDs by name
        $regionId = DB::table('regions')->pluck('id', 'name');
        $now = now();

        $provinces = [
            // Region X – Northern Mindanao
            ['psgc_code' => '101300000', 'region' => 'Region X – Northern Mindanao', 'name' => 'Bukidnon'],
            ['psgc_code' => '104200000', 'region' => 'Region X – Northern Mindanao', 'name' => 'Camiguin'],
            ['psgc_code' => '102200000', 'region' => 'Region X – Northern Mindanao', 'name' => 'Lanao del Norte'],
            ['psgc_code' => '103500000', 'region' => 'Region X – Northern Mindanao', 'name' => 'Misamis Occidental'],
            ['psgc_code' => '103600000', 'region' => 'Region X – Northern Mindanao', 'name' => 'Misamis Oriental'],

            // Region XI – Davao Region
            ['psgc_code' => '111300000', 'region' => 'Region XI – Davao Region', 'name' => 'Davao de Oro'],
            ['psgc_code' => '111100000', 'region' => 'Region XI – Davao Region', 'name' => 'Davao del Norte'],
            ['psgc_code' => '111200000', 'region' => 'Region XI – Davao Region', 'name' => 'Davao del Sur'],
            ['psgc_code' => '111800000', 'region' => 'Region XI – Davao Region', 'name' => 'Davao Occidental'],
            ['psgc_code' => '111600000', 'region' => 'Region XI – Davao Region', 'name' => 'Davao Oriental'],

            // Region XII – SOCCSKSARGEN
            ['psgc_code' => '124700000', 'region' => 'Region XII – SOCCSKSARGEN', 'name' => 'Cotabato'],
            ['psgc_code' => '128000000', 'region' => 'Region XII – SOCCSKSARGEN', 'name' => 'Sarangani'],
            ['psgc_code' => '126500000', 'region' => 'Region XII – SOCCSKSARGEN', 'name' => 'South Cotabato'],
            ['psgc_code' => '126400000', 'region' => 'Region XII – SOCCSKSARGEN', 'name' => 'Sultan Kudarat'],

            // Region XIII – Caraga
            ['psgc_code' => '160200000', 'region' => 'Region XIII – Caraga', 'name' => 'Agusan del Norte'],
            ['psgc_code' => '160300000', 'region' => 'Region XIII – Caraga', 'name' => 'Agusan del Sur'],
            ['psgc_code' => '168500000', 'region' => 'Region XIII – Caraga', 'name' => 'Dinagat Islands'],
            ['psgc_code' => '166700000', 'region' => 'Region XIII – Caraga', 'name' => 'Surigao del Norte'],
            ['psgc_code' => '166800000', 'region' => 'Region XIII – Caraga', 'name' => 'Surigao del Sur'],

            // BARMM
            ['psgc_code' => '190600000', 'region' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao', 'name' => 'Basilan'],
            ['psgc_code' => '192300000', 'region' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao', 'name' => 'Lanao del Sur'],
            ['psgc_code' => '196300000', 'region' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao', 'name' => 'Maguindanao del Norte'],
            ['psgc_code' => '196400000', 'region' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao', 'name' => 'Maguindanao del Sur'],
            ['psgc_code' => '197300000', 'region' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao', 'name' => 'Sulu'],
            ['psgc_code' => '197600000', 'region' => 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao', 'name' => 'Tawi-Tawi'],
        ];

        foreach ($provinces as $p) {
            DB::table('provinces')->insert([
                'psgc_code'  => $p['psgc_code'],
                'region_id'  => $regionId[$p['region']],
                'name'       => $p['name'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CITIES & MUNICIPALITIES
    // Format: ['Province name', 'City/Mun name', is_city (true=city, false=municipality)]
    // ──────────────────────────────────────────────────────────────────────────

    private function seedCities(): void
    {
        $provinceId = DB::table('provinces')->pluck('id', 'name');
        $now = now();
        $rows = [];

        foreach ($this->citiesData() as [$province, $name, $isCity]) {
            $rows[] = [
                'psgc_code'  => null,
                'province_id'=> $provinceId[$province],
                'name'       => $name,
                'is_city'    => $isCity,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert in chunks of 100 for performance
        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('cities')->insert($chunk);
        }
    }

    private function citiesData(): array
    {
        // ['Province', 'Name', is_city]
        return [
            // ── BUKIDNON ──────────────────────────────────────────────────────
            ['Bukidnon', 'Malaybalay City',  true],
            ['Bukidnon', 'Valencia City',    true],
            ['Bukidnon', 'Baungon',          false],
            ['Bukidnon', 'Cabanglasan',      false],
            ['Bukidnon', 'Damulog',          false],
            ['Bukidnon', 'Dangcagan',        false],
            ['Bukidnon', 'Don Carlos',       false],
            ['Bukidnon', 'Impasug-on',       false],
            ['Bukidnon', 'Kadingilan',       false],
            ['Bukidnon', 'Kalilangan',       false],
            ['Bukidnon', 'Kibawe',           false],
            ['Bukidnon', 'Kitaotao',         false],
            ['Bukidnon', 'Lantapan',         false],
            ['Bukidnon', 'Libona',           false],
            ['Bukidnon', 'Malitbog',         false],
            ['Bukidnon', 'Manolo Fortich',   false],
            ['Bukidnon', 'Maramag',          false],
            ['Bukidnon', 'Pangantucan',      false],
            ['Bukidnon', 'Quezon',           false],
            ['Bukidnon', 'San Fernando',     false],
            ['Bukidnon', 'Sumilao',          false],
            ['Bukidnon', 'Talakag',          false],

            // ── CAMIGUIN ─────────────────────────────────────────────────────
            ['Camiguin', 'Catarman',    false],
            ['Camiguin', 'Guinsiliban', false],
            ['Camiguin', 'Mahinog',     false],
            ['Camiguin', 'Mambajao',    false],
            ['Camiguin', 'Sagay',       false],

            // ── LANAO DEL NORTE ───────────────────────────────────────────────
            ['Lanao del Norte', 'Iligan City',              true],
            ['Lanao del Norte', 'Bacolod',                  false],
            ['Lanao del Norte', 'Baloi',                    false],
            ['Lanao del Norte', 'Baroy',                    false],
            ['Lanao del Norte', 'Balo-i',                   false],
            ['Lanao del Norte', 'Kapatagan',                false],
            ['Lanao del Norte', 'Kauswagan',                false],
            ['Lanao del Norte', 'Kolambugan',               false],
            ['Lanao del Norte', 'Lala',                     false],
            ['Lanao del Norte', 'Linamon',                  false],
            ['Lanao del Norte', 'Magsaysay',                false],
            ['Lanao del Norte', 'Maigo',                    false],
            ['Lanao del Norte', 'Matungao',                 false],
            ['Lanao del Norte', 'Munai',                    false],
            ['Lanao del Norte', 'Nunungan',                 false],
            ['Lanao del Norte', 'Pantao Ragat',             false],
            ['Lanao del Norte', 'Pantar',                   false],
            ['Lanao del Norte', 'Poona Piagapo',            false],
            ['Lanao del Norte', 'Salvador',                 false],
            ['Lanao del Norte', 'Sapad',                    false],
            ['Lanao del Norte', 'Sultan Naga Dimaporo',     false],
            ['Lanao del Norte', 'Tagoloan',                 false],
            ['Lanao del Norte', 'Tangcal',                  false],
            ['Lanao del Norte', 'Tubod',                    false],

            // ── MISAMIS OCCIDENTAL ────────────────────────────────────────────
            ['Misamis Occidental', 'Oroquieta City',             true],
            ['Misamis Occidental', 'Ozamiz City',                true],
            ['Misamis Occidental', 'Tangub City',                true],
            ['Misamis Occidental', 'Aloran',                     false],
            ['Misamis Occidental', 'Baliangao',                  false],
            ['Misamis Occidental', 'Bonifacio',                  false],
            ['Misamis Occidental', 'Calamba',                    false],
            ['Misamis Occidental', 'Clarin',                     false],
            ['Misamis Occidental', 'Concepcion',                 false],
            ['Misamis Occidental', 'Don Victoriano Chiongbian',  false],
            ['Misamis Occidental', 'Jimenez',                    false],
            ['Misamis Occidental', 'Lopez Jaena',                false],
            ['Misamis Occidental', 'Panaon',                     false],
            ['Misamis Occidental', 'Plaridel',                   false],
            ['Misamis Occidental', 'Sapang Dalaga',              false],
            ['Misamis Occidental', 'Sinacaban',                  false],
            ['Misamis Occidental', 'Tudela',                     false],

            // ── MISAMIS ORIENTAL ──────────────────────────────────────────────
            ['Misamis Oriental', 'Cagayan de Oro City', true],
            ['Misamis Oriental', 'El Salvador City',    true],
            ['Misamis Oriental', 'Gingoog City',        true],
            ['Misamis Oriental', 'Alubijid',            false],
            ['Misamis Oriental', 'Balingasag',          false],
            ['Misamis Oriental', 'Balingoan',           false],
            ['Misamis Oriental', 'Binuangan',           false],
            ['Misamis Oriental', 'Claveria',            false],
            ['Misamis Oriental', 'Gitagum',             false],
            ['Misamis Oriental', 'Initao',              false],
            ['Misamis Oriental', 'Jasaan',              false],
            ['Misamis Oriental', 'Kinoguitan',          false],
            ['Misamis Oriental', 'Lagonglong',          false],
            ['Misamis Oriental', 'Laguindingan',        false],
            ['Misamis Oriental', 'Libertad',            false],
            ['Misamis Oriental', 'Lugait',              false],
            ['Misamis Oriental', 'Magsaysay',           false],
            ['Misamis Oriental', 'Manticao',            false],
            ['Misamis Oriental', 'Medina',              false],
            ['Misamis Oriental', 'Naawan',              false],
            ['Misamis Oriental', 'Opol',                false],
            ['Misamis Oriental', 'Salay',               false],
            ['Misamis Oriental', 'Sugbongcogon',        false],
            ['Misamis Oriental', 'Tagoloan',            false],
            ['Misamis Oriental', 'Talisayan',           false],
            ['Misamis Oriental', 'Villanueva',          false],

            // ── DAVAO DE ORO ──────────────────────────────────────────────────
            ['Davao de Oro', 'Compostela',  false],
            ['Davao de Oro', 'Laak',        false],
            ['Davao de Oro', 'Mabini',      false],
            ['Davao de Oro', 'Maco',        false],
            ['Davao de Oro', 'Maragusan',   false],
            ['Davao de Oro', 'Mawab',       false],
            ['Davao de Oro', 'Monkayo',     false],
            ['Davao de Oro', 'Montevista',  false],
            ['Davao de Oro', 'Nabunturan',  false],
            ['Davao de Oro', 'New Bataan',  false],
            ['Davao de Oro', 'Pantukan',    false],

            // ── DAVAO DEL NORTE ───────────────────────────────────────────────
            ['Davao del Norte', 'Tagum City',                    true],
            ['Davao del Norte', 'Panabo City',                   true],
            ['Davao del Norte', 'Island Garden City of Samal',   true],
            ['Davao del Norte', 'Asuncion',                      false],
            ['Davao del Norte', 'Braulio E. Dujali',             false],
            ['Davao del Norte', 'Carmen',                        false],
            ['Davao del Norte', 'Kapalong',                      false],
            ['Davao del Norte', 'New Corella',                   false],
            ['Davao del Norte', 'San Isidro',                    false],
            ['Davao del Norte', 'Santo Tomas',                   false],
            ['Davao del Norte', 'Talaingod',                     false],

            // ── DAVAO DEL SUR ─────────────────────────────────────────────────
            // Davao City is a Highly Urbanized City (HUC) — geographically in this province
            ['Davao del Sur', 'Davao City', true],
            ['Davao del Sur', 'Digos City', true],
            ['Davao del Sur', 'Bansalan',   false],
            ['Davao del Sur', 'Hagonoy',    false],
            ['Davao del Sur', 'Kiblawan',   false],
            ['Davao del Sur', 'Magsaysay',  false],
            ['Davao del Sur', 'Malalag',    false],
            ['Davao del Sur', 'Matanao',    false],
            ['Davao del Sur', 'Padada',     false],
            ['Davao del Sur', 'Santa Cruz', false],
            ['Davao del Sur', 'Sulop',      false],

            // ── DAVAO OCCIDENTAL ──────────────────────────────────────────────
            ['Davao Occidental', 'Don Marcelino',   false],
            ['Davao Occidental', 'Jose Abad Santos', false],
            ['Davao Occidental', 'Malita',           false],
            ['Davao Occidental', 'Sarangani',        false],
            ['Davao Occidental', 'Santa Maria',      false],

            // ── DAVAO ORIENTAL ────────────────────────────────────────────────
            ['Davao Oriental', 'Mati City',           true],
            ['Davao Oriental', 'Baganga',             false],
            ['Davao Oriental', 'Banaybanay',          false],
            ['Davao Oriental', 'Boston',              false],
            ['Davao Oriental', 'Caraga',              false],
            ['Davao Oriental', 'Cateel',              false],
            ['Davao Oriental', 'Governor Generoso',   false],
            ['Davao Oriental', 'Lupon',               false],
            ['Davao Oriental', 'Manay',               false],
            ['Davao Oriental', 'San Isidro',          false],
            ['Davao Oriental', 'Tarragona',           false],

            // ── COTABATO (NORTH COTABATO) ─────────────────────────────────────
            ['Cotabato', 'Kidapawan City',      true],
            ['Cotabato', 'Alamada',             false],
            ['Cotabato', 'Aleosan',             false],
            ['Cotabato', 'Antipas',             false],
            ['Cotabato', 'Arakan',              false],
            ['Cotabato', 'Banisilan',           false],
            ['Cotabato', 'Carmen',              false],
            ['Cotabato', 'Kabacan',             false],
            ['Cotabato', 'Libungan',            false],
            ['Cotabato', "M'lang",              false],
            ['Cotabato', 'Magpet',              false],
            ['Cotabato', 'Makilala',            false],
            ['Cotabato', 'Matalam',             false],
            ['Cotabato', 'Midsayap',            false],
            ['Cotabato', 'Pigcawayan',          false],
            ['Cotabato', 'Pikit',               false],
            ['Cotabato', 'President Roxas',     false],
            ['Cotabato', 'Tulunan',             false],

            // ── SARANGANI ─────────────────────────────────────────────────────
            ['Sarangani', 'Alabel',     false],
            ['Sarangani', 'Glan',       false],
            ['Sarangani', 'Kiamba',     false],
            ['Sarangani', 'Maasim',     false],
            ['Sarangani', 'Maitum',     false],
            ['Sarangani', 'Malapatan',  false],
            ['Sarangani', 'Malungon',   false],

            // ── SOUTH COTABATO ────────────────────────────────────────────────
            ['South Cotabato', 'Koronadal City',  true],
            ['South Cotabato', 'General Santos City', true],
            ['South Cotabato', 'Banga',           false],
            ['South Cotabato', 'Lake Sebu',        false],
            ['South Cotabato', 'Norala',           false],
            ['South Cotabato', 'Polomolok',        false],
            ['South Cotabato', 'Santo Niño',       false],
            ['South Cotabato', 'Surallah',         false],
            ["South Cotabato", "T'boli",           false],
            ['South Cotabato', 'Tampakan',         false],
            ['South Cotabato', 'Tantangan',        false],
            ['South Cotabato', 'Tupi',             false],

            // ── SULTAN KUDARAT ────────────────────────────────────────────────
            ['Sultan Kudarat', 'Tacurong City',          true],
            ['Sultan Kudarat', 'Bagumbayan',             false],
            ['Sultan Kudarat', 'Columbio',               false],
            ['Sultan Kudarat', 'Esperanza',              false],
            ['Sultan Kudarat', 'Isulan',                 false],
            ['Sultan Kudarat', 'Kalamansig',             false],
            ['Sultan Kudarat', 'Lambayong',              false],
            ['Sultan Kudarat', 'Lebak',                  false],
            ['Sultan Kudarat', 'Lutayan',                false],
            ['Sultan Kudarat', 'Palimbang',              false],
            ['Sultan Kudarat', 'President Quirino',      false],
            ['Sultan Kudarat', 'Senator Ninoy Aquino',   false],

            // ── AGUSAN DEL NORTE ──────────────────────────────────────────────
            ['Agusan del Norte', 'Butuan City',                   true],
            ['Agusan del Norte', 'Cabadbaran City',               true],
            ['Agusan del Norte', 'Buenavista',                    false],
            ['Agusan del Norte', 'Carmen',                        false],
            ['Agusan del Norte', 'Jabonga',                       false],
            ['Agusan del Norte', 'Kitcharao',                     false],
            ['Agusan del Norte', 'Las Nieves',                    false],
            ['Agusan del Norte', 'Magallanes',                    false],
            ['Agusan del Norte', 'Nasipit',                       false],
            ['Agusan del Norte', 'Remedios T. Romualdez',         false],
            ['Agusan del Norte', 'Santiago',                      false],
            ['Agusan del Norte', 'Tubay',                         false],

            // ── AGUSAN DEL SUR ────────────────────────────────────────────────
            ['Agusan del Sur', 'Bayugan City',      true],
            ['Agusan del Sur', 'Bunawan',           false],
            ['Agusan del Sur', 'Esperanza',         false],
            ['Agusan del Sur', 'La Paz',            false],
            ['Agusan del Sur', 'Loreto',            false],
            ['Agusan del Sur', 'Prosperidad',       false],
            ['Agusan del Sur', 'Rosario',           false],
            ['Agusan del Sur', 'San Francisco',     false],
            ['Agusan del Sur', 'San Luis',          false],
            ['Agusan del Sur', 'Santa Josefa',      false],
            ['Agusan del Sur', 'Sibagat',           false],
            ['Agusan del Sur', 'Talacogon',         false],
            ['Agusan del Sur', 'Trento',            false],
            ['Agusan del Sur', 'Veruela',           false],

            // ── DINAGAT ISLANDS ───────────────────────────────────────────────
            ['Dinagat Islands', 'Basilisa',    false],
            ['Dinagat Islands', 'Cagdianao',   false],
            ['Dinagat Islands', 'Dinagat',     false],
            ['Dinagat Islands', 'Libjo',       false],
            ['Dinagat Islands', 'Loreto',      false],
            ['Dinagat Islands', 'San Jose',    false],
            ['Dinagat Islands', 'Tubajon',     false],

            // ── SURIGAO DEL NORTE ─────────────────────────────────────────────
            ['Surigao del Norte', 'Surigao City',    true],
            ['Surigao del Norte', 'Alegria',         false],
            ['Surigao del Norte', 'Bacuag',          false],
            ['Surigao del Norte', 'Burgos',          false],
            ['Surigao del Norte', 'Claver',          false],
            ['Surigao del Norte', 'Dapa',            false],
            ['Surigao del Norte', 'Del Carmen',      false],
            ['Surigao del Norte', 'General Luna',    false],
            ['Surigao del Norte', 'Gigaquit',        false],
            ['Surigao del Norte', 'Mainit',          false],
            ['Surigao del Norte', 'Malimono',        false],
            ['Surigao del Norte', 'Pilar',           false],
            ['Surigao del Norte', 'Placer',          false],
            ['Surigao del Norte', 'San Benito',      false],
            ['Surigao del Norte', 'San Francisco',   false],
            ['Surigao del Norte', 'San Isidro',      false],
            ['Surigao del Norte', 'Santa Monica',    false],
            ['Surigao del Norte', 'Sison',           false],
            ['Surigao del Norte', 'Socorro',         false],
            ['Surigao del Norte', 'Tagana-an',       false],
            ['Surigao del Norte', 'Tubod',           false],

            // ── SURIGAO DEL SUR ───────────────────────────────────────────────
            ['Surigao del Sur', 'Bislig City',    true],
            ['Surigao del Sur', 'Tandag City',    true],
            ['Surigao del Sur', 'Barobo',         false],
            ['Surigao del Sur', 'Bayabas',        false],
            ['Surigao del Sur', 'Cagwait',        false],
            ['Surigao del Sur', 'Cantilan',       false],
            ['Surigao del Sur', 'Carmen',         false],
            ['Surigao del Sur', 'Carrascal',      false],
            ['Surigao del Sur', 'Cortes',         false],
            ['Surigao del Sur', 'Hinatuan',       false],
            ['Surigao del Sur', 'Lanuza',         false],
            ['Surigao del Sur', 'Lianga',         false],
            ['Surigao del Sur', 'Lingig',         false],
            ['Surigao del Sur', 'Madrid',         false],
            ['Surigao del Sur', 'Marihatag',      false],
            ['Surigao del Sur', 'San Agustin',    false],
            ['Surigao del Sur', 'San Miguel',     false],
            ['Surigao del Sur', 'Tagbina',        false],
            ['Surigao del Sur', 'Tago',           false],

            // ── BASILAN ───────────────────────────────────────────────────────
            ['Basilan', 'Isabela City',          true],
            ['Basilan', 'Akbar',                 false],
            ['Basilan', 'Al-Barka',              false],
            ['Basilan', 'Hadji Mohammad Ajul',   false],
            ['Basilan', 'Hadji Muhtamad',        false],
            ['Basilan', 'Lantawan',              false],
            ['Basilan', 'Maluso',                false],
            ['Basilan', 'Sumisip',               false],
            ['Basilan', 'Tabuan-Lasa',           false],
            ['Basilan', 'Tipo-Tipo',             false],
            ['Basilan', 'Tuburan',               false],
            ['Basilan', 'Ungkaya Pukan',         false],

            // ── LANAO DEL SUR ─────────────────────────────────────────────────
            ['Lanao del Sur', 'Marawi City',              true],
            ['Lanao del Sur', 'Bacolod-Kalawi',           false],
            ['Lanao del Sur', 'Balabagan',                false],
            ['Lanao del Sur', 'Balindong',                false],
            ['Lanao del Sur', 'Bayang',                   false],
            ['Lanao del Sur', 'Binidayan',                false],
            ['Lanao del Sur', 'Bumbaran',                 false],
            ['Lanao del Sur', 'Butig',                    false],
            ['Lanao del Sur', 'Calanogas',                false],
            ['Lanao del Sur', 'Ditsaan-Ramain',           false],
            ['Lanao del Sur', 'Ganassi',                  false],
            ['Lanao del Sur', 'Kapai',                    false],
            ['Lanao del Sur', 'Kapatagan',                false],
            ['Lanao del Sur', 'Lumba-Bayabao',            false],
            ['Lanao del Sur', 'Lumbatan',                 false],
            ['Lanao del Sur', 'Lumbayanague',             false],
            ['Lanao del Sur', 'Madalum',                  false],
            ['Lanao del Sur', 'Madamba',                  false],
            ['Lanao del Sur', 'Maguing',                  false],
            ['Lanao del Sur', 'Malabang',                 false],
            ['Lanao del Sur', 'Marantao',                 false],
            ['Lanao del Sur', 'Marogong',                 false],
            ['Lanao del Sur', 'Masiu',                    false],
            ['Lanao del Sur', 'Mulondo',                  false],
            ['Lanao del Sur', 'Pagayawan',                false],
            ['Lanao del Sur', 'Piagapo',                  false],
            ['Lanao del Sur', 'Picong',                   false],
            ['Lanao del Sur', 'Poona Bayabao',            false],
            ['Lanao del Sur', 'Pualas',                   false],
            ['Lanao del Sur', 'Saguiaran',                false],
            ['Lanao del Sur', 'Sultan Dumalondong',       false],
            ['Lanao del Sur', 'Sultan Gumander',          false],
            ['Lanao del Sur', 'Tagoloan II',              false],
            ['Lanao del Sur', 'Tamparan',                 false],
            ['Lanao del Sur', 'Taraka',                   false],
            ['Lanao del Sur', 'Tubaran',                  false],
            ['Lanao del Sur', 'Tugaya',                   false],
            ['Lanao del Sur', 'Wao',                      false],

            // ── MAGUINDANAO DEL NORTE ─────────────────────────────────────────
            ['Maguindanao del Norte', 'Barira',                   false],
            ['Maguindanao del Norte', 'Buldon',                   false],
            ['Maguindanao del Norte', 'Datu Blah T. Sinsuat',     false],
            ['Maguindanao del Norte', 'Datu Odin Sinsuat',        false],
            ['Maguindanao del Norte', 'Kabuntalan',               false],
            ['Maguindanao del Norte', 'Matanog',                  false],
            ['Maguindanao del Norte', 'Northern Kabuntalan',      false],
            ['Maguindanao del Norte', 'Sultan sa Barongis',       false],
            ['Maguindanao del Norte', 'Upi',                      false],

            // ── MAGUINDANAO DEL SUR ───────────────────────────────────────────
            ['Maguindanao del Sur', 'Ampatuan',                        false],
            ['Maguindanao del Sur', 'Buluan',                          false],
            ['Maguindanao del Sur', 'Datu Abdullah Sangki',            false],
            ['Maguindanao del Sur', 'Datu Anggal Midtimbang',          false],
            ['Maguindanao del Sur', 'Datu Hofer Ampatuan',             false],
            ['Maguindanao del Sur', 'Datu Montawal',                   false],
            ['Maguindanao del Sur', 'Datu Paglas',                     false],
            ['Maguindanao del Sur', 'Datu Piang',                      false],
            ['Maguindanao del Sur', 'Datu Salibo',                     false],
            ['Maguindanao del Sur', 'Guindulungan',                    false],
            ['Maguindanao del Sur', 'Mamasapano',                      false],
            ['Maguindanao del Sur', 'Pagalungan',                      false],
            ['Maguindanao del Sur', 'Rajah Buayan',                    false],
            ['Maguindanao del Sur', 'Shariff Aguak',                   false],
            ['Maguindanao del Sur', 'Shariff Saydona Mustapha',        false],
            ['Maguindanao del Sur', 'South Upi',                       false],
            ['Maguindanao del Sur', 'Talayan',                         false],

            // ── SULU ──────────────────────────────────────────────────────────
            ['Sulu', 'Hadji Panglima Tahil',   false],
            ['Sulu', 'Indanan',                false],
            ['Sulu', 'Jolo',                   false],
            ['Sulu', 'Kalingalan Caluang',     false],
            ['Sulu', 'Lugus',                  false],
            ['Sulu', 'Luuk',                   false],
            ['Sulu', 'Maimbung',               false],
            ['Sulu', 'Old Panamao',            false],
            ['Sulu', 'Omar',                   false],
            ['Sulu', 'Pandami',                false],
            ['Sulu', 'Panglima Estino',        false],
            ['Sulu', 'Pangutaran',             false],
            ['Sulu', 'Parang',                 false],
            ['Sulu', 'Pata',                   false],
            ['Sulu', 'Patikul',                false],
            ['Sulu', 'Siasi',                  false],
            ['Sulu', 'Talipao',                false],
            ['Sulu', 'Tapul',                  false],
            ['Sulu', 'Tongkil',                false],

            // ── TAWI-TAWI ─────────────────────────────────────────────────────
            ['Tawi-Tawi', 'Bongao',             false],
            ['Tawi-Tawi', 'Languyan',           false],
            ['Tawi-Tawi', 'Mapun',              false],
            ['Tawi-Tawi', 'Panglima Sugala',    false],
            ['Tawi-Tawi', 'Sapa-Sapa',          false],
            ['Tawi-Tawi', 'Sibutu',             false],
            ['Tawi-Tawi', 'Simunul',            false],
            ['Tawi-Tawi', 'Sitangkai',          false],
            ['Tawi-Tawi', 'South Ubian',        false],
            ['Tawi-Tawi', 'Tandubas',           false],
            ['Tawi-Tawi', 'Turtle Islands',     false],
        ];
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BARANGAYS — Davao City (sample set; full data can be loaded via psgc:import)
    // Davao City has 182 barangays across 11 districts.
    // ──────────────────────────────────────────────────────────────────────────

    private function seedBarangays(): void
    {
        $cityId = DB::table('cities')->where('name', 'Davao City')->value('id');

        if (! $cityId) {
            $this->command->warn('Davao City not found — skipping barangay seed.');
            return;
        }

        $now  = now();
        $rows = [];

        foreach ($this->davaoCityBarangays() as $name) {
            $rows[] = [
                'psgc_code'  => null,
                'city_id'    => $cityId,
                'name'       => $name,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('barangays')->insert($chunk);
        }
    }

    private function davaoCityBarangays(): array
    {
        // All 182 official barangays of Davao City
        return [
            // District 1
            'Agdao', 'Alambre', 'Ataypan', 'Bago Aplaya', 'Bago Gallera',
            'Bago Oshiro', 'Baguio', 'Balengaeng', 'Baliok', 'Bangkas Heights',
            'Buhangin Proper', 'Bula', 'Bunawan Proper', 'Cabantian', 'Callawa',
            'Calinan', 'Catigan', 'Centro (San Juan)', 'Ciguiling', 'Communal',
            'Dacudao', 'Daliao', 'Dalisay', 'Eden', 'Emon',
            'Fatima (Benowang)', 'Gatungan', 'Gov. Paciano Bangoy',
            'Gov. Vicente Duterte', 'Gumalang',
            // District 2
            'Ilang', 'Inayangan', 'Indangan', 'Lacson', 'Lamanan',
            'Lampianao', 'Langub', 'Lasang', 'Laverna', 'Leon Garcia Sr.',
            'Lizada', 'Los Amigos', 'Lubogan', 'Lumiad', 'Ma-a',
            'Mabuhay', 'Magtuod', 'Mahayag', 'Malabog', 'Malakas',
            'Manambulan', 'Mandug', 'Manuel Guianga', 'Mapula', 'Marapangi',
            'Marilog Proper', 'Matina Aplaya', 'Matina Crossing', 'Matina Pangi',
            'Mintal',
            // District 3
            'Mudiang', 'Mulig', 'New Carmen', 'New Valencia',
            'Pampanga', 'Panacan', 'Pangyan', 'Paradise Embak', 'Rafael Castillo',
            'Riverside', 'Salapawan', 'Saloy', 'Sasa', 'Sibulan',
            'Sirawan', 'Sirib', 'Suawan', 'Subasta', 'Tacunan',
            'Tagakpan', 'Tagluno', 'Tagurano', 'Talandang', 'Talomo Proper',
            'Tamayong', 'Tamugan', 'Tapak', 'Tawagan', 'Tibuloy',
            'Tibungco', 'Tigatto', 'Toril Proper', 'Tuganay', 'Ula',
            'Ulas', 'Vicente Hizon Sr.', 'Waan', 'Wangan', 'Wilfredo Aquino',
            // Additional barangays
            'Bago Oshiro', 'Baracatan', 'Biao Escuela', 'Biao Guianga',
            'Biao Joaquin', 'Binugao', 'Bucana', 'Buda', 'Buhangin Proper',
            'Cabaguio', 'Camansi', 'Catalunan Grande', 'Catalunan Pequeño',
            'Centro (San Juan)', 'Colosas', 'Communal', 'Crossing Bayabas',
            'Dumoy', 'F. Bangoy', 'Fatima', 'Gatungan', 'Ilang',
            'Lacson', 'Ladislawa', 'Lizada', 'Maa', 'Magsaysay',
            'Mahayag', 'Mandug', 'Matina Pangi', 'Megkawayan', 'Mintal',
            'New Visayas', 'Panacan', 'Paquibato Proper', 'Paradise Embak',
            'Pisayahan', 'Poblacion', 'Pula Bato', 'Riverside', 'Salapawan',
            'San Antonio', 'Santo Niño', 'Sasa', 'Taclobo', 'Talandang',
            'Talomo Proper', 'Tigatto', 'Toril Proper', 'Tugbok Proper',
            'Ulas', 'Wangan',
        ];
    }
}
