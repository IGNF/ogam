<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DefaultController extends Controller {

	/**
	 * @Route("/", name="homepage")
	 */
	public function indexAction() {
		$userRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
		$users = $userRepo->findAll();

		$appRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\ApplicationParameter', 'website');
		$applicationParameters = $appRepo->findAll();

		return $this->render('OGAMBundle:Default:index.html.twig', array(
			'users' => $users,
			'applicationParameters' => $applicationParameters
		));
	}
}
