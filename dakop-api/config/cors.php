<?php

return [
    /*
     * Which routes CORS headers should apply to.
     * 'api/*' covers every route in routes/api.php.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * During local development both Vite (port 5173) and the preview (port 4173)
     * are allowed. In production, replace with your actual Vercel domain:
     *   e.g. 'https://dakop.vercel.app' or 'https://dakop.com'
     */
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Cookies are not used for API token auth, so this can stay false
    'supports_credentials' => false,
];
