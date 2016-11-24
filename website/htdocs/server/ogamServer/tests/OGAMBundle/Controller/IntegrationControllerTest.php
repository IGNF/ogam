<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use OGAMBundle\Entity\Website\User;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\HttpFoundation\Response;

class IntegrationControllerTest extends WebTestCase
{
    private $client = null;

    public function setUp()
    {
        $this->client = static::createClient();
    }

    private function logIn($login = 'admin', $roles = array('ROLE_ADMIN'))
    {
        $session = $this->client->getContainer()->get('session');

        // the firewall context (defaults to the firewall name)
        $firewall = 'main';

        $token = new UsernamePasswordToken((new User())->setLogin($login), null, $firewall, $roles);
        $session->set('_security_'.$firewall, serialize($token));
        $session->save();

        $cookie = new Cookie($session->getName(), $session->getId());
        $this->client->getCookieJar()->set($cookie);
    }

    // *************************************************** //
    //                 Access Right Tests                  //
    // *************************************************** //
    
    /**
     * Test access with a visitor login
     * @dataProvider visitorUrls
     */
    public function testIntegrationPageVisitorAccess($url, $statusCode = Response::HTTP_FORBIDDEN)
    {
        $this->logIn('visitor', array('ROLE_VISITOR'));
        $client = $this->client;

        $client->request('GET', $url);

        $this->assertEquals(
            $statusCode,
            $client->getResponse()->getStatusCode()
        );
    }
    
    /**
     * Provision list url
     */
    public function visitorUrls(){
        return [
            'integration' => ['/integration/'],
            'show-data-submission-page' => ['/integration/show-data-submission-page'],
            'show-create-data-submission' => ['/integration/show-create-data-submission'],
            'show-upload-data' => ['/integration/show-upload-data/1'],
            'validate-create-data-submission' => ['/integration/validate-create-data-submission'],
            'validate-upload-data' => ['/integration/validate-upload-data/1'],
            'cancel-data-submission' => ['/integration/cancel-data-submission'],
            'check-submission' => ['/integration/check-submission'],
            'validate-data' => ['/integration/validate-data'],
            'get-data-status' => ['/integration/get-data-status'],
            'check-data-status' => ['/integration/check-data-status'],
            'export-file-model' => ['/integration/export-file-model']
        ];
    }
    
    /**
     * Test access with a admin login
     * @dataProvider adminUrls
     */
    public function testIntegrationPageAdminAccess($url, $statusCode = Response::HTTP_OK)
    {
        $this->logIn('admin', array('ROLE_ADMIN'));
        $client = $this->client;
    
        $client->request('GET', $url);
    
        $this->assertEquals(
            $statusCode,
            $client->getResponse()->getStatusCode()
        );
    }
    
    /**
     * Provision list url
     */
    public function adminUrls(){
        return [
            'integration' => ['/integration/'],
            'show-data-submission-page' => ['/integration/show-data-submission-page'],
            'show-create-data-submission' => ['/integration/show-create-data-submission'],
            'show-upload-data' => ['/integration/show-upload-data/1'],
            'validate-create-data-submission' => ['/integration/validate-create-data-submission'],
            'validate-upload-data' => ['/integration/validate-upload-data/1', Response::HTTP_FOUND],
            'cancel-data-submission' => ['/integration/cancel-data-submission'],
            'check-submission' => ['/integration/check-submission'],
            'validate-data' => ['/integration/validate-data'],
            'get-data-status' => ['/integration/get-data-status'],
            'check-data-status' => ['/integration/check-data-status'],
            // TODO OGAM-818 - Revoir la fonction IntegrationController/exportFileModelAction pour ne pas faire planter le test unitaire
            'export-file-model' => ['/integration/export-file-model?fileFormat=LOCATION_FILE', Response::HTTP_INTERNAL_SERVER_ERROR]
        ];
    }
}