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
 * @package controllers
 */
class MapController extends AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Initialise the models
		$this->servicesModel = new Application_Model_Mapping_Services();
		$this->layersModel = new Application_Model_Mapping_Layers();
		$this->boundingBoxModel = new Application_Model_Mapping_BoundingBox();

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
		$permissions = $userSession->permissions;
		if (empty($permissions) || !(array_key_exists('DATA_QUERY', $permissions) || array_key_exists('DATA_QUERY_HARMONIZED', $permissions))) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_QUERY');
		}
	}

	/**
	 * Get the parameters used to initialise a map.
	 */
	public function getMapParametersAction() {
		$this->logger->debug('getMapParametersAction');
		// Get back the provider id for the current user
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->providerId;

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");

		$this->view->bbox_x_min = $configuration->bbox_x_min; // x min of Bounding box
		$this->view->bbox_y_min = $configuration->bbox_y_min; // y min of Bounding box
		$this->view->bbox_x_max = $configuration->bbox_x_max; // x max of Bounding box
		$this->view->bbox_y_max = $configuration->bbox_y_max; // y max of Bounding box
		$this->view->tilesize = $configuration->tilesize; // Tile size
		$this->view->projection = "EPSG:".$configuration->srs_visualisation; // Projection
		
		// Get the available scales
		$scales = $this->layersModel->getScales();
		
		// Transform the available scales into resolutions
		$resolutions = $this->_getResolutions($scales);
		$resolString = implode(",", $resolutions);
		$this->view->resolutions = $resolString;
		$this->view->numZoomLevels = count($resolutions);

		$this->logger->debug('$configuration->usePerProviderCenter : '.$configuration->usePerProviderCenter);

		if ($configuration->usePerProviderCenter == 1) {
			// Center the map on the provider location
			$center = $this->boundingBoxModel->getCenter($providerId);
			$this->view->defaultzoom = $center->defaultzoom;
			$this->view->x_center = $center->x_center;
			$this->view->y_center = $center->y_center;
		} else {
			// Use default settings
			$this->view->defaultzoom = $configuration->zoom_level;
			$this->view->x_center = ($configuration->bbox_x_min + $configuration->bbox_x_max) / 2;
			$this->view->y_center = ($configuration->bbox_y_min + $configuration->bbox_y_max) / 2;
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
		$this->render('map-parameters');
	}

	/**
	 * Calculate the resolution array corresponding to the available scales.
	 *
	 * @param Array[Integer] $scales The list of scales
	 */
	private function _getResolutions($scales) {

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");
		$dpi = $configuration->mapserver_dpi; // Default number of dots per inch in mapserv
		$factor = $configuration->mapserver_inch_per_kilometer; // Inch to meter conversion factor

		// WARNING : Bounding box must match the tilecache configuration and tile size

		$resolutions = array();
		foreach ($scales as $scale) {
			// resolution = scaleDenominator * (1/dpi)inch * (1/inch_per_kilometer)km/inch * 1000 m/km
			$resolutions[$scale] = $scale / ($dpi * $factor) * 1000;
			// REMARQUE: L'OGC préconise une taille de pixel standard de 0.28mm. Ici elle dépend de la config.
		}
		return $resolutions;
	}

	/**
	 * Return the list of vector layers as a JSON.
	 */
	public function ajaxgetvectorlayersAction() {

		$this->logger->debug('getvectorlayersAction');

		// Get the available layers
		$layerNames = $this->layersModel->getVectorLayersList();

		$json  = '{"success":true';
		$json .= ', layerNames : [';
		$json .= '{"code":null, "label":"' . $this->translator->translate('empty_layer') .'","url":null},';
		foreach ($layerNames as $layerName => $tab) {
		    $layer = $this->layersModel->getLayer($layerName);
		    $viewServiceName = $layer->viewServiceName;
		    $viewService = $this->servicesModel->getService($viewServiceName);
		    $serviceConfig = $viewService->serviceConfig;
		    $url_wms = json_decode($serviceConfig)->{'urls'}[0];
		    
			$json .= '{"code":'.json_encode($layerName).',';
			$json .= '"label":'. json_encode($tab[0]).',';
			$json .= '"url":'. json_encode(json_decode($tab[1])->{'urls'}[0]).',';
			$json .= '"url_wms":'. json_encode($url_wms).'},';
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
		$providerId = $userSession->user->providerId;

		// Get the available services base urls and parameters
		$services = $this->servicesModel->getServices();
		// Get the available layers
		$layers = $this->layersModel->getLayersList($providerId);
		
		// Get the available scales
		$scales = $this->layersModel->getScales();
		// Transform the available scales into resolutions
		$resolutions = $this->_getResolutions($scales);

				
		// Build the base URL for tiles
		$sessionId = session_id();
		
		$out = '{"services":[';
		foreach ($services as $service) {
			$out .= '{"name":"'.$service->serviceName.'"';
			$out .= ', "config":'.$service->serviceConfig.'},';
		}

		// Remove the last comma
		if (!empty($services)) {
			$out = substr($out, 0, -1);
		}
		echo $out.'],';
	
		// For each available layer, build the corresponding URL and definition
		$out = '"layers":[';
		$this->logger->debug('number of layers : '.count($layers));
		foreach ($layers as $layer) {
		
			$out .= "{";

			// OpenLayer object (tiled or not)
			if ($layer->isUntiled) {
				$out .= '"singleTile":true';
			} else {
				$out .= '"singleTile":false';
			}

			// Logical layer name
			$out .= ', "name":"'.$layer->layerName.'"';

			// Service name
			$out .= ', "serviceName":"'.$layer->serviceName.'"';
			
			// View Service name
			$out .= ', "viewServiceName":"'.$layer->viewServiceName.'"';
			
			// Feature Service name
			$out .= ', "featureServiceName":"'.$layer->featureServiceName.'"';
			
			// Legend Service Name
			$out .= ', "legendServiceName":"'.$layer->legendServiceName.'"';
			
			// Feature Info Service Name
			$out .= ', "featureInfoServiceName":"'.$layer->featureInfoServiceName.'"';
			
			$out .= ', "params":{';
				
			// Server Layer name (or list of names)
			$layerNames = $layer->serviceLayerName;
			$out .= '"layers" : ["'.$layerNames.'"]';

			// Transparency
			if ($layer->isTransparent) {
				$out .= ', "transparent": true';
			} else {
				$out .= ', "transparent": false';
			}
				
			//  Image Format
			$out .= ', "format": "image/'.$layer->imageFormat.'"';

			// Hidden ?
			if ($layer->isHidden) {
				$out .= ', "isHidden": true';
			} else {
				$out .= ', "isHidden": false';
			}

			// Disabled ?
			if ($layer->isDisabled) {
				$out .= ', "isDisabled": true';
			} else {
				$out .= ', "isDisabled": false';
			}

			// Checked ?
			if ($layer->isChecked) {
				$out .= ', "isChecked": true';
			} else {
				$out .= ', "isChecked": false';
			}

			$out .= ', "activateType": "'.$layer->activateType.'"';

			// We will test this flag to know if we need to generate a SLD
			if ($layer->hasSLD) {
				$out .= ', "hasSLD": true';
			} else {
				$out .= ', "hasSLD": false';
			}

			// Add the sessionid
			$out .= ', "session_id": "'.$sessionId.'"';

			// Add the country code
			$out .= ', "provider_id": "'.$providerId.'"';

			$out .= '}';

			// Options
			$out .= ', "options":{"buffer": 0';

			// Node Group
			if (!empty($layer->parentId)) {
				$out .= ', "nodeGroup": "'.$layer->parentId.'"';
			}

			// Checked Group
			if (!empty($layer->checkedGroup)) {
				$out .= ', "checkedGroup": "'.$layer->checkedGroup.'"';
			}

			// Transition effect
			if (!empty($layer->transitionEffect)) {
				$out .= ', "transitionEffect": "'.$layer->transitionEffect.'"';
			}

			// Layer visibility by default
			if ($layer->isDefault) {
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
			if ($layer->defaultOpacity >= 0 && $layer->defaultOpacity <= 100 && $layer->defaultOpacity <> NULL) {
			    $defaultOpacity = $layer->defaultOpacity / 100;
			    $out .= ', "opacity": "'.$defaultOpacity.'"';
			} else {
			    $out .= ', "opacity": 1';
			}

			// Label
			$out .= ',"label":"'.addslashes($layer->layerLabel).'"';

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
		$this->getResponse()->setHeader('Content-type', 'application/json');
		
	}

	/**
	 * Return the model corresponding to the legend.
	 */
	public function ajaxgettreelayersAction() {

		$this->logger->debug('ajaxgettreelayersAction');

		// Get back the country code
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->providerId;
		$this->logger->debug('providerId : '.$providerId);

		$item = $this->_getLegendItems(-1, $providerId);

		echo "[".$item."]";

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');

	}

	/**
	 * Return the part of the legend model corresponding to the selected node.
	 *
	 * @param String $parentId The identifier of the parent node
	 * @param String $providerId The identifier of the provider
	 * @return String
	 */
	private function _getLegendItems($parentId, $providerId) {

		$this->logger->debug('_getLegendItems : '.$parentId." ".$providerId);

		// Get the list of items corresponding to the asked level
		$legendItems = $this->layersModel->getLegend($parentId, $providerId);

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
			$json .= '"text": "'.$legendItem->label.'", ';

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
				$json .= '"layer": "'.$legendItem->layerName.'" ';
			} else {
				// The item is a node
				$json .= '"leaf": false, ';
				$json .= '"nodeType" : "gx_layercontainer", '; // TODO : Do this on the js side
				$json .= '"nodeGroup": "'.$legendItem->itemId.'" ';

			}
			$json .= '}, ';
		}

		$json = substr($json, 0, -2);

		return $json;
	}

	
	/**
	 * Show a PDF containing the map selected by the user.
	 */
	function printmapAction() {

		$this->logger->debug('generatemapAction');

		// Get the map parameters
		$center = $this->_getParam('center');
		$zoom = $this->_getParam('zoom');
		$layers = $this->_getParam('layers');
		$centerX = substr($center, stripos($center, "lon=") + 4, stripos($center, ",") - (stripos($center, "lon=") + 4));
		$centerY = substr($center, stripos($center, "lat=") + 4);
		
		//Get the base urls for the services
		$printservices = $this->servicesModel->getPrintServices();

			$this->logger->debug($printservices);
		
		// Get the server name for the layers
		$layerNames = explode(",", $layers);
		
		
		$serviceLayerNames = "";
		$imageFormats = "";
		$baseUrls = "";
		$service = "";
		
		foreach ($layerNames as $layerName) {
		    
		    //Get parameters of the layers
			$layer = $this->layersModel->getLayer($layerName);
			$serviceLayerNames .= $layer->serviceLayerName.",";
			$imageFormats .= $layer->imageFormat.",";
			
			//Get the base Url for service print
			$printServiceName = $layer->printServiceName;
			foreach ($printservices as $printservice) {
			    if ($printservice->serviceName === $printServiceName) {
			        $baseUrls .= json_decode($printservice->serviceConfig)->{'urls'}[0].",";
			        $json = json_decode($printservice->serviceConfig,true);
			        foreach ($json as $key => $val) {
			             if ($key === 'params'){
			                    $service .= $val['SERVICE'].",";
			             }
			        }    
			    }
			}
		}
		
		$baseUrls = substr($baseUrls, 0, -1); // remove last comma		
		$serviceLayerNames = substr($serviceLayerNames, 0, -1);
		$service = substr($service, 0, -1);
		
		// Get the configuration values
		$configuration = Zend_Registry::get("configuration");
		$mapReportServiceURL = $configuration->mapReportGenerationService_url;		
		$dpi = $configuration->mapserver_dpi; // Default number of dots per inch in mapserv

		    
		// Get the scales
		$scales = $this->layersModel->getScales();
		    
		// Get the current scale
		$scalesArray = array_values($scales);
		$currentScale = $scales[$zoom];
		$this->logger->debug('generatemapAction2');
		//Construction of the json specification, parameter of mapfish-print servlet
		$spec = "{
    
		    layout: 'A4 portrait',
		    title: 'A simple example',
		    srs: 'EPSG:".$configuration->srs_visualisation."',
		    units: 'm',
		    layers: [";
		
		    // Conversion of string lists of layers parameters into array
		    $layersArray = explode(",", $layers);
		    $baseUrlsArray = explode(",", $baseUrls);
		    $serviceLayerNamesArray = explode(",", $serviceLayerNames);
		    $imageFormatsArray = explode(",", $imageFormats);
		    $serviceArray = explode(",", $service);
		    
		    $i=0;
		    
		    // TODO : A vérifier, résolutions en dur pour le WMTS à supprimer ?
		    foreach ($layersArray as $layer) {
		        if (strcasecmp($serviceArray[$i] , 'wms') == 0) {
		        $spec .= "{
		        type: 'WMS',
		        format: 'image/$imageFormatsArray[$i]',
		        version: '1.3.0',
		        layers: ['$serviceLayerNamesArray[$i]'],
		        baseURL: '$baseUrlsArray[$i]',
		        customParams: {TRANSPARENT:true,SESSION_ID:".session_id()."}
		        },";
		        } elseif (strcasecmp($serviceArray[$i] , 'wmts') == 0) {
		        $spec .="{
		        type: 'WMTS',
		        version:1.0.0,
		        requestEncoding:'KVP',
		        matrixSet:'PM',
		        style:'normal',
		        format: 'image/$imageFormatsArray[$i]',
		        layer: '$serviceLayerNamesArray[$i]',
		        baseURL: '$baseUrlsArray[$i]',
		        matrixIds:[
		            {'identifier':'0','topLeftCorner':[-20037508,20037508],  'resolution':156543.033928,'matrixSize':[1,1],'tileSize':[256,256]},
		            {'identifier':'1','topLeftCorner':[-20037508,20037508],  'resolution':78271.516964,'matrixSize':[2,2],'tileSize':[256,256]},
		            {'identifier':'2','topLeftCorner':[-20037508,20037508],  'resolution':39135.758482,'matrixSize':[4,4],'tileSize':[256,256]},
		            {'identifier':'3','topLeftCorner':[-20037508,20037508],  'resolution':19567.879241,'matrixSize':[8,8],'tileSize':[256,256]},
		            {'identifier':'4','topLeftCorner':[-20037508,20037508],  'resolution':9783.9396212,'matrixSize':[16,16],'tileSize':[256,256]},
		            {'identifier':'5','topLeftCorner':[-20037508,20037508],  'resolution':4891.9698101,'matrixSize':[32,32],'tileSize':[256,256]},
		            {'identifier':'6','topLeftCorner':[-20037508,20037508],  'resolution':2445.984905,'matrixSize':[64,64],'tileSize':[256,256]},
		            {'identifier':'7','topLeftCorner':[-20037508,20037508],  'resolution':1222.992453,'matrixSize':[128,128],'tileSize':[256,256]},
		            {'identifier':'8','topLeftCorner':[-20037508,20037508],  'resolution':611.496226,'matrixSize':[256,256],'tileSize':[256,256]},
		            {'identifier':'9','topLeftCorner':[-20037508,20037508],  'resolution':305.748113,'matrixSize':[512,512],'tileSize':[256,256]},
		            {'identifier':'10','topLeftCorner':[-20037508,20037508], 'resolution':152.874057,'matrixSize':[1024,1024],'tileSize':[256,256]},
		            {'identifier':'11','topLeftCorner':[-20037508,20037508], 'resolution':76.4370289,'matrixSize':[2048,2048],'tileSize':[256,256]},
		            {'identifier':'12','topLeftCorner':[-20037508,20037508], 'resolution':38.2185145,'matrixSize':[4096,4096],'tileSize':[256,256]},
		            {'identifier':'13','topLeftCorner':[-20037508,20037508], 'resolution':19.109257,'matrixSize':[8192,8192],'tileSize':[256,256]},
		            {'identifier':'14','topLeftCorner':[-20037508,20037508], 'resolution':9.554629 ,'matrixSize':[16384,16384],'tileSize':[256,256]},
		            {'identifier':'15','topLeftCorner':[-20037508,20037508], 'resolution':4.777302 ,'matrixSize':[32768,32768],'tileSize':[256,256]},
		            {'identifier':'16','topLeftCorner':[-20037508,20037508], 'resolution':2.388657,'matrixSize':[65536,65536],'tileSize':[256,256]},
		            {'identifier':'17','topLeftCorner':[-20037508,20037508], 'resolution':1.194329 ,'matrixSize':[131072,131072],'tileSize':[256,256]},
		            {'identifier':'18','topLeftCorner':[-20037508,20037508], 'resolution':0.597164 ,'matrixSize':[262144,262144],'tileSize':[256,256]},
		            {'identifier':'19','topLeftCorner':[-20037508,20037508], 'resolution':0.298582 ,'matrixSize':[524288,524288],'tileSize':[256,256]},
		            {'identifier':'20','topLeftCorner':[-20037508,20037508], 'resolution':0.149291 ,'matrixSize':[1048576,1048576],'tileSize':[256,256]},
		            {'identifier':'21','topLeftCorner':[-20037508,20037508], 'resolution':0.074646  ,'matrixSize':[2097152,2097152],'tileSize':[256,256]}
		        ],
		        customParams: {TRANSPARENT:true,SESSION_ID:".session_id()."}
		    },";
		    }
		        $i++;
		    }
		    $spec.= " ],
		    pages: [
		        {
		        
		            center: [$centerX,$centerY],
		            scale: $currentScale,
		            dpi: $dpi,
		            mapTitle: '',
		            comment:'',
		            data: [
		                {id:1, name: 'carte1'}
		            ]
                }
            ]
	    }";
   
       $this->logger->debug('json : '.$spec);
		    
		    
		// Calculate the report URL
		$mapReportUrl = $mapReportServiceURL."/print.pdf?spec=".urlencode($spec);
		$this->logger->debug('generatemap URL : '.$mapReportUrl);
		
		// Set the timeout and user agent
		ini_set('user_agent', $_SERVER['HTTP_USER_AGENT']);
		ini_set("max_execution_time", $configuration->max_execution_time);
		$maxReportGenerationTime = $configuration->max_report_generation_time;
		$defaultTimeout = ini_get('default_socket_timeout');
		if ($maxReportGenerationTime != null) {			
			ini_set('default_socket_timeout', $maxReportGenerationTime);
		}

		// Set the header for a PDF output
		header("Cache-control: private\n");
		header("Content-Type: application/pdf\n");
		header("Content-transfer-encoding: binary\n");
		header("Content-disposition: attachment; filename=Map_".date('dmy_Hi').".pdf");

		// Launch the PDF generation
		$handle = fopen($mapReportUrl, "rb");
		if ($handle) {
			while (!feof($handle)) {
				echo fread($handle, 8192);
			}
			fclose($handle);
			
			// No View, we send directly the output
			$this->_helper->layout()->disableLayout();
			$this->_helper->viewRenderer->setNoRender();
		} else {
			$this->logger->debug("Error reading data");
			echo "Error reading data";
		}

		// Restore default timeout
		ini_set('default_socket_timeout', $defaultTimeout);
		
		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

}
