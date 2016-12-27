<?php
namespace OGAMBundle\Tests\Entity;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class SchemaTest extends KernelTestCase {

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
			->getManager();
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
	 * Test la récupération des schémas.
	 */
	public function testGetSchemas() {

		// Récupère la liste des schémas
		$schemas = $this->em->getRepository('OGAMBundle\Entity\Metadata\TableSchema', 'metadata')->findAll();

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($schemas), 6);

		$rawSchema = $schemas['RAW_DATA'];
		$this->assertEquals($rawSchema->getCode(), 'RAW_DATA');
		$this->assertEquals($rawSchema->getName(), 'RAW_DATA');
		$this->assertEquals($rawSchema->getLabel(), 'Raw Data');
		$this->assertEquals($rawSchema->getDescription(), 'Contains raw data');
	}

}