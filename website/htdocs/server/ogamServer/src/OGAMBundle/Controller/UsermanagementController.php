<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use OGAMBundle\Entity\Website\Provider;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use OGAMBundle\Entity\Website\Role;

/**
 * @Route("/usermanagement")
 */
class UsermanagementController extends Controller {

	/**
	 * @Route("/", name = "usermanagement_home")
	 */
	public function indexAction() {
		return $this->render('OGAMBundle:UsermanagementController:index.html.twig', array());
	}

	/**
	 * Build and return the provider form.
	 *
	 * @param Provider $provider
	 *        	a provider
	 * @return a Form
	 */
	protected function getProviderForm($provider = null) {
		$formBuilder = $this->createFormBuilder($provider);

		$formBuilder->add('id', HiddenType::class);
		$formBuilder->add('label', TextType::class, array(
			'label' => 'Label'
		));
		$formBuilder->add('definition', TextareaType::class, array(
			'label' => 'Definition',
			'required' => false
		));
		$formBuilder->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));

		return $formBuilder->getForm();
	}

	/**
	 * Build and return the role form.
	 *
	 * @param Role $role
	 *        	a role
	 * @return a Form
	 */
	protected function getRoleForm($role = null) {
		$formBuilder = $this->createFormBuilder($role);

		$formBuilder->add('code', TextType::class, array(
			'label' => 'Code'
		));

		$formBuilder->add('label', TextType::class, array(
			'label' => 'Label'
		));
		$formBuilder->add('definition', TextType::class, array(
			'label' => 'Definition',
			'required' => false
		));
		$formBuilder->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));

		return $formBuilder->getForm();
	}

	/**
	 * Delete a provider.
	 *
	 * @Route("/deleteProvider/{id}", name="usermanagement_deleteProvider", requirements={"id": "[1-9][0-9]*"})
	 */
	public function deleteProviderAction($id) {
		$providerRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Provider', 'website');
		$provider = $providerRepo->find($id);

		if ($provider == null) {
			$this->addFlash('error', 'The provider does not exist.');
			return $this->redirectToRoute('usermanagement_showProviders');
		}

		$em = $this->getDoctrine()->getManager();
		$em->remove($provider);
		$em->flush();

		$this->addFlash('success', 'The provider has been deleted.');

		return $this->redirectToRoute('usermanagement_showProviders');
	}

	/**
	 * Delete a role.
	 *
	 * @Route("/deleteRole/{code}", name="usermanagement_deleteRole")
	 */
	public function deleteRoleAction($code) {
		$roleRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Role', 'website');
		$role = $roleRepo->find($code);

		if ($role == null) {
			$this->addFlash('error', 'The role does not exist.');
			return $this->redirectToRoute('usermanagement_showRoles');
		}

		$em = $this->getDoctrine()->getManager();
		$em->remove($role);
		$em->flush();

		$this->addFlash('success', 'The role has been deleted.');

		return $this->redirectToRoute('usermanagement_showRoles');
	}

	/**
	 * @Route("/deleteUser")
	 */
	public function deleteUserAction() {
		return $this->render('OGAMBundle:UsermanagementController:delete_user.html.twig', array());
		// ...
	}

	/**
	 * @Route("/showChangePassword")
	 */
	public function showChangePasswordAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_change_password.html.twig', array());
		// ...
	}

	/**
	 * Edit a provider.
	 *
	 * @Route("/editProvider/{id}", name="usermanagement_editProvider", requirements={"id": "[1-9][0-9]*"})
	 */
	public function editProviderAction(Request $request, $id = null) {
		$provider = new Provider();

		$logger = $this->get('logger');
		$logger->debug('editProviderAction');

		if ($id != null) {
			$providerRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Provider', 'website');
			$provider = $providerRepo->find($id);
		}

		// Get the provider form
		$form = $this->getProviderForm($provider);

		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			// $form->getData() holds the submitted values
			// but, the original `$provider` variable has also been updated
			$provider = $form->getData();

			$logger->debug('provider : ' . \Doctrine\Common\Util\Debug::dump($provider, 3, true, false));

			// Save the provider
			$em = $this->getDoctrine()->getManager();
			$em->persist($provider);
			$em->flush();

			$this->addFlash('success', 'The provider information has been saved.');

			return $this->redirectToRoute('usermanagement_showProviders');
		}

		return $this->render('OGAMBundle:UsermanagementController:show_edit_provider.html.twig', array(
			'form' => $form->createView()
		));
	}

	/**
	 * Edit a role.
	 *
	 * @Route("/editRole/{code}", name="usermanagement_editRole")
	 */
	public function editRoleAction(Request $request, $code = null) {
		$role = new Role();

		$logger = $this->get('logger');
		$logger->debug('editRoleAction');

		if ($code != null) {
			$roleRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Role', 'website');
			$role = $roleRepo->find($code);
		}

		// Get the role form
		$form = $this->getRoleForm($role);

		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			// $form->getData() holds the submitted values
			// but, the original `$provider` variable has also been updated
			$role = $form->getData();

			$logger->debug('provider : ' . \Doctrine\Common\Util\Debug::dump($role, 3, true, false));

			// Save the provider
			$em = $this->getDoctrine()->getManager();
			$em->persist($role);
			$em->flush();

			$this->addFlash('success', 'The role information has been saved.');

			return $this->redirectToRoute('usermanagement_showRoles');
		}

		return $this->render('OGAMBundle:UsermanagementController:show_edit_role.html.twig', array(
			'form' => $form->createView()
		));
	}

	/**
	 * @Route("/showCreateUser")
	 */
	public function showCreateUserAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_create_user.html.twig', array());
		// ...
	}

	/**
	 * Show the list of providers.
	 *
	 * @Route("/showProviders", name="usermanagement_showProviders")
	 */
	public function showProvidersAction() {
		$logger = $this->get('logger');
		$logger->info('showProvidersAction');

		// Get the list of providers
		$providersRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Provider', 'website');
		$providers = $providersRepo->findAll();

		// Calculate if each provider can be deleted or not
		$isDeletableProvider = array();
		foreach ($providers as $provider) {

			$isDeletable = true;

			// If a user is using this provider then we cannot delete
			$usersRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
			$users = $usersRepo->findByProvider($provider->getId());
			if (count($users) > 0) {
				$isDeletable = false;
			}

			// TODO : No active submission

			// TODO : No data in database

			$isDeletableProvider[$provider->getId()] = $isDeletable;
		}

		return $this->render('OGAMBundle:UsermanagementController:show_providers.html.twig', array(
			'providers' => $providers,
			'isDeletableProvider' => $isDeletableProvider
		));
	}

	/**
	 * Show the detail of a provider.
	 *
	 * @Route("/showProviderContent/{id}", name="usermanagement_showProviderContent")
	 *
	 * @param Integer $id
	 *        	the id of a provider
	 */
	public function showProviderContentAction($id) {
		$logger = $this->get('logger');
		$logger->info('showProviderContentAction');

		$logger->info('id : ' . $id);

		// Get the provider detail
		$providersRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Provider', 'website');
		$provider = $providersRepo->find($id);

		$logger->info('provider : ' . \Doctrine\Common\Util\Debug::dump($provider, 3, true, false));

		// Get the users linked to this provider
		$usersRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
		$users = $usersRepo->findByProvider($provider->getId());

		// Get the submissions linked to this provider
		$submissionsRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\RawData\Submission', 'raw_data');
		$submissions = $submissionsRepo->findByProvider($provider->getId());

		$logger->info('submissions : ' . \Doctrine\Common\Util\Debug::dump($submissions, 3, true, false));

		// Get the raw data linked to this provider

		return $this->render('OGAMBundle:UsermanagementController:show_provider_content.html.twig', array(
			'provider' => $provider,
			'users' => $users,
			'submissions' => $submissions
		));
	}

	/**
	 * @Route("/showRoles", name="usermanagement_showRoles")
	 */
	public function showRolesAction() {
		$logger = $this->get('logger');
		$logger->info('showRolesAction');

		// Get the list of roles
		$rolesRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Role', 'website');
		$roles = $rolesRepo->findAll();

		// Calculate if each role can be deleted or not
		$isDeletableRole = array();
		foreach ($roles as $role) {

			$isDeletable = true;

			// If a user is using this role then we cannot delete
			$roleRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Role', 'website');
			$nbUsers = $roleRepo->userCount($role->getCode());
			if ($nbUsers > 0) {
				$isDeletable = false;
			}

			$isDeletableRole[$role->getCode()] = $isDeletable;
		}

		return $this->render('OGAMBundle:UsermanagementController:show_roles.html.twig', array(
			'roles' => $roles,
			'isDeletableRole' => $isDeletableRole
		));
	}

	/**
	 * @Route("/showUsers", name="usermanagement_showUsers")
	 */
	public function showUsersAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_users.html.twig', array());
		// ...
	}
}
