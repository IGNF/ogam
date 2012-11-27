<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * ErrorController
 * @package controllers
 */
// Don't extends the AbstractOGAMController because of the predispatch redirection
class ErrorController extends Zend_Controller_Action {

	/**
	 * The logger
	 */
	protected $logger;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		$bootstrap = $this->getInvokeArg('bootstrap');
		$this->logger = $bootstrap->getResource('log');

	}

	/**
	 * errorAction() is the action that will be called by the "ErrorHandler"
	 * plugin.  When an error/exception has been encountered
	 * in a ZF MVC application (assuming the ErrorHandler has not been disabled
	 * in your bootstrap) - the Errorhandler will set the next dispatchable
	 * action to come here.  This is the "default" module, "error" controller,
	 * specifically, the "error" action.  These options are configurable.
	 *
	 * @see http://framework.zend.com/manual/en/zend.controller.plugins.html
	 *
	 * @return void
	 */
	public function errorAction() {

		// Ensure the default view suffix is used so we always return good
		// content
		$this->_helper->viewRenderer->setViewSuffix('phtml');

		// Grab the error object from the request
		$error = $this->_getParam('error_handler');

		// Log the error
		$this->logger->err('Error : '.$error->exception);

		// pass the environment to the view script so we can conditionally
		// display more/less information
		$this->view->env = $this->getInvokeArg('env');

		// pass the actual exception object to the view
		$this->view->exception = $error->exception;

		// pass the request to the view
		$this->view->request = $error->request;

		// Clean the response body
		$this->_response->clearBody();

		// $errors will be an object set as a parameter of the request object,
		// type is a property
		switch ($error->type) {
			case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
			case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:
				$this->_noActionException($error);
				break;
			default:
				// Switch on the exception type
				switch (get_class($error->exception)) {
					case 'Zend_Auth_Exception' :
						$this->_authException($error);
						break;
					case 'Zend_Db_Exception' :
						$this->_databaseException($error);
						break;
					default:
						$this->_defaultException($error);
					break;
			}
		}

	}

	/**
	 * Manage "No action" or "No controller" exceptions.
	 *
	 * @param the error
	 */
	private function _noActionException($error) {
		// 404 error -- controller or action not found
		$this->getResponse()->setHttpResponseCode(404);
		$this->view->message = 'Page not found';

		// Go to the error page
		$this->render('error');
	}

	/**
	 * Manage database exceptions.
	 *
	 * @param the error
	 */
	private function _databaseException($error) {
		// 404 error -- controller or action not found
		$this->getResponse()->setHttpResponseCode(403);
		$this->view->message = 'Database Error';

		// Go to the error page
		$this->render('error');
	}

	/**
	 * Manage authentication exceptions.
	 *
	 * @param the error
	 */
	private function _authException($error) {

		$this->logger->err('_authException');

		if ($this->getRequest()->isXmlHttpRequest()) {
			// We come from a AJAX request
			echo '{"success":false,"errorMessage":'.json_encode($error->exception->getMessage()).'}';
				
			// No View, we send directly the JSON
			$this->_helper->layout()->disableLayout();
			$this->_helper->viewRenderer->setNoRender();
			$this->getResponse()->setHeader('Content-type', 'application/json');
		} else {
			// We come from a HTML page
			$this->view->message = $error->exception->getMessage();
			$this->render('error');
		}


	}

	/**
	 * Manage other exceptions.
	 *
	 * @param the error
	 */
	private function _defaultException($error) {
		$this->getResponse()->setHttpResponseCode(500);
		$this->view->message = 'Application error';

		// Go to the error page
		$this->render('error');
	}
}
