<?php
namespace Ign\Bundle\OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ChangePasswordType extends AbstractType {

	/**
	 * Build the user change password form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {

		// add the password fields
		$builder->add('plainPassword', RepeatedType::class, array(
			'type' => PasswordType::class,
			'first_options' => array(
				'label' => 'Password'
			),
			'second_options' => array(
				'label' => 'Confirm Password'
			)
		))->add('submit', SubmitType::class, array(
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
