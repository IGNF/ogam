<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use OGAMBundle\Entity\Generic\DataObject;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormBuilder;
use OGAMBundle\Entity\Metadata\TableField;
use OGAMBundle\Entity\Metadata\FormField;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type as FType;


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
			if (!empty($params[$infoField->getData()->getData()])) {
				$infoField->value = $params[$infoField->getData()->getData()];
			}
		}

		// Complete the other fields with the session values (particulary join_keys)
		foreach ($data->editableFields as $editableField) {
			if (!empty($params[$editableField->getData()->getData()])) {
				$editableField->value = $params[$editableField->getData()->getData()];
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
    	$childrenTableLabels = $this->get('doctrine.orm.metadata_entity_manager')->getRepository('OGAMBundle:Metadata\TableTree')->getChildrenTableLabels($data->tableFormat);

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
     * Generate a Form Element from a TableField description.
     *
     * This is used only to validate the submitted data.
     * The form is not displayed, the actual form is an ExtJS component.
     *
     * @param FormBuilder $form the form(element) builder
     * @param TableField $tableField the table descriptor of the data
     * @param FormField $formField the form descriptor of the data
     * @param Boolean $isKey is the field a primary key ?
     * @return FormBuilderInterface the element (builder)
     * @todo make all fields within OGAMBundle:FormTypes\..  
     */
    protected function getFormElement($form, TableField $tableField, FormField $formField, $isKey = false) {
    
        
        $option = array();
        $option['label']=$tableField->getLabel();
        // Warning : $formField can be null if no mapping is defined with $tableField
        switch ($tableField->getType()) {
    
            case "STRING":
    
                // The field is a text field
                $elem = $form->create($tableField->getData()->getData(), FType\TextType::class);
    
                // Add a regexp validator if a mask is present
                if ($formField !== null && $formField->mask !== null) {
                    $validator = new Zend_Validate_Regex(array(
                        'pattern' => $formField->mask
                    ));
                    $elem->addValidator($validator);
                }
                $elem->setValue($tableField->value);
                break;
    
            case "INTEGER":
    
                // The field is an integer
                $elem = $form->create($tableField->getData()->getData(), FType\TextType::class);
                $elem->addValidator(new Zend_Validate_Int());
                $elem->setValue($tableField->value);
                break;
    
            case "NUMERIC":
    
                // The field is a numeric
                $elem = $form->create($tableField->getData()->getData(), FType\TextType::class);
                $elem->addValidator(new Zend_Validate_Float(array(
                    'locale' => 'en_EN'
                ))); // The locale should correspond to the database config
                $elem->setValue($tableField->value);
    
                if ($tableField->subtype === "RANGE") {
    
                    // Check min and max
                    $range = $this->metadataModel->getRange($tableField->unit);
                    $elem->addValidator(new Zend_Validate_LessThan(array(
                        'max' => $range->max
                    )));
                    $elem->addValidator(new Zend_Validate_GreaterThan(array(
                        'min' => $range->min
                    )));
                }
                break;
    
            case "DATE":
    
                // The field is a date
                $elem = $form->create($tableField->getData()->getData(), FType\DateType::class);
                // validate the date format
                if ($formField !== null && $formField->mask !== null) {
                    $validator = new Zend_Validate_Date(array(
                        'format' => $formField->mask,
                        'locale' => 'en_EN'
                    ));
                } else {
                    $validator = new Zend_Validate_Date(array(
                        'locale' => 'en_EN'
                    ));
                }
                $elem->addValidator($validator);
                $elem->setValue($tableField->value);
                break;
            case 'TIME':

                // validate the date format
                if ($formField !== null && $formField->mask !== null) {
                    $option['format'] = $formField->mask;
                } else {
                   $option['format']='HH:mm';
                }
                // The field is a date
                $elem = $form->create($tableField->getData()->getData(), FType\TimeType::class, $option);

                $elem->setData($tableField->value);
                break;
    
            case "CODE":
    
                $elem = $form->create($tableField->getData()->getData(), FType\ChoiceType::class);
                $elem->setData($tableField->value);
                break;
    
            case "BOOLEAN":
    
                // The field is a boolean
                $elem = $form->create($tableField->getData()->getData(), FType\CheckboxType::class);
                $elem->setData($tableField->value);
                break;
    
            case "ARRAY":
    
                // Build a multiple select box
                $elem = $form->create($tableField->getData()->getData(), FType\ChoiceType::class, array('multiple'=>true));
                $elem->setData($tableField->value);
                break;
    
            case "GEOM":
            default:
    
                // Default
                $elem = $form->create($tableField->getData()->getData(), FType\TextType::class);
                $elem->setData($tableField->value);
        }
    

       // $elem->setDescription($tableField->definition);
    
        if ($isKey) {
           $elem->setDisabled(true);
        }
    
        return $elem;
    }
    
    protected function getEditDataForm($data, $mode) {
        $formBuilder = $this
		->get('form.factory')
  		->createNamedBuilder('edit_data_form', FormType::class);
        
  		//FIXME : action needed ?
		$formBuilder->setAction($this->generateUrl('ajax-validate-edit-data', array('MODE'=>$mode)));
		
		$formBuilder->setMethod('POST')->setAttribute('class', 'editform');
		

		// Dynamically build the form
		
		//
		// The key elements as labels
		//
		foreach ($data->infoFields as $tablefield) {
		
		    $formField = $this->get('ogam.generic_service')->getTableToFormMapping($tablefield);
		
		    $elem = $this->getFormElement($formBuilder, $tablefield, $formField, true);
		    $elem->class = 'dataedit_key';
		    $formBuilder->add($elem);
		}
		
		//
		// The editable elements as form fields
		//
		foreach ($data->editableFields as $tablefield) {
		
		    // Hardcoded value : We don't edit the line number (it's a technical element)
		    if ($tablefield->data !== "LINE_NUMBER") {
		        $formField = $this->genericService->getTableToFormMapping($tablefield);
		        $elem = $this->getFormElement($formField, $tablefield, $formField, false);
		        $elem->class = 'dataedit_field';
		        $formBuilder->add($elem);
		    }
		}
		
		//
		// Add the submit element
		//
		 $formBuilder->add('submit', FType\SubmitType::class, array('label' => 'Submit'));

    
    }
    
    /**
     * Save the edited data in database.
     *
     * @return the HTML view
     * @Route("/ajax-validate-edit-data")
     */
    public function ajaxValidateEditDataAction(Request $request) {
        // Get the mode
        $mode = $request->request->getAlpha('MODE');
        
        // Validate the form
        $form = $this->getEditDataForm($data, $mode);
        if (!$form->isValidPartial($_POST)) {
        
            // On réaffiche le formulaire avec les messages d'erreur
            $this->view->form = $form;
            $this->view->ancestors = $websiteSession->ancestors;
            $this->view->tableFormat = $data->tableFormat;
            $this->view->data = $data;
            $this->view->children = $websiteSession->children;
            $this->view->message = '';
            $this->view->mode = $mode;
        
            echo '{"success":false,"errorMessage":' . json_encode($this->translator->translate("Invalid form")) . '}';
        } else {
        
            try {
        
                if ($mode === 'ADD') {
                    // Insert the data
        
                    // join_keys values must not be erased
                    $joinKeys = $this->genericModel->getJoinKeys($data);
        
                    foreach ($data->getFields() as $field) {
                        $isNotJoinKey = !in_array($field->columnName, $joinKeys);
        
                        if ($isNotJoinKey) {
                            // Update the data descriptor with the values submitted
                            $field->value = $this->_getParam($field->getName());
                        }
                    }
        
                    $data = $this->genericModel->insertData($data);
                } else {
                    // Edit the data
        
                    // Update the data descriptor with the values submitted (for editable fields only)
                    foreach ($data->getEditableFields() as $field) {
                        $field->value = $this->_getParam($field->getName());
                    }
        
                    $this->genericModel->updateData($data);
                }
                echo '{"success":true, ';
        
                // Manage redirections
        
                // Check the number of children
                $children = $this->genericModel->getChildren($data);
        
                // After a creation if no more children possible
                if (count($children) === 0 && $mode === 'ADD') {
                    // We redirect to the parent
                    $ancestors = $this->genericModel->getAncestors($data);
                    if (!empty($ancestors)) {
                        $ancestor = $ancestors[0];
                        $redirectURL = '#edition-edit/' . $ancestor->getId();
                    } else {
                        $redirectURL = '#edition-edit/' . $data->getId();
                    }
                    echo '"redirectLink":' . json_encode($redirectURL) . ',';
                } else {
                    // We redirect to the newly created or edited item
                    $redirectURL = '#edition-edit/' . $data->getId();
                    echo '"redirectLink":' . json_encode($redirectURL) . ',';
                }
        
                // Add a message
                echo '"message":' . json_encode($this->translator->translate("Data saved"));
                echo '}';
            } catch (Exception $e) {
                $this->logger->err($e->getMessage());
        
                if (stripos($e->getMessage(), 'SQLSTATE[23505]') !== false) {
                    // Traitement du cas d'un doublon pour PostgreSQL
                    echo '{"success":false,"errorMessage":' . json_encode($this->translator->translate('Error inserting data duplicate key')) . '}';
                } else {
                    // Cas général
                    echo '{"success":false,"errorMessage":' . json_encode($e->getMessage()) . '}';
                }
            }
        }
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
    	$childrenTableLabels = $this->get('doctrine.orm.metadata_entity_manager')->getRepository('OGAMBundle:Metadata\TableTree')->getChildrenTableLabels($data->tableFormat);

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
       
        $res = $this->getQueryService()->getEditForm($data);
        
    	return $this->json($res);
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
    
    protected function getQueryService() {
        return $this->get('ogam.query_service');
    }
    
    /**
     * Returns a JsonResponse that uses the serializer component if enabled, or json_encode.
     *
     * @param mixed $data    The response data
     * @param int   $status  The status code to use for the Response
     * @param array $headers Array of extra headers to add
     * @param array $context Context to pass to serializer when using serializer component
     *
     * @return JsonResponse
     * //import from symfony 3.1
     */
    protected function json($data, $status = 200, $headers = array(), $context = array())
    {
        if ($this->container->has('serializer')) {
            $json = $this->container->get('serializer')->serialize($data, 'json', array_merge(array(
                'json_encode_options' => JsonResponse::DEFAULT_ENCODING_OPTIONS,
            ), $context));
            return new JsonResponse($json, $status, $headers, true);
        }
        return new JsonResponse($data, $status, $headers);
    }
}
