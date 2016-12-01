<?php

namespace Tests\OGAMBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

class DataEditionControllerTest extends AbstractControllerTest
{

    public function testGetEditFormAction()
    {
        $this->logIn('admin', array('ROLE_ADMIN'));
        $this->checkControllerActionAccess([
            'ajaxGetEditFormAction_Location' => [[
                'uri' => '/dataedition/ajax-get-edit-form/SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T'
            ],[
                'isJson' => true,
                'jsonFile' =>  __DIR__.'/Mock/DataEditionController/ajax-get-edit-form-95552-P6040-2-4T.json'
            ]],
            'ajaxGetEditFormAction_Plot' => [[
                'uri' => '/dataedition/ajax-get-edit-form/SCHEMA/RAW_DATA/FORMAT/PLOT_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5'
            ],[
                'isJson' => true,
                'jsonFile' =>  __DIR__.'/Mock/DataEditionController/ajax-get-edit-form-cyle-5.json'
            ]]
        ], Response::HTTP_OK);
    }
    
    // *************************************************** //
    //                 Access Right Tests                  //
    // *************************************************** //
    
    public function getNotLoggedUrls(){
        return $this->getAdminUrls();
    }
    
    public function getVisitorUrls(){
        return $this->getAdminUrls();
    }
    
    public function getAdminUrls(){
        return [
            'showEditDataAction' => [[
                'uri' => '/dataedition/show-edit-data/SCHEMA/RAW_DATA/FORMAT/PLOT_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5'
            ],[
                'isJson' => false,
                'contentFile' =>  __DIR__.'/Mock/DataEditionController/show-edit-data.json'
            ]],
            'showAddDataAction' => [[
                'uri' => '/dataedition/show-add-data/SCHEMA/RAW_DATA/FORMAT/SPECIES_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5'
            ],[
                'isJson' => false,
                'contentFile' =>  __DIR__.'/Mock/DataEditionController/show-add-data.json'
            ]],
            'ajaxGetAddFormAction' => [[
                'uri' => '/dataedition/ajax-get-add-form/SCHEMA/RAW_DATA/FORMAT/SPECIES_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5/ID_TAXON/',
                'parameters' => [
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ],[
                'isJson' => true,
                'jsonFile' =>  __DIR__.'/Mock/DataEditionController/ajax-get-add-form.json'
            ]],
            'ajaxValidateEditDataAction' => [[ // Chained to the ajaxGetAddForm action
                'uri' => '/dataedition/ajax-validate-edit-data',
                'method' => 'POST',
                'parameters' => [
                    'SPECIES_DATA__PROVIDER_ID' => 1,
                    'SPECIES_DATA__PLOT_CODE' => '95552-P6040-2-4T',
                    'SPECIES_DATA__CYCLE' => 5,
                    'SPECIES_DATA__ID_TAXON' => 349525,
                    'SPECIES_DATA__BASAL_AREA' => null,
                    'SPECIES_DATA__COMMENT' => null,
                    'MODE' => 'ADD'
                ]
            ],[
                'isJson' => true,
                'jsonFile' =>  __DIR__.'/Mock/DataEditionController/ajax-validate-edit-data.json'
            ]],
            'ajaxGetEditFormAction' => [[
                'uri' => '/dataedition/ajax-get-edit-form/SCHEMA/RAW_DATA/FORMAT/PLOT_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5',
                'parameters' => [
                    'page' => 1,
                    'start' => 0,
                    'limit' => 25
                ]
            ],[
                'isJson' => true,
                'jsonFile' =>  __DIR__.'/Mock/DataEditionController/ajax-get-edit-form.json'
            ]],
            'ajaxDeleteDataAction' => [[
                'uri' => '/dataedition/ajax-delete-data/SCHEMA/RAW_DATA/FORMAT/SPECIES_DATA/PROVIDER_ID/1/PLOT_CODE/95552-P6040-2-4T/CYCLE/5/ID_TAXON/349525'
            ],[
                'isJson' => true,
                'jsonFile' =>  __DIR__.'/Mock/DataEditionController/ajax-delete-data.json'
            ]],
            'getparametersAction' => [[
                'uri' => '/dataedition/getParameters'
            ],[
                'contentFile' => __DIR__.'/Mock/DataEditionController/getParameters.js'
            ]],
            'ajaximageuploadAction' => [[
                'uri' => '/dataedition/ajaximageupload'
            ],[
                'isJson' => true
            ]]
        ];
    }
}