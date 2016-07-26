<?php

namespace OGAMBundle\Entity\Mapping;

use Doctrine\ORM\Mapping as ORM;

/**
 * Service
 *
 * @ORM\Table(name="mapping.service")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Mapping\ServiceRepository")
 */
class Service
{


    /**
     * The name of the service.
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="service_name", type="string", length=50, unique=true)
     */
    private $serviceName;

    /**
     * The configuration with base url and parameters of the service.
     * @var string
     *
     * @ORM\Column(name="serviceConfig", type="string", length=1000, nullable=true)
     */
    private $serviceConfig;


    /**
     * Set serviceName
     *
     * @param string $serviceName
     *
     * @return Service
     */
    public function setServiceName($serviceName)
    {
        $this->serviceName = $serviceName;

        return $this;
    }

    /**
     * Get serviceName
     *
     * @return string
     */
    public function getServiceName()
    {
        return $this->serviceName;
    }

    /**
     * Set serviceConfig
     *
     * @param string $serviceConfig
     *
     * @return Service
     */
    public function setServiceConfig($serviceConfig)
    {
        $this->serviceConfig = $serviceConfig;

        return $this;
    }

    /**
     * Get serviceConfig
     *
     * @return string
     */
    public function getServiceConfig()
    {
        return $this->serviceConfig;
    }
}

