<?php
namespace OGAMBundle\Services;

use Symfony\Component\Yaml\Yaml;

class BreadcrumbsConfigService {

	private $yamlConfig;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->readConfiguration();
	}

	/**
	 * Read the configuration.
	 */
	private function readConfiguration() {
		$this->yamlConfig = Yaml::parse(file_get_contents(__DIR__ . '/../Resources/config/navigation.yml'));
	}

	public function getConfig() {
		return $this->yamlConfig;
	}

	/**
	 * Return the config items in the path of an action.
	 *
	 * @param String $controller        	
	 * @param String $action        	
	 * @return Array[]
	 */
	public function getPath($controller, $action) {
		$configArray = $this->yamlConfig;
		
		return $this->getPathRecursive($configArray, $controller, $action);
	}

	/**
	 * Return the URL for a path item..
	 *
	 * @param Array $item        	
	 * @return String
	 */
	public function getURL($item) {
		
		// Root
		$url = "/";
		
		// Controller
		if (isset($item['controller']) && (strtolower($item['controller']) != "default")) {
			$url .= strtolower($item['controller']) . "/";
		}
		
		// Action
		if (isset($item['action']) && ($item['action'] != "index")) {
			$url .= $item['action'];
		}
		
		return $url;
	}

	/**
	 * Return the config items in the path of an action.
	 *
	 * @param String $controller        	
	 * @param String $action        	
	 * @return Array[]
	 */
	private function getPathRecursive($configArray, $controller, $action) {
		$result = false;
		
		// Search for the controller and action in the config
		foreach ($configArray as $item) {
			
			// echo "Search in : " . print_r($item, true);
			
			// If we get the name of the controller
			if (isset($item['controller']) && (strtolower($item['controller']) == strtolower($controller))) {
				
				// If we find the good action, we return directly
				if (strtolower($item['action']) == strtolower($action)) {
					return array(
						$item
					);
				}
			}
			
			// If not we search deeper
			if (isset($item['pages'])) {
				
				$foundItem = $this->getPathRecursive($item['pages'], $controller, $action);
				if ($foundItem) {
					if (!$result) {
						$result = array(
							$item
						);
					}
					$result = array_merge($result, $foundItem);
				}
			}
		}
		
		return $result;
	}
}
