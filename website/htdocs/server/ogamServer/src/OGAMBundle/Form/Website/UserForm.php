<?php
namespace OGAMBundle\Form\Website;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;

/**
 * User Form.
 */
class UserForm extends AbstractType {

	public function buildForm(FormBuilderInterface $formBuilder, array $options) {
		$formBuilder->add('login', TextType::class, array(
			'label' => 'Login'
		));

		$formBuilder->add('password', RepeatedType::class, array(
			'type' => PasswordType::class,
			'first_options' => array(
				'label' => 'Password'
			),
			'second_options' => array(
				'label' => 'Confirm Password'
			)
		));

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
	}



	public function configureOptions(OptionsResolver $resolver) {
		$resolver->setDefaults(array(
			'data_class' => 'OGAMBundle\Entity\Website\User'
		));
	}
}
