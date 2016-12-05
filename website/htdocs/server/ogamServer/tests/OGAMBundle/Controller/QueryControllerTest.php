<?php

namespace Tests\OGAMBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

class QueryControllerTest extends AbstractControllerTest
{
    
    // *************************************************** //
    //                 Access Right Tests                  //
    // *************************************************** //
    
    /**
     * Test access with a visitor login
     */
    public function testControllerActionVisitorAccess()
    {
        $this->logIn('visitor', array('ROLE_VISITOR')); // The session must be keeped for the chained requests
        $this->checkControllerActionAccess($this->getRawDataUrls(Response::HTTP_FORBIDDEN), Response::HTTP_FORBIDDEN);
        $this->checkControllerActionAccess($this->getHarmonizedDataUrls(), Response::HTTP_OK);
    }
    
    /**
     * Test access with a admin login
     */
    public function testControllerActionAdminAccess()
    {
        $this->logIn('admin', array('ROLE_ADMIN')); // The session must be keeped for the chained requests
        $this->checkControllerActionAccess($this->getRawDataUrls(), Response::HTTP_OK);
        $this->checkControllerActionAccess($this->getHarmonizedDataUrls(), Response::HTTP_OK);
    }
    
    public function getNotLoggedUrls(){
        return [
            'query' => [['uri' => '/query/']],
            'show-query-form' => [['uri' => '/query/show-query-form']],
            //'odp-index' => [['uri' => '/odp/index.html?locale=fr']], // TODO: Not found. Why?
            'getgridparameters' => [['uri' => '/query/getgridparameters']],
            'ajaxgetdatasets' => [['uri' => '/query/ajaxgetdatasets']],
            'ajaxgetqueryform' => [['uri' => '/query/ajaxgetqueryform']],
            'ajaxgetqueryformfields' => [['uri' => '/query/ajaxgetqueryformfields']],
            'ajaxresetresultlocation' => [['uri' => '/query/ajaxresetresultlocation']],
            'ajaxbuildrequest' => [['uri' => '/query/ajaxbuildrequest']],
            'ajaxgetresultsbbox' => [['uri' => '/query/ajaxgetresultsbbox']],
            'ajaxgetresultcolumns' => [['uri' => '/query/ajaxgetresultcolumns']],
            'ajaxgetresultrows' => [['uri' => '/query/ajaxgetresultrows']],
            'ajaxgetpredefinedrequestlist' => [['uri' => '/query/ajaxgetpredefinedrequestlist']],
            'ajaxgetpredefinedrequestcriteria' => [['uri' => '/query/ajaxgetpredefinedrequestcriteria']],
            'ajaxgetdetails' => [['uri' => '/query/ajaxgetdetails']],
            'csv-export' => [['uri' => '/query/csv-export']],
            'kml-export' => [['uri' => '/query/kml-export']],
            'geojson-export' => [['uri' => '/query/geojson-export']],
            'ajaxgettreenodes' => [['uri' => '/query/ajaxgettreenodes']],
            'ajaxgettaxrefnodes' => [['uri' => '/query/ajaxgettaxrefnodes']],
            'ajaxgetdynamiccodes' => [['uri' => '/query/ajaxgetdynamiccodes']],
            'ajaxgetcodes' => [['uri' => '/query/ajaxgetcodes']],
            'ajaxgettreecodes' => [['uri' => '/query/ajaxgettreecodes']],
            'ajaxgettaxrefcodes' => [['uri' => '/query/ajaxgettaxrefcodes']],
            'ajaxgetlocationinfo' => [['uri' => '/query/ajaxgetlocationinfo']]
        ];
    }
    
    public function getRawDataUrls($defaultStatusCode = Response::HTTP_FOUND){
        return array_merge([
            'query_RAW_DATA' => [[
                'uri' => '/query/',
                'method' => 'GET',
                'parameters' => [
                    'SCHEMA' => 'RAW_DATA'
                ]
            ],[
                'statusCode' => $defaultStatusCode,
                'redirectionLocation' => '/query/show-query-form'
            ]]
        ], $this->getOthersUrls($defaultStatusCode));
    }
    
    public function getHarmonizedDataUrls(){
        return array_merge([
            'query_HARMONIZED_DATA' => [[
                'uri' => '/query/',
                'method' => 'GET',
                'parameters' => [
                    'SCHEMA' => 'HARMONIZED_DATA'
                ]
            ],[
                'statusCode' => Response::HTTP_FOUND,
                'redirectionLocation' => '/query/show-query-form'
            ]]
        ], $this->getOthersUrls());
    }
    
    public function getOthersUrls($defaultStatusCode = Response::HTTP_FOUND){
        return [
            'show-query-form' => [[
                'uri' => '/query/show-query-form'
            ],[
                'statusCode' => $defaultStatusCode,
                'redirectionLocation' => '/odp/index.html?locale=fr'
            ]],
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
                    //'column__PLOT_FORM__CORINE_BIOTOPE'=>'1',// Data not declared into the harmonized data.
                    //'column__PLOT_FORM__FICHE_PLACETTE'=>'1',// Data not declared into the harmonized data.
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