<?php
namespace OGAMBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Request;

class BreadcrumbListener implements EventSubscriberInterface {
	
	// The white october breadcrumbs service
	private $breadcrumbs;
	
	// The breadcrumbs config service
	private $breadcrumbsConfig;

	/**
	 * Constructor.
	 *
	 * @param unknown $breadcrumbs        	
	 * @param unknown $breadcrumbsConfig        	
	 */
	public function __construct($breadcrumbs, $breadcrumbsConfig) {
		$this->breadcrumbs = $breadcrumbs;
		$this->breadcrumbsConfig = $breadcrumbsConfig;
	}

	public function onKernelRequest(GetResponseEvent $event) {
		$request = $event->getRequest();
		
		$controllerName = $this->getControllerName($request);
		$actionName = $this->getActionName($request);
		
		// var_dump("controllerName : " . $controllerName);
		// var_dump("actionName : " . $actionName);
		
		$pathItems = $this->breadcrumbsConfig->getPath($controllerName, $actionName);
		
		if ($pathItems) {
			
			foreach ($pathItems as $path) {
				
				$this->breadcrumbs->addItem($path['label'], $this->breadcrumbsConfig->getURL($path));
			}
		}
	}

	/**
	 * Extract the action name.
	 * cf http://stackoverflow.com/questions/22852664/how-can-i-get-the-action-name-in-a-symfony2-controller.
	 *
	 * @return string
	 */
	public function getActionName(Request $request) {
		$action = $request->get('_controller');
		$action = explode('::', $action);
		
		// use this line if you want to remove the trailing "Action" string
		return isset($action[1]) ? preg_replace('/Action$/', '', $action[1]) : false;
		
		// return $action[1];
	}

	/**
	 * Extract the controller name (only for the master request).
	 *
	 * @return string
	 */
	public function getControllerName(Request $request) {
		$controller = $request->get('_controller');
		$controller = explode('::', $controller);
		$controller = explode('\\', $controller[0]);
		
		// use this line if you want to remove the trailing "Controller" string
		return isset($controller[2]) ? preg_replace('/Controller$/', '', $controller[2]) : false;
		
		// return isset($controller[2]) ? $controller[2] : false;
	}

	public static function getSubscribedEvents() {
		return array(
			KernelEvents::REQUEST => array(
				array(
					'onKernelRequest',
					16
				)
			)
		);
	}
}
