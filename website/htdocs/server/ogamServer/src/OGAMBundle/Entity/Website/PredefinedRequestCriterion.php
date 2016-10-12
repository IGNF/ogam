<?php

namespace OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;

/**
 * PredefinedRequestCriteria
 *
 * @ORM\Table(name="website\predefined_request_criterion")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Website\PredefinedRequestCriterionRepository")
 */
class PredefinedRequestCriterion
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Website\PredefinedRequest")
     * @ORM\JoinColumn(name="requestName", referencedColumnName="name")
     */
    private $requestName;

    /**
     * @var string
     *
     * @ORM\Column(name="format", type="string", length=36)
     */
    private $format;

    /**
     * @var string
     *
     * @ORM\Column(name="data", type="string", length=36)
     */
    private $data;

    /**
     * @var string
     *
     * @ORM\Column(name="value", type="string", length=500)
     */
    private $value;

    /**
     * @var bool
     *
     * @ORM\Column(name="fixed", type="boolean")
     */
    private $fixed;


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
     * Set requestName
     *
     * @param string $requestName
     *
     * @return PredefinedRequestCriteria
     */
    public function setRequestName($requestName)
    {
        $this->requestName = $requestName;

        return $this;
    }

    /**
     * Get requestName
     *
     * @return string
     */
    public function getRequestName()
    {
        return $this->requestName;
    }

    /**
     * Set format
     *
     * @param string $format
     *
     * @return PredefinedRequestCriteria
     */
    public function setFormat($format)
    {
        $this->format = $format;

        return $this;
    }

    /**
     * Get format
     *
     * @return string
     */
    public function getFormat()
    {
        return $this->format;
    }

    /**
     * Set data
     *
     * @param string $data
     *
     * @return PredefinedRequestCriteria
     */
    public function setData($data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Get data
     *
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Set value
     *
     * @param string $value
     *
     * @return PredefinedRequestCriteria
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return string
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set fixed
     *
     * @param boolean $fixed
     *
     * @return PredefinedRequestCriteria
     */
    public function setFixed($fixed)
    {
        $this->fixed = $fixed;

        return $this;
    }

    /**
     * Get fixed
     *
     * @return bool
     */
    public function getFixed()
    {
        return $this->fixed;
    }
}

