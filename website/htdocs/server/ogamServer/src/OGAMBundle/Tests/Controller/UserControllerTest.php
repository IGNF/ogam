<?php
namespace OGAMBundle\Tests\Controller;

use Symfony\Component\HttpFoundation\Response;

class UserControllerTest extends AbstractControllerTest {
	// *************************************************** //
	// Access Right Tests //
	// *************************************************** //
	
	/**
	 * Test access without login
	 */
	public function testControllerActionNotLoggedAccess() {
		$this->checkControllerActionAccess($this->getAdminUrls(), Response::HTTP_OK);
	}

	/**
	 * Test access with a visitor login
	 */
	public function testControllerActionVisitorAccess() {
		$this->logIn('visitor', array(
			'ROLE_VISITOR'
		)); // The session must be keeped for the chained requests
		$this->checkControllerActionAccess($this->getAdminUrls(), Response::HTTP_OK);
	}

	public function getAdminUrls() {
		return [
			'indexAction' => [
				[
					'uri' => '/user/'
				]
			],
			'showLoginFormAction' => [
				[
					'uri' => '/user/login'
				]
			],
			'validateLoginAction' => [
				[
					'uri' => '/user/validateLogin'
				]
			],
			'changePasswordAction' => [
				[
					'uri' => '/user/changePassword'
				]
			],
			'logoutAction' => [
				[
					'uri' => '/user/logout'
				],
				[
					'statusCode' => Response::HTTP_FOUND,
					'redirectionLocation' => 'http://localhost/'
				]
			]
		];
	}

	public function testIndex() {
		$client = static::createClient();
		
		$crawler = $client->request('GET', '/');
	}

	public function testLogout() {
		$client = static::createClient();
		
		$crawler = $client->request('GET', '/logout');
	}

	public function testShowchangepassword() {
		$client = static::createClient();
		
		$crawler = $client->request('GET', '/showChangePassword');
	}

	public function testShowloginform() {
		$client = static::createClient();
		
		$crawler = $client->request('GET', '/showLoginForm');
	}

	public function testValidatechangepassword() {
		$client = static::createClient();
		
		$crawler = $client->request('GET', '/validateChangePassword');
	}

	public function testValidatelogin() {
		$client = static::createClient();
		
		$crawler = $client->request('GET', '/validateLogin');
	}
}
