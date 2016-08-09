<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * @Route("/usermanagement")
 */
class UsermanagementControllerController extends Controller {

	/**
	 * @Route("/", name = "usermanagement_home")
	 */
	public function indexAction() {
		return $this->render('OGAMBundle:UsermanagementController:index.html.twig', array());
	}

	/**
	 * @Route("/deleteProvider")
	 */
	public function deleteProviderAction() {
		return $this->render('OGAMBundle:UsermanagementController:delete_provider.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/deleteRole")
	 */
	public function deleteRoleAction() {
		return $this->render('OGAMBundle:UsermanagementController:delete_role.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/deleteUser")
	 */
	public function deleteUserAction() {
		return $this->render('OGAMBundle:UsermanagementController:delete_user.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showChangePassword")
	 */
	public function showChangePasswordAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_change_password.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showCreateProvider")
	 */
	public function showCreateProviderAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_create_provider.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showCreateRole")
	 */
	public function showCreateRoleAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_create_role.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showCreateUser")
	 */
	public function showCreateUserAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_create_user.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showProviders", name="usermanagement_showProviders")
	 */
	public function showProvidersAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_providers.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showRoles", name="usermanagement_showRoles")
	 */
	public function showRolesAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_roles.html.twig', array()
		// ...
		);
	}

	/**
	 * @Route("/showUsers", name="usermanagement_showUsers")
	 */
	public function showUsersAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_users.html.twig', array()
		// ...
		);
	}
}
