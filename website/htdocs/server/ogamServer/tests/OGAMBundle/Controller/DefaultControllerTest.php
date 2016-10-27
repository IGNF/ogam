<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class DefaultControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/');

        $this->assertContains('OGAM', $client->getResponse()->getContent());
    }
    
    /**
     * TODO: Check the contents of those functions
     * @Route("/test")
     */
    public function testAction(Request $request)
    {
    
        $em = $this->get('doctrine.orm.metadata_entity_manager');
        $locale = $this->get('ogam.locale_listener')->getLocale();
         
        // Test MODE
        $unit = $em->find(Unit::class, 'CODE_MODE');
        dump('MODE');
        dump($em->getRepository(Unit::class)->getModes($unit, $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, 'A', $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, ['A','B'], $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByLabel($unit, 'a', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, 'A', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, ['A','B'], $locale));
         
        // Test DYNAMODE
        $unit = $em->find(Unit::class, 'CODE_DYNAMIC');
        dump('DYNAMODE');
        dump($em->getRepository(Unit::class)->getModes($unit, $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, 'A', $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, ['A','B'], $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByLabel($unit, 'a', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, 'A', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, ['A','B'], $locale));
         
        // Test MODE_TREE
        $unit = $em->find(Unit::class, 'CORINE_BIOTOPE');
        dump('MODE_TREE');
        dump($em->getRepository(Unit::class)->getModes($unit, $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, '11.1', $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, ['11.1','11.11'], $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByLabel($unit, 'eaux', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, '11.1', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, ['11.1','11.11'], $locale));
         
        // Test MODE_TAXREF
        $unit = $em->find(Unit::class, 'ID_TAXON');
        dump('MODE_TAXREF');
        dump($em->getRepository(Unit::class)->getModes($unit, $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, '100', $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByCode($unit, ['100','1000'], $locale));
        dump($em->getRepository(Unit::class)->getModesFilteredByLabel($unit, 'salaman', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, '100', $locale));
        dump($em->getRepository(Unit::class)->getModesLabelsFilteredByCode($unit, ['100','1000'], $locale));
    
        // Send the result as a JSON String
        return new JsonResponse([
            'success' => true
        ]);
    }
}
