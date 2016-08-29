<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use OGAMBundle\Entity\HarmonizedData\HarmonizationProcess;
use Symfony\Component\HttpFoundation\Request;
/**
 * @Route("/harmonization")
 * @author FBourcier
 *
 */
class HarmonizationController extends Controller
{
    /**
     * @Route("/", name="harmonization_home")
     */
    public function indexAction()
    {
        return $this->showHarmonizationPageAction();
    }

    /**
     * @Route("/show-harmonization-page", name="harmonization_dashboard")
     */
    public function showHarmonizationPageAction()
    {
    	$activeSubmissions = $this->getDoctrine()->getRepository('OGAMBundle:RawData\Submission','raw_data')->getSubmissionsForHarmonization();
    	$HarmoRepo = $this->getDoctrine()->getRepository('OGAMBundle:HarmonizedData\HarmonizationProcess','harmonized_data');
    	$harmonisationProcesses = array();

    	foreach ($activeSubmissions as $activeSubmission) {
    		$harmonisationProcess = $HarmoRepo->findOneBy(array('providerId'=>$activeSubmission->getProvider()->getId(), 'dataset'=>$activeSubmission->getDataset()), array('harmonizationId'=> 'DESC'));
    		if (empty($harmonisationProcess)) {
    			$harmonisationProcess = new HarmonizationProcess();
    			$harmonisationProcess->setProviderId($activeSubmission->getProvider()->getId())->setDataset($activeSubmission->getDataset())->addSubmission($activeSubmission);
    		}
    		$harmonisationProcesses[] = $harmonisationProcess;
    	}

        return $this->render('OGAMBundle:Harmonization:show_harmonization_page.html.twig', array(
            'harmonizations' => $harmonisationProcesses
        ));
    }

    /**
     * Launch the harmonization process.
     * 
     * @Route("/launch-harmonization", name="harmonization_launch")
     */
    public function launchHarmonizationAction(Request $request)
    {
    	// Get the submission Id
    	$providerId = $request->query->get("PROVIDER_ID");
    	$datasetId = $request->query->get("DATASET_ID");
    	
    	$service = $this->get('ogam.harmonization_service');
    	// Send the cancel request to the integration server
    	try {
    		$service->harmonizeData($providerId, $datasetId, FALSE);
    	} catch (Exception $e) {
    		$this->logger->err('Error during harmonization: ' . $e);
    		$this->view->errorMessage = $e->getMessage();
    		return $this->render('show-harmonization-process-error');
    	}
    	
    	// Forward the user to the next step
    	return $this->redirectToRoute('harmonization_dashboard');
    }

    /**
     * Remove the generated data.
     * 
     * @Route("/remove-harmonization-data", name="harmonization_removeharmonizationdata")
     */
    public function removeHarmonizationDataAction(Request $request)
    {
    	// Get the submission Id
    	$providerId = $request->query->get("PROVIDER_ID");
    	$datasetId = $request->query->get("DATASET_ID");
    	
    	$service = $this->get('ogam.harmonization_service');
    	// Send the cancel request to the integration server
    	try {
    		$service->harmonizeData($providerId, $datasetId, TRUE);
    	} catch (Exception $e) {
    		$this->getLogger()->err('Error during harmonization: ' . $e);
    		$this->view->errorMessage = $e->getMessage();
    		return $this->render('show-harmonization-process-error');
    	}
    	
    	// Forward the user to the next step
    	return $this->redirectToRoute('harmonization_dashboard');
    }

    /**
     * Gets the integration status.
     * 
     * @Route("/get-status", name="harmonization_getstatus")
     */
    public function getStatusAction(Request $request)
    {
    	// Get the submission Id
    	$providerId = $request->request->get("PROVIDER_ID");
    	$datasetId  = $request->request->get("DATASET_ID");
    	
    	$service = $this->get('ogam.harmonization_service');
    	// Send the cancel request to the integration server
    	try {
    		$status = $service->getStatus($datasetId, $providerId);
    	
    		$data = array(
    					'success'=> TRUE,
    					'status'=>$status->status
    			);
    		// Echo the result as a JSON
    		if ($status->status === "OK") {
    			return $this->json($data);
    		} else {
    			$data['taskName']= $status->taskName;
    			if ($status->currentCount != null) {
    				$data["currentCount"]= $status->currentCount;
    			}
    			if ($status->totalCount != null) {
    				$data['totalCount'] = $status->totalCount;
    			}
    			return $this->json($data);
    		}
    	
    	} catch (Exception $e) {
    		$this->getLogger()->err('Error during get: ' . $e);

    		return $this->json(array(
    				'success'=> FALSE,
    				'errorMsg'=>  $e->getMessage()

    		));
    	}
    }

}
