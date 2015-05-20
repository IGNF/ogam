<?php
require_once 'Zend/Application.php';
require_once 'Zend/Test/PHPUnit/ControllerTestCase.php';

/**
 * Test case for a controller.
 */
abstract class ControllerTestCase extends Zend_Test_PHPUnit_ControllerTestCase {

	protected $application;

	protected $logger;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		if ($this->application == null) {
			$this->application = new Zend_Application(APPLICATION_ENV, APPLICATION_PATH . '/configs/application.ini');
			$this->application->bootstrap();
			
			$bootstrap = $this->application->getBootstrap();
			$front = $bootstrap->getResource('FrontController');
			$front->setParam('bootstrap', $bootstrap);
		}
		
		$this->logger = Zend_Registry::get("logger");
		
		// Force the cache usage to false
		$configuration = Zend_Registry::get("configuration");
		$configuration->useCache = false;
	}
}