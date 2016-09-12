<?php

namespace OGAMBundle\Services;

use OGAMBundle\Entity\Metadata\Dataset;

/**
 *
 * The Query Service.
 *
 * This service handles the queries used to feed the query interface with ajax requests.
 */
class QueryService {
	/**
	 * The logger.
	 *
	 * @var Logger
	 */
	private $logger;

	/**
	 * The locale.
	 *
	 * @var locale
	 */
	private $locale;

	/**
	 * The user.
	 *
	 * @var user
	 */
	private $user;

	/**
	 *
	 */
	private $configation;

	/**
	 * The models.
	 * @var EntityManager
	 */
	private $metadataModel;

	function __construct($em, $configuration, $logger, $locale, $user)
	{
		// Initialise the logger
		$this->logger = $logger;

		// Initialise the locale
		$this->locale = $locale;

		// Initialise the user
		$this->user = $user;

		$this->configuration = $configuration;

		// Initialise the metadata models
		$this->metadataModel = $em;
	}

	/**
	 * Get the list of available datasets.
	 *
	 * @return JSON The list of datasets
	 */
	public function getDatasets() {
		return $this->metadataModel->getRepository(Dataset::class)->getDatasetsForDisplay($this->locale, $this->user);
	}
}