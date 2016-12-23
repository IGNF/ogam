<?php

namespace OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;

/**
 * PredefinedRequestGroupAsso
 *
 * @ORM\Table(name="website.predefined_request_group_asso")
 * @ORM\Entity
 */
class PredefinedRequestGroupAsso
{
    /**
     * @var string
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Website\PredefinedRequestGroup", inversedBy="requests")
     * @ORM\JoinColumn(name="group_name", referencedColumnName="name")
     */
    private $groupName;

    /**
     * @var string
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Website\PredefinedRequest", inversedBy="groups")
     * @ORM\JoinColumn(name="request_name", referencedColumnName="name")
     */
    private $requestName;

    /**
     * @var int
     *
     * @ORM\Column(name="position", type="integer", nullable=true)
     */
    private $position;

    /**
     * Set groupName
     *
     * @param string $groupName
     *
     * @return PredefinedRequestGroupAsso
     */
    public function setGroupName($groupName)
    {
        $this->groupName = $groupName;

        return $this;
    }

    /**
     * Get groupName
     *
     * @return string
     */
    public function getGroupName()
    {
        return $this->groupName;
    }

    /**
     * Set requestName
     *
     * @param string $requestName
     *
     * @return PredefinedRequestGroupAsso
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
     * Set position
     *
     * @param integer $position
     *
     * @return PredefinedRequestGroupAsso
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get position
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }
}

