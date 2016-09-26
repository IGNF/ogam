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
use Symfony\Component\Validator\Constraints as Assert;
use Zend\Validator\Date;
use Symfony\Component\HttpFoundation\Session\Attribute\NamespacedAttributeBag;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use OGAMBundle\Form\AjaxType;

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
     * @param FormField|null $formField the form descriptor of the data
     * @param Boolean $isKey is the field a primary key ?
     * @return FormBuilderInterface the element (builder)
     * @todo make all fields within OGAMBundle:FormTypes\..  
     */
    protected function getFormElement($form, TableField $tableField,  $formField, $isKey = false) {
        if (null === $formField){
            throw new \InvalidArgumentException('tableField is required, not null');
        }
        
        $option = array();
        $option['label'] = $tableField->getLabel();
        $unit = $formField->getData()->getUnit();
        
        // Warning : $formField can be null if no mapping is defined with $tableField
        switch ($unit->getType()) {
    
            case "STRING":
                // Add a regexp validator if a mask is present
                if ($formField !== null && $formField->getMask() !== null) {
                    $validator = new Assert\Regex(array(
                        'pattern' => $formField->getMask()
                    ));
                    $option['constraints'][] = $validator;
                }
                
                // The field is a text field
                $elem = $form->create($tableField->getName(), FType\TextType::class, $option);
    
                $elem->setData($tableField->value);
                break;
    
            case "INTEGER":

                $option['constraints'] = new Assert\Type('int');//digit ?
                // The field is an integer
                $elem = $form->create($tableField->getName(), FType\TextType::class, $option);

                $elem->setData($tableField->value);
                break;
    
            case "NUMERIC":
                $option['constraints'] = [new Assert\Type('numeric')];
                // The field is a numeric
                if ($unit->getSubType() === "RANGE") {
    
                    // Check min and max
                    $range = $unit->getRange();
                    $option['constraints'][]= new Assert\Range(array('min'=> $range->getMin(), 'max'=>$range->getMax()));
                }
                
                $elem = $form->create($tableField->getName(), FType\TextType::class, $option);

                $elem->setData($tableField->value);
                break;
    
            case "DATE":
    
                // The field is a date
               
                // validate the date format
                if ($formField !== null && $formField->getMask() !== null) {
                    $validator = new Assert\DateTime(/*array(//@version 3.1 symfony
                        'format' => $formField->getMask(),
                    )*/);
                    $option['format'] = $formField->getMask();
                } else {
                    $validator = $validator = new Assert\Date();
                }
                
                $option['constraints'] = $validator;
                
                $elem = $form->create($tableField->getName(), FType\DateType::class, $option);
                $elem->setData($tableField->value);
                break;
            case 'TIME':

                // validate the date format
                if ($formField !== null && $formField->getMask() !== null) {
                //    $option['format'] = $formField->getMask();//TODO: mask ? symfony3.1 ?
                } else {
              //     $option['format']='HH:mm';
                }
                // The field is a date
                $elem = $form->create($tableField->getName(), FType\TimeType::class, $option);

                $elem->setData($tableField->value);
                break;
    
            case "CODE":
                
                $elem = $form->create($tableField->getName(), FType\TextType::class, $option);//TODO choicetype depending the subtype, modes ....
                $elem->setData($tableField->value);
                break;
    
            case "BOOLEAN":
    
                // The field is a boolean
                $elem = $form->create($tableField->getData()->getName(), FType\CheckboxType::class, $option);
                $elem->setData($tableField->value);
                break;
    
            case "ARRAY":
    
                // 
                $option['entry_type'] = FType\TextType::class;
                $option['prototype_name']='';
                $option['allow_add']=true;
                $elem = $form->create($tableField->getName(), FType\CollectionType::class, $option);
                $elem->setData($tableField->value);
                break;
    
            case "GEOM":
            default:
    
                // Default
                $elem = $form->create($tableField->getName(), FType\TextType::class, $option);
                $elem->setData($tableField->value);
        }
    

       // $elem->setDescription($tableField->definition);
    
        if ($isKey) {
           $elem->setAttribute('readonly', 'readonly');
        }
    
        return $elem;
    }
    /**
     * Build and return the data form.
     * @param DataObject $data The descriptor of the expected data.
     * @param String $mode ('ADD' or 'EDIT')
     * @return \Symfony\Component\Form\FormInterface
     */
    protected function getEditDataForm($data, $mode) {
        $formBuilder = $this
		->get('form.factory')
  		->createNamedBuilder('edit_data_form', AjaxType::class);//use in ajax often 
        
  		//FIXME : action needed ?
		$formBuilder->setAction($this->generateUrl('dataedition_validate_edit_data', array('MODE'=>$mode)));
		
		$formBuilder->setAttribute('class', 'editform');
		

		// Dynamically build the form
		//
		// The key elements as labels
		//
		foreach ($data->infoFields as $tablefield) {
		
		    $formField = $this->get('ogam.generic_service')->getTableToFormMapping($tablefield);
		    if (null !== $formField){
    		    $elem = $this->getFormElement($formBuilder, $tablefield, $formField, true);
    		    $elem->setAttribute('class', 'dataedit_key');
    		    $formBuilder->add($elem);
		    }
		}
		
		//
		// The editable elements as form fields
		//
		foreach ($data->editableFields as $tablefield) {
		
		    // Hardcoded value : We don't edit the line number (it's a technical element)
		    if ($tablefield->getData()->getData() !== "LINE_NUMBER") {

		        $formField = $this->get('ogam.generic_service')->getTableToFormMapping($tablefield);
		        if (null !== $formField){
    		        $elem = $this->getFormElement($formBuilder, $tablefield, $formField, false);
    		        $elem->setAttribute('class', 'dataedit_field');
    		        $formBuilder->add($elem);
		        }
		    }
		}
		
		//
		// Add the submit element
		//
		$formBuilder->add('submit', FType\SubmitType::class, array('label' => 'Submit'));

        return $formBuilder->getForm();
    }
    
    /**
     * Save the edited data in database.
     *
     * @return the HTML view
     * @Route("/ajax-validate-edit-data", name="dataedition_validate_edit_data")
     */
    public function ajaxValidateEditDataAction(Request $request) {
        // Get the mode
        $mode = $request->request->getAlpha('MODE');
        
        // Get back info from the session
        $websiteSession = $request->getSession()/*->getBag('website')*/;
        $data = $websiteSession->get('data');

        // Validate the form
        $form = $this->getEditDataForm($data, $mode);
        
        //$form->handleRequest($request);
        //$form->submit($request->request->all(), false);
        foreach($form->all() as $field) {
            $value = $request->request->get($form->getName(),null);
            if (null !== $value){
                $field->submit($value);
            }
        }
        $form->submit(null,true);
        
        if (!$form->isSubmitted()){
            return $this->json(['success' => false, 'errorMessage'=>'not submit']);
        }
        
        if (!$form->isValid()) {
        /*
            // On réaffiche le formulaire avec les messages d'erreur
            $view->form = $form;
            $view->ancestors = $websiteSession->get('ancestors');
            $view->tableFormat = $data->tableFormat;
            $view->data = $data;
            $view->children = $websiteSession->get('children');
            $view->message = '';
            $view->mode = $mode;
        */

            return $this->json(['success' => false, 'errorMessage'=> $this->get('translator')->trans("Invalid form"), 'errors'=> $form->getErrors(true,true)]);
        } else {
        
            try {
                $genericModel =$this->get('ogam.manager.generic');
                if ($mode === 'ADD') {
                    // Insert the data
                    $values = $form->getData();
                    // join_keys values must not be erased
                    $joinKeys = $genericModel->getJoinKeys($data);

                    foreach ($data->getFields() as $field) {
                        $isNotJoinKey = !in_array($field->getColumnName(), $joinKeys);

                        if ($isNotJoinKey) {
                            // Update the data descriptor with the values submitted
                            $field->value = $request->request->get($field->getName(),null);
                        }
                    }
        
                    $data = $genericModel->insertData($data);
                } else {
                    // Edit the data
                    $values = $form->getData();
                    // Update the data descriptor with the values submitted (for editable fields only)
                    foreach ($data->getEditableFields() as $field) {
                        $field->value = $request->request->get($field->getName(),null);
                    }
        
                    $genericModel->updateData($data);
                }
                
                $view = ['success'=>true];

                // Manage redirections

                // Check the number of children
                $children = $genericModel->getChildren($data);

                // After a creation if no more children possible
                if (count($children) === 0 && $mode === 'ADD') {
                    // We redirect to the parent
                    $ancestors = $genericModel->getAncestors($data);
                    if (!empty($ancestors)) {
                        $ancestor = $ancestors[0];
                        $redirectURL = '#edition-edit/' . $ancestor->getId();
                    } else {
                        $redirectURL = '#edition-edit/' . $data->getId();
                    }
                    $view['redirectLink'] = $redirectURL;
                } else {
                    // We redirect to the newly created or edited item
                    $view['redirectLink'] = '#edition-edit/' . $data->getId();
                }

                // Add a message
                $view['message'] = $this->get('translator')->trans("Data saved");
                return $this->json($view);
            } catch (Exception $e) {
                $this->logger->err($e->getMessage());
        
                if (stripos($e->getMessage(), 'SQLSTATE[23505]') !== false) {
                    // Traitement du cas d'un doublon pour PostgreSQL
                    return $this->json(['success'=>false, 'errorMessage'=>$this->get('translator')->trans('Error inserting data duplicate key')]);
                } else {
                    // Cas général
                    return $this->json(['success' => false, 'errorMessage' => $e->getMessage()]);
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
    	//$bag = new NamespacedAttributeBag('website','/');
    	//$bag->set('data',)
    	$bag = $request->getSession();
        $response = $this->render('OGAMBundle:DataEdition:edit_data.html.php', array(
    		'dataId' => $data->getId(),
			'tableFormat' => $data->tableFormat,
			'ancestors' => $ancestors,
			'data' => $data,
			'children' => array(), // No children in add mode
			'childrenTableLabels'=> $childrenTableLabels,
			'mode' => $mode,
			'message' => $message,
    	));
    	$bag->replace(array('data' => $data, 'ancestors' => $ancestors));

    	return $response;
    	//$this->render('OGAMBundle:DataEdition:show_add_data.html.twig', array(
    	
    }

    /**
     * AJAX function : Get the AJAX structure corresponding to the edition form.
     *
     * @return JSON The list of forms
     * @Route("/ajax-get-edit-form/{id}", requirements={"id"= ".*"})
     */
    public function ajaxGetEditFormAction(Request $request, $id=null) {

        $data = $this->getDataFromRequest($request);
        
        // Complete the data object with the existing values from the database.
        $genericModel = $this->get('ogam.manager.generic');
        $data = $genericModel->getDatum($data);
        
        // The service used to manage the query module
        $res = $this->getQueryService()->getEditForm($data);
        
        $bag = $request->getSession();
        json_encode($data);
        $ser = new Serializer(array(new ObjectNormalizer()));
        $ser->normalize($data);// FIXME : treewalker force loading proxy element ...
        $bag->set('data', $data);
        return $this->json($res);
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
        $bag = $request->getSession();
        json_encode($data);
        $ser = new Serializer(array(new ObjectNormalizer()));
        $ser->normalize($data);// FIXME : treewalker force loading proxy element ...
        $bag->set('data', $data);
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
        
        if ($this->has('serializer')) {
            //symfony 3.1 proprerty
            $json = $this->get('serializer')->serialize($data, 'json', array_merge(array(
                'json_encode_options' => 15 /* JsonResponse::DEFAULT_ENCODING_OPTIONS */,//symfony 3.1 proprerty
            ), $context));
            return (new JsonResponse($json, $status, $headers, true))
            ->setContent($json);// to prior 3.1...
        }
        return new JsonResponse($data, $status, $headers);
    }
}
