<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use OGAMBundle\Entity\Mapping\Layer;
use Symfony\Component\HttpFoundation\JsonResponse;
use OGAMBundle\Entity\Mapping\LayerService;
use OGAMBundle\Entity\Mapping\LayerTreeNode;
use OGAMBundle\Entity\Mapping\ZoomLevel;
use OGAMBundle\Repository\Mapping\ZoomLevelRepository;
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

		// Get the map resolution
		$resolutions = $this->get('doctrine')->getRepository(ZoomLevel::class)->getResolutions();
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
     * Return the list of available layer services as a JSON.
     * 
     * @Route("/ajaxgetlayerservices")
     */
    public function ajaxgetlayerservicesAction()
    {
        $logger = $this->get('logger');
        $logger->debug('ajaxgetlayerservicesAction');

        // Send the result as a JSON String
        return new JsonResponse([
            'success' => true,
            'data' => $this->get('doctrine')->getRepository(LayerService::class)->findAll()
        ]);
    }

    /**
     * Return the list of available layers as a JSON.
     * 
     * @Route("/ajaxgetlayers")
     */
    public function ajaxgetlayersAction(Request $request)
    {
        $logger = $this->get('logger');
        $logger->debug('ajaxgetlayersAction');

        // Send the result as a JSON String
        return new JsonResponse([
            'success' => true,
            'data' => $this->get('doctrine')->getRepository(Layer::class)->findAll()
        ]);
    }

    /**
     * Return the list of available layer tree nodes as a JSON.
     * 
     * @Route("/ajaxgetlayertreenodes")
     */
    public function ajaxgetlayertreenodesAction(Request $request)
    {
        $logger = $this->get('logger');
        $logger->debug('ajaxgetlayertreenodes');

        // Get the resolutions corresponding to the scales
        $layerTreeNodes = $this->get('doctrine')->getRepository(LayerTreeNode::class)->findAll();
        foreach ($layerTreeNodes as $layerTreeNode) {
            //$layerTreeNode->getLayer()->
        }
        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        return $this->render ( 'OGAMBundle:Map:ajaxgetlayertreenodes.json.twig', array (
            'layerTreeNodes' => $this->get('doctrine')->getRepository(LayerTreeNode::class)->findAll()
        ),$response);
    }

}
