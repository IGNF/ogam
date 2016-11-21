<?php
namespace OGAMBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use OGAMBundle\Entity\Website\User;
use OGAMBundle\Entity\Website\Role;
use OGAMBundle\Entity\Website\Provider;
use Symfony\Component\Form\Extension\Core\Type\EmailType;

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
	 * Build and return the user form.
	 *
	 * @param User $user
	 *        	a provider
	 * @return a Form
	 */
	protected function getUserForm($user = null) {
		$formBuilder = $this->createFormBuilder($user, array(
			'data_class' => 'OGAMBundle\Entity\Website\User'
		));

		$formBuilder->add('login', TextType::class, array(
			'label' => 'Login'
		));

		// add the password fields in creation mode only
		if ($user == null || $user->getLogin() == null) {
			$formBuilder->add('plainPassword', RepeatedType::class, array(
				'type' => PasswordType::class,
				'first_options' => array(
					'label' => 'Password'
				),
				'second_options' => array(
					'label' => 'Confirm Password'
				)
			));
		}

		$formBuilder->add('username', TextType::class, array(
			'label' => 'User Name'
		));

		// Provider
		$formBuilder->add('provider', EntityType::class, array(
			'label' => 'Provider',
			'class' => 'OGAMBundle\Entity\Website\Provider',
			'choice_label' => 'label',
			'multiple' => false
		));

		$formBuilder->add('email', EmailType::class, array(
			'label' => 'Email'
		));

		// Roles
		$formBuilder->add('roles', EntityType::class, array(
			'label' => 'Roles',
			'class' => 'OGAMBundle\Entity\Website\Role',
			'choice_label' => 'label',
			'multiple' => true,
			'expanded' => true
		));

		$formBuilder->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));

		return $formBuilder->getForm();
	}

	/**
	 * Build and return the user change password form.
	 *
	 * @param User $user
	 *        	a provider
	 * @return a Form
	 */
	protected function getChangeUserPasswordForm($user = null) {
		$formBuilder = $this->createFormBuilder($user, array(
			'data_class' => 'OGAMBundle\Entity\Website\User'
		));

		// add the password fields
		$formBuilder->add('plainPassword', RepeatedType::class, array(
			'type' => PasswordType::class,
			'first_options' => array(
				'label' => 'Password'
			),
			'second_options' => array(
				'label' => 'Confirm Password'
			)
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
			'label' => 'Code',
			'read_only' => $role ? !empty($role->getCode()) : false
		));

		$formBuilder->add('label', TextType::class, array(
			'label' => 'Label'
		));
		$formBuilder->add('definition', TextType::class, array(
			'label' => 'Definition',
			'required' => false
		));

		$formBuilder->add('permissions', EntityType::class, array(
			'label' => 'Permissions',
			'class' => 'OGAMBundle\Entity\Website\Permission',
			'choice_label' => 'label',
			'multiple' => true,
			'expanded' => true
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
	 * @Route("/deleteUser/{login}", name="usermanagement_deleteUser")
	 */
	public function deleteUserAction($login) {
		$userRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
		$user = $userRepo->find($login);

		if ($user == null) {
			$this->addFlash('error', 'The user does not exist.');
			return $this->redirectToRoute('usermanagement_showUsers');
		}

		$em = $this->getDoctrine()->getManager();
		$em->remove($user);
		$em->flush();

		$this->addFlash('success', 'The user has been deleted.');

		return $this->redirectToRoute('usermanagement_showUsers');
	}

	/**
	 * @Route("/changePassword/{login}", name="usermanagement_changePassword")
	 */
	public function changePasswordAction(Request $request, $login) {
		$logger = $this->get('logger');
		$logger->debug('changePasswordAction');

		// Load the user
		$userRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
		$user = $userRepo->find($login);

		// Get the change password form
		$form = $this->getChangeUserPasswordForm($user);

		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			// $form->getData() holds the submitted values
			// but, the original `$user` variable has also been updated
			$user = $form->getData();

			// Encrypt the password if in creation mode
			if (!empty($user->getPlainPassword())) {
				$encoder =  $this->get('ogam.challenge_response_encoder');
				$password = $encoder->encodePassword($user->getPlainPassword(), '');
				$user->setPassword($password);
			}

			// Save the user
			$em = $this->getDoctrine()->getManager();
			$em->persist($user);
			$em->flush();

			$this->addFlash('success', 'The user password information has been saved.');

			return $this->redirectToRoute('usermanagement_showUsers');
		}

		return $this->render('OGAMBundle:UsermanagementController:change_password.html.twig', array(
			'form' => $form->createView(),
			'user' => $user
		));
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

		return $this->render('OGAMBundle:UsermanagementController:edit_provider.html.twig', array(
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

		return $this->render('OGAMBundle:UsermanagementController:edit_role.html.twig', array(
			'form' => $form->createView()
		));
	}

	/**
	 * Edit a user.
	 *
	 * @Route("/editUser/{login}", name="usermanagement_editUser")
	 */
	public function editUserAction(Request $request, $login = null) {
		$user = new User();

		$logger = $this->get('logger');
		$logger->debug('editUserAction');

		if ($login != null) {
			$userRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
			$user = $userRepo->find($login);
		}

		// Get the provider form
		$form = $this->getUserForm($user);

		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			// $form->getData() holds the submitted values
			// but, the original `$user` variable has also been updated
			$user = $form->getData();

			$logger->debug('user : ' . \Doctrine\Common\Util\Debug::dump($user, 3, true, false));

			// Encrypt the password if in creation mode
			if (!empty($user->getPlainPassword())) {
				$password = $this->get('ogam.challenge_response_encoder')->encodePassword($user->getPlainPassword(), '');
				$user->setPassword($password);
			}

			// Save the user
			$em = $this->getDoctrine()->getManager();
			$em->persist($user);
			$em->flush();

			$this->addFlash('success', 'The user information has been saved.');

			return $this->redirectToRoute('usermanagement_showUsers');
		}

		return $this->render('OGAMBundle:UsermanagementController:edit_user.html.twig', array(
			'form' => $form->createView()
		));
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
	 * Show the list of roles.
	 *
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
	 * Show the list of users.
	 *
	 * @Route("/showUsers", name="usermanagement_showUsers")
	 */
	public function showUsersAction() {
		$logger = $this->get('logger');
		$logger->info('showUsersAction');

		// Get the list of roles
		$usersRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\User', 'website');
		$users = $usersRepo->findAll();

		return $this->render('OGAMBundle:UsermanagementController:show_users.html.twig', array(
			'users' => $users
		));
	}
}
