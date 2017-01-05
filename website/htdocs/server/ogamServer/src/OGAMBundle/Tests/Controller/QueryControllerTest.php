<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class QueryControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/');
    }

    public function testShowqueryform()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/show-query-form');
    }

    public function testAjaxgetpredefinedrequestlist()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetpredefinedrequestlist');
    }

    public function testAjaxgetpredefinedrequestcriteria()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetpredefinedrequestcriteria');
    }

    public function testAjaxsavepredefinedrequest()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxsavepredefinedrequest');
    }

    public function testAjaxgetqueryform()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetqueryform');
    }

    public function testAjaxgetqueryformfields()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetqueryformfields');
    }

    public function testAjaxgetdatasets()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetdatasets');
    }

    public function testAjaxbuildrequest()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxbuildrequest');
    }

    public function testAjaxgetresultsbbox()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetresultsbbox');
    }

    public function testAjaxgetresultcolumns()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetresultcolumns');
    }

    public function testAjaxgetresultrows()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetresultrows');
    }

    public function testGetgridparameters()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/getgridparameters');
    }

    public function testAjaxgetdetails()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetdetails');
    }

    public function testAjaxgetchildren()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetchildren');
    }

    public function testCsvexport()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/csvExport');
    }

    public function testKmlexport()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '[A[B/kml-export');
    }

    public function testGeojsonexport()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/[C[C[C[Cg[C[Cjson-export');
    }

    public function testAjaxgettreenodes()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgettreenodes');
    }

    public function testAjaxgettaxrefnodes()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgettaxrefnodes');
    }

    public function testAjaxgetdynamiccodes()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetdynamiccodes');
    }

    public function testAjaxgetcodes()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetcodes');
    }

    public function testAjaxgettreecodes()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgettreecodes');
    }

    public function testAjaxgettaxrefcodes()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgettaxrefcodes');
    }

    public function testAjaxgetlocationinfo()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxgetlocationinfo');
    }

    public function testAjaxresetresultlocation()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/ajaxresetresultlocation');
    }

}
