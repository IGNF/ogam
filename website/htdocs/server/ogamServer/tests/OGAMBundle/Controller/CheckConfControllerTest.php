<?php

namespace Tests\OGAMBundle\Controller;

class CheckConfControllerTest extends AbstractControllerTest
{
    // *************************************************** //
    //                 Access Right Tests                  //
    // *************************************************** //

    public function getNotLoggedUrls(){
        return [
            'indexAction' => [['uri' => '/checkconf/']],
            'showCheckConfAction' => [['uri' => '/checkconf/showCheckConf']]
        ];
    }
    
    public function getVisitorUrls(){
        return $this->getNotLoggedUrls();
    }
    
    public function getAdminUrls(){
        return [
            'indexAction' => [['uri' => '/checkconf/']],
            'showCheckConfAction' => [['uri' => '/checkconf/showCheckConf']]
        ];
    }
}