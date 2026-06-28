<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes — no login required
|--------------------------------------------------------------------------
*/

// Auth — throttled to slow down brute-force / spam account creation
// throttle:N,M  =  max N requests per M minutes (keyed by IP for guests)
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:10,1');

// Reports (read-only is public)
Route::get('/reports',          [ReportController::class, 'index']);
Route::get('/reports/{report}', [ReportController::class, 'show']);

// Anyone can confirm (guest token already prevents duplicate votes per report,
// so this limit only needs to stop rapid-fire abuse — kept generous because
// Philippine mobile users often share one carrier IP)
Route::post('/reports/{report}/confirm', [ReportController::class, 'confirm'])
    ->middleware('throttle:30,1');

// Location dropdowns (used when filling the report form)
Route::get('/regions',                        [LocationController::class, 'regions']);
Route::get('/regions/{region}/provinces',     [LocationController::class, 'provinces']);
Route::get('/provinces/{province}/cities',    [LocationController::class, 'cities']);
Route::get('/cities/{city}/barangays',        [LocationController::class, 'barangays']);

// Fast location resolver — city+suburb name → IDs (replaces looping in the frontend)
Route::get('/locations/resolve',              [LocationController::class, 'resolve']);

/*
|--------------------------------------------------------------------------
| Protected routes — login required
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',     [AuthController::class, 'me']);
    Route::post('/logout',[AuthController::class, 'logout']);

    // Account settings
    Route::put('/profile',     [ProfileController::class, 'update']);
    Route::put('/password',    [ProfileController::class, 'updatePassword']);
    Route::delete('/profile',  [ProfileController::class, 'destroy']);

    // Submit a new report — anti-spam: max 8 reports per minute per user
    // (authenticated, so this is keyed by user ID, not the shared carrier IP)
    Route::post('/reports', [ReportController::class, 'store'])
        ->middleware('throttle:8,1');
});
