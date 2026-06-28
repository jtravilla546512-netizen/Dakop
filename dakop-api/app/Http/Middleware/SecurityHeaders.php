<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds standard hardening headers to every API response.
 * These tell browsers to behave defensively even if something slips through.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Don't let the browser guess (sniff) a response's content type
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Disallow our API responses from being embedded in an <iframe> (clickjacking)
        $response->headers->set('X-Frame-Options', 'DENY');

        // Don't leak the full URL (which may contain data) to other sites
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Opt out of being included in Google's FLoC/Topics ad tracking
        $response->headers->set('Permissions-Policy', 'browsing-topics=()');

        return $response;
    }
}
