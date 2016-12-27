<?php

namespace OGAMBundle\Tests\Controller;

class UserManagementControllerTest extends AbstractControllerTest
{
    // *************************************************** //
    //                 Access Right Tests                  //
    // *************************************************** //

    public function getNotLoggedUrls(){
        return [
            'indexAction' => [['uri'=>'/usermanagement/']],
            'showProvidersAction' => [['uri'=>'/usermanagement/showProviders']],
            'showProviderContentAction' => [['uri'=>'/usermanagement/showProviderContent/1']],
            'editProviderAction' => [['uri' => '/usermanagement/editProvider']],
            'deleteProviderAction' => [['uri' => '/usermanagement/deleteProvider/999']],
            'showRolesAction' => [['uri'=>'/usermanagement/showRoles']],
            'editRoleAction' => [['uri'=>'/usermanagement/editRole']],
            'deleteRoleAction' => [['uri'=>'/usermanagement/deleteRole/999']],
            'showUsersAction' => [['uri'=>'/usermanagement/showUsers']],
            'editUserAction' => [['uri'=>'/usermanagement/editUser']],
            'changePasswordAction' => [['uri'=>'/usermanagement/changePassword/visitor']],
            'deleteUserAction' => [['uri'=>'/usermanagement/deleteUser/notexistinglogin']]
        ];
    }

    public function getVisitorUrls(){
        return $this->getNotLoggedUrls();
    }

    public function getAdminUrls(){
        return [
            'indexAction' => [['uri'=>'/usermanagement/']],
            'showProvidersAction' => [['uri'=>'/usermanagement/showProviders']],
            'showProviderContentAction' => [['uri'=>'/usermanagement/showProviderContent/1']],
            'editProviderAction' => [['uri' => '/usermanagement/editProvider']],
            'deleteProviderAction' => [[
                'uri' => '/usermanagement/deleteProvider/999'
            ],[
                'statusCode' => Response::HTTP_FOUND,
                'redirectionLocation' => '/usermanagement/showProviders',
                'alertMessage' => 'The provider does not exist.'
            ]],
            'showRolesAction' => [['uri'=>'/usermanagement/showRoles']],
            'editRoleAction' => [['uri'=>'/usermanagement/editRole']],
            'deleteRoleAction' => [[
                'uri'=>'/usermanagement/deleteRole/999'
            ],[
                'statusCode' => Response::HTTP_FOUND,
                'redirectionLocation' => '/usermanagement/showRoles',
                'alertMessage' => 'The role does not exist.'
            ]],
            'showUsersAction' => [['uri'=>'/usermanagement/showUsers']],
            'editUserAction' => [['uri'=>'/usermanagement/editUser']],
            'changePasswordAction' => [['uri'=>'/usermanagement/changePassword/visitor']],
            'deleteUserAction' => [[
                'uri'=>'/usermanagement/deleteUser/notexistinglogin'
            ],[
                'statusCode' => Response::HTTP_FOUND,
                'redirectionLocation' => '/usermanagement/showUsers',
                'alertMessage' => 'The user does not exist.'
            ]]
        ];
    }
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
