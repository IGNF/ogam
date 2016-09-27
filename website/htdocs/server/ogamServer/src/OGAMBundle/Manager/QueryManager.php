<?php
namespace OGAMBundle\Manager;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManager;
use OGAMBundle\Services\QueryService;

/**
 * Class allowing query access to the RAW_DATA tables.
 */
class QueryManager
{

    /**
     * The logger.
     *
     * @var Logger
     */
    var $logger;

    /**
     * The query service.
     *
     * @var QueryService
     */
    protected $queryService;

    /**
     * The metadata Model.
     *
     * @var EntityManager
     */
    protected $metadataModel;

    /**
     * The database connections
     *
     * @var Connection
     */
    private $rawdb;

    /**
     *
     * @var Connection
     */
    private $metadatadb;

    /**
     * Initialisation
     */
    public function __construct($metaModel_em, $raw_em, $queryService, $configuration)
    {
        
        // Initialise the metadata model
        $this->metadataModel = $metaModel_em;
        
        // Initialise the generic service
        $this->queryService = $queryService;
        
        // The database connection
        $this->rawdb = $raw_em->getConnection();
        $this->metadatadb = $metaModel_em->getConnection();
    }

    public function setLogger($logger)
    {
        $this->logger = $logger;
    }

    public function getDatasets()
    {
        return array(
            'success' => true,
            'data' => $this->queryService->getDatasets()
        );
    }

    public function getQueryForms($datasetId, $requestName)
    {
        return $this->queryService->getQueryForms($datasetId, $requestName);
    }

    public function prepareResultLocations($formQuery, $userInfos)
    {
        $this->queryService->prepareResultLocations($formQuery, $userInfos);
    }
}