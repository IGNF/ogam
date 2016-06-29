<?php

include_once('includes/authentication.php');

$configurationSession = new Zend_Session_Namespace('configuration');

parse_str(ltrim($_SERVER["QUERY_STRING"],'?'), $query); //recupere la requete envoyée partie (GET params)...
$query = array_change_key_case($query, CASE_UPPER); // force les clés en majuscule
$queryParamsAllow = array(//paramNom => requis
    'BBOX' ,
    'LAYERS' ,
    'EXCEPTIONS' ,
    'SRS' ,
    'CRS' ,
    'FORMAT' ,
    'WIDTH' ,
    'HEIGHT' ,
    'SESSION_ID' ,
    'PLOT_CODE' ,// TODO: use the query parameter
    'TRANSPARENT' ,
    'VERSION' ,
    'STYLES' ,
	'QUERY_LAYERS' ,
	'X' ,
	'Y' ,
	'INFO_FORMAT' ,
	'HASSLD' ,
	'SERVICE' ,
	'REQUEST' ,
	'LAYER' ,
	'MAP.SCALEBAR',
    'OUTPUTFORMAT',
    'TYPENAME',
    'SRSNAME'
);

// Vérifie que les paramètres sont dans la liste des ceux autorisés
$queriesArg = array();
foreach($queryParamsAllow as $param) {
    if (isset($query[$param])){
        $queriesArg[$param] = $query[$param];
    }
}
// force la valeur de REQUEST
if (strcasecmp($queriesArg['REQUEST'] , "getlegendgraphic") == 0) {
	$queriesArg['REQUEST']  = 'GetLegendGraphic';
} else if (strcasecmp($queriesArg['REQUEST'] , "getmap") == 0) {
	$queriesArg['REQUEST']  = 'GetMap';
} else {
    $queriesArg['REQUEST']  = 'GetFeature';
}

// force la valeur de SERVICE
$geoJSONOFRequired = false;
if (strcasecmp($queriesArg['SERVICE'] , "WFS") !== 0) {
    header('Content-Type: image/png');
    $queriesArg['SERVICE']  = 'WMS';
} elseif (strcasecmp($queriesArg['OUTPUTFORMAT'] , "geojsonogr") === 0 || strcasecmp($queriesArg['OUTPUTFORMAT'] , "geojsontpl") === 0) {
    $geoJSONOFRequired = true;
    header('Content-Type: application/json,subtype=geojson,charset=utf-8');
}

header('Access-Control-Allow-Origin: *');

// Set the url
$url = $configurationSession->configuration['mapserver_private_url'];
if (isset($queriesArg['USECACHE']) && strcasecmp($queriesArg['USECACHE'], 'true') === 0) {
    $url = $configurationSession->configuration['tilecache_private_url'];
}

// Set the uri (url + urn)
$uri = rtrim($url,'?').'?'.http_build_query($queriesArg);

//echo $uri;exit;
//error_log($uri);

$content = file_get_contents($uri);
if ($content !== FALSE) {
    if ($content === "" && $geoJSONOFRequired) { // BugFix: gdal-bin 1.10 OGR driver return nothing when there are no feature
        echo '{
            "type": "FeatureCollection",
            "features": []
        }';
    } else {
        echo $content;
    }
}