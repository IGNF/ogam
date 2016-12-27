<?php
namespace OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RoleType extends AbstractType {

	/**
	 * Build the role form.
	 *
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options) {
		$builder->add('code', TextType::class, array(
			'label' => 'Code',
			'read_only' => $role ? !empty($role->getCode()) : false
		))
			->add('label', TextType::class, array(
			'label' => 'Label'
		))
			->add('definition', TextType::class, array(
			'label' => 'Definition',
			'required' => false
		))
			->add('permissions', EntityType::class, array(
			'label' => 'Permissions',
			'class' => 'OGAMBundle\Entity\Website\Permission',
			'choice_label' => 'label',
			'multiple' => true,
			'expanded' => true
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
			'data_class' => 'OGAMBundle\Entity\Website\Role'
		));
	}
}
