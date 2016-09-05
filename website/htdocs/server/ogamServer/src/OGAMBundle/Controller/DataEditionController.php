<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use OGAMBundle\Entity\Generic\DataObject;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
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
     * @return DataObject the data object
     */
    protected function getDataFromRequest($request) {
		//bouchon 
		$data = new DataObject();
		$params = array();
		$id = $request->attributes->get('id');
		if (is_string($id)){
			$list = explode('/', $id);// will be like key1/value1/key2/value2
			if(count($list) % 2){//is an key+value list  so odd is error
				$this->createNotFoundException('DataObject not found');
			}
			$params = array_column(array_chunk($list, 2), 1, 0);//make array key =>value
		}
		
		$schema = $params["SCHEMA"];
		$format = $params["FORMAT"];
		
		$data = $this->get('ogam.generic_service')->buildDataObject($schema, $format);
		
		// Complete the primary key info with the session values
		foreach ($data->infoFields as $infoField) {
			if (!empty($params[$infoField->getData()])) {
				$infoField->value = $params[$infoField->getData()];
			}
		}
		
		// Complete the other fields with the session values (particulary join_keys)
		foreach ($data->editableFields as $editableField) {
			if (!empty($params[$editableField->getData()])) {
				$editableField->value = $params[$editableField->getData()];
			}
		}
		
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
     * @Route("/show-edit-data/{id}", requirements={"id"= ".*"})
     */
    public function showEditDataAction(Request $request, $data = null, $message = '')
    {
        $genericModel = $this->get('ogam.manager.generic');
        $mode = 'EDIT';
    	// If data is set then we don't need to read from database
    	if ($data === null) {
    		$data = $this->getDataFromRequest($request);
    		$genericModel->getDatum($data);
    	}
    	
    	// If the objet is not existing then we are in create mode instead of edit mode
    	
    	// Get the ancestors of the data objet from the database (to generate a summary)
    	$ancestors = $genericModel->getAncestors($data);
    	
    	// Get the childs of the data objet from the database (to generate links)
    	$children = $genericModel->getChildren($data);
    	
    	// Get the labels linked to the children table (to display the links)
    	$childrenTableLabels = $this->get('doctrine.orm.metadata_entity_manager')->getRepository('OGAMBundle:Metadata\TableTreeData')->getChildrenTableLabels($data->tableFormat);
    	 
    	return 
    	$this->render('OGAMBundle:DataEdition:edit_data.html.php', array(
    		'dataId' => $data->getId(),
			'tableFormat' => $data->tableFormat,
			'ancestors' => $ancestors,
			'data' => $data,
			'children' => $children,
			'childrenTableLabels'=> $childrenTableLabels,
			'mode' => $mode,
			'message' => $message,
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
     * @Route("/show-add-data/{id}", requirements={"id"= ".*"})
     * @Template(engine="php")
     */
    public function showAddDataAction(Request $request, DataObject $data = null, $message = '') {
    	$mode = 'ADD';
    	
    	// If data is set then we don't need to read from database
    	if ($data === null) {
    		$data = $this->getDataFromRequest($request);
    	}
    	
    	// If the objet is not existing then we are in create mode instead of edit mode
    	
    	// Get the ancestors of the data objet from the database (to generate a summary)
    	$ancestors = $this->get('ogam.manager.generic')->getAncestors($data);
    	
    	// Get the labels linked to the children table (to display the links)
    	$childrenTableLabels = $this->get('doctrine.orm.metadata_entity_manager')->getRepository('OGAMBundle:Metadata\TableTreeData')->getChildrenTableLabels($data->tableFormat);
    	 
    	return 
    	//$this->render('OGAMBundle:DataEdition:show_add_data.html.twig', array(
    	$this->render('OGAMBundle:DataEdition:edit_data.html.php', array(
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
     * @Route("/ajax-get-edit-form/{id}", requirements={"id"= ".*"})
     */
    public function ajaxGetEditFormAction(Request $request, $id=null) {
        $data = $this->getDataFromRequest($request);
    	return $this->json(array());
    }

    /**
     * AJAX function : Get the AJAX structure corresponding to the add form.
     *
     * @return JSON The list of forms
     * @Route("/ajax-get-add-form/{id}", requirements={"id"= ".*"})
     */
    public function ajaxGetAddFormAction(Request $request, $id=null) {
        $data = $this->getDataFromRequest($request);
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
