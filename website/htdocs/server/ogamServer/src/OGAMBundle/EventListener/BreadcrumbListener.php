<?php
namespace OGAMBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class BreadcrumbListener implements EventSubscriberInterface {

	// The breadcrumbs service
	private $breadcrumbs;

	public function __construct($breadcrumbs)
	{
		$this->breadcrumbs = $breadcrumbs;
	}

	public function onKernelRequest(GetResponseEvent $event) {
		$request = $event->getRequest();

		$this->breadcrumbs->addItem("Home", "Home");
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
