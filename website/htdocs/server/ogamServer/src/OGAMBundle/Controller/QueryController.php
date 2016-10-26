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
use OGAMBundle\Entity\Website\PredefinedRequest;
use OGAMBundle\Entity\Website\PredefinedRequestCriterion;
use OGAMBundle\Entity\Metadata\Dynamode;
use OGAMBundle\Entity\Metadata\Unit;

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
	 * @Route("/ajaxresetresultlocation")
	 */
	public function ajaxresetresultlocationAction() {
	    $this->get ( 'logger' )->debug ( 'ajaxresetresultlocationAction' );

		$sessionId = session_id();
		$this->get('doctrine')->getRepository(ResultLocation::class, 'mapping')->cleanPreviousResults($sessionId);

		 return new JsonResponse(['success' => true]);
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
                    $queryForm->addCriterion($split[0], $split[1], $inputValue);
                }
                if (strpos($inputName, "column__") === 0) {
                    $columnName = substr($inputName, strlen("column__"));
                    $split = explode("__", $columnName);
                    $queryForm->addColumn($split[0], $split[1]);
                }
            }

            if ($queryForm->isValid()) {
                // Store the request parameters in session
                $request->getSession()->set('query_QueryForm', $queryForm);

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
	        $queryForm = $request->getSession()->get('query_QueryForm');
	        // Get the mappings for the query form fields
	        $this->get('ogam.query_service')->setQueryFormFieldsMappings($queryForm);

	        // Call the service to get the definition of the columns
	        $userInfos = [
	            "providerId" => $this->getUser() ? $this->getUser()->getProvider()->getId() : NULL,
	            "DATA_QUERY_OTHER_PROVIDER" => $this->getUser() && $this->isAllowed('DATA_QUERY_OTHER_PROVIDER')
	        ];
	        $this->get('ogam.manager.query')->prepareResultLocations($queryForm, $userInfos);

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
	public function ajaxgetresultcolumnsAction(Request $request) {
	    $logger = $this->get ( 'logger' );
		$logger->debug('ajaxgetresultcolumns');

		try {
			// Get the request from the session
	        $queryForm = $request->getSession()->get('query_QueryForm');
	        // Get the mappings for the query form fields
	        $this->get('ogam.query_service')->setQueryFormFieldsMappings($queryForm);

			// Call the service to get the definition of the columns
	        $userInfos = [
	            "providerId" => $this->getUser() ? $this->getUser()->getProvider()->getId() : NULL,
	            "DATA_QUERY_OTHER_PROVIDER" => $this->getUser() && $this->isAllowed('DATA_QUERY_OTHER_PROVIDER'),
	            "DATA_EDITION_OTHER_PROVIDER" => $this->getUser() && $this->isAllowed('DATA_EDITION_OTHER_PROVIDER')
	        ];
			$this->get('ogam.query_service')->buildRequest($queryForm, $userInfos, $request->getSession());

			$response = new Response();
			$response->headers->set('Content-Type', 'application/json');
			return $this->render ( 'OGAMBundle:Query:ajaxgetresultcolumns.json.twig', array (
			    'columns' => $this->get('ogam.query_service')->getColumns($queryForm, $userInfos),
			    'userInfos' => $userInfos
			),$response);

		} catch (Exception $e) {
			$logger->error('Error while getting result : ' . $e);
			return new JsonResponse(['success' => false, 'errorMessage' => $e->getMessage()]);
		}
	}

	/**
	 * @Route("/ajaxgetresultrows")
	 */
	public function ajaxgetresultrowsAction(Request $request) {
	    $logger = $this->get ( 'logger' );
		$logger->debug('ajaxgetresultrows');

		// Get the datatable parameters
		$start = $request->request->getInt('start');
		$length = $request->request->getInt('limit');
		$sort = $request->request->get('sort');
		$sortObj = json_decode($sort, true)[0];

		// Call the service to get the definition of the columns
		$userInfos = [
		    "DATA_QUERY_OTHER_PROVIDER" => $this->getUser() && $this->isAllowed('DATA_QUERY_OTHER_PROVIDER')
		];
		// Send the result as a JSON String
		return new JsonResponse([
		    'success' => true,
		    'total' => $request->getSession()->get('query_Count'),
		    'data' => $this->get('ogam.query_service')->getResultRows($start, $length, $sortObj["property"], $sortObj["direction"], $request->getSession(), $userInfos)
		]);
	}

	/**
	 * @Route("/ajaxgetpredefinedrequestlist")
	 */
	public function ajaxgetpredefinedrequestlistAction(Request $request) {
	    $logger = $this->get ( 'logger' );
	    $logger->debug('ajaxgetpredefinedrequestlist');

	    $sort = $request->query->get('sort');
	    $dir = $request->query->getAlpha('dir');

	    // Get the predefined values for the forms
	    $schema = $this->get('ogam.schema_listener')->getSchema();
	    $locale = $this->get('ogam.locale_listener')->getLocale();
	    $predefinedRequestRepository = $this->get('doctrine')->getRepository(PredefinedRequest::class);
	    $predefinedRequestList = $predefinedRequestRepository->getPredefinedRequestList($schema, $dir, $sort, $locale);

		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		return $this->render ( 'OGAMBundle:Query:ajaxgetpredefinedrequestlist.json.twig', array (
		    'data' => $predefinedRequestList
		),$response);
	}

	/**
	 * @Route("/ajaxgetpredefinedrequestcriteria")
	 */
	public function ajaxgetpredefinedrequestcriteriaAction(Request $request) {
	    $logger = $this->get ( 'logger' );
	    $logger->debug('ajaxgetpredefinedrequestcriteria');

	    $requestName = $request->query->get('request_name');
	    $predefinedRequestCriterionRepository = $this->get('doctrine')->getRepository(PredefinedRequestCriterion::class);
	    $locale = $this->get('ogam.locale_listener')->getLocale();

	    $response = new Response();
	    $response->headers->set('Content-Type', 'application/json');
	    return $this->render ( 'OGAMBundle:Query:ajaxgetpredefinedrequestcriteria.html.twig', array (
	        'data' => $predefinedRequestCriterionRepository->getPredefinedRequestCriteria($requestName, $locale)
	    ),$response);
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
	 * Get the parameters used to initialise the result grid.
	 * @Route("/getgridparameters")
	 */
	public function getgridparametersAction() {
	    $viewParam = array();
	    $viewParam['hideGridCsvExportMenuItem'] = true; // By default the export is hidden
	    $viewParam['hideGridDataEditButton'] = true;
	    $viewParam['checkEditionRights'] = true; // By default, we don't check for rights on the data

	    $user = $this->getUser();
	    $schema = $this->get('ogam.schema_listener')->getSchema();

	    if ($schema == 'RAW_DATA' && $user->isAllowed('EXPORT_RAW_DATA')) {
	        $viewParam['hideGridCsvExportMenuItem'] = false;
	    }
	    if ($schema == 'HARMONIZED_DATA' && $user->isAllowed('EXPORT_HARMONIZED_DATA')) {
	        $viewParam['hideGridCsvExportMenuItem'] = false;
	    }
	    if (($schema == 'RAW_DATA' || $schema == 'HARMONIZED_DATA') && $user->isAllowed('DATA_EDITION')) {
	        $viewParam['hideGridDataEditButton'] = false;
	    }
	    if ($user->isAllowed('DATA_EDITION_OTHER_PROVIDER')) {
	        $viewParam['checkEditionRights'] = false;
	    }

	    $response = new Response();
	    $response->headers->set('Content-type', 'application/javascript');
	    return $this->render('OGAMBundle:Query:getgridparameters.html.twig', $viewParam, $response);
	}

	/**
	 * Get the details associed with a result line (clic on the "detail button").
	 *
	 * @Route("/ajaxgetdetails")
	 */
	public function ajaxgetdetailsAction(Request $request) {
	    $logger = $this->get ( 'logger' );
	    $logger->debug('getDetailsAction');

	    // Get the names of the layers to display in the details panel
	    $configuration =  $this->get('ogam.configuration_manager');
	    $detailsLayers = [];
	    $detailsLayers[] = $configuration->getConfig('query_details_layers1');
	    $detailsLayers[] = $configuration->getConfig('query_details_layers2');

	    // Get the current dataset to filter the results
	    $datasetId = $request->getSession()->get('query_QueryForm')->getDatasetId();

	    // Get the id from the request
	    $id = $request->request->get('id');
	    
	    $userInfos = [
	        "providerId" => $this->getUser() ? $this->getUser()->getProvider()->getId() : NULL,
	        "DATA_EDITION" => $this->getUser() && $this->getUser()->isAllowed('DATA_EDITION')
	    ];
	    
	    $response = new Response();
	    $response->headers->set('Content-Type', 'application/json');
	    return $this->render ( 'OGAMBundle:Query:ajaxgetdetails.json.twig', array (
	        'data' => $this->get('ogam.query_service')->getDetailsData($id, $detailsLayers, $datasetId, true, $userInfos)
	    ),$response);
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
     *
     * @Route("/ajaxgetdynamiccodes")
     */
    public function ajaxgetdynamiccodesAction(Request $request)
    {
        $unitCode = $request->query->get('unit');
        $query = $request->query->get('query');
        $em = $this->get('doctrine.orm.metadata_entity_manager');
        $unit = $em->find(Unit::class, $unitCode);
        $modes = $em->getRepository(Dynamode::class)->getModes($unit, null, $query);

        $response = new JsonResponse();

        return $this->render('OGAMBundle:Query:ajaxgetcodes.json.twig', array(
            'data' => $modes
        ), $response);
    }

	/**
	 * @Route("/ajaxgetcodes")
	 */
	public function ajaxgetcodesAction(Request $request) {
	    $unitCode = $request->query->get('unit');
	    $query = $request->query->get('query', null);
	    $em = $this->get('doctrine.orm.metadata_entity_manager');
	    $unit = $em->find(Unit::class, $unitCode);

	    $locale = $this->get('ogam.locale_listener')->getLocale();

	    if ($query === null) {
	        $modes = $em->getRepository(Unit::class)->getModes($unit, $locale);
	    } else {
	        $modes =  $em->getRepository('OGAMBundle:Metadata\Mode')->getModesFilteredByLabel($unit, $query, $locale);
	    }

	    $response = new JsonResponse();

	    return $this->render('OGAMBundle:Query:ajaxgetcodes.json.twig', array(
	        'data' => $modes
	    ), $response);;
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
}
