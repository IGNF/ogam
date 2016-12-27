<?php
namespace OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserType extends AbstractType {

	/**
	 * Build the user form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {
		$builder->add('login', TextType::class, array(
			'label' => 'Login',
			'read_only' => $user ? $user->getLogin() != null : false
		));

		// add the password fields in creation mode only
		if ($options['user'] == null || $options['user']->getLogin() == null) {
			$builder->add('plainPassword', RepeatedType::class, array(
				'type' => PasswordType::class,
				'first_options' => array(
					'label' => 'Password'
				),
				'second_options' => array(
					'label' => 'Confirm Password'
				)
			));
		}

		$builder->add('username', TextType::class, array(
			'label' => 'User Name'
		));

		// Provider
		$builder->add('provider', EntityType::class, array(
			'label' => 'Provider',
			'class' => 'OGAMBundle\Entity\Website\Provider',
			'choice_label' => 'label',
			'multiple' => false
		));

		$builder->add('email', EmailType::class, array(
			'label' => 'Email'
		));

		// Roles
		$builder->add('roles', EntityType::class, array(
			'label' => 'Roles',
			'class' => 'OGAMBundle\Entity\Website\Role',
			'choice_label' => 'label',
			'multiple' => true,
			'expanded' => true
		));

		$formBuilder->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));
	}

	/**
	 *
	 * @param OptionsResolver $resolver
	 */
	public function configureOptions(OptionsResolver $resolver) {
		$resolver->setDefaults(array(
			'data_class' => 'OGAMBundle\Entity\Website\User'
		));
	}
}
