<?php

include_once('includes/authentication.php');

$configurationSession = new Zend_Session_Namespace('configuration');

parse_str(ltrim($_SERVER["QUERY_STRING"],'?'), $query); // Get the query parameters
$query = array_change_key_case($query, CASE_UPPER); // Capitalize the parameters
$queryParamsAllow = array(
    'BBOX' ,
    'LAYERS' ,
    'EXCEPTIONS' ,
    'SRS' ,
    'CRS' ,
    'FORMAT' ,
    'WIDTH' ,
    'HEIGHT' ,
    'SESSION_ID' ,
    'PROVIDER_ID' , // TODO: use the query parameter
    'PLOT_CODE' , // TODO: use the query parameter
    'CYCLE' , // TODO: use the query parameter
    'TREE_ID' , // TODO: use the query parameter
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

// Check that the settings are in the list of those allowed
$queriesArg = array();
foreach($queryParamsAllow as $param) {
    if (isset($query[$param])){
        $queriesArg[$param] = $query[$param];
    }
}

// Force the REQUEST parameter
if (strcasecmp($queriesArg['REQUEST'] , "getlegendgraphic") == 0) {
	$queriesArg['REQUEST']  = 'GetLegendGraphic';
} else if (strcasecmp($queriesArg['REQUEST'] , "getmap") == 0) {
	$queriesArg['REQUEST']  = 'GetMap';
} else {
    $queriesArg['REQUEST']  = 'GetFeature';
}

// Force the SERVICE parameter
$geoJSONOFRequired = false;
if (strcasecmp($queriesArg['SERVICE'] , "WFS") !== 0) {
    header('Content-Type: image/png');
    $queriesArg['SERVICE']  = 'WMS';
} elseif (strcasecmp($queriesArg['OUTPUTFORMAT'] , "geojsonogr") === 0 || strcasecmp($queriesArg['OUTPUTFORMAT'] , "geojsontpl") === 0) {
    $geoJSONOFRequired = true;
    header('Content-Type: application/json,subtype=geojson,charset=utf-8');
}

// Force the EXCEPTIONS parameter
$queriesArg['EXCEPTIONS'] = 'BLANK';

header('Access-Control-Allow-Origin: *');

// Set the url
$url = $configurationSession->configuration['mapserver_private_url'];
if (isset($queriesArg['USECACHE']) && strcasecmp($queriesArg['USECACHE'], 'true') === 0) {
    $url = $configurationSession->configuration['tilecache_private_url'];
}

if (empty($url)) {
	error_log("URL not set, check the configuration of the mapserver_private_url parameter and the bootstrap");
	echo "URL not set, check the configuration of the mapserver_private_url parameter and the bootstrap";
	exit;
}

// Set the uri (url + urn)
$uri = rtrim($url,'?').'?'.http_build_query($queriesArg);

/**
 * Note for the debug:
 * - Uncomment the line below,
 * - Comment the header to see the uri on your page,
 * - Set the EXCEPTIONS parameter to XML,
 * - Check into the apache configuration (httpd_ogam.conf) your access right for the '/usr/lib/cgi-bin' directory.
 */
// echo $uri; exit;

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