<?php

namespace OGAMBundle\Entity\HarmonizedData;

use Doctrine\ORM\Mapping as ORM;

/**
 * HarmonizationProcess
 *
 * @ORM\Table(name="harmonized_data.harmonization_process")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\HarmonizedData\HarmonizationProcessRepository")
 */
class HarmonizationProcess
{


    /**
     * @var int
     *
     * @ORM\Column(name="harmonization_process_id", type="integer", unique=true)
     * @ORM\Id
     */
    private $harmonizationId;

    /**
     * @var string
     *
     * @ORM\Column(name="provider_id", type="string", length=36)
     */
    private $providerId;

    /**
     * @var string
     *
     * @ORM\Column(name="dataset_id", type="string", length=36)
     */
    private $datasetId;

    /**
     * @var string
     *
     * @ORM\Column(name="harmonization_status", type="string", length=36, nullable=true)
     */
    private $status;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="_creationdt", type="datetime", nullable=true)
     */
    private $date;



    /**
     * Set harmonizationId
     *
     * @param integer $harmonizationId
     *
     * @return HarmonizationProcess
     */
    public function setHarmonizationId($harmonizationId)
    {
        $this->harmonizationId = $harmonizationId;

        return $this;
    }

    /**
     * Get harmonizationId
     *
     * @return int
     */
    public function getHarmonizationId()
    {
        return $this->harmonizationId;
    }

    /**
     * Set providerId
     *
     * @param string $providerId
     *
     * @return HarmonizationProcess
     */
    public function setProviderId($providerId)
    {
        $this->providerId = $providerId;

        return $this;
    }

    /**
     * Get providerId
     *
     * @return string
     */
    public function getProviderId()
    {
        return $this->providerId;
    }

    /**
     * Set datasetId
     *
     * @param string $datasetId
     *
     * @return HarmonizationProcess
     */
    public function setDatasetId($datasetId)
    {
        $this->datasetId = $datasetId;

        return $this;
    }

    /**
     * Get datasetId
     *
     * @return string
     */
    public function getDatasetId()
    {
        return $this->datasetId;
    }

    /**
     * Set status
     *
     * @param string $status
     *
     * @return HarmonizationProcess
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set date
     *
     * @param \DateTime $date
     *
     * @return HarmonizationProcess
     */
    public function setDate($date)
    {
        $this->date = $date;

        return $this;
    }

    /**
     * Get date
     *
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->data;
    }
}

