<?php
namespace Ign\Bundle\OGAMBundle\EventListener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Translation\TranslatorInterface;

class AjaxErrorListener {

    protected $translator;
    
    public function __construct(TranslatorInterface $translator) {
        $this->translator = $translator;
    }
    
	/**
	 * Handles security related exceptions.
	 *
	 * @param GetResponseForExceptionEvent $event
	 *        	An GetResponseForExceptionEvent instance
	 */
	public function onKernelException(GetResponseForExceptionEvent $event) {
		$exception = $event->getException();
		$request = $event->getRequest();
		
		if (true && $event->isMasterRequest() && $request->isXmlHttpRequest()) {
			if ($exception instanceof AuthenticationException || $exception instanceof AccessDeniedException) {
				$response = array(
				    'errorMessage' => $this->translator->trans('Please login'),
					'success' => false
				);
				$event->setResponse(new JsonResponse($response, 401));
			} else {
				$response = array(
				    'errorMessage' => $this->translator->trans('Application error'),
					'success' => false
				);
				$event->setResponse(new JsonResponse($response, 500));
			}
		}
	}
}