<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Route("/user")
 */
class UserController extends Controller {

	/**
	 * Default action.
	 *
	 * @Route("/", name = "user_home")
	 */
	public function indexAction(Request $request) {
		// Display the login form by default
		return $this->showLoginFormAction($request);
	}

	/**
	 * Show the change password form.
	 *
	 * @Route("/showChangePassword", name = "user_showchangepassword")
	 */
	public function showChangePasswordAction() {
		// TODO
		return $this->render('OGAMBundle:User:show_change_password.html.twig', array()
		// ...
		);
	}

	/**
	 * Display the login form.
	 *
	 * @Route("/login", name = "user_login")
	 */
	public function showLoginFormAction(Request $request) {
		$authenticationUtils = $this->get('security.authentication_utils');

		// get the login error if there is one
		$error = $authenticationUtils->getLastAuthenticationError();

		// last username entered by the user
		$lastUsername = $authenticationUtils->getLastUsername();

		// generate a new challenge
		$encoder = $this->get('ogam.challenge_response_encoder');
		$challenge = $encoder->generateChallenge();

		// Store the challenge in session
		$session = $request->getSession();
		$session->set('challenge', $challenge);

		// Display the login form
		return $this->render('OGAMBundle:User:show_login_form.html.twig', array(
			// last username entered by the user
			'last_username' => $lastUsername,
			'error' => $error,
			'challenge' => $challenge
		));
	}

	/**
	 * Logout.
	 *
	 * @Route("/logout", name = "user_logout")
	 */
	public function logoutAction() {
		// Nothing to do, the security module redirects automatically to the homepage (cf security.yml)
	}

	/**
	 * Validate the password change.
	 *
	 * @Route("/changePassword", name = "user_validatechangepassword")
	 */
	public function validateChangePasswordAction() {
		return $this->render('OGAMBundle:User:validate_change_password.html.twig', array()
		// ...
		);
	}

	/**
	 * Validate the login.
	 *
	 * @Route("/validateLogin", name = "user_validatelogin")
	 */
	public function validateLoginAction() {
		// Nothing to do, the security module redirects automatically to the homepage (cf security.yml)

		return new Response();
	}
}
