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
	const STEP_INIT = 'INIT';
	const STEP_INSERTED = 'INSERTED';
	const STEP_CHECKED = 'CHECKED';
	const STEP_VALIDATED = 'VALIDATED';
	const STEP_CANCELLED = 'CANCELLED';
	const STATUS_OK= 'OK';
	const STATUS_RUNNING= 'RUNNING';
	const STATUS_WARNING = 'WARNING';
	const STATUS_ERROR = 'ERROR';
	const STATUS_CRASH = 'CRASH';
	
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
     * The provider (country, organisation).
     *
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Website\Provider")
     * @ORM\JoinColumn(name="provider_id", referencedColumnName="id")
     */
    private $provider;

    /**
     * The dataset
     *
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Metadata\Dataset")
     * @ORM\JoinColumn(name="dataset_id", referencedColumnName="dataset_id")
     */
    private $dataset;

    /**
     * The login of the user who has done the submission.
     *
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Website\User")
     * @ORM\JoinColumn(name="user_login", referencedColumnName="user_login")
     */
    private $user;

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

    /**
     * Set provider
     *
     * @param \OGAMBundle\Entity\Website\Provider $provider
     *
     * @return Submission
     */
    public function setProvider(\OGAMBundle\Entity\Website\Provider $provider = null)
    {
        $this->provider = $provider;

        return $this;
    }

    /**
     * Get provider
     *
     * @return \OGAMBundle\Entity\Website\Provider
     */
    public function getProvider()
    {
        return $this->provider;
    }

    /**
     * Set dataset
     *
     * @param \OGAMBundle\Entity\Metadata\Dataset $dataset
     *
     * @return Submission
     */
    public function setDataset(\OGAMBundle\Entity\Metadata\Dataset $dataset = null)
    {
        $this->dataset = $dataset;

        return $this;
    }

    /**
     * Get dataset
     *
     * @return \OGAMBundle\Entity\Metadata\Dataset
     */
    public function getDataset()
    {
        return $this->dataset;
    }

    /**
     * Add file
     *
     * @param \OGAMBundle\Entity\RawData\SubmissionFile $file
     *
     * @return Submission
     */
    public function addFile(\OGAMBundle\Entity\RawData\SubmissionFile $file)
    {
        $this->files[] = $file;

        return $this;
    }

    /**
     * Remove file
     *
     * @param \OGAMBundle\Entity\RawData\SubmissionFile $file
     */
    public function removeFile(\OGAMBundle\Entity\RawData\SubmissionFile $file)
    {
        $this->files->removeElement($file);
    }

    /**
     * Get files
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getFiles()
    {
        return $this->files;
    }

    /**
     * Set user
     *
     * @param \OGAMBundle\Entity\Website\User $user
     *
     * @return Submission
     */
    public function setUser(\OGAMBundle\Entity\Website\User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \OGAMBundle\Entity\Website\User
     */
    public function getUser()
    {
        return $this->user;
    }
}
