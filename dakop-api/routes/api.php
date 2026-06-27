<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes — no login required
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Reports (read-only is public)
Route::get('/reports',          [ReportController::class, 'index']);
Route::get('/reports/{report}', [ReportController::class, 'show']);

// Anyone can confirm (guest token prevents duplicates)
Route::post('/reports/{report}/confirm', [ReportController::class, 'confirm']);

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

    // Submit a new report
    Route::post('/reports', [ReportController::class, 'store']);
});
