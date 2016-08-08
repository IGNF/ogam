<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

class UserController extends Controller
{
    /**
     * Default action.
     *
     * @Route("user/")
     */
    public function indexAction(Request $request)
    {
    	// Display the login form by default
        return $this->showLoginFormAction($request);
    }

    /**
     * Logout.
     *
     * @Route("user/logout")
     */
    public function logoutAction()
    {
        return $this->render('OGAMBundle:User:logout.html.twig', array(
            // ...
        ));
    }

    /**
     * Show the change password form.
     *
     * @Route("user/showChangePassword")
     */
    public function showChangePasswordAction()
    {
        return $this->render('OGAMBundle:User:show_change_password.html.twig', array(
            // ...
        ));
    }

    /**
     *  Display the login form.
     *
     *  @Route("user/login")
     */
    public function showLoginFormAction(Request $request)
    {

        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        // generate a new challenge
        $encoder = $this->get('ogam.challengeresponseencoder');
        $challenge = $encoder->generateChallenge();

        // Store the challenge in session
        $session = $request->getSession();
        $session->set('challenge', $challenge);

        $logger = $this->get('logger');
        $logger->info('Challenge : ' . $challenge);
        $logger->info('lastUsername : ' . $lastUsername);
        $logger->info('error : ' . $error);

        // Display the login form
        return $this->render('OGAMBundle:User:show_login_form.html.twig',
        	array(
        		// last username entered by the user
        		'last_username' => $lastUsername,
        		'error'         => $error,
        		'challenge'	=> $challenge
        	)
        );
    }

    /**
     * Validate the password change.
     *
     * @Route("user/changePassword")
     */
    public function validateChangePasswordAction()
    {
        return $this->render('OGAMBundle:User:validate_change_password.html.twig', array(
            // ...
        ));
    }

    /**
     * Validate the login.
     *
     * @Route("user/validateLogin")
     */
    public function validateLoginAction()
    {
        return $this->render('OGAMBundle:User:validate_login.html.twig', array(
            // ...
        ));
    }

}
