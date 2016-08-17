<?php
namespace OGAMBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Request;

class BreadcrumbListener implements EventSubscriberInterface {

	// The breadcrumbs service
	private $breadcrumbs;

	public function __construct($breadcrumbs) {
		$this->breadcrumbs = $breadcrumbs;
	}

	public function onKernelRequest(GetResponseEvent $event) {
		$request = $event->getRequest();

		$controllerName = $this->getControllerName($request);
		$actionName = $this->getActionName($request);

		$this->breadcrumbs->addItem("Home", "/");

		if (!empty($controllerName) && ($controllerName != "Default")) {
			$this->breadcrumbs->addItem($controllerName, "/" . strtolower($controllerName));
		}
		if (!empty($actionName) && ($actionName != "index")) {
			$this->breadcrumbs->addItem($actionName, strtolower($actionName));

			// $this->breadcrumbs->addItem($actionName, $this->get("router")->generate("$actionName"));
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
