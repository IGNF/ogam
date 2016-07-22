<?php

namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DefaultController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {

    	$users = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User')->findAll();

        return $this->render('OGAMBundle:Default:index.html.twig', array('users' => $users));
    }
}
