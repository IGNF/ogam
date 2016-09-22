<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @Route("/query")
 */
class QueryController extends Controller {
	/**
	 * @Route("/", name = "query_home")
	 */
	public function indexAction() {
		return $this->redirectToRoute ( 'query_show-query-form' );
	}
	
	/**
	 * Show the main query page.
	 *
	 * @Route("/show-query-form", name = "query_show-query-form")
	 */
	public function showQueryFormAction(Request $request) {
		$logger = $this->get ( 'logger' );
		$logger->debug ( 'showQueryFormAction' );
		
		// Clean previous results
		$this->getDoctrine ()->getRepository ( 'OGAMBundle\Entity\Mapping\ResultLocation', 'mapping' )->cleanPreviousResults ( session_id () );
		
		// Check if the parameter of the default page is set
		if ($request->query->get ( 'default' ) === "predefined") {
			$logger->debug ( 'defaultTab predefined' );
			// $this->view->defaultTab = 'predefined'; //TODO: Regarder avec flo le fonctionnement avec zend...
		}
		
		// Forward the user to the next step
		return $this->redirect ( '/odp/index.html?locale=' . $request->getLocale () );
	}
	
	/**
	 * @Route("/ajaxgetdatasets")
	 */
	public function ajaxgetdatasetsAction(Request $request) {
		$this->get ( 'logger' )->debug ( 'ajaxgetdatasetsAction' );
		return new JsonResponse($this->get('ogam.manager.query')->getDatasets());
	}
	
	/**
	 * @Route("/ajaxgetqueryform")
	 */
	public function ajaxgetqueryformAction(Request $request) {
		$logger = $this->get ( 'logger' );
		$logger->debug ( 'ajaxgetqueryformAction' );
		
		$filters = json_decode($request->query->get('filter'));
		
		$datasetId = null;
		$requestName = null;
		
		if (is_array($filters)) {
			foreach ($filters as $aFilter) {
				switch ($aFilter->property) {
					case 'processId':
						$datasetId = $aFilter->value;
						break;
					case 'requestName':
						$requestName = $aFilter->value;
						break;
					default:
						$logger->debug('filter unattended : ' . $aFilter->property);
				}
			}
		} else {
			$datasetId = json_decode($request->query->get('datasetId'));
			$requestName = $request->request->get('requestName');
		}

		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		return $this->render ( 'OGAMBundle:Query:ajaxgetqueryform.json.twig', array (
		    'forms' => $this->get('ogam.manager.query')->getQueryForms($datasetId, $requestName)
		),$response);
	}
	
	/**
	 * @Route("/ajaxgetpredefinedrequestlist")
	 */
	public function ajaxgetpredefinedrequestlistAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetpredefinedrequestlist.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetpredefinedrequestcriteria")
	 */
	public function ajaxgetpredefinedrequestcriteriaAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetpredefinedrequestcriteria.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxsavepredefinedrequest")
	 */
	public function ajaxsavepredefinedrequestAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxsavepredefinedrequest.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetqueryformfields")
	 */
	public function ajaxgetqueryformfieldsAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetqueryformfields.html.twig', array ()
		// ...
		 );
	}

	/**
	 * @Route("/ajaxbuildrequest")
	 */
	public function ajaxbuildrequestAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxbuildrequest.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetresultsbbox")
	 */
	public function ajaxgetresultsbboxAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetresultsbbox.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetresultcolumns")
	 */
	public function ajaxgetresultcolumnsAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetresultcolumns.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetresultrows")
	 */
	public function ajaxgetresultrowsAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetresultrows.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/getgridparameters")
	 */
	public function getgridparametersAction() {
		return $this->render ( 'OGAMBundle:Query:getgridparameters.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetdetails")
	 */
	public function ajaxgetdetailsAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetdetails.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetchildren")
	 */
	public function ajaxgetchildrenAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetchildren.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/csv-export")
	 */
	public function csvExportAction() {
		return $this->render ( 'OGAMBundle:Query:csv_export.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/kml-export")
	 */
	public function kmlExportAction() {
		return $this->render ( 'OGAMBundle:Query:kml_export.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/json-export")
	 */
	public function geojsonExportAction() {
		return $this->render ( 'OGAMBundle:Query:geojson_export.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgettreenodes")
	 */
	public function ajaxgettreenodesAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgettreenodes.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgettaxrefnodes")
	 */
	public function ajaxgettaxrefnodesAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgettaxrefnodes.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetdynamiccodes")
	 */
	public function ajaxgetdynamiccodesAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetdynamiccodes.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetcodes")
	 */
	public function ajaxgetcodesAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetcodes.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgettreecodes")
	 */
	public function ajaxgettreecodesAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgettreecodes.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgettaxrefcodes")
	 */
	public function ajaxgettaxrefcodesAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgettaxrefcodes.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxgetlocationinfo")
	 */
	public function ajaxgetlocationinfoAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxgetlocationinfo.html.twig', array ()
		// ...
		 );
	}
	
	/**
	 * @Route("/ajaxresetresultlocation")
	 */
	public function ajaxresetresultlocationAction() {
		return $this->render ( 'OGAMBundle:Query:ajaxresetresultlocation.html.twig', array ()
		// ...
		 );
	}
}
