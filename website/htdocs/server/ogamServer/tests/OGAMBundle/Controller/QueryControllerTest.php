<?php

namespace OGAMBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use OGAMBundle\Entity\Website\User;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockFileSessionStorage;
use OGAMBundle\Entity\Generic\QueryForm;
use Symfony\Component\BrowserKit\Request;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\NativeFileSessionHandler;
use Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage;

class QueryControllerTest extends WebTestCase
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

    /**
     * Test the ajaxgetresultsbbox action
     */
    public function testAjaxGetResultsBboxAction()
    {
        $this->logIn('visitor', array('ROLE_VISITOR'));
        $client = $this->client;
        
        // Create the query form
        $queryForm = new QueryForm();
        $queryForm->setDatasetId('SPECIES');
        $queryForm->addCriterion('PLOT_FORM', 'IS_FOREST_PLOT', '1');
        $queryForm->addColumn('PLOT_FORM', 'PLOT_CODE');
        $queryForm->addColumn('PLOT_FORM', 'CYCLE');
        $queryForm->addColumn('PLOT_FORM', 'INV_DATE');
        $queryForm->addColumn('PLOT_FORM', 'IS_FOREST_PLOT');
        $queryForm->addColumn('PLOT_FORM', 'CORINE_BIOTOPE');
        $queryForm->addColumn('PLOT_FORM', 'FICHE_PLACETTE');
        $queryForm->addColumn('PLOT_FORM', 'COMMENT');
        
        // Add the query form to the session
        $session = $client->getContainer()->get('session');
        $session->set('query_QueryForm', $queryForm);
        $session->save(); // The session must be closed before to launch the request.
        
        $client->request('GET', '/query/ajaxgetresultsbbox');
        
        $this->assertEquals(
            Response::HTTP_OK,
            $client->getResponse()->getStatusCode()
        );
        $this->assertEquals(
            '{"success":true,"resultsbbox":"POLYGON((-527809.009132829 5067935.99827698,-527809.009132829 6621490.24812977,1059575.98276081 6621490.24812977,1059575.98276081 5067935.99827698,-527809.009132829 5067935.99827698))"}',
            $client->getResponse()->getContent()
        );
    }
    
    // *************************************************** //
    //                 Access Right Tests                  //
    // *************************************************** //

    /**
     * Test access without login
     */
    public function testQueryPageNotloggedAccess()
    {
        $this->queryPageAccess(Response::HTTP_FOUND);
    }
    
    /**
     * Test access with a visitor login
     */
    public function testQueryPageVisitorAccess()
    {
        $this->logIn('visitor', array('ROLE_VISITOR')); // The session must be keeped for the chained requests
        $this->queryPageAccess(Response::HTTP_OK);
    }
    
    /**
     * Test access with a admin login
     */
    public function testQueryPageAdminAccess()
    {
        $this->logIn('admin', array('ROLE_ADMIN')); // The session must be keeped for the chained requests
        $this->queryPageAccess(Response::HTTP_OK);
    }
    
    /**
     * Test all the access
     */
    public function queryPageAccess($defaultStatusCode = Response::HTTP_OK)
    {
        $client = $this->client;
        
        // Loop on the urls
        $urls = $this->getUrls();
        foreach($urls as $urlName => $url) {
            echo "\n\r", $urlName, "...";

            // Set the parameters
            $requestParameters = $url[0];
            $responseParameters = empty($url[1]) ? []: $url[1];
            $statusCode = empty($responseParameters['statusCode']) ? $defaultStatusCode: $responseParameters['statusCode'];
            $isJson = empty($responseParameters['isJson']) ? false: $responseParameters['isJson'];

            // Launch the request
            $crawler = $client->request(
                empty($requestParameters['method']) ? 'GET' : $requestParameters['method'],
                $requestParameters['uri'],
                empty($requestParameters['parameters']) ? array() : $requestParameters['parameters']
            );

            // Display the response status and error message
            $responseStatusCode = $client->getResponse()->getStatusCode();
            echo " Status code : ", $responseStatusCode;
            if($isJson && $responseStatusCode === Response::HTTP_OK) {
                $response = json_decode($client->getResponse()->getContent());
                if($response->success === true) {
                    echo ", Success : true";
                    //echo "\n\r", $client->getResponse()->getContent();
                } else {
                    echo ", Success : ", $response->success ? 'true':'false', ", Error message : \n\r", $response->errorMessage;
                }
            }
            if( $responseStatusCode === Response::HTTP_INTERNAL_SERVER_ERROR) {
                echo ", Error message : ";
                print_r($crawler->filter('div#traces-text')->text());
            }

            // Asserts
            $this->assertEquals(
                $statusCode,
                $responseStatusCode
            );
            if($isJson && $responseStatusCode === Response::HTTP_OK) {
                $this->assertEquals(
                    true,
                    $response->success
                );
            }
        }
    }
    
    /**
     * Provision list url
     * 
     * Format : [
     * [ // RequestParameters
     *     'uri' => '/ControllerRoute/ActionRoute', // Required
     *     'method' => 'GET|POST|...', // Default : GET
     *     'parameters' => [ // Default : []
     *         'name'=> value
     *     ]
     * ],[ // ResponseParameters
     *     'statusCode' => Response::HTTP_OK|Response::HTTP_FOUND|..., // Default : Response::HTTP_OK
     *     'isJson' => true|false // Default : false
     * ]]
     */
    public function getUrls(){
        return [
            'query' => [[
                'uri' => '/query/',
                'method' => 'GET',
                'parameters' => [
                    'SCHEMA' => 'RAW_DATA'
                ]
            ], ['statusCode' => Response::HTTP_FOUND]],
            'show-query-form' => [['uri' => '/query/show-query-form'], ['statusCode' => Response::HTTP_FOUND]],
            //'odp-index' => [['uri' => '/odp/index.html?locale=fr']], // TODO: Not found. Why?
            'getgridparameters' => [['uri' => '/query/getgridparameters']],
            'ajaxgetdatasets' => [[
                'uri' => '/query/ajaxgetdatasets',
                'method' => 'GET',
                'parameters' => [
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgetqueryform' => [[
                'uri' => '/query/ajaxgetqueryform',
                'method' => 'GET',
                'parameters' => [
                    'filter' => '[{"property":"processId","value":"SPECIES","exactMatch":true}]'
                ]
            ], ['isJson' => true]],
            'ajaxgetqueryformfields' => [[
                'uri' => '/query/ajaxgetqueryformfields',
                'method' => 'GET',
                'parameters' => [
                    'query'=>'',
                    'page'=>'1',
                    'start'=>'0',
                    'limit'=>'3',
                    'filter'=>'[{"property":"processId","value":"SPECIES"},{"property":"form","value":"PLOT_FORM"},{"property":"fieldsType","value":"criteria"}]'
                ]
            ], ['isJson' => true]],
            'ajaxresetresultlocation' => [['uri' => '/query/ajaxresetresultlocation'], ['isJson' => true]],
            'ajaxbuildrequest' => [[
                'uri' => '/query/ajaxbuildrequest',
                'method' => 'POST',
                'parameters' => [
                    'datasetId'=>'SPECIES',
                    'criteria__PLOT_FORM__IS_FOREST_PLOT'=>'1',
                    //'criteria__PLOT_FORM__IS_FOREST_PLOT[]'=>'1',// TODO: Doesn't work. why?
                    'column__PLOT_FORM__PLOT_CODE'=>'1',
                    'column__PLOT_FORM__CYCLE'=>'1',
                    'column__PLOT_FORM__INV_DATE'=>'1',
                    'column__PLOT_FORM__IS_FOREST_PLOT'=>'1',
                    'column__PLOT_FORM__CORINE_BIOTOPE'=>'1',
                    'column__PLOT_FORM__FICHE_PLACETTE'=>'1',
                    'column__PLOT_FORM__COMMENT'=>'1'
                ]
            ], ['isJson' => true]],
            'ajaxgetresultsbbox' => [['uri' => '/query/ajaxgetresultsbbox'], ['isJson' => true]],
            'ajaxgetresultcolumns' => [[
                'uri' => '/query/ajaxgetresultcolumns',
                'method' => 'GET',
                'parameters' => [
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgetresultrows' => [['uri' => '/query/ajaxgetresultrows'], ['isJson' => true]],
            'ajaxgetpredefinedrequestlist' => [[
                'uri' => '/query/ajaxgetpredefinedrequestlist',
                'method' => 'GET',
                'parameters' => [
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgetpredefinedrequestcriteria' => [[
                'uri' => '/query/ajaxgetpredefinedrequestcriteria',
                'method' => 'GET',
                'parameters' => [
                    'request_name' => 'DEP'
                ]
            ], ['isJson' => true]],
            'ajaxgetdetails' => [[
                'uri' => '/query/ajaxgetdetails',
                'method' => 'POST',
                'parameters' => [
                    'id' => 'SCHEMA/RAW_DATA/FORMAT/PLOT_DATA/PROVIDER_ID/1/PLOT_CODE/01575-14060-4-0T/CYCLE/5'
                ]
            ], ['isJson' => true]],
            'csv-export' => [['uri' => '/query/csv-export']],
            'kml-export' => [['uri' => '/query/kml-export']],
            'geojson-export' => [['uri' => '/query/geojson-export']],
            'ajaxgettreenodes' => [[
                'uri' => '/query/ajaxgettreenodes',
                'method' => 'POST',
                'parameters' => [
                    'unit' => 'CORINE_BIOTOPE',
                    'depth' => '1',
                    'node' => '*'
                ]
            ], ['isJson' => true]],
            'ajaxgettaxrefnodes' => [[
                'uri' => '/query/ajaxgettaxrefnodes',
                'method' => 'POST',
                'parameters' => [
                    'unit' => 'ID_TAXON',
                    'depth' => '1',
                    'node' => '*'
                ]
            ], ['isJson' => true]],
            'ajaxgetdynamiccodes' => [[
                'uri' => '/query/ajaxgetdynamiccodes',
                'method' => 'GET',
                'parameters' => [
                    'unit' => 'COMMUNES',
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgetcodes' => [[
                'uri' => '/query/ajaxgetcodes',
                'method' => 'GET',
                'parameters' => [
                    'unit' => 'SPECIES_CODE',
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgettreecodes' => [[
                'uri' => '/query/ajaxgettreecodes',
                'method' => 'GET',
                'parameters' => [
                    'unit' => 'CORINE_BIOTOPE',
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgettaxrefcodes' => [[
                'uri' => '/query/ajaxgettaxrefcodes',
                'method' => 'GET',
                'parameters' => [
                    'unit' => 'ID_TAXON',
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ], ['isJson' => true]],
            'ajaxgetlocationinfo' => [[
                'uri' => '/query/ajaxgetlocationinfo',
                'method' => 'GET',
                'parameters' => [
                    'LON' => 310640.0829509576,
                    'LAT' => 5953527.259075833,
                    'MAXFEATURES' => 20
                ]
            ], ['isJson' => true]]
        ];
    }
}