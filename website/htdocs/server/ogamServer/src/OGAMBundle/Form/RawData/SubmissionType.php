<?php
namespace OGAMBundle\Form\RawData;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;

class SubmissionType extends AbstractType
{

    /**
     *
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('step')
            ->add('status')
            ->add('creationDate', DateTimeType::class)
            ->add('validationDate', DateTimeType::class)
            ->add('provider', EntityType::class, array(
            'class' => 'OGAMBundle:Website\Provider',
            'choice_label' => 'label'
            ))
            ->add('dataset', EntityType::class, array(
            'class' => 'OGAMBundle:Metadata\Dataset',
            'choice_label' => 'label'
                /*
            'query_builder' => function (EntityRepository $er) {
                return $er->createQueryBuilder('d')
                    ->orderBy('d.id', 'ASC');
            }                */
                ))
            ->add('user', EntityType::class, array(
            'class' => 'OGAMBundle:Website\User',
            'em' => 'website',
            'choice_label' => 'login'));
    }

    /**
     *
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'OGAMBundle\Entity\RawData\Submission'
        ));
    }
}
