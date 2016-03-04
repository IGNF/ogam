<?php
include_once ('setup.php');

function onfailure($url) {
	header('Location: ' . $url);
}

require_once APPLICATION_PATH . '/objects/website/Role.php';
require_once APPLICATION_PATH . '/objects/website/User.php';

/*
 * require_once APPLICATION_PATH . '/../library/Zend/Exception.php';
 * require_once APPLICATION_PATH . '/../library/Zend/Session/Exception.php';
 * require_once APPLICATION_PATH . '/../library/Zend/Session/Abstract.php';
 * require_once APPLICATION_PATH . '/../library/Zend/Session/Namespace.php';
 * require_once APPLICATION_PATH . '/../library/Zend/Session/SaveHandler/Interface.php';
 */
require_once APPLICATION_PATH . '/../library/Zend/Session.php';
require_once APPLICATION_PATH . '/../library/Zend/Registry.php';

Zend_Session::setOptions($ApplicationConf->resources->session->toArray());

$userSession = new Zend_Session_Namespace('user');
$configurationSession = new Zend_Session_Namespace('configuration');
$mapServiceURL = $configurationSession->configuration['map_service_url'];

/*
 * echo '<br/>mapServiceURL : '; echo $mapServiceURL;
 * echo '<br/>connected : '; echo $userSession->connected;
 * echo '<br/>role : '; print_r($userSession->user->role);
 * echo '<br/>permissions : '; print_r($userSession->user->role->permissionsList);
 * exit();
 */

if (!$userSession->connected) {
	error_log('User not connected on ' . $_SERVER["HTTP_HOST"]);
	error_log('Request: ' . $_SERVER["QUERY_STRING"]);
	onfailure('/');
}

if (empty($userSession->user) || !in_array('DATA_QUERY', $userSession->user->role->permissionsList)) {
	onfailure('/');
}

// Zend_Session::stop(); // Doesn't work well
session_write_close(); // libere le cookie/session

parse_str($_SERVER["QUERY_STRING"], $query); // recupere la requete envoyée partie (GET params)...
$query = array_change_key_case($query, CASE_UPPER); // force les clés en majuscule
$queryParamsAllow = array( // paramNom => requis
	'BBOX',
	'LAYERS',
	'EXCEPTIONS',
	'SRS',
	'FORMAT',
	'WIDTH',
	'HEIGHT',
	'SESSION_ID',
	'TRANSPARENT',
	'VERSION',
	'STYLES',
	'REQUEST',
	'QUERY_LAYERS',
	'X',
	'Y',
	'INFO_FORMAT',
	'HASSLD',
	'SERVICE',
	'REQUEST',
	'FORMAT',
	'LAYER'
);

// Vérifie que les paramètres sont dans la liste des ceux autorisés
$queriesArg = array();
foreach ($queryParamsAllow as $param) {
	if (isset($query[$param])) {
		$queriesArg[$param] = $query[$param];
	}
}
// force la valeur de certains parametres
if (strcasecmp($queriesArg['REQUEST'], "getlegendgraphic") == 0) {
	$queriesArg['REQUEST'] = 'GetLegendGraphic';
} else if (strcasecmp($queriesArg['REQUEST'], "getmap") == 0) {
	$queriesArg['REQUEST'] = 'GetMap';
} else {
	$queriesArg['REQUEST'] = 'GetFeature';
}

$queriesArg['SERVICE'] = 'WMS';

$uri = $mapServiceURL . '&' . http_build_query($queriesArg);
header('Content-Type: image/png');
$content = file_get_contents($uri);
if ($content !== FALSE) {
	echo $content;
}