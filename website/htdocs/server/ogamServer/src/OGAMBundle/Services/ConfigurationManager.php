<?php
namespace OGAMBundle\Services;

use Monolog\Logger;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * Implement a password encoder to use with the challenge-response authentification.
 */
class ConfigurationManager {

	private $em;

	private $logger;

	/**
	 * The array of parameters.
	 *
	 * @var Array[ApplicationParameter]
	 */
	private $parameters = array();

	/**
	 * Constructor.
	 *
	 * @param EntityManager $em
	 * @param Logger $logger
	 */
	public function __construct(EntityManager $em, Logger $logger) {
		$this->em = $em;
		$this->logger = $logger;

		$this->readConfiguration();
	}

	/**
	 * Read the configuration.
	 */
	private function readConfiguration() {
		// Get application parameters
		$appRepo = $this->em->getRepository('OGAMBundle\Entity\Website\ApplicationParameter', 'website');
		$this->parameters = $appRepo->findAllIndexedByName();
	}

	/**
	 * Get a config parameter.
	 *
	 * @param String $name
	 * @param String $defaultValue
	 * @param Boolean $silent
	 *        	(if true, doesn't generate a warning for default value)
	 * @return String the parameter value
	 * @throws An exception if the parameter cannot be found and no default value is set
	 */
	public function getConfig($name, $defaultValue = null, $silent = false) {

		$this->logger->debug("getConfig : " . $name);

		if (isset($this->parameters[$name])) {
			$parameter = $this->parameters[$name];
		}

		// Get the parameter value from the config
		if (!empty($parameter)) {
			return $parameter->getValue();
		} else if ($defaultValue !== null) {

			// If not available but a default is specified, return the default
			if (!$silent) {
				$this->logger->warning('Configuration parameter ' . $name . ' not found, using default value : ' . $defaultValue);
			}

			return $defaultValue;
		} else {

			// Missing config
			$this->logger->error('Configuration parameter ' . $name . ' cannot be found');

			throw new Exception('Configuration parameter ' . $name . ' cannot be found');
		}
	}
}