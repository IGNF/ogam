<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use OGAMBundle\Entity\Website\User;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class DataEditionControllerTest extends WebTestCase
{
    private $client = null;

    public function setUp()
    {
        $this->client = static::createClient();
    }

    private function logIn()
    {
        $session = $this->client->getContainer()->get('session');

        // the firewall context (defaults to the firewall name)
        $firewall = 'main';

        $token = new UsernamePasswordToken((new User())->setLogin('admin'), null, $firewall, array('ROLE_ADMIN'));
        $session->set('_security_'.$firewall, serialize($token));
        $session->save();

        $cookie = new Cookie($session->getName(), $session->getId());
        $this->client->getCookieJar()->set($cookie);
    }

    public function testGetParameters()
    {
        $this->logIn();
        $client = $this->client;

        $crawler = $client->request('GET', '/dataedition/getParameters');

        $this->assertTrue($client->getResponse()->isSuccessful());

        $this->assertStringEqualsFile(__DIR__.'/getParameters.js', $client->getResponse()->getContent());
    }

    /**
     * functionnal test on global content
     * @dataProvider providerJsonUrl
     */
    public function testGettablePages($url, $contentFile)
    {
        $this->logIn();//require login
        $client = $this->client;
        $crawler = $client->request('GET',$url);
        $this->assertTrue($client->getResponse()->isSuccessful());
        $this->assertJsonStringEqualsJsonFile($contentFile, $client->getResponse()->getContent());
    }

    /**
     *provision list url & file
     */
    public function providerJsonUrl(){
        return [
           //'getParameters' => ['/dataedition/getParameters', __DIR__.'/getParameters.js'],
           'showEditData'  => ['/dataedition/show-edit-data/SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/1/PLOT_CODE/987321',  __DIR__.'/show-edit-data-987321.json'],
           'showAddData' => ['/dataedition/show-add-data/SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/1', __DIR__.'/show-add-data.json'],
           'ajax-get-edit-form location'=>['/dataedition/ajax-get-edit-form/SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T', __DIR__.'/ajax-get-edit-form-95552-P6040-2-4T.json'],
           'ajax-get-edit-form plot'=>['/dataedition/ajax-get-edit-form/SCHEMA/RAW_DATA/FORMAT/PLOT_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5', __DIR__.'/ajax-get-edit-form-cyle-5.json'],
           'ajax-get-add-form'=> ['/dataedition/ajax-get-add-form/SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/1', __DIR__.'/ajax-get-add-form.json']
            ];
    }
}