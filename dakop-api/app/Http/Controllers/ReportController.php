<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReportResource;
use App\Models\Barangay;
use App\Models\Report;
use App\Models\ReportConfirmation;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // GET /api/reports  — list active reports, with optional filters
    public function index(Request $request)
    {
        $query = Report::active()
            ->with(['user', 'barangay.city.province.region'])
            ->latest();

        // Filter by province: find all barangay IDs that belong to this province
        if ($request->filled('province_id')) {
            $query->whereHas('barangay.city', function ($q) use ($request) {
                $q->where('province_id', $request->province_id);
            });
        }

        // Filter by city/municipality
        if ($request->filled('city_id')) {
            $query->whereHas('barangay', function ($q) use ($request) {
                $q->where('city_id', $request->city_id);
            });
        }

        // Filter by specific barangay
        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        // Filter by checkpoint type (hpg or lto)
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return ReportResource::collection($query->get());
    }

    // POST /api/reports  — submit a new report (requires auth)
    public function store(Request $request)
    {
        $data = $request->validate([
            'barangay_id' => ['required', 'exists:barangays,id'],
            'type'        => ['required', 'in:hpg,lto,speed_gun'],
            'latitude'    => ['required', 'numeric', 'between:-90,90'],
            'longitude'   => ['required', 'numeric', 'between:-180,180'],
            'description' => ['nullable', 'string', 'max:500'],
            'landmark'    => ['nullable', 'string', 'max:255'],
        ]);

        // Anti-spam / defensive guard: reject a near-duplicate of THIS user's own
        // recent report (same type, within ~150m, last 10 minutes). Stops accidental
        // double-taps and deliberate spam, without blocking genuinely new reports.
        $delta = 0.0015; // ≈ 150 metres in degrees
        $isDuplicate = Report::where('user_id', $request->user()->id)
            ->where('type', $data['type'])
            ->where('created_at', '>=', now()->subMinutes(10))
            ->whereBetween('latitude',  [$data['latitude']  - $delta, $data['latitude']  + $delta])
            ->whereBetween('longitude', [$data['longitude'] - $delta, $data['longitude'] + $delta])
            ->exists();

        if ($isDuplicate) {
            return response()->json([
                'message' => 'You already reported a similar checkpoint near here a few minutes ago.',
            ], 422);
        }

        $data['user_id']    = $request->user()->id;
        $data['expires_at'] = now()->addHours(2);

        $report = Report::create($data);
        $report->load(['user', 'barangay.city.province.region']);

        return new ReportResource($report);
    }

    // GET /api/reports/{report}  — single report detail
    public function show(Report $report)
    {
        $report->load(['user', 'barangay.city.province.region']);

        return new ReportResource($report);
    }

    // POST /api/reports/{report}/confirm  — vote still_here or no_longer_here
    public function confirm(Request $request, Report $report)
    {
        $request->validate([
            'vote'        => ['required', 'in:still_here,no_longer_here'],
            'guest_token' => ['required', 'uuid'],
        ]);

        // One vote per guest_token per report
        $alreadyVoted = ReportConfirmation::where('report_id', $report->id)
            ->where('guest_token', $request->guest_token)
            ->exists();

        if ($alreadyVoted) {
            return response()->json(['message' => 'You have already voted on this report.'], 409);
        }

        ReportConfirmation::create([
            'report_id'   => $report->id,
            'user_id'     => $request->user()?->id,
            'guest_token' => $request->guest_token,
            'vote'        => $request->vote,
        ]);

        // How many "gone" votes (and a majority) are needed to remove a report early.
        $removalThreshold = 3;

        if ($request->vote === 'still_here') {
            // Extend expiry by 30 minutes, but never beyond 4 hours from creation.
            // NOTE: this does NOT reset to 2h — it just pushes the deadline a bit.
            $maxExpiry = $report->created_at->addHours(4);
            $newExpiry = now()->addMinutes(30);
            $report->expires_at        = $newExpiry->lessThan($maxExpiry) ? $newExpiry : $maxExpiry;
            $report->still_here_count += 1;
        } else {
            $report->no_longer_here_count += 1;

            // Crowd consensus removal: enough people say it's gone AND they
            // outnumber those who say it's still there → expire it now.
            // One or two stray votes can't remove a report others are confirming.
            if ($report->no_longer_here_count >= $removalThreshold
                && $report->no_longer_here_count > $report->still_here_count) {
                $report->expires_at = now();
            }
        }

        $report->save();

        return response()->json([
            'message'              => 'Vote recorded.',
            'still_here_count'     => $report->still_here_count,
            'no_longer_here_count' => $report->no_longer_here_count,
            'expires_at'           => $report->expires_at->toIso8601String(),
        ]);
    }
}
