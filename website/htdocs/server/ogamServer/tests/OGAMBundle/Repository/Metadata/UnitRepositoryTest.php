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
     * Test the unit's mode function with a MODE type
     */
    public function unitModesFctsWithUnitCode($unitCode) {
        $repo = $this->em->getRepository('OGAMBundle:Metadata\Unit', 'metadata');
        $unit = $this->em->getReference(Unit::class, $unitCode);
        $locale = 'FR';
        
        // Check the getModes function
        $modes = $repo->getModes($unit, $locale);
        $this->assertEquals(count($modes), 3); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getDefinition(), 'Le cas a'); // Check the locale
        
        // Check the getModesFilteredByCode function with a simple code
        $modes = $repo->getModesFilteredByCode($unit, 'A', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getCode(), 'A'); // Check the code
        $this->assertEquals($modes[0]->getDefinition(), 'Le cas a'); // Check the locale
        
        // Check the getModesFilteredByCode function with an array of code
        $modes = $repo->getModesFilteredByCode($unit, ['A','B'], $locale);
        $this->assertEquals(count($modes), 2); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getCode(), 'A'); // Check the code
        $this->assertEquals($modes[0]->getDefinition(), 'Le cas a'); // Check the locale
        $this->assertEquals($modes[1]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[1]->getCode(), 'B'); // Check the code
        $this->assertEquals($modes[1]->getDefinition(), 'Le cas b'); // Check the locale
        
        // Check the getModesFilteredByLabel function with a simple label
        $modes = $repo->getModesFilteredByLabel($unit, 'a', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getLabel(), 'A'); // Check the label
        $this->assertEquals($modes[0]->getDefinition(), 'Le cas a'); // Check the locale
        
        // Check the getModesLabelsFilteredByCode function with a simple code
        $modes = $repo->getModesLabelsFilteredByCode($unit, 'A', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes['A'], 'A'); // Check the code and the label
        
        // Check the getModesLabelsFilteredByCode function with an array of code
        $modes = $repo->getModesLabelsFilteredByCode($unit, ['A','B'], $locale);
        $this->assertEquals(count($modes), 2); // Check the count
        $this->assertEquals($modes['A'], 'A'); // Check the code and the label
        $this->assertEquals($modes['B'], 'B'); // Check the code and the label
    }

    /**
     * Test the unit's mode function with a MODE type
     */
    public function testUnitModesFctsWithModeType() {
        $this->unitModesFctsWithUnitCode('CODE_MODE');
    }

    /**
     * Test the unit's mode function with a DYNAMODE type
     */
    public function testUnitModesFctsWithDynamodeType() {
        $this->unitModesFctsWithUnitCode('CODE_DYNAMIC');
    }
    
    /**
     * Test the unit's mode function with a MODE_TREE type
     */
    public function testUnitModesFctsWithModetreeType() {
        $repo = $this->em->getRepository('OGAMBundle:Metadata\Unit', 'metadata');
        $unitCode = 'CORINE_BIOTOPE';
        $unit = $this->em->getReference(Unit::class, $unitCode);
        $locale = 'FR';
        
        // Check the getModes function
        $modes = $repo->getModes($unit, $locale);
        $this->assertEquals(count($modes), 50); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getDefinition(), 'Habitats littoraux et halophiles'); // Check the locale
        
        // Check the getModesFilteredByCode function with a simple code
        $modes = $repo->getModesFilteredByCode($unit, '11.1', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getCode(), '11.1'); // Check the code
        $this->assertEquals($modes[0]->getDefinition(), 'Eaux marines'); // Check the locale
        
        // Check the getModesFilteredByCode function with an array of code
        $modes = $repo->getModesFilteredByCode($unit, ['11.1','11.11'], $locale);
        $this->assertEquals(count($modes), 2); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getCode(), '11.1'); // Check the code
        $this->assertEquals($modes[0]->getDefinition(), 'Eaux marines'); // Check the locale
        $this->assertEquals($modes[1]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[1]->getCode(), '11.11'); // Check the code
        $this->assertEquals($modes[1]->getDefinition(), 'Eaux océaniques'); // Check the locale
        
        // Check the getModesFilteredByLabel function with a simple label
        $modes = $repo->getModesFilteredByLabel($unit, 'eaux', $locale);
        $this->assertEquals(count($modes), 16); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getLabel(), 'Eaux marines'); // Check the label
        $this->assertEquals($modes[0]->getDefinition(), 'Eaux marines'); // Check the locale
        
        // Check the getModesLabelsFilteredByCode function with a simple code
        $modes = $repo->getModesLabelsFilteredByCode($unit, '11.1', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes['11.1'], 'Eaux marines'); // Check the code and the label
        
        // Check the getModesLabelsFilteredByCode function with an array of code
        $modes = $repo->getModesLabelsFilteredByCode($unit, ['11.1','11.11'], $locale);
        $this->assertEquals(count($modes), 2); // Check the count
        $this->assertEquals($modes['11.1'], 'Eaux marines'); // Check the code and the label
        $this->assertEquals($modes['11.11'], 'Eaux océaniques'); // Check the code and the label
    }

    /**
     * Test the unit's mode function with a MODE_TAXREF type
     */
    public function testUnitModesFctsWithModetaxrefType() {
        $repo = $this->em->getRepository('OGAMBundle:Metadata\Unit', 'metadata');
        $unitCode = 'ID_TAXON';
        $unit = $this->em->getReference(Unit::class, $unitCode);
        $locale = 'FR';
    
        // Check the getModes function
        $modes = $repo->getModes($unit, $locale);
        $this->assertEquals(count($modes), 50); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getLabel(), 'Animalia'); // Check the locale
    
        // Check the getModesFilteredByCode function with a simple code
        $modes = $repo->getModesFilteredByCode($unit, '100', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getCode(), '100'); // Check the code
        $this->assertEquals($modes[0]->getLabel(), 'Salamandra salamandra salamandra'); // Check the locale
    
        // Check the getModesFilteredByCode function with an array of code
        $modes = $repo->getModesFilteredByCode($unit, ['100','1000'], $locale);
        $this->assertEquals(count($modes), 2); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getCode(), '100'); // Check the code
        $this->assertEquals($modes[0]->getLabel(), 'Salamandra salamandra salamandra'); // Check the locale
        $this->assertEquals($modes[1]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[1]->getCode(), '1000'); // Check the code
        $this->assertEquals($modes[1]->getLabel(), 'Procellaria glacialis'); // Check the locale
    
        // Check the getModesFilteredByLabel function with a simple label
        $modes = $repo->getModesFilteredByLabel($unit, 'salaman', $locale);
        $this->assertEquals(count($modes), 28); // Check the count
        $this->assertEquals($modes[0]->getUnit(), $unitCode); // Check the unit
        $this->assertEquals($modes[0]->getLabel(), 'Salamandra salamandra salamandra'); // Check the label and the locale
    
        // Check the getModesLabelsFilteredByCode function with a simple code
        $modes = $repo->getModesLabelsFilteredByCode($unit, '100', $locale);
        $this->assertEquals(count($modes), 1); // Check the count
        $this->assertEquals($modes['100'], 'Salamandra salamandra salamandra'); // Check the code and the label
    
        // Check the getModesLabelsFilteredByCode function with an array of code
        $modes = $repo->getModesLabelsFilteredByCode($unit, ['100','1000'], $locale);
        $this->assertEquals(count($modes), 2); // Check the count
        $this->assertEquals($modes['100'], 'Salamandra salamandra salamandra'); // Check the code and the label
        $this->assertEquals($modes['1000'], 'Procellaria glacialis'); // Check the code and the label
    }
}