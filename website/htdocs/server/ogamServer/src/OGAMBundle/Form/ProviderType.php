<?php
namespace OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProviderType extends AbstractType {

	/**
	 * Build the provider form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {
		$builder->add('id', HiddenType::class)
			->add('label', TextType::class, array(
			'label' => 'Label'
		))
			->add('definition', TextareaType::class, array(
			'label' => 'Definition',
			'required' => false
		))
			->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));
	}

	/**
	 *
	 * @param OptionsResolver $resolver
	 */
	public function configureOptions(OptionsResolver $resolver) {
		$resolver->setDefaults(array(
			'data_class' => 'OGAMBundle\Entity\Website\Provider'
		));
	}
}
