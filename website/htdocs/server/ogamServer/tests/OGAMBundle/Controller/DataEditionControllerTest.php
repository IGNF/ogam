<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class DataEditionControllerTest extends WebTestCase
{
    public function testGetParameters()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/dataedition/getParameters');

        $this->assertTrue($client->getResponse()->isSuccessful());

        $this->assertRegExp('OgamDesktop\.userProviderId = \'%d\'', $client->getResponse()->getContent(), 'should contains provider information');
        $this->assertRegExp('OgamDesktop\.view.edition\.Panel\.override\(\{
        checkEditionRights :.+\}\);', $client->getResponse()->getContent(), 'should contains checkEditionRights flags');
    }
}
