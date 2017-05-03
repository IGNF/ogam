<?php
namespace Ign\Bundle\OGAMBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Ign\Bundle\OGAMBundle\Entity\Website\Role;
use Ign\Bundle\OGAMBundle\Entity\Website\Permission;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Ign\Bundle\OGAMBundle\Entity\Metadata\Dataset;
use Ign\Bundle\OGAMBundle\Entity\Metadata\TableSchema;
use Doctrine\ORM\EntityRepository;

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
			'class' => Permission::class,
			'choice_label' => 'label',
			'multiple' => true,
			'expanded' => true
		))
		    ->add('schemas', EntityType::class, array(
		    'label' => 'Schemas Permissions',
		    'class' => TableSchema::class,
		    'choice_label' => 'label',
		    'multiple' => true,
		    'expanded' => true,
	        'query_builder' => function (EntityRepository $er) {
	            $qb = $er->createQueryBuilder('s');
	            $exp = $qb->expr()->in('s.code', array(
    	            'RAW_DATA',
    	            'HARMONIZED_DATA'
    	        ));
	            return $qb->where($exp);
	        }
		))
    		->add('datasets', EntityType::class, array(
		    'label' => 'Datasets Restrictions',
		    'class' => Dataset::class,
		    'choice_label' => 'label',
		    'multiple' => true,
		    'expanded' => true
		))
			->add('submit', SubmitType::class, array(
			'label' => 'Submit'
		));

        // In edition mode:
        // - code is not editable
        $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event) {
            $role = $event->getData();
            $form = $event->getForm();
            // check if the Role object is "new"
            // If no data is passed to the form, the data is "null".
            if ($role && !empty($role->getCode())) {
                $form->add('code', TextType::class, array(
                    'label' => 'Code',
                    'attr' => array(
                        'readonly' => true,
                    )
                ));
            }
        });
	}

	/**
	 *
	 * @param OptionsResolver $resolver
	 */
	public function configureOptions(OptionsResolver $resolver) {
		$resolver->setDefaults(array(
			'data_class' => Role::class,
		));
	}
}
