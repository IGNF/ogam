<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use OGAMBundle\Entity\Website\Provider;

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
	 * Build and return the provider form.
	 *
	 * @param Provider $provider
	 *        	a provider
	 * @return a Form
	 */
	protected function getProviderForm($provider = null) {
		$formBuilder = $this->createFormBuilder($provider);

		$formBuilder->add('label', TextType::class);
		$formBuilder->add('definition', DateType::class);
		$formBuilder->add('save', SubmitType::class, array(
			'label' => 'Validate'
		));

		return $formBuilder->getForm();
	}

	/**
	 * @Route("/deleteProvider", name="usermanagement_deleteProvider")
	 */
	public function deleteProviderAction() {
		return $this->render('OGAMBundle:UsermanagementController:delete_provider.html.twig', array());
		// ...
	}

	/**
	 * @Route("/deleteRole")
	 */
	public function deleteRoleAction() {
		return $this->render('OGAMBundle:UsermanagementController:delete_role.html.twig', array());
		// ...
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
	 * @Route("/showEditProvider", name="usermanagement_showEditProvider")
	 */
	public function showEditProviderAction(Request $request) {
		$provider = new Provider();

		$logger = $this->get('logger');
		$logger->debug('showEditProviderAction');

		// Get the provider form
		$form = $this->getProviderForm();

		$logger->debug('form : ' . \Doctrine\Common\Util\Debug::dump($form, 3, true, false));

		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			// $form->getData() holds the submitted values
			// but, the original `$provider` variable has also been updated
			$provider = $form->getData();

			$logger->debug('provider : ' . \Doctrine\Common\Util\Debug::dump($provider, 3, true, false));

			// ... perform some action, such as saving the task to the database
			// for example, if Task is a Doctrine entity, save it!
			// $em = $this->getDoctrine()->getManager();
			// $em->persist($task);
			// $em->flush();

			$this->addFlash('success', 'The provider information has been saved.');

			return $this->redirectToRoute('usermanagement_home');
		}

		return $this->render('OGAMBundle:UsermanagementController:show_edit_provider.html.twig', array(
			'form' => $form->createView()
		));
	}

	/**
	 * @Route("/showCreateRole")
	 */
	public function showCreateRoleAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_create_role.html.twig', array());
		// ...
	}

	/**
	 * @Route("/showCreateUser")
	 */
	public function showCreateUserAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_create_user.html.twig', array());
		// ...
	}

	/**
	 * @Route("/showProviders", name="usermanagement_showProviders")
	 */
	public function showProvidersAction() {
		$logger = $this->get('logger');
		$logger->info('showProvidersAction');

		// Get the list of providers
		$providersRepo = $this->getDoctrine()->getRepository('OGAMBundle\Entity\Website\Provider', 'website');
		$providers = $providersRepo->findAll();

		// Calculate if teach provider can be deleted or not
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
	 * @Route("/showProviderContent", name="usermanagement_showProviderContent")
	 */
	public function showProviderContentAction(Request $request) {
		$logger = $this->get('logger');
		$logger->info('showProviderContentAction');

		$id = (int) $request->query->get('id');

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
		return $this->render('OGAMBundle:UsermanagementController:show_roles.html.twig', array());
		// ...
	}

	/**
	 * @Route("/showUsers", name="usermanagement_showUsers")
	 */
	public function showUsersAction() {
		return $this->render('OGAMBundle:UsermanagementController:show_users.html.twig', array());
		// ...
	}
}
