<?php
namespace Tests\OGAMBundle\Repository\Metadata;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use OGAMBundle\Entity\Metadata\Unit;

class UnitRepositoryTest extends KernelTestCase {

    /**
     *
     * @var \Doctrine\ORM\EntityManager
     */
    private $em;

    /**
     *
     * {@inheritdoc}
     *
     */
    protected function setUp() {
        self::bootKernel();

        $this->em = static::$kernel->getContainer()
        ->get('doctrine')
        ->getManager('metadata');
    }

    /**
     *
     * {@inheritdoc}
     *
     */
    protected function tearDown() {
        parent::tearDown();

        if ($this->em){
            $this->em->close();
        }
        $this->em = null; // avoid memory leaks
    }


    /**
     * Test la récupération des modalites|labels de Mode via Unit.
     */
    public function testMode() {
        $repo = $this->em->getRepository('OGAMBundle:Metadata\Unit', 'metadata');

        $unit = $this->em->getReference(Unit::class, 'SPECIES_CODE');

        // On récupère la liste des espèces
        $modes = $repo->getModes($unit, 'fr');

        // On vérifie que l'on a ramené la bonne modalité
        $this->assertEquals(count($modes), 303);

        // On filtre sur un code
        $modes = $repo->getModesLabel($unit, '999','FR');

        // On vérifie que l'on a ramené la bonne modalité
        $this->assertEquals(count($modes), 1);
        $this->assertEquals($modes['999'], 'Autres feuillus');

        // On filtre sur une liste de codes
        $modes = $repo->getModesLabel($unit, array(
            '999',
            '998'
        ), 'FR');

        // On vérifie que l'on a ramené la bonne modalité
        $this->assertCount(2, $modes);
        $this->assertEquals($modes['999'], 'Autres feuillus');
        $this->assertEquals($modes['998'], 'Autres conifères');

        // On filtre sur un libellé
        $modes = $repo->getModesFilteredByLabel($unit, 'Acacia', 'FR');

        // On vérifie que l'on a ramené la bonne modalité
        $this->assertCount(11, $modes);
    }

}