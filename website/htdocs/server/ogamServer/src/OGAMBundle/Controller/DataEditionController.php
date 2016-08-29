<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use OGAMBundle\Entity\Generic\DataObject;
use Symfony\Component\HttpFoundation\Request;
/**
 * 
 * @Route ("/dataedition")
 *
 */
class DataEditionController extends Controller
{
    /**
     * @Route("/", name="dataedition_home")
     */
    public function indexAction()
    {
        return $this->render('OGAMBundle:DataEdition:index.html.twig', array(
            // ...
        ));
    }

    /**
     * Display the "index" page.
	 *
	 * @param String $message
	 *        	a message to be displayed on the page
     * @Route("/show-index")
     */
    public function showIndexAction()
    {
        return $this->render('OGAMBundle:DataEdition:index.html.twig', array(
            // ...
        ));
    }
    
    /**
     * Parse request parameters and build the corresponding data object.
     *
     * @param Request $request
     *        	The request object.
     * @return Application_Object_Generic_DataObject the data object
     */
    protected function getDataFromRequest($request) {
		//bouchon 
		$data = new DataObject();
    	return $data;
    }
    
    /**
     * Edit a data.
	 *
	 * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
	 *
	 * @param DataObject $data The data to display (optional)
	 * @param String $message a confirmation/warning message to display (optional)
	 * @return the view
     * @Route("/show-edit-data")
     */
    public function showEditDataAction($data = null, $message = '')
    {
    	return $this->render('OGAMBundle:DataEdition:edit_data.json.twig', array(
    			// ...
    	));
    }

    /**
     * Delete a data.
     *
     * @return the view.
     * @Route("/ajax-delete-data")
     */
    public function ajaxDeleteDataAction() {
    	return $this->render('OGAMBundle:DataEdition:ajax_delete_data.json.twig', array(
    			// ...
    	));
    }

    /**
     * Save the edited data in database.
     *
     * @return the HTML view
     * @Route("/ajax-validate-edit-data")
     */
    public function ajaxValidateEditDataAction() {
    	return $this->render('OGAMBundle:DataEdition:ajax_validate_edit_data.json.twig', array(
    			// ...
    	));
    }

    /**
     * Add a new data.
     *
     * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
     *
     * @param DataObject $data
     *        	The data to display (optional)
     * @param String $message
     *        	A confirmation/warning message to display
     * @return the HTML view
     * @Route("/show-add-data")
     */
    public function showAddDataAction(Request $request, $data = null, $message = '') {
    	$mode = 'ADD';
    	
    	// If data is set then we don't need to read from database
    	if ($data === null) {
    		$data = $this->getDataFromRequest($request);
    	}
    	
    	// If the objet is not existing then we are in create mode instead of edit mode
    	
    	// Get the ancestors of the data objet from the database (to generate a summary)
    	$ancestors = $this->getDoctrine()->getRepository('OGAMBundle:GenericRepository')->getAncestors($data);
    	
    	// Get the labels linked to the children table (to display the links)
    	$childrenTableLabels = $this->get('doctrine.orm.metadata_entity_manager')->getChildrenTableLabels($data->tableFormat);
    	 
    	return $this->render('OGAMBundle:DataEdition:show_add_data.html.twig', array(
    		'dataId' => $data->getId(),
			'tableFormat' => $data->tableFormat,
			'ancestors' => $ancestors,
			'data' => $data,
			'children' => array(), // No children in add mode
			'childrenTableLabels'=> $childrenTableLabels,
			'mode' => $mode,
			'message' => $message,
    	));
    }

    /**
     * AJAX function : Get the AJAX structure corresponding to the edition form.
     *
     * @return JSON The list of forms
     * @Route("/ajax-get-edit-form")
     */
    public function ajaxGetEditFormAction() {
    	return $this->json(array());
    }

    /**
     * AJAX function : Get the AJAX structure corresponding to the add form.
     *
     * @return JSON The list of forms
     * @Route("/ajax-get-add-form")
     */
    public function ajaxGetAddFormAction() {
    	return $this->json(array());
    }

    /**
     * Get the parameters.
     * @Route("/getparameters")
     */
    public function getparametersAction() {
    	$user = $this->getUser();
    	return $this->render('OGAMBundle:DataEdition:edit_parameters.js.twig', array(
    			'checkEditionRights' =>  ($user && $this->isGranted('DATA_EDITION_OTHER_PROVIDER')) ? FALSE : TRUE,
    			'userProviderId' => $user->getProvider()->getId(),
    	));
    }

    /**
     * Upload an image and store it on the disk.
     *
     * @return JSON
     * @Route("/ajaximageupload")
     */
    public function ajaximageuploadAction() {
    	return $this->json(array('succes' => TRUE));
    }
}
