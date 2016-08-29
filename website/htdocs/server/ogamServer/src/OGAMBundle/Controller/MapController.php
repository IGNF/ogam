<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
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
		$view->bbox_x_min = $configuration->getConfig('bbox_x_min'); // x min of Bounding box
		$view->bbox_y_min = $configuration->getConfig('bbox_y_min'); // y min of Bounding box
		$view->bbox_x_max = $configuration->getConfig('bbox_x_max'); // x max of Bounding box
		$view->bbox_y_max = $configuration->getConfig('bbox_y_max'); // y max of Bounding box
		$view->tilesize = $configuration->getConfig('tilesize', 256); // Tile size
		$view->projection = "EPSG:" . $configuration->getConfig('srs_visualisation'); // Projection

		// Get the available scales
		$scales = $this->scalesModel->getScales();

		// Transform the available scales into resolutions
		$resolutions = $this->getResolutions($scales);
		$resolString = implode(",", $resolutions);
		$view->resolutions = $resolString;
		$view->numZoomLevels = count($resolutions);

		$userPerProviderCenter = ($configuration->getConfig('usePerProviderCenter', true) === '1');

		if ($userPerProviderCenter) {
			// Center the map on the provider location
			$center = $this->boundingBoxModel->getCenter($providerId);
			$view->zoomLevel = $center->zoomLevel;
			$view->centerX = $center->x;
			$view->centerY = $center->y;
		} else {
			// Use default settings
			$view->zoomLevel = $configuration->getConfig('zoom_level', '1');
			$view->centerX = ($this->view->bbox_x_min + $this->view->bbox_x_max) / 2;
			$view->centerY = ($this->view->bbox_y_min + $this->view->bbox_y_max) / 2;
		}

		// Feature parameters
		$view->featureinfo_margin = $configuration->getConfig('featureinfo_margin', '1000');
		$view->featureinfo_typename = $configuration->getConfig('featureinfo_typename', "result_locations");
		$view->featureinfo_maxfeatures = $configuration->getConfig('featureinfo_maxfeatures', 20);

        return $this->render('OGAMBundle:Map:get_map_parameters.js.twig', $view)->headers->set('Content-type', 'application/javascript');
    }

    /**
     * Return the list of vector layers as a JSON.
     * @Route("/ajaxgetvectorlayers")
     */
    public function ajaxgetvectorlayersAction(Request $request)
    {
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
