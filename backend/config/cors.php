<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'public/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', sprintf(
            'http://%s:%s',
            env('PRIMARY_DOMAIN', 'localhost'),
            env('PORT_FRONTEND', '3000')
        )),
        sprintf('https://%s', env('PRIMARY_DOMAIN', 'localhost')),
        sprintf('https://api.%s', env('PRIMARY_DOMAIN', 'localhost')),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
