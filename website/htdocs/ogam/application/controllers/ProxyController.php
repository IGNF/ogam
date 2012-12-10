<?php
/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
require_once 'AbstractOGAMController.php';

/**
 * Proxy used to safely route the request to the mapserver.
 * @package controllers
 */
class ProxyController extends AbstractOGAMController {

	/**
	 * The generic service.
	 */
	private $genericService;

	/**
	 * The models.
	 */
	private $metadataModel;
	private $classDefinitionModel;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Initialise the models
		$this->metadataModel = new Genapp_Model_Metadata_Metadata();
		$this->classDefinitionModel = new Application_Model_Mapping_ClassDefinition();

		// The service used to build generic info from the metadata
		$this->genericService = new Genapp_Service_GenericService();
	}

	/**
	 * No authorization check.
	 *
	 * @throws Exception when user not loggued.
	 */
	function preDispatch() {
		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions)) {
			// user not logged
			throw new Zend_Auth_Exception('User not logged');
		}
	}

	/**
	 * Extract the content of a String located after a substring.
	 *
	 * @param String $string the source string
	 * @param String $substring the substring to locate
	 * @return String the part of the string located after the substring
	 */
	private function _extractAfter($string, $substring) {
		return substr($string, strpos($string, $substring) + strlen($substring));
	}

	/**
	 * Extract the value of a parameter from an URL.
	 *
	 * @param String $url the url string
	 * @param String $param the parameter name
	 * @return String the value of the parameter
	 */
	private function _extractParam($url, $param) {
		$end = $this->_extractAfter($url, $param."=");
		$endpos = strpos($end, "&");
		if ($endpos === false) {
			$endpos = strlen($end);
		}
		$value = substr($end, 0, $endpos);
		return $value;
	}

	/**
	 * Checks that a string ends with a given substring.
	 *
	 * @param String $str
	 * @param String $sub
	 * @return a boolean
	 */
	private function _endsWith($str, $sub) {
		return (substr($str, strlen($str) - strlen($sub)) == $sub);
	}

	/**
	 * Get a Tile from Mapserver
	 */
	function gettileAction() {
	    $this->logger->debug(__METHOD__);
		$uri = $_SERVER['REQUEST_URI'];

		$configuration = Zend_Registry::get("configuration");
		$mapserverURL = $configuration->mapserver_url;
		$mapserverURL = $mapserverURL."&";

		$uri = $mapserverURL.$this->_extractAfter($uri, "proxy/gettile?");

		// Check the image type
		$imagetype = $this->_extractParam($uri, "FORMAT");
		if ($this->_endsWith($imagetype, "JPG") || $this->_endsWith($imagetype, "JPEG")) {
			header("Content-Type: image/jpg");
		} else {
			header("Content-Type: image/png");
		}

		// If the layer needs activation, we suppose it needs a SLD.
		$hassld = $this->_extractParam($uri, "HASSLD");
		if (strtolower($hassld) == "true") {

			// Get the layer name
			$layerName = $this->_extractParam($uri, "LAYERS");

			if (strpos($layerName, "interpolation") !== FALSE) {
				$sld = $this->_generateRasterSLD($layerName, 'average_value');
			} else {
				$sld = $this->_generateSLD($layerName, 'average_value');
			}
			$uri .= "&SLD_BODY=".urlencode($sld);
		}

		$this->logger->debug('redirect gettile : '.$uri);

		// Send the request to Mapserver and forward the response data
		$handle = fopen($uri, "rb");

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$result = $this->_sendGET($uri);
		} else {
			$result = $this->_sendPOST($uri, $this->_request->getRawBody());
		}

		echo $result;

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Get a WFS from Mapserver.
	 * Used to get a list of features in the WFSLayer layer.
	 *
	 * Used for snapping and for getFeature tool.
	 */
	function getwfsAction() {

		$uri = $_SERVER["REQUEST_URI"];
		$method = $_SERVER['REQUEST_METHOD']; // GET or POST

		$configuration = Zend_Registry::get("configuration");
		$mapserverURL = $configuration->mapserver_url;
		$mapserverURL = $mapserverURL."&";

		$uri = $mapserverURL.$this->_extractAfter($uri, "proxy/getwfs?");
		$this->logger->debug('redirect getwfs : '.$uri);

		if ($method == 'GET') {
			$result = $this->_sendGET($uri);
		} else {
			$result = $this->_sendPOST($uri, $this->_request->getRawBody());
		}

		echo $result;

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Simulate a GET
	 *
	 * @param String $url the url to call
	 * @throws Exception
	 */
	private function _sendGET($url) {

		$result = "";
		$handle = fopen($url, "rb");
		$result = stream_get_contents($handle);
		fclose($handle);

		return $result;
	}

	/**
	 * Simulate a POST
	 *
	 * @param String $url the url to call
	 * @param Array $data the post data
	 * @throws Exception
	 */
	private function _sendPOST($url, $data) {

		$this->logger->debug('_sendPOST : '.$url." data : ".$data);

		$contentType = "application/xml";

		$opts = array (
		    'http' => array (
		        'method' => "POST",
		        'header' => "Content-Type: ".$contentType."\r\n"."Content-length: ".strlen($data)."\r\n",
		        'content' => $data
		    )
		);
		ini_set('user_agent', $_SERVER['HTTP_USER_AGENT']);
		$context = stream_context_create($opts);
		$fp = fopen($url, 'r', false, $context);
		$result = "";
		if ($fp) {
			while ($str = fread($fp, 1024)) {
			    $result .= $str;
			}
			fclose($fp);
		} else {
			return "Error opening url : ".$url;
		}

		return $result;

	}

	/**
	 * Get a Tile from Tilecache
	 */
	function getcachedtileAction() {

		$configuration = Zend_Registry::get("configuration");
		$tilecacheURL = $configuration->tilecache_url;
		$ur = new HttpQueryString(false, $_SERVER["QUERY_STRING"]); //recupere la requete envoyé partie ?...

		$queriesArg = array();
		$queriesArg['request'] = 'GetMap';
		$queriesArg['service'] = 'WMS';

		$query = $ur->mod($queriesArg); //force la valeur de certains parametres

		$uri = $tilecacheURL.$query->toString();

		$this->logger->debug('redirect getcachedtile : '.$uri);

		// Send the request to Mapserver and forward the response data
		header("Content-Type: image/png");

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$result = $this->_sendGET($uri);
		} else {
			$result = $this->_sendPOST($uri, $this->_request->getRawBody());
		}

		echo $result;

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Get a Legend Image
	 */
	function getlegendimageAction() {

		$uri = $_SERVER["REQUEST_URI"];

		$configuration = Zend_Registry::get("configuration");
		$mapserverURL = $configuration->mapserver_url;
		$mapserverURL = $mapserverURL."&";

		$uri = $mapserverURL.$this->_extractAfter($uri, "proxy/getlegendimage?");

		// Check the image type
		$imagetype = $this->_extractParam($uri, "FORMAT");
		if ($this->_endsWith($imagetype, "JPG") || $this->_endsWith($imagetype, "JPEG")) {
			header("Content-Type: image/jpg");
		} else {
			header("Content-Type: image/png");
		}

		// If the layer needs activation, we suppose it needs a SLD.
		$activation = $this->_extractParam($uri, "HASSLD");
		$this->logger->debug('uri : '.$uri);
		if (strtolower($activation) == "true") {

			// Get the layer name
			$layerName = $this->_extractParam($uri, "LAYER");

			// generate a SLD_BODY
			if (strpos($layerName, "interpolation") !== FALSE) {
				$sld = $this->_generateRasterSLD($layerName);
			} else {
				$sld = $this->_generateSLD($layerName, 'average_value');
			}
			$uri .= "&SLD_BODY=".urlencode($sld);
		}

		$this->logger->debug('redirect getlegendimage : '.$uri);

		// Send the request to Mapserver and forward the response data
		$handle = fopen($uri, "rb");

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$result = $this->_sendGET($uri);
		} else {
			$result = $this->_sendPOST($uri, $this->_request->getRawBody());
		}

		echo $result;

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Get informations about a feature.
	 *
	 * The function will call Mapserver with a WFS request.
	 * The returned number of features should be maximum 1.
	 */
	function getfeatureinfoAction() {

		$this->logger->debug('getfeatureinfoAction');

		$uri = $_SERVER["REQUEST_URI"];

		$configuration = Zend_Registry::get("configuration");
		$mapserverURL = $configuration->mapserver_url;
		$mapserverURL = $mapserverURL."&";
		$sessionId = session_id();

		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema; // the schema used
		$queryObject = $websiteSession->queryObject; // the last query done

		$uri = $this->_extractAfter($uri, "proxy/getfeatureinfo?");

		$metadataModel = new Genapp_Model_Metadata_Metadata();

		// On effecture une requête mapserver "GetFeature" pour chaque layer
		$uri = $mapserverURL.$uri."&SESSION_ID=".$sessionId;
		$this->logger->debug('redirect getinfo : '.$uri);

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$gml = $this->_sendGET($uri);
		} else {
			$gml = $this->_sendPOST($uri, $this->_request->getRawBody());
		}

		// Get the infos to display
		$this->logger->debug('Get the infos to display');
		if (strpos($gml, ":display>")) {
			// we have at least one plot found


			$dom = new DomDocument();
			$dom->loadXML($gml);

			// List the items to display
			$displayNodes = $dom->getElementsByTagName("display");

			$displayItems = array();

			foreach ($displayNodes->item(0)->childNodes as $item) {
				if ($item->nodeType == XML_ELEMENT_NODE) {
					$name = str_replace('ms:', '', $item->nodeName);
					$name = str_replace('myns:', '', $name);
					$value = $item->nodeValue;

					$displayItems[$name] = $value;
				}
			}


			echo '{"success":true'.', "fields":'.json_encode($displayItems).'}';
		} else {
			echo '{"success":true, "fields":[]}';
		}

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Extract some parameters from a WFS XLM response.
	 *
	 * @param String $domNode the XML node
	 * @return Array[String => String] The params
	 */
	private function _getParams($domNode) {
		$params = array();
		foreach ($domNode->childNodes as $childNode) {
			if ($childNode->nodeType == XML_ELEMENT_NODE) {
				$name = str_replace('ms:', '', $childNode->nodeName);
				$name = str_replace('myns:', '', $name);
				$params[$name] = $childNode->nodeValue;
			}
		}
		return $params;
	}

	/**
	 * Show a PDF report for the data submission.
	 */
	function showreportAction() {

		$configuration = Zend_Registry::get("configuration");
		$reportServiceURL = $configuration->reportGenerationService_url;
		$errorReport = $configuration->errorReport;
		$submissionId = $this->_getParam("submissionId");

		$reportURL = $reportServiceURL."/run?__format=pdf&__report=report/".$errorReport."&submissionid=".$submissionId;

		$this->logger->debug('redirect showreport : '.$reportURL);

		set_time_limit(0);
		header("Cache-control: private\n");
		header("Content-Type: application/pdf\n");
		header("Content-transfer-encoding: binary\n");
		header('Content-disposition: attachment; filename=Error_Report_'.$submissionId.".pdf");

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$result = $this->_sendGET($reportURL);
		} else {
			$result = $this->_sendPOST($reportURL, $this->_request->getRawBody());
		}

		echo $result;

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Show a simplified PDF report for the data submission.
	 */
	function showsimplifiedreportAction() {

		$configuration = Zend_Registry::get("configuration");
		$reportServiceURL = $configuration->reportGenerationService_url;
		$errorReport = $configuration->simplifiedReport;
		$submissionId = $this->_getParam("submissionId");

		$reportURL = $reportServiceURL."/run?__format=pdf&__report=report/".$errorReport."&submissionid=".$submissionId;

		$this->logger->debug('redirect showreport : '.$reportURL);

		set_time_limit(0);
		header("Cache-control: private\n");
		header("Content-Type: application/pdf\n");
		header("Content-transfer-encoding: binary\n");
		header('Content-disposition: attachment; filename=Error_Report_'.$submissionId.".pdf");

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$result = $this->_sendGET($reportURL);
		} else {
			$result = $this->_sendPOST($reportURL, $this->_request->getRawBody());
		}

		echo $result;


		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Show a PDF report for the plot location submission.
	 */
	function showplotreportAction() {

		$configuration = Zend_Registry::get("configuration");
		$reportServiceURL = $configuration->reportGenerationService_url;
		$plotErrorReport = $configuration->plotErrorReport;
		$submissionId = $this->_getParam("submissionId");

		$reportURL = $reportServiceURL."/run?__format=pdf&__report=report/".$plotErrorReport."&submissionid=".$submissionId;

		$this->logger->debug('redirect showreport : '.$reportURL);

		set_time_limit(0);
		header("Cache-control: private\n");
		header("Content-Type: application/pdf\n");
		header("Content-transfer-encoding: binary\n");
		header('Content-disposition: attachment; filename=Error_Report_'.$submissionId.".pdf");

		$method = $_SERVER['REQUEST_METHOD']; // GET or POST
		if ($method == 'GET') {
			$result = $this->_sendGET($reportURL);
		} else {
			$result = $this->_sendPOST($reportURL, $this->_request->getRawBody());
		}

		echo $result;

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Generate a SLD.
	 * TODO : Move this method to the "Map" controler and make a call between controlers.
	 *
	 * @param String $layerName The name of the layer
	 * @param String $variableName The name of the variable
	 */
	private function _generateSLD($layerName, $variableName) {

		$this->logger->debug('_generateSLD : '.$layerName);

		// Define the classes
		$classes = $this->classDefinitionModel->getClassDefinition($variableName);

		// Generate the SLD string
		$sld = '<StyledLayerDescriptor version="1.0.0"';
		$sld .= ' xmlns="http://www.opengis.net/sld"';
		$sld .= '  xmlns="http://www.opengis.net/ogc"';
		$sld .= '  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">';
		$sld .= '<NamedLayer>';
		$sld .= '<Name>'.$layerName.'</Name>';
		$sld .= '<UserStyle>';
		$sld .= '<Name>'.$layerName.'</Name>';
		$sld .= '<Title>'.$layerName.'</Title>';
		$sld .= '<FeatureTypeStyle>';

		// Generate the SLD code corresponding to one class
		foreach ($classes as $classe) {

			$sld .= '<Rule>';
			$sld .= '<Name>'.$classe->label.'</Name>';
			$sld .= '<Filter>';
			$sld .= '<And>';
			$sld .= '<PropertyIsGreaterThan>';
			$sld .= '<PropertyName>'.$variableName.'</PropertyName>';
			$sld .= '<Literal>'.$classe->minValue.'</Literal>';
			$sld .= '</PropertyIsGreaterThan>';
			$sld .= '<PropertyIsLessThan>';
			$sld .= '<PropertyName>'.$variableName.'</PropertyName>';
			$sld .= '<Literal>'.$classe->maxValue.'</Literal>';
			$sld .= '</PropertyIsLessThan>';
			$sld .= '</And>';
			$sld .= '</Filter>';
			$sld .= '<PolygonSymbolizer>';
			$sld .= '<Fill>';
			$sld .= '<CssParameter name="fill">#'.$classe->color.'</CssParameter>';
			$sld .= '</Fill>';
			$sld .= '</PolygonSymbolizer>';
			$sld .= '</Rule>';
		}

		$sld .= '</FeatureTypeStyle>';
		$sld .= '</UserStyle>';
		$sld .= '</NamedLayer>';
		$sld .= '</StyledLayerDescriptor>';

		$this->logger->debug('_generated SLD : '.$sld);

		return $sld;

	}

	/**
	 * Generate a SLD for a Raster layer.
	 * TODO : Move this method to the "Map" controler and make a call between controlers.
	 *
	 * @param String $layerName The name of the layer
	 * @param String $variableName The name of the variable
	 */
	private function _generateRasterSLD($layerName, $variableName) {

		$this->logger->debug('_generateRasterSLD : '.$layerName);

		// Define the classes
		$classes = $this->classDefinitionModel->getRasterClassDefinition($variableName);

		// Generate the SLD string
		$sld = '<StyledLayerDescriptor version="1.0.0"';
		$sld .= ' xmlns="http://www.opengis.net/sld"';
		$sld .= '  xmlns="http://www.opengis.net/ogc"';
		$sld .= '  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">';
		$sld .= '<NamedLayer>';
		$sld .= '<Name>'.$layerName.'</Name>';
		$sld .= '<UserStyle>';
		$sld .= '<Name>'.$layerName.'</Name>';
		$sld .= '<Title>'.$layerName.'</Title>';
		$sld .= '<FeatureTypeStyle>';
		$sld .= '<Rule>';
		$sld .= '<RasterSymbolizer>';
		$sld .= '<ColorMap>';

		// Generate the SLD code corresponding to one class
		foreach ($classes as $classe) {
			$sld .= '<ColorMapEntry color="#'.$classe->color.'" quantity="'.$classe->maxValue.'" label="'.$classe->label.'" />';
		}

		$sld .= '</ColorMap>';
		$sld .= '</RasterSymbolizer>';
		$sld .= '</Rule>';
		$sld .= '</FeatureTypeStyle>';
		$sld .= '</UserStyle>';
		$sld .= '</NamedLayer>';
		$sld .= '</StyledLayerDescriptor>';

		$this->logger->debug('_generated SLD : '.$sld);

		return $sld;
	}
}