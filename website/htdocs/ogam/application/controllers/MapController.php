<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * MapController is the controller that manages the web-mapping interface.
 * @package controllers
 */
class MapController extends AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Initialise the models
		$this->layersModel = new Application_Model_DbTable_Mapping_Layers();
		$this->boundingBoxModel = new Application_Model_DbTable_Mapping_BoundingBox();
	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !(array_key_exists('DATA_QUERY', $permissions) || array_key_exists('DATA_QUERY_HARMONIZED', $permissions))) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('User index');

		$this->showMapAction();
	}

	/**
	 * Get the parameters used to initialise a map.
	 */
	public function getmapparametersAction() {
		$this->logger->debug('getmapparametersAction');

		// Get back the country code
		$userSession = new Zend_Session_Namespace('user');

		// TODO : Remove hardcoded value
		$countryCode = "1";

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");

		$this->view->bbox = $configuration->bbox; // Bounding box
		$this->view->tilesize = $configuration->tilesize; // Tile size
		$this->view->projection = "EPSG:".$configuration->srs_visualisation; // Projection

		// Get the available scales
		$scales = $this->layersModel->getScales();

		// Transform the available scales into resolutions
		$resolutions = $this->_getResolutions($scales);
		$resolString = implode(",", $resolutions);
		$this->view->resolutions = $resolString;

		// Center the map on the country
		$center = $this->boundingBoxModel->getCenter($countryCode);
		$this->view->defaultzoom = $center->defaultzoom;
		$this->view->x_center = $center->x_center;
		$this->view->y_center = $center->y_center;

		// Feature parameters
		if (empty($configuration->featureinfo->margin)) {
			$configuration->featureinfo->margin = "5000";
		}
		$this->view->featureinfo_margin = $configuration->featureinfo->margin;
		if (empty($configuration->featureinfo->typename)) {
			$configuration->featureinfo->typename = "result_locations";
		}
		$this->view->featureinfo_typename = $configuration->featureinfo->typename;
		if (empty($configuration->featureinfo->maxfeatures)) {
			$configuration->featureinfo->maxfeatures = 0;
		}
		$this->view->featureinfo_maxfeatures = $configuration->featureinfo->maxfeatures;

		$this->_helper->layout()->disableLayout();
		$this->render('map-parameters');
	}

	/**
	 * Calculate the resolution array corresponding to the available scales.
	 */
	private function _getResolutions($scales) {

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");
		$tilesize = $configuration->tilesize; // Tile size in pixels

		// WARNING : Bounding box must match the tilecache configuration and tile size

		$resolutions = array();
		foreach ($scales as $scale) {
			$res = $scale * (2 * $tilesize) / (DPI * FACTOR);
			$resolutions[$scale] = $res;
		}
		return $resolutions;
	}

	/**
	 * Return the list of available layers as a JSON.
	 */
	public function getlayersAction() {

		$this->logger->debug('getlayersAction');

		// Get back the country code
		$userSession = new Zend_Session_Namespace('user');

		// TODO : Remove hardcoded value
		$countryCode = "1";

		// Get some configutation parameters
		$configuration = Zend_Registry::get("configuration");
		$tilecacheURLs = $configuration->tilecache_url->toArray();
		$tileBaseURLs = $configuration->tiles_base_url->toArray();
		$proxyPath = $configuration->useMapProxy ? '/mapProxy.php' : '/proxy/gettile';

		// Get the available layers
		$layers = $this->layersModel->getLayersList($countryCode);

		// Get the available scales
		$scales = $this->layersModel->getScales();

		// Transform the available scales into resolutions
		$resolutions = $this->_getResolutions($scales);

		// Build the base URL for cached tiles
		$out = '{"url_array_cached":[';
		foreach ($tilecacheURLs as $tilecacheURL) {
			$out .= '"'.$tilecacheURL.'&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap",';
		}
		// Remove the last comma
		if (!empty($tilecacheURLs)) {
			$out = substr($out, 0, -1);
		}
		echo $out.'],';

		// Build the base URL for mapserver tiles
		$sessionId = session_id();
		$out = '"url_array_tiled":[';
		foreach ($tileBaseURLs as $pathBaseURL) {
			$out .= '"'.$pathBaseURL.$proxyPath."?SESSION_ID=".$sessionId.'",'; // appel direct
		}
		// Remove the last comma
		if (!empty($tileBaseURLs)) {
			$out = substr($out, 0, -1);
		}
		echo $out.'],';

		// For each available layer, build the corresponding URL and definition
		$out = '"layers":[';
		foreach ($layers as $layer) {

			$out .= "{";

			// OpenLayer object (tiled or not)
			if ($layer->isUntiled == 1) {
				$out .= '"untiled":true';
			} else {
				$out .= '"untiled":false';
			}

			// Logical layer name
			$out .= ', "name":"'.$layer->layerName.'"';

			// URL for the layer
			if ($layer->isCached == 1) {
				$out .= ', "url":"url_array_cached"';
			} else {
				$out .= ', "url":"url_array_tiled"';
			}

			// Has a legend ?
			if ($layer->hasLegend == 1) {
				$out .= ', "hasLegend": true';
			} else {
				$out .= ', "hasLegend": false';
			}

			$out .= ', "params":{';

			// Mapserver Layer name (or list of names)
			$layerNames = $layer->mapservLayers;
			$out .= '"layers" : ["'.$layerNames.'"]';

			// Transparency
			if ($layer->isTransparent == 1) {
				$out .= ', "transparent": true';
			} else {
				$out .= ', "transparent": false';
			}

			//  Image Format
			$out .= ', "format": "image/'.$layer->imageFormat.'"';

			// Hidden ?
			if ($layer->isHidden == 1) {
				$out .= ', "isHidden": true';
			} else {
				$out .= ', "isHidden": false';
			}

			// Disabled ?
			if ($layer->isDisabled == 1) {
				$out .= ', "isDisabled": true';
			} else {
				$out .= ', "isDisabled": false';
			}

			// Checked ?
			if ($layer->isChecked == 1) {
				$out .= ', "isChecked": true';
			} else {
				$out .= ', "isChecked": false';
			}

			$out .= ', "activateType": "'.$layer->activateType.'"';

			// We will test this flag to know if we need to generate a SLD
			if ($layer->hasSLD == 1) {
				$out .= ', "hasSLD": true';
			} else {
				$out .= ', "hasSLD": false';
			}

			// Add the sessionid
			$out .= ', "session_id": "'.$sessionId.'"';

			// Add the country code
			$out .= ', "country_code": "'.$countryCode.'"';

			$out .= '}';

			// Options
			$out .= ', "options":{"buffer": 0';

			// Transition effect
			if (!empty($layer->transitionEffect)) {
				$out .= ', "transitionEffect": "'.$layer->transitionEffect.'"';
			}

			// Layer visibility by default
			if ($layer->isDefault == 1) {
				$out .= ', "visibility": true';
			} else {
				$out .= ', "visibility": false';
			}

			// Is a Base Layer ?
			if ($layer->isBaseLayer == 1) {
				$out .= ', "isBaseLayer": true';
			} else {
				$out .= ', "isBaseLayer": false';
			}

			// Label
			$out .= ',"label":"'.addslashes($layer->layerLabel).'"';

			// Opacity
			if ($layer->opacity != "") {
				$out .= ', "opacity":'.($layer->opacity / 100);
			}

			// Scale min/max management
			if ($layer->maxscale != "" || $layer->minscale != "") {
				$out .= ', "resolutions": [';

				$restable = "";
				foreach ($scales as $scale) {
					if (($layer->minscale == "" || $scale >= $layer->minscale) && ($layer->maxscale == "" || $scale <= $layer->maxscale)) {
						$restable .= $resolutions[$scale].", ";
					}
				}
				$restable = substr($restable, 0, -2);
				$out .= $restable;

				$out .= "]";
			}

			$out .= "}},";

		}

		// Remove the last comma
		if (!empty($layers)) {
			$out = substr($out, 0, -1);
		}

		echo $out.']}';

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Return the model corresponding to the legend.
	 */
	public function getTreeLayersAction() {

		$this->logger->debug('getTreeLayersAction');

		// Get back the country code
		$userSession = new Zend_Session_Namespace('user');
		$countryCode = $userSession->user->countryCode;
		$this->logger->debug('countryCode : '.$countryCode);

		$item = $this->_getLegendItems(-1, $countryCode);

		echo "[".$item."]";

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Return the part of the legend model corresponding to the selected node.
	 *
	 * @return String
	 */
	private function _getLegendItems($parentId, $countryCode) {

		$this->logger->debug('_getLegendItems : '.$parentId." ".$countryCode);

		// Get the list of items corresponding to the asked level
		$legendItems = $this->layersModel->getLegend($parentId, $countryCode);

		// Get the list of active layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$activatedLayers = $mappingSession->activatedLayers;

		$json = "";

		// Iterate over each legend item
		foreach ($legendItems as $legendItem) {

			$json .= '{';
			$json .= '"text": "'.$legendItem->label.'", ';
			$json .= '"maxscale": "'.$legendItem->maxScale.'", ';
			$json .= '"minscale": "'.$legendItem->minScale.'", ';

			$json .= '"expanded": ';
			if ($legendItem->isExpended == 1) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			$json .= '"checked": ';
			if ($legendItem->isChecked == 1) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			$json .= '"hidden": ';
			if ($legendItem->isHidden == 1 && !in_array($legendItem->layerName, $activatedLayers)) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			$json .= '"disabled": ';
			if ($legendItem->isDisabled == 1) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			// The item is a leaf
			if ($legendItem->isLayer == 1) {
				$json .= '"leaf": true, ';
				$json .= '"layerName": "'.$legendItem->layerName.'" ';
			} else {
				// The item is a node
				$json .= '"leaf": false, ';

				// Recursive call
				$json .= '"children": ['.$this->_getLegendItems($legendItem->itemId, $countryCode).']';
			}
			$json .= '}, ';
		}

		$json = substr($json, 0, -2);

		return $json;
	}

	/**
	 * Calculate bounding box corresponding to a position and zoom level.
	 *
	 * @param Integer $centerX the X position of the center of the map
	 * @param Integer $centerY the Y position of the center of the map
	 * @param Integer $zoomLevel the zoom level
	 * @param Integer $size the size of the image (in pixels)
	 * @return Array[Integer] the bounding box
	 */
	private function _getBbox($centerX, $centerY, $zoomLevel, $size) {

		// Get the scales
		$scales = $this->layersModel->getScales();

		// Get the resolutions (in meters per pixel)
		$resolutions = $this->_getResolutions($scales);

		// Get the resolution at the current zoom level
		$resolutions = array_values($resolutions);
		$currentRes = $resolutions[$zoomLevel];

		// Calculate the BBOX around the center for an image of a given size
		$xMin = $centerX - ($currentRes * $size / 2);
		$xMax = $centerX + ($currentRes * $size / 2);
		$yMin = $centerY - ($currentRes * $size / 2);
		$yMax = $centerY + ($currentRes * $size / 2);

		return $xMin.",".$yMin.",".$xMax.",".$yMax;
	}

	/**
	 * Show a PDF containing the map selected by the user.
	 */
	function ajaxgeneratemapAction() {

		$this->logger->debug('ajaxgeneratemapAction');

		// Get the map parameters
		$center = $this->_getParam('center');
		$zoom = $this->_getParam('zoom');
		$layers = $this->_getParam('layers');
		$centerX = substr($center, stripos($center, "lon=") + 4, stripos($center, ",") - (stripos($center, "lon=") + 4));
		$centerY = substr($center, stripos($center, "lat=") + 4);

		// Get the mapserver name for the layers
		$layerNames = explode(",", $layers);
		$mapservLayers = "";
		foreach ($layerNames as $layerName) {
			$layer = $this->layersModel->getLayer($layerName);
			$mapservLayers .= $layer->mapservLayers.",";
		}
		$mapservLayers = substr($mapservLayers, 0, -1); // remove last comma

		// Get the configuration values
		$configuration = Zend_Registry::get("configuration");
		$reportServiceURL = $configuration->reportGenerationService_url;
		$mapReport = $configuration->mapReport;

		// Get the corresponding BBOX (for an image of 700 pixels, the size in the PDF report)
		$bbox = $this->_getBbox($centerX, $centerY, $zoom, 700);
		$this->logger->debug('bbox : '.$bbox);

		// Calculate the Mapserver URL
		$wmsURL = $configuration->mapserver_url;
		$wmsURL .= "&SERVICE=WMS";
		$wmsURL .= "&VERSION=1.1.1";
		$wmsURL .= "&FORMAT=PNG";
		$wmsURL .= "&REQUEST=GetMap";
		$wmsURL .= "&SESSION_ID=".session_id();
		$wmsURL .= "&SRS=EPSG:".$configuration->srs_visualisation;
		$wmsURL .= "&BBOX=".$bbox;
		$wmsURL .= "&LAYERS=".$mapservLayers;
		// The WIDTH and HEIGHT parameters are defined inside the report

		// Calculate the report URL
		$reportUrl = $reportServiceURL."/run?__format=pdf&__report=report/".$mapReport;
		$reportUrl .= "&WMSURL=".urlencode($wmsURL);

		$this->logger->debug('ajaxgeneratemap URL : '.$reportUrl);

		// Set the header for a PDF output
		header("Cache-control: private\n");
		header("Content-Type: application/pdf\n");
		header("Content-transfer-encoding: binary\n");
		header("Content-disposition: attachment; filename=Map.pdf");

		// Launch the PDF generation
		$handle = fopen($reportUrl, "rb");
		if ($handle) {
			while (!feof($handle)) {
				echo fread($handle, 8192);
			}
			fclose($handle);
		}

		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

}