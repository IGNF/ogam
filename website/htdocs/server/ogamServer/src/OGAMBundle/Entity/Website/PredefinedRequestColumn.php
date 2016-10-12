<?php

namespace OGAMBundle\Entity\Webiste;

use Doctrine\ORM\Mapping as ORM;

/**
 * PredefinedRequestColumn
 *
 * @ORM\Table(name="webiste\predefined_request_column")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Webiste\PredefinedRequestColumnRepository")
 */
class PredefinedRequestColumn
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
     * @return PredefinedRequestColumn
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
     * @return PredefinedRequestColumn
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
     * @return PredefinedRequestColumn
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
}

