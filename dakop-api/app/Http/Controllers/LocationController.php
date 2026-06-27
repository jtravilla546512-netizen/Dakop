<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\City;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    /**
     * Return all regions.
     * has_data = true when the region contains at least one city with barangays.
     */
    public function regions()
    {
        // Single query: which region IDs have at least one city with barangays?
        $withData = DB::table('regions')
            ->join('provinces', 'provinces.region_id', '=', 'regions.id')
            ->join('cities',    'cities.province_id',  '=', 'provinces.id')
            ->join('barangays', 'barangays.city_id',   '=', 'cities.id')
            ->distinct()
            ->pluck('regions.id')
            ->flip(); // flip to use isset() instead of in_array() — faster

        return response()->json([
            'data' => Region::orderBy('name')->get()->map(fn($r) => [
                'id'       => $r->id,
                'name'     => $r->name,
                'has_data' => isset($withData[$r->id]),
            ]),
        ]);
    }

    /**
     * Return provinces for a region.
     * has_data = true when the province has at least one city with barangays.
     */
    public function provinces(Region $region)
    {
        $withData = DB::table('provinces')
            ->join('cities',    'cities.province_id', '=', 'provinces.id')
            ->join('barangays', 'barangays.city_id',  '=', 'cities.id')
            ->where('provinces.region_id', $region->id)
            ->distinct()
            ->pluck('provinces.id')
            ->flip();

        return response()->json([
            'data' => $region->provinces()->orderBy('name')->get()->map(fn($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'has_data' => isset($withData[$p->id]),
            ]),
        ]);
    }

    /**
     * Return cities/municipalities for a province.
     * has_data = true when the city has at least one barangay.
     */
    public function cities(Province $province)
    {
        $withData = DB::table('cities')
            ->join('barangays', 'barangays.city_id', '=', 'cities.id')
            ->where('cities.province_id', $province->id)
            ->distinct()
            ->pluck('cities.id')
            ->flip();

        return response()->json([
            'data' => $province->cities()->orderBy('name')->get()->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'is_city'  => $c->is_city,
                'has_data' => isset($withData[$c->id]),
            ]),
        ]);
    }

    /**
     * Return barangays for a city.
     */
    public function barangays(City $city)
    {
        return response()->json([
            'data' => $city->barangays()->orderBy('name')->get()->map(fn($b) => [
                'id'   => $b->id,
                'name' => $b->name,
            ]),
        ]);
    }

    /**
     * Resolve a city + optional suburb (barangay) name to their DB IDs.
     * Used by the frontend to auto-fill dropdowns after reverse geocoding or
     * a landmark search — one call instead of looping through all regions.
     *
     * GET /api/locations/resolve?city=Davao+City&suburb=Agdao
     */
    public function resolve()
    {
        $cityQuery   = strtolower(trim(request('city',   '')));
        $suburbQuery = strtolower(trim(request('suburb', '')));

        if (!$cityQuery) return response()->json(null, 404);

        $city = City::whereRaw('LOWER(name) LIKE ?', ["%{$cityQuery}%"])->first();
        if (!$city) return response()->json(null, 404);

        $province = Province::find($city->province_id);
        $region   = Region::find($province->region_id);

        $barangay = null;
        if ($suburbQuery) {
            $barangay = Barangay::where('city_id', $city->id)
                ->whereRaw('LOWER(name) LIKE ?', ["%{$suburbQuery}%"])
                ->first();
        }

        return response()->json([
            'region'   => ['id' => $region->id,   'name' => $region->name],
            'province' => ['id' => $province->id, 'name' => $province->name],
            'city'     => ['id' => $city->id,     'name' => $city->name,
                           'has_data' => Barangay::where('city_id', $city->id)->exists()],
            'barangay' => $barangay ? ['id' => $barangay->id, 'name' => $barangay->name] : null,
        ]);
    }
}
