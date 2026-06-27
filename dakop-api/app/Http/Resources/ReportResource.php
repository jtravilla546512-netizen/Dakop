<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'type'                 => $this->type,
            'latitude'             => $this->latitude,
            'longitude'            => $this->longitude,
            'description'          => $this->description,
            'landmark'             => $this->landmark,
            'expires_at'           => $this->expires_at->toIso8601String(),
            'is_active'            => $this->isActive(),
            'still_here_count'     => $this->still_here_count,
            'no_longer_here_count' => $this->no_longer_here_count,
            'created_at'           => $this->created_at->toIso8601String(),
            'reporter'             => $this->whenLoaded('user', fn() => [
                'id'   => $this->user?->id,
                'name' => $this->user?->name ?? 'Anonymous',
            ]),
            'location' => $this->whenLoaded('barangay', fn() => [
                'barangay' => $this->barangay->name,
                'city'     => $this->barangay->city->name,
                'province' => $this->barangay->city->province->name,
                'region'   => $this->barangay->city->province->region->name,
            ]),
        ];
    }
}
