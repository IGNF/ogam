<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/');
    }

    public function testLogout()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/logout');
    }

    public function testShowchangepassword()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showChangePassword');
    }

    public function testShowloginform()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/showLoginForm');
    }

    public function testValidatechangepassword()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/validateChangePassword');
    }

    public function testValidatelogin()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/validateLogin');
    }

}
