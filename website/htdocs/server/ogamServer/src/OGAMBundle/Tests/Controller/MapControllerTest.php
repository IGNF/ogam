<?php
namespace OGAMBundle\Tests\Controller;

use Symfony\Component\HttpFoundation\Response;

class MapControllerTest extends AbstractControllerTest {
	// *************************************************** //
	// Access Right Tests //
	// *************************************************** //
	
	/**
	 * Test access with a visitor login
	 */
	public function testControllerActionVisitorAccess() {
		$this->logIn('visitor', array(
			'ROLE_VISITOR'
		));
		$this->checkControllerActionAccess($this->getVisitorUrls(), Response::HTTP_OK);
	}

	public function getNotLoggedUrls() {
		return $this->getAdminUrls();
	}

	public function getVisitorUrls() {
		return $this->getAdminUrls();
	}

	public function getAdminUrls() {
		return [
			'getMapParametersAction' => [
				[
					'uri' => '/map/get-map-parameters'
				]
			],
			'ajaxgetlayertreenodesAction' => [
				[
					'uri' => '/map/ajaxgetlayertreenodes'
				],
				[
					'isJson' => true
				]
			]
		];
	}
}
