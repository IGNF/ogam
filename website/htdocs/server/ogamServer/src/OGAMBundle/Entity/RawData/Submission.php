<?php

namespace OGAMBundle\Entity\RawData;

use Doctrine\ORM\Mapping as ORM;

/**
 * Submission.
 *
 * @ORM\Table(name="raw_data.submission")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\RawData\SubmissionRepository")
 */
class Submission
{
    /**
     * The submission identifier.
     * @var int
     *
     * @ORM\Column(name="submission_id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * The submission step (INIT, INSERTED, CHECKED, VALIDATED, CANCELLED).
     * @var string
     *
     * @ORM\Column(name="step", type="string", length=36, nullable=true)
     */
    private $step;

    /**
     * The submission status (OK, WARNING, ERROR, CRASH).
     * @var string
     *
     * @ORM\Column(name="status", type="string", length=36, nullable=true)
     */
    private $status;

    /**
     * The provider (country, organisation) identifier.
     * @var string
     *
     * @ORM\Column(name="provider_id", type="string", length=36, nullable=true)
     */
    private $providerId;

    /**
     * The dataset identifier.
     * @var string
     *
     * @ORM\Column(name="dataset_id", type="string", length=36, nullable=true)
     */
    private $datasetId;

    /**
     * The login of the user who has done the submission.
     * @var string
     *
     * @ORM\Column(name="user_login", type="string", length=50, nullable=true)
     */
    private $userLogin;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="_creationdt", type="datetime", nullable=true)
     */
    private $creationDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="_validationdt", type="datetime", nullable=true)
     */
    private $validationDate;

    /**
     * The files of the submission.
     * @ORM\OneToMany(targetEntity="SubmissionFile", mappedBy="submission")
     */
    private $files;

    /**
     * Constructor.
     */
    public function __construct() {
    	$this->files = new \Doctrine\Common\Collections\ArrayCollection();
    }


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set step
     *
     * @param string $step
     *
     * @return Submission
     */
    public function setStep($step)
    {
        $this->step = $step;

        return $this;
    }

    /**
     * Get step
     *
     * @return string
     */
    public function getStep()
    {
        return $this->step;
    }

    /**
     * Set status
     *
     * @param string $status
     *
     * @return Submission
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
     * Set providerId
     *
     * @param string $providerId
     *
     * @return Submission
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
     * @return Submission
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
     * Set userLogin
     *
     * @param string $userLogin
     *
     * @return Submission
     */
    public function setUserLogin($userLogin)
    {
        $this->userLogin = $userLogin;

        return $this;
    }

    /**
     * Get userLogin
     *
     * @return string
     */
    public function getUserLogin()
    {
        return $this->userLogin;
    }

    /**
     * Set creationDate
     *
     * @param \DateTime $creationDate
     *
     * @return Submission
     */
    public function setCreationDate($creationDate)
    {
        $this->creationDate = $creationDate;

        return $this;
    }

    /**
     * Get creationDate
     *
     * @return \DateTime
     */
    public function getCreationDate()
    {
        return $this->creationDate;
    }

    /**
     * Set validationDate
     *
     * @param \DateTime $validationDate
     *
     * @return Submission
     */
    public function setValidationDate($validationDate)
    {
        $this->validationDate = $validationDate;

        return $this;
    }

    /**
     * Get validationDate
     *
     * @return \DateTime
     */
    public function getValidationDate()
    {
        return $this->validationDate;
    }
}

