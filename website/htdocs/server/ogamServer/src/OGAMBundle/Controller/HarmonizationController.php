<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
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
     * @Route("/show-harmonization-page")
     */
    public function showHarmonizationPageAction()
    {
    	$activeSubmissions = $this->getDoctrine()->getRepository('OGAMBundle:RawData\Submission','raw_data')->getSubmissionsForHarmonization();
    	$harmonizations = $this->getDoctrine()->getRepository('OGAMBundle:HarmonizedData\HarmonizationProcess','harmonized_data')->findAll();
    	/*
    	// Get the list of available harmonization (active submissions)
    	$activeSubmissions = $this->submissionModel->getSubmissionsForHarmonization();
    	
    	$harmonisationProcesses = array();
    	
    	foreach ($activeSubmissions as $id => $activeSubmission) {
    	
    		// Get the status of the last process run
    		$process = $this->harmonizationModel->getHarmonizationProcessInfo($activeSubmission);
    	
    		// Get the source submissions of this process
    		$process = $this->harmonizationModel->getHarmonizationProcessSources($process);
    	
    		// Get the current status of the source data
    		if($process->status === 'UNDONE'){
    			$submission = $this->submissionModel->getSubmission($activeSubmission->submissionId);
    			if ($submission->step === "VALIDATED") {
    				$submissionStatus = "VALIDATED";
    			} else {
    				$submissionStatus = "NOT_VALID";
    			}
    		} else {
    			$submissionStatus = 'VALIDATED';
    			foreach ($process->submissionIDs as $submissionID) {
    				$submission = $this->submissionModel->getSubmission($submissionID);
    				if ($submission->step !== "VALIDATED") {
    					$submissionStatus = "NOT_VALID";
    				}
    			}
    		}
    	
    		$process->submissionStatus = $submissionStatus;
    	
    		$harmonisationProcesses[$id] = $process;
    	}
    	
    	// Send the data to the view
    	$this->view->harmonizations = $harmonisationProcesses;
    	*/
        return $this->render('OGAMBundle:Harmonization:show_harmonization_page.html.twig', array(
            'harmonizations' => $harmonizations
        ));
    }

    /**
     * @Route("/launch-harmonization", name="harmonization_launch")
     */
    public function launchHarmonizationAction()
    {
        return $this->render('OGAMBundle:Harmonization:launch_harmonization.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/remove-harmonization-data", name="harmonization_removeharmonizationdata")
     */
    public function removeHarmonizationDataAction()
    {
        return $this->render('OGAMBundle:Harmonization:remove_harmonization_data.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/get-status", name="harmonization_getstatus")
     */
    public function getStatusAction()
    {
        return $this->render('OGAMBundle:Harmonization:get_status.html.twig', array(
            // ...
        ));
    }

}
