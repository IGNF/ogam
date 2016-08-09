<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Doctrine\ORM\EntityManager;
/**
 * @Route("/integration")
 */
class IntegrationController extends Controller
{
	/**
	 * get the underline entity manager related with
	 * @return EntityManager
	 */
	function getEntityManger(){
		return $this->get('doctrine.orm.raw_data_entity_manager');
	}

	/**
	 * Default action.
	 *
     * @Route("/", name = "integration_home")
	 */
	public function indexAction() {
		// Display the default
		return $this->showDataSubmissionPageAction();
	}


    /**
     * Show the data submission page.
     *
     * @Route("/show-data-submission-page")
     */
    public function showDataSubmissionPageAction()
    {
    	$submissions = $this->getEntityManger()->getRepository('OGAMBundle:RawData\Submission')->getAciveSubmissions();

        return $this->render('OGAMBundle:Integration:show_data_submission_page.html.twig', array(
            // ...
            'submissions'=>$submissions
        ));
    }

    /**
     * Show the create data submission page.
     *
     * @Route("/show-create-data-submission", name="integration_creation")
     */
    public function showCreateDataSubmissionAction()
    {
        return $this->render('OGAMBundle:Integration:show_create_data_submission.html.twig', array(
            // ...
        ));
    }

    /**
     * Show the upload data page.
     *
     * @Route("/show-upload-data")
     */
    public function showUploadDataAction()
    {
        return $this->render('OGAMBundle:Integration:show_upload_data.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/validate-create-data-submission")
     */
    public function validateCreateDataSubmissionAction()
    {
        return $this->render('OGAMBundle:Integration:validate_create_data_submission.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/validate-upload-data")
     */
    public function validateUploadDataAction()
    {
        return $this->render('OGAMBundle:Integration:validate_upload_data.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/cancel-data-submission", name="integration_cancel")
     */
    public function cancelDataSubmissionAction()
    {
        return $this->render('OGAMBundle:Integration:cancel_data_submission.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/check-submission", name="integration_check")
     */
    public function checkSubmissionAction()
    {
        return $this->render('OGAMBundle:Integration:check_submission.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/get-data-status", name="integration_status")
     */
    public function getDataStatusAction()
    {
        return $this->render('OGAMBundle:Integration:get_data_status.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/check-data-status")
     */
    public function getCheckStatusAction()
    {
        return $this->render('OGAMBundle:Integration:get_check_status.html.twig', array(
            // ...
        ));
    }

    /**
     * @Route("/export-file-model")
     */
    public function exportFileModelAction()
    {
        return $this->render('OGAMBundle:Integration:export_file_model.html.twig', array(
            // ...
        ));
    }

}
