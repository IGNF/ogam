<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use OGAMBundle\Entity\Generic;
use OGAMBundle\Entity\Mapping\ResultLocation;
use OGAMBundle\Entity\Generic\QueryForm;

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
	 * AJAX function : Builds the query.
	 * 
	 * @Route("/ajaxbuildrequest")
	 */
	public function ajaxbuildrequestAction(Request $request) {
	    $logger = $this->get ( 'logger' );
		$logger->debug ( 'ajaxbuildrequestAction' );
		
        // Check the validity of the POST
        if (!$request->isMethod('POST')) {
            $logger->debug('form is not a POST');
            return $this->redirectToRoute ( 'homepage' );
        }
    
        $datasetId = $request->request->getAlnum('datasetId');
    
        try {
    
            // Parse the input parameters and create a request object
            $queryForm = new QueryForm();
            $queryForm->setDatasetId($datasetId);
            foreach ($_POST as $inputName => $inputValue) {
                if (strpos($inputName, "criteria__") === 0 && !$this->isEmptyCriteria($inputValue)) {
                    $logger->debug('POST var added');
                    $criteriaName = substr($inputName, strlen("criteria__"));
                    $split = explode("__", $criteriaName);
                    $queryForm->addCriteria($split[0], $split[1], $inputValue);
                }
                if (strpos($inputName, "column__") === 0) {
                    $columnName = substr($inputName, strlen("column__"));
                    $split = explode("__", $columnName);
                    $queryForm->addColumn($split[0], $split[1]);
                }
            }
    
            if ($queryForm->isValid()) {
                // Store the request parameters in session
                $request->getSession()->set('queryForm', $queryForm);
    
                // Activate the result layer
                // TODO: Check if still mandatory
                //$this->mappingSession->activatedLayers[] = 'result_locations';
    
                return new JsonResponse(['success' => true]);
            } else {
                $logger->error('Invalid request.');
                return new JsonResponse(['success' => false, 'errorMessage' => 'Invalid request.']);
            }
    
        } catch (Exception $e) {
            $this->logger->error('Error while getting result : ' . $e);
            return new JsonResponse(['success' => false, 'errorMessage' => $e->getMessage()]);
        }
	}

	/**
	 * Check if a criteria is empty.
	 * (not private as this function is extended in custom directory of derivated applications)
	 *
	 * @param Undef $criteria
	 * @return true if empty
	 */
	protected function isEmptyCriteria($criteria) {
	    if (is_array($criteria)) {
	        $emptyArray = true;
	        foreach ($criteria as $value) {
	            if ($value != "") {
	                $emptyArray = false;
	            }
	        }
	        return $emptyArray;
	    } else {
	        return ($criteria == "");
	    }
	}
	
	/**
	 * @Route("/ajaxgetresultsbbox")
	 */
	public function ajaxgetresultsbboxAction(Request $request) {
	    $logger = $this->get ( 'logger' );
	    $logger->debug('ajaxgetresultsbboxAction');
	    
	    $configuration =  $this->get('ogam.configuration_manager');
	    ini_set("max_execution_time", $configuration->getConfig('max_execution_time', 480));
	    
	    try {
	    
	        // Get the request from the session
	        $queryForm = $request->getSession()->get('queryForm');
	    
	        // Call the service to get the definition of the columns
	        $this->get('ogam.manager.query')->prepareResultLocations($queryForm);
	    
	        // Execute the request
	        $resultLocationModel = $this->get('doctrine')->getRepository(ResultLocation::class);
	        $resultsbbox = $resultLocationModel->getResultsBBox(session_id(), $configuration->getConfig('srs_visualisation', 3857));
	    
	        // Send the result as a JSON String
	        return new JsonResponse(['success' => true, 'resultsbbox' => $resultsbbox]);
	    } catch (Exception $e) {
	        $logger->error('Error while getting result : ' . $e);
	        return new JsonResponse(['success' => false, 'errorMessage' => $e->getMessage()]);
	    }
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
