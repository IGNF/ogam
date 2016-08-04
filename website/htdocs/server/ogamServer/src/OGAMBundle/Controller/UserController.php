<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class UserController extends Controller
{
    /**
     * Default action.
     *
     * @Route("user/")
     */
    public function indexAction()
    {
    	// Display the login form by default
        return $this->showLoginFormAction();
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
    public function showLoginFormAction()
    {

        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        // TODO : générer un salt
        $login_salt = "90caf35ece5a987d60c7469415cd3855";

        return $this->render(
        	'OGAMBundle:User:show_login_form.html.twig',
        	array(
        		// last username entered by the user
        		'last_username' => $lastUsername,
        		'error'         => $error,
        		'login_salt'	=> $login_salt
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
