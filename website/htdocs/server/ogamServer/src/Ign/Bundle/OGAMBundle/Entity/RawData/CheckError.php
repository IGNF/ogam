<?php

namespace Ign\Bundle\OGAMBundle\Entity\RawData;

use Doctrine\ORM\Mapping as ORM;

/**
 * CheckError
 *
 * @ORM\Table(name="raw_data.check_error")
 * @ORM\Entity(repositoryClass="Ign\Bundle\OGAMBundle\Repository\RawData\CheckErrorRepository")
 */
class CheckError
{
    /**
     * @var int
     *
     * @ORM\Column(name="check_error_id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var int
     *
     * @ORM\Column(name="check_id", type="integer")
     */
    private $checkId;

    /**
     * @var Checks
     *
     * @ORM\ManyToOne(targetEntity="Ign\Bundle\OGAMBundle\Entity\Metadata\Checks")
     * @ORM\JoinColumn(name="check_id", referencedColumnName="check_id")
     */
    private $check;

    /**
     * @var int
     *
     * @ORM\Column(name="submission_id", type="integer")
     */
    private $submissionId;

    /**
     * @var int
     *
     * @ORM\Column(name="line_number", type="integer")
     */
    private $lineNumber;

    /**
     * @var string
     *
     * @ORM\Column(name="src_format", type="string", length=36, nullable=true)
     */
    private $srcFormat;

    /**
     * @var string
     *
     * @ORM\Column(name="src_data", type="string", length=36, nullable=true)
     */
    private $srcData;

    /**
     * @var string
     *
     * @ORM\Column(name="provider_id", type="string", length=36, nullable=true)
     */
    private $providerId;

    /**
     * @var string
     *
     * @ORM\Column(name="plot_code", type="string", length=36, nullable=true)
     */
    private $plotCode;

    /**
     * @var string
     *
     * @ORM\Column(name="found_value", type="string", length=255, nullable=true)
     */
    private $foundValue;

    /**
     * @var string
     *
     * @ORM\Column(name="expected_value", type="string", length=255, nullable=true)
     */
    private $expectedValue;

    /**
     * @var string
     *
     * @ORM\Column(name="error_message", type="string", length=4000, nullable=true)
     */
    private $errorMessage;


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
     * Set checkId
     *
     * @param integer $checkId
     *
     * @return CheckError
     */
    public function setCheckId($checkId)
    {
        $this->checkId = $checkId;

        return $this;
    }

    /**
     * Get checkId
     *
     * @return int
     */
    public function getCheckId()
    {
        return $this->checkId;
    }

    /**
     * Set check
     *
     * @param Checks $check
     *
     * @return CheckError
     */
    public function setCheck($check)
    {
        $this->check = $check;

        return $this;
    }

    /**
     * Get check
     *
     * @return Checks
     */
    public function getCheck()
    {
        return $this->check;
    }

    /**
     * Set submissionId
     *
     * @param integer $submissionId
     *
     * @return CheckError
     */
    public function setSubmissionId($submissionId)
    {
        $this->submissionId = $submissionId;

        return $this;
    }

    /**
     * Get submissionId
     *
     * @return int
     */
    public function getSubmissionId()
    {
        return $this->submissionId;
    }

    /**
     * Set lineNumber
     *
     * @param integer $lineNumber
     *
     * @return CheckError
     */
    public function setLineNumber($lineNumber)
    {
        $this->lineNumber = $lineNumber;

        return $this;
    }

    /**
     * Get lineNumber
     *
     * @return int
     */
    public function getLineNumber()
    {
        return $this->lineNumber;
    }

    /**
     * Set srcFormat
     *
     * @param string $srcFormat
     *
     * @return CheckError
     */
    public function setSrcFormat($srcFormat)
    {
        $this->srcFormat = $srcFormat;

        return $this;
    }

    /**
     * Get srcFormat
     *
     * @return string
     */
    public function getSrcFormat()
    {
        return $this->srcFormat;
    }

    /**
     * Set srcData
     *
     * @param string $srcData
     *
     * @return CheckError
     */
    public function setSrcData($srcData)
    {
        $this->srcData = $srcData;

        return $this;
    }

    /**
     * Get srcData
     *
     * @return string
     */
    public function getSrcData()
    {
        return $this->srcData;
    }

    /**
     * Set providerId
     *
     * @param string $providerId
     *
     * @return CheckError
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
     * Set plotCode
     *
     * @param string $plotCode
     *
     * @return CheckError
     */
    public function setPlotCode($plotCode)
    {
        $this->plotCode = $plotCode;

        return $this;
    }

    /**
     * Get plotCode
     *
     * @return string
     */
    public function getPlotCode()
    {
        return $this->plotCode;
    }

    /**
     * Set foundValue
     *
     * @param string $foundValue
     *
     * @return CheckError
     */
    public function setFoundValue($foundValue)
    {
        $this->foundValue = $foundValue;

        return $this;
    }

    /**
     * Get foundValue
     *
     * @return string
     */
    public function getFoundValue()
    {
        return $this->foundValue;
    }

    /**
     * Set expectedValue
     *
     * @param string $expectedValue
     *
     * @return CheckError
     */
    public function setExpectedValue($expectedValue)
    {
        $this->expectedValue = $expectedValue;

        return $this;
    }

    /**
     * Get expectedValue
     *
     * @return string
     */
    public function getExpectedValue()
    {
        return $this->expectedValue;
    }

    /**
     * Set errorMessage
     *
     * @param string $errorMessage
     *
     * @return CheckError
     */
    public function setErrorMessage($errorMessage)
    {
        $this->errorMessage = $errorMessage;

        return $this;
    }

    /**
     * Get errorMessage
     *
     * @return string
     */
    public function getErrorMessage()
    {
        return $this->errorMessage;
    }
}

