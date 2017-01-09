<?php
namespace Ign\Bundle\OGAMBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DataSubmissionType extends AbstractType {

	/**
	 * Build the data submission form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {
		$builder->add('DATASET_ID', ChoiceType::class, array(
			'label' => 'Dataset',
			'required' => true,
			'choice_value' => 'id',
			'choice_label' => 'label',
			'choices' => $options['choices'],
			'choices_as_values' => true
		))
			->add('submit', SubmitType::class);
	}

	/**
	 *
	 * @param OptionsResolver $resolver
	 */
	public function configureOptions(OptionsResolver $resolver) {
		$resolver->setDefaults(array(
			'choices' => null
		));
	}
}
