<?php
namespace OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class DataSubmissionType extends AbstractType {

	/**
	 * Build the data submission form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {
		$builder->setAction($this->generateUrl('integration_validate_creation'))
			->add('DATASET_ID', ChoiceType::class, array(
			'label' => 'Dataset',
			'required' => true,
			'choice_value' => 'id',
			'choice_label' => 'label',
			'choices' => $this->getDoctrine()
				->getRepository('OGAMBundle:Metadata\Dataset', 'metadata')
				->getDatasetsForUpload(),
			'choices_as_values' => true
		))
			->add('submit', SubmitType::class);
	}
}
