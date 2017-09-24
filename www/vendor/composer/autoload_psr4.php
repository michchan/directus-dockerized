<?php

// autoload_psr4.php @generated by Composer

$vendorDir = dirname(dirname(__FILE__));
$baseDir = dirname($vendorDir);

return array(
    'Zend\\Stdlib\\' => array($vendorDir . '/zendframework/zend-stdlib/src'),
    'Zend\\Db\\' => array($vendorDir . '/zendframework/zend-db/src'),
    'Twig\\' => array($vendorDir . '/twig/twig/src'),
    'Symfony\\Component\\Yaml\\' => array($vendorDir . '/symfony/yaml'),
    'Psr\\Http\\Message\\' => array($vendorDir . '/psr/http-message/src'),
    'League\\OAuth2\\Client\\' => array($vendorDir . '/league/oauth2-client/src', $vendorDir . '/league/oauth2-github/src', $vendorDir . '/league/oauth2-google/src', $vendorDir . '/league/oauth2-facebook/src'),
    'League\\OAuth1\\' => array($vendorDir . '/league/oauth1-client/src'),
    'League\\Flysystem\\' => array($vendorDir . '/league/flysystem/src'),
    'Intervention\\Image\\' => array($vendorDir . '/intervention/image/src/Intervention/Image'),
    'GuzzleHttp\\Psr7\\' => array($vendorDir . '/guzzlehttp/psr7/src'),
    'GuzzleHttp\\Promise\\' => array($vendorDir . '/guzzlehttp/promises/src'),
    'GuzzleHttp\\' => array($vendorDir . '/guzzlehttp/guzzle/src'),
    'Directus\\Installation\\' => array($baseDir . '/installation/includes'),
    'Directus\\Customs\\Hooks\\' => array($baseDir . '/customs/hooks'),
    'Directus\\Customs\\Hasher\\' => array($baseDir . '/customs/hashers'),
    'Directus\\Customs\\Embed\\Provider\\' => array($baseDir . '/customs/embeds'),
    'Directus\\API\\Routes\\' => array($baseDir . '/api/routes'),
    'Directus\\' => array($baseDir . '/api/core/Directus'),
);
