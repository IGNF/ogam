<?php
namespace Ign\Bundle\OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ChangeUserPasswordType extends AbstractType {

	/**
	 * Build the user change password form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {

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
