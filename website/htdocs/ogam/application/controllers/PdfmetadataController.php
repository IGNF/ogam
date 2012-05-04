<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';
require_once '../application/form/PdfMeta.php';

class PdfmetadataController extends AbstractOGAMController {
	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "user";
		$websiteSession->moduleLabel = "File Indexation";
		$websiteSession->moduleURL = "fileindexation";
	}
	
	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$role = $userSession->role;
		if (empty($permissions) || !array_key_exists('INDEX_FILE', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : INDEX_FILE');
		}
	}

    public function indexAction() {
    // action body
        $this->logger->debug('Pdfmetadata index');
    }

    public function listAction() {

    	$indexKey = $this->_getParam("INDEX_KEY");
        $config = Zend_Registry::get('configuration');

    	$globOut = array();
	    foreach ($config->indices->$indexKey->filesDirectories as $filesDirectory) {
	        $globOut = array_merge($globOut, glob($filesDirectory . '*.pdf'));
        }
        if(count($globOut)>0) { // make sure the glob array has something in it
            $this->view->files = $globOut;
        }else {
            $this->view->message = 'No files found.<br />';
        }
        $this->view->indexKey = $indexKey;
    }

    public function viewmetaAction()
    {
        $pdfPath = urldecode($this->_request->getParam('file'));
        $indexKey = $this->_getParam("INDEX_KEY");
        
        $pdf = Zend_Pdf::load($pdfPath);

        $this->view->file = $pdfPath;
        $this->view->indexKey = $indexKey;
        $this->view->metaValues = $pdf->properties;
        
        $config = Zend_Registry::get('configuration');
        $this->getResponse()->setHeader('Content-type', 'text/html; charset='.$config->indices->$indexKey->filesCharset);
        
    }

    // TODO: Rebuild this function to edit a dynamic metadata form
    public function editmetaAction()
    {
        // Get the form and send to the view.
        $form = new Form_PdfMeta();
        $this->view->form = $form;

        // Get the file and send the location to the view.
        $pdfPath          = urldecode($this->_request->getParam('file'));
        $file             = substr($pdfPath, strrpos($pdfPath, SLASH)+1);
        $this->view->file = $file;

        // Define what meta data we are looking at.
        $metaValues = array('Title'    => '',
                            'Author'   => '',
                            'Subject'  => '',
                            'Keywords' => '',
        );

        if ($this->_request->isPost()) {
            // Get the current form values.
            $formData = $this->_request->getPost();
            if ($form->isValid($formData)) {
                // Form values are valid.

                // Save the contents of the form to the associated meta data fields in the PDF.
                $pdf = Zend_Pdf::load($pdfPath);
                foreach ($metaValues as $meta => $metaValue) {
                    if (isset($formData[$meta])) {
                        $pdf->properties[$meta] = $formData[$meta];
                    } else {
                        $pdf->properties[$meta] = '';
                    }
                }
                $pdf->save($pdfPath);

                // Add to/update index.
                $config = Zend_Registry::get('configuration');
                $appLucene = Genapp_Search_Lucene::open($config->luceneIndex);
                $index = Genapp_Search_Lucene_Index_Pdfs::index($pdfPath, $appLucene);

                // Redirect the user to the list action of this controller.
                return $this->_helper->redirector('list', 'pdfmetadata', '', array())->setCode(301);
            } else {
                // Form values are not valid send the current values to the form.
                $form->populate($formData);
            }
        } else {
            // Make sure the file exists before we start doing anything with it.
            if (file_exists($pdfPath)) {
                // Extract any current meta data values from the PDF document
                $pdf = Zend_Pdf::load($pdfPath);
                foreach ($metaValues as $meta => $metaValue) {
                    if (isset($pdf->properties[$meta])) {
                        $metaValues[$meta] = $pdf->properties[$meta];
                    } else {
                        $metaValues[$meta] = '';
                    }
                }
                // Populate the form with out metadata values.
                $form->populate($metaValues);
            } else {
                // File doesn't exist.
            }
        }
    }
}