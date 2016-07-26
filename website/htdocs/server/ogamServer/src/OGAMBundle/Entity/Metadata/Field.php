<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * Field
 *
 * @ORM\Table(name="metadata.field")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\FieldRepository")
 * @ORM\InheritanceType("JOINED")
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({"FILE" = "FileField", "TABLE" = "TableField", "FORM" = "FormField"})
 */
abstract class Field
{
    /**
     * @var string
     *
     * @ORM\Id
	 * @ORM\Column(name="data", type="string", length=36)
     */
    private $data;

    /**
     * @var string
     *
     * @ORM\Id
	 * @ORM\Column(name="format", type="string", length=36)
     */
    private $format;


    /**
     * Set data
     *
     * @param string $data
     *
     * @return field
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
     * Set format
     *
     * @param string $format
     *
     * @return field
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

}

