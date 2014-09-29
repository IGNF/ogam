<?php
/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
require_once 'AbstractOGAMController.php';

class IndexedpdffileController extends AbstractOGAMController {
	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "indexedpdffile";
		$websiteSession->moduleLabel = "Indexed PDF Files";
		$websiteSession->moduleURL = "indexedpdffile";
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
		if (empty($permissions) || !array_key_exists('INDEX_FILE', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : INDEX_FILE');
		}
	}

	public function indexAction() {
		// action body
		$this->logger->debug('Indexedpdffile index');
	}

	public function listAction() {

		$indexKey = $this->_getParam("INDEX_KEY");
		$config = Zend_Registry::get('configuration');

		$filesList = AbstractOGAMController::getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');

		if(count($filesList)>0) { // make sure the glob array has something in it
			$this->view->files = $filesList;
		}else {
			$this->view->message = 'No files found.<br />';
		}
		$this->view->indexKey = $indexKey;
	}

	public function viewpdfAction(){
		$pdfPath = urldecode($this->_request->getParam('file'));
		$pdf = Zend_Pdf::load($pdfPath);

		// Short File name
		$splitedFilename = preg_split("/[\\/\\\\]+/",$pdfPath);
		$shortFileName = $splitedFilename[count($splitedFilename)- 1];

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

		$this->getResponse()->setHeader('Content-type', 'application/pdf;');
		$this->getResponse()->setHeader('Content-Disposition', 'attachment; filename='.$shortFileName);
		echo $pdf->render();
	}

	public function viewmetaAction()
	{
		$pdfPath = urldecode($this->_request->getParam('file'));
		$indexKey = $this->_getParam("INDEX_KEY");

		$pdf = Zend_Pdf::load($pdfPath);

		$this->view->file = $pdfPath;
		$this->view->indexKey = $indexKey;
		$config = Zend_Registry::get('configuration');
		foreach($pdf->properties as $name => $value){
			$pdf->properties[$name] = iconv($config->indices->$indexKey->filesCharset,'UTF-8', $value);
		}
		$this->view->metaValues = $pdf->properties;
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
				return $this->_helper->redirector('list', 'indexedpdffile', '', array())->setCode(301);
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