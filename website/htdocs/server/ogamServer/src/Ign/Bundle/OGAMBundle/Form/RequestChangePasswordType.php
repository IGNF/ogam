<?php
namespace Ign\Bundle\OGAMBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Ign\Bundle\OGAMBundle\Entity\Website\User;

class RequestChangePasswordType extends AbstractType {

	/**
	 * Build the form used to request a password reset.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {

		// add the email fields
		$builder->add('email', EmailType::class, array(
			'label' => 'Email'
		));
	}

	/**
	 *
	 * @param OptionsResolver $resolver
	 */
	public function configureOptions(OptionsResolver $resolver) {
		$resolver->setDefaults(array(
			'data_class' => User::class,
		));
	}
}
