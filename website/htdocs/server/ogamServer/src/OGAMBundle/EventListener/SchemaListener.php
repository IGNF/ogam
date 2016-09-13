<?php
namespace OGAMBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class SchemaListener implements EventSubscriberInterface {

	private $defaultSchema;

	protected $schema;

	public function __construct($defaultSchema = 'RAW_DATA') {
		$this->defaultSchema = $defaultSchema;
	}

	public function onKernelRequest(GetResponseEvent $event) {
		$request = $event->getRequest();
		if (!$request->hasPreviousSession()) {
			return;
		}

		// Detect the "SCHEMA" parameter in URL
		$schema = $request->query->get('SCHEMA');
		if (!empty($schema)) {
			$request->getSession()->set('_schema', $schema);
		} else {
			// If no explicit schema has been set on this request, use one from the session
			$schema = $request->getSession()->get('_schema', $this->defaultSchema);
		}
	}

	public static function getSubscribedEvents() {
		return array(
			// must be registered after the default Locale listener
			KernelEvents::REQUEST => array(
				array(
					'onKernelRequest',
					17
				)
			)
		);
	}
	
	public function getSchema()
	{
		return $this->schema;
	}
}