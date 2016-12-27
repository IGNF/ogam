<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;

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
	 * Build and return the user change password form.
	 *
	 * @param User $user
	 *        	a provider
	 * @return a Form
	 */
	protected function getChangePasswordForm($user = null) {
		$formBuilder = $this->createFormBuilder($user, array(
			'data_class' => 'OGAMBundle\Entity\Website\User'
		));

		// non-mapped field for the old password
		$formBuilder->add('oldpassword', PasswordType::class, array(
			'label' => 'Old Password',
			'mapped' => false
		));

		// the password fields
		$formBuilder->add('plainPassword', RepeatedType::class, array(
			'type' => PasswordType::class,
			'first_options' => array(
				'label' => 'New Password'
			),
			'second_options' => array(
				'label' => 'Confirm Password'
			)
		));

		// submit button
		$formBuilder->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));

		return $formBuilder->getForm();
	}

	/**
	 * Show the change password form.
	 *
	 * @Route("/changePassword", name = "user_changepassword")
	 */
	public function changePasswordAction(Request $request) {
		$logger = $this->get('logger');
		$logger->debug('changePasswordAction');

		// Get the current user
		$user = $this->getUser();

		// Get the change password form
		$form = $this->getChangePasswordForm($user);

		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			// $form->getData() holds the submitted values
			// but, the original `$user` variable has also been updated
			$user = $form->getData();

			// Check that the old password is correct
			$encoder = $this->get('ogam.challenge_response_encoder');
			$oldPassword = $form->get('oldpassword')->getData();
			$cryptedOldPassword = $encoder->encodePassword($oldPassword, '');

			if ($user->getPassword() !== $cryptedOldPassword) {
				$this->addFlash('error', "Old password is not correct");
				return $this->redirectToRoute('homepage');
			}

			// Encrypt the password if in creation mode
			if (!empty($user->getPlainPassword())) {
				$password = $encoder->encodePassword($user->getPlainPassword(), '');
				$user->setPassword($password);
			}

			// Save the user
			$em = $this->getDoctrine()->getManager();
			$em->persist($user);
			$em->flush();

			$this->addFlash('success', 'Your password has been changed.');

			return $this->redirectToRoute('homepage');
		}

		return $this->render('OGAMBundle:User:change_password.html.twig', array(
			'form' => $form->createView()
		));
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
		return $this->render('OGAMBundle:User:login_form.html.twig', array(
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
	 * Validate the login.
	 *
	 * @Route("/validateLogin", name = "user_validatelogin")
	 */
	public function validateLoginAction() {
		// Nothing to do, the security module redirects automatically to the homepage (cf security.yml)
		return new Response();
	}
}
