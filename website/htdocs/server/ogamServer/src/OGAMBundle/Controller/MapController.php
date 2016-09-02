<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
/**
 * 
 * @Route("/map")
 *
 */
class MapController extends Controller
{
    /**
	 * Get the parameters used to initialise a map.
	 * @Route("/get-map-parameters")
     */
    public function getMapParametersAction()
    {
    	//TODO :getMapParametersAction
		$providerId = $this->getUser()->getProvider()->getId();

		// Get the parameters from configuration file
		$configuration = $this->get("ogam.configuration_manager");
		$view = new \ArrayObject();
		$view->setFlags(\ArrayObject::ARRAY_AS_PROPS);
		$view->bbox_x_min = $configuration->getConfig('bbox_x_min'); // x min of Bounding box
		$view->bbox_y_min = $configuration->getConfig('bbox_y_min'); // y min of Bounding box
		$view->bbox_x_max = $configuration->getConfig('bbox_x_max'); // x max of Bounding box
		$view->bbox_y_max = $configuration->getConfig('bbox_y_max'); // y max of Bounding box
		$view->tilesize = $configuration->getConfig('tilesize', 256); // Tile size
		$view->projection = "EPSG:" . $configuration->getConfig('srs_visualisation'); // Projection

		// Get the available scales
		$scales = $this->get('ogam.repository.mapping.scale')->getScales();

		// Transform the available scales into resolutions
		$resolutions = $this->getResolutions($scales);
		$resolString = implode(",", $resolutions);
		$view->resolutions = $resolString;
		$view->numZoomLevels = count($resolutions);

		$userPerProviderCenter = ($configuration->getConfig('usePerProviderCenter', true) === '1');

		if ($userPerProviderCenter) {
			// Center the map on the provider location
			$center = $this->getDoctrine()->getManagerForClass('OGAMBundle\Entity\Mapping\BoundingBox')->find('OGAMBundle\Entity\Mapping\BoundingBox', $providerId)->getCenter();
			$view->zoomLevel = $center->zoomLevel;
			$view->centerX = $center->x;
			$view->centerY = $center->y;
		} else {
			// Use default settings
			$view->zoomLevel = $configuration->getConfig('zoom_level', '1');
			$view->centerX = ($view->bbox_x_min + $view->bbox_x_max) / 2;
			$view->centerY = ($view->bbox_y_min + $view->bbox_y_max) / 2;
		}

		// Feature parameters
		$view->featureinfo_margin = $configuration->getConfig('featureinfo_margin', '1000');
		$view->featureinfo_typename = $configuration->getConfig('featureinfo_typename', "result_locations");
		$view->featureinfo_maxfeatures = $configuration->getConfig('featureinfo_maxfeatures', 20);

        return $this->render('OGAMBundle:Map:get_map_parameters.js.twig', $view->getArrayCopy(), (new Response())->headers->set('Content-type', 'application/javascript'));
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
    	$configuration = $this->get("ogam.configuration_manager");
    	$tilesize = $configuration->getConfig('tilesize', 256); // Tile size in pixels
    	$dpi = $configuration->getConfig('mapserver_dpi', 72); // Default number of dots per inch in mapserv
    	$factor = $configuration->getConfig('mapserver_inch_per_kilometer', 39370.1); // Inch to meter conversion factor
    
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
     * @Route("/ajaxgetvectorlayers")
     */
    public function ajaxgetvectorlayersAction(Request $request)
    {
    	$vectorlayers = $this->layersModel->getVectorLayersList();
    	// Get the available scales
    	$scales = $this->get('ogam.repository.mapping.scale')->getScales();
    	// Transform the available scales into resolutions
    	$resolutions = $this->getResolutions($scales);
    	
        return $this->render('OGAMBundle:Map:ajaxgetvectorlayers.json.twig', array(
            // ...
        ));
    }

    /**
     * Return the list of available layers as a JSON.
     * @Route("/ajaxgetlayers")
     */
    public function ajaxgetlayersAction(Request $request)
    {
        return $this->render('OGAMBundle:Map:ajaxgetlayers.json.twig', array(
            // ...
        ));
    }

    /**
     * Return the model corresponding to the legend.
     * @Route("/ajaxgettreelayers")
     */
    public function ajaxgettreelayersAction(Request $request)
    {
        return $this->render('OGAMBundle:Map:ajaxgettreelayers.json.twig', array(
            // ...
        ));
    }

}
