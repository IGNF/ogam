<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UsermanagementControllerControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/index');
    }

    public function testDeleteprovider()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/deleteProvider');
    }

    public function testDeleterole()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/deleteRole');
    }

    public function testDeleteuser()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/deleteUser');
    }

    public function testShowchangepassword()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showChangePassword');
    }

    public function testShowcreateprovider()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showCreateProvider');
    }

    public function testShowcreaterole()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showCreateRole');
    }

    public function testShowcreateuser()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showCreateUser');
    }

    public function testShowproviders()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', 'showRolesAction');
    }

    public function testShowroles()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showRoles');
    }

    public function testShowusers()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showUsers');
    }

}
