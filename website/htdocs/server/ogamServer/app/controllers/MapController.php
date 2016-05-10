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
 * MapController is the controller that manages the web-mapping interface.
 *
 * @package Application_Controller
 */
class MapController extends AbstractOGAMController {

	/**
	 * Initialise the controler.
	 */
	public function init() {
		parent::init();

		// Initialise the models
		$this->servicesModel = new Application_Model_Mapping_Services();
		$this->layersModel = new Application_Model_Mapping_Layers();
		$this->boundingBoxModel = new Application_Model_Mapping_BoundingBox();
		$this->scalesModel = new Application_Model_Mapping_Scales();

		$this->lang = strtoupper($this->translator->getAdapter()->getLocale());
	}

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {
		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;
		if (empty($user) || !($user->isAllowed('DATA_QUERY') || $user->isAllowed('DATA_QUERY_HARMONIZED'))) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_QUERY OR DATA_QUERY_HARMONIZED');
		}
	}

	/**
	 * Get the parameters used to initialise a map.
	 */
	public function getMapParametersAction() {
		$this->logger->debug('getMapParametersAction');
		// Get back the provider id for the current user
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->provider->id;

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");

		$this->view->bbox_x_min = $configuration->bbox_x_min; // x min of Bounding box
		$this->view->bbox_y_min = $configuration->bbox_y_min; // y min of Bounding box
		$this->view->bbox_x_max = $configuration->bbox_x_max; // x max of Bounding box
		$this->view->bbox_y_max = $configuration->bbox_y_max; // y max of Bounding box
		$this->view->tilesize = $configuration->tilesize; // Tile size
		$this->view->projection = "EPSG:" . $configuration->srs_visualisation; // Projection

		// Get the available scales
		$scales = $this->scalesModel->getScales();

		// Transform the available scales into resolutions
		$resolutions = $this->getResolutions($scales);
		$resolString = implode(",", $resolutions);
		$this->view->resolutions = $resolString;
		$this->view->numZoomLevels = count($resolutions);

		$this->logger->debug('$configuration->usePerProviderCenter : ' . $configuration->usePerProviderCenter);

		if ($configuration->usePerProviderCenter === '1' || (strtolower($configuration->usePerProviderCenter) === 'true')) {
			// Center the map on the provider location
			$center = $this->boundingBoxModel->getCenter($providerId);
			$this->view->zoomLevel = $center->zoomLevel;
			$this->view->centerX = $center->x;
			$this->view->centerY = $center->y;
		} else {
			// Use default settings
			$this->view->zoomLevel = $configuration->zoom_level;
			$this->view->centerX = ($configuration->bbox_x_min + $configuration->bbox_x_max) / 2;
			$this->view->centerY = ($configuration->bbox_y_min + $configuration->bbox_y_max) / 2;
		}

		// Feature parameters
		if (empty($configuration->featureinfo_margin)) {
			$configuration->featureinfo_margin = "5000";
		}
		$this->view->featureinfo_margin = $configuration->featureinfo_margin;
		if (empty($configuration->featureinfo_typename)) {
			$configuration->featureinfo_typename = "result_locations";
		}
		$this->view->featureinfo_typename = $configuration->featureinfo_typename;
		if (empty($configuration->featureinfo_maxfeatures)) {
			$configuration->featureinfo_maxfeatures = 0;
		}
		$this->view->featureinfo_maxfeatures = $configuration->featureinfo_maxfeatures;

		$this->_helper->layout()->disableLayout();
		$this->getResponse()->setHeader('Content-type', 'application/javascript');
		$this->render('map-parameters');
	}

	/**
	 * Calculate the resolution array corresponding to the available scales.
	 *
	 * Not private because can be used by custom controllers.
	 *
	 * @param Array[Integer] $scales
	 *        	The list of scales
	 * @return Array[Integer] the resolutions
	 */
	protected function getResolutions($scales) {

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");
		$tilesize = $configuration->tilesize; // Tile size in pixels
		$dpi = $configuration->mapserver_dpi; // Default number of dots per inch in mapserv
		$factor = $configuration->mapserver_inch_per_kilometer; // Inch to meter conversion factor

		// WARNING : Bounding box must match the tilecache configuration and tile size

		$resolutions = array();
		foreach ($scales as $scale) {
			$res = $scale * (2 * $tilesize) / ($dpi * $factor);
			$resolutions[$scale] = $res / (2 * $tilesize) * 1000;
		}
		return $resolutions;
	}

	/**
	 * Return the list of vector layers as a JSON.
	 */
	public function ajaxgetvectorlayersAction() {
		$this->logger->debug('getvectorlayersAction');

		// Get the available layers
		$vectorlayers = $this->layersModel->getVectorLayersList();

		$json = '{"success":true';
		$json .= ', "layerNames" : [';
		foreach ($vectorlayers as $layerName => $layer) {

			$viewService = $this->servicesModel->getService($layer->viewServiceName);
			$serviceConfig = $viewService->serviceConfig;

			$featureService = (($layer->featureServiceName == '') ? null : $this->servicesModel->getService($layer->featureServiceName));

			$json .= '{"serviceLayerName":' . json_encode($layer->serviceLayerName) . ',';
			$json .= '"layerLabel":' . json_encode($layer->layerLabel) . ',';

			if (!empty($featureService)) {
				$layerService = json_decode($featureService->serviceConfig);
				$layerServiceParams = $layerService->{'params'};
				$url = rtrim($layerService->{'urls'}[0], '?') . '?';
				foreach ($layerServiceParams as $pKey => $pValue) {
					$url .= $pKey . '=' . $pValue . '&';
				}
				$url = rtrim($url, '&');
				$json .= '"featureServiceUrl":' . json_encode($url) . '},';
			}
		}
		if (!empty($layerNames)) {
			$json = substr($json, 0, -1);
		}
		$json .= ']';
		$json .= '}';

		echo $json;

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Return the list of available layers as a JSON.
	 */
	public function ajaxgetlayersAction() {
		$this->logger->debug('ajaxgetlayersAction');

		// Get back the provider id of the user
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->provider->id;

		// Get the available services base urls and parameters
		$services = $this->servicesModel->getServices();
		// Get the available layers
		$layers = $this->layersModel->getLayersList($providerId);

		// Get the available scales
		$scales = $this->scalesModel->getScales();
		// Transform the available scales into resolutions
		$resolutions = $this->getResolutions($scales);

		// Build the base URL for tiles
		$sessionId = session_id();

		$out = '{"services":[';
		foreach ($services as $service) {
			$out .= '{"name":"' . $service->serviceName . '"';
			$out .= ', "config":' . $service->serviceConfig . '},';
		}

		// Remove the last comma
		if (!empty($services)) {
			$out = substr($out, 0, -1);
		}
		echo $out . '],';

		// For each available layer, build the corresponding URL and definition
		$out = '"layers":[';
		$this->logger->debug('number of layers : ' . count($layers));
		foreach ($layers as $layer) {

			$out .= "{";

			// OpenLayer object (tiled or not)
			if ($layer->isUntiled) {
				$out .= '"singleTile":true';
			} else {
				$out .= '"singleTile":false';
			}

			// Should we display a legend for this layer ?
			if ($layer->hasLegend) {
				$out .= ', "hasLegend":true';
			} else {
				$out .= ', "hasLegend":false';
			}

			// Logical layer name
			$out .= ', "name":"' . $layer->layerName . '"';

			// View Service name
			$out .= ', "viewServiceName":"' . $layer->viewServiceName . '"';

			// Feature Service name
			$out .= ', "featureServiceName":"' . $layer->featureServiceName . '"';

			// Legend Service Name
			$out .= ', "legendServiceName":"' . $layer->legendServiceName . '"';

			$out .= ', "params":{';

			// Server Layer name (or list of names)
			$layerNames = $layer->serviceLayerName;
			$out .= '"layers" : ["' . $layerNames . '"]';

			// Transparency
			if ($layer->isTransparent) {
				$out .= ', "transparent": true';
			} else {
				$out .= ', "transparent": false';
			}

			// Hidden
			if ($layer->treeItem->isHidden) {
				$out .= ', "isHidden": true';
			} else {
				$out .= ', "isHidden": false';
			}

			// Disabled
			if ($layer->treeItem->isDisabled) {
				$out .= ', "isDisabled": true';
			} else {
				$out .= ', "isDisabled": false';
			}

			// Checked
			if ($layer->treeItem->isChecked) {
				$out .= ', "isChecked": true';
			} else {
				$out .= ', "isChecked": false';
			}

			$out .= ', "activateType": "' . $layer->activateType . '"';

			// Add the sessionid
			$out .= ', "session_id": "' . $sessionId . '"';

			// Add the country code
			$out .= ', "provider_id": "' . $providerId . '"';

			$out .= '}';

			// Options
			$out .= ', "options":{"buffer": 0';

			// Node Group
			if (!empty($layer->treeItem->parentId)) {
				$out .= ', "nodeGroup": "' . $layer->treeItem->parentId . '"';
			}

			// Layer visibility by default
			if ($layer->treeItem->isChecked) {
				$out .= ', "visibility": true';
			} else {
				$out .= ', "visibility": false';
			}

			// Is a Base Layer ?
			if ($layer->isBaseLayer) {
				$out .= ', "isBaseLayer": true';
			} else {
				$out .= ', "isBaseLayer": false';
			}

			// Default Opacity
			if ($layer->defaultOpacity >= 0 && $layer->defaultOpacity <= 100 && $layer->defaultOpacity != NULL) {
				$defaultOpacity = $layer->defaultOpacity / 100;
				$out .= ', "opacity": "' . $defaultOpacity . '"';
			} else {
				$out .= ', "opacity": 1';
			}

			// Label
			$out .= ',"label":"' . addslashes($layer->layerLabel) . '"';

			// Scale min/max management
			if ($layer->maxscale != "" || $layer->minscale != "") {
				$out .= ', "resolutions": [';

				$restable = "";
				foreach ($scales as $scale) {
					if (($layer->minscale == "" || $scale >= $layer->minscale) && ($layer->maxscale == "" || $scale <= $layer->maxscale)) {
						$restable .= $resolutions[$scale] . ", ";
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

		echo $out . ']}';

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Return the model corresponding to the legend.
	 */
	public function ajaxgettreelayersAction() {
		$this->logger->debug('ajaxgettreelayersAction');

		// Get back the country code
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->provider->id;
		$this->logger->debug('providerId : ' . $providerId);

		$item = $this->_getLegendItems(-1, $providerId);

		echo "[" . $item . "]";

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Return the part of the legend model corresponding to the selected node.
	 *
	 * @param String $parentId
	 *        	The identifier of the parent node
	 * @param String $providerId
	 *        	The identifier of the provider
	 * @return String
	 */
	private function _getLegendItems($parentId, $providerId) {
		$this->logger->debug('_getLegendItems : ' . $parentId . " " . $providerId);

		// Get the list of items corresponding to the asked level
		$legendItems = $this->layersModel->getLegendItems($parentId, $providerId);

		// Get the list of active layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$activatedLayers = $mappingSession->activatedLayers;
		if ($activatedLayers == null) {
			$activatedLayers = array();
		}

		$json = "";

		// Iterate over each legend item
		foreach ($legendItems as $legendItem) {

			$json .= '{';
			$json .= '"text": "' . $legendItem->label . '", ';

			$json .= '"expanded": ';
			if ($legendItem->isExpended) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			$json .= '"checked": ';
			if ($legendItem->isChecked) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			$json .= '"hidden": ';
			if ($legendItem->isHidden && !in_array($legendItem->layerName, $activatedLayers)) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			$json .= '"disabled": ';
			if ($legendItem->isDisabled) {
				$json .= 'true, ';
			} else {
				$json .= 'false, ';
			}

			// The item is a leaf
			if ($legendItem->isLayer) {
				$json .= '"leaf": true, ';
				$json .= '"nodeType" : "gx_layer", '; // TODO : Do this on the js side
				$json .= '"layer": "' . $legendItem->layerName . '" ';
			} else {
				// The item is a node
				$json .= '"leaf": false, ';
				$json .= '"nodeType" : "gx_layercontainer", '; // TODO : Do this on the js side
				$json .= '"nodeGroup": "' . $legendItem->itemId . '" ';
			}
			$json .= '}, ';
		}

		$json = substr($json, 0, -2);

		return $json;
	}
}
