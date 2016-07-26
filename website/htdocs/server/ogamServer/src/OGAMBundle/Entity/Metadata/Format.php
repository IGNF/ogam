<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * Represent an abstract Format.
 *
 * @ORM\Table(name="metadata.format")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\FormatRepository")
 * @ORM\InheritanceType("JOINED")
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({"FILE" = "FileFormat", "TABLE" = "TableFormat", "FORM" = "FormFormat"})
 */
abstract class Format
{

    /**
     * The format identifier.
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="format", type="string", length=36, unique=true)
     */
    private $format;

    /**
     * Set format
     *
     * @param string $format
     *
     * @return Format
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

