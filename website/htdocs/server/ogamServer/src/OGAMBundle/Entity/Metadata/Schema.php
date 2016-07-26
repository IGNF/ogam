<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * Schema
 *
 * @ORM\Table(name="metadata.table_schema")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\SchemaRepository")
 */
class Schema
{

    /**
     * The code.
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="schema_code", type="string", length=36, unique=true)
     */
    private $code;

    /**
     * The physical name of the schema (in database).
     * @var string
     *
     * @ORM\Column(name="schema_name", type="string", length=36)
     */
    private $name;

    /**
     * The label.
     * @var string
     *
     * @ORM\Column(name="label", type="string", length=36, nullable=true)
     */
    private $label;

    /**
     * The description.
     * @var string
     *
     * @ORM\Column(name="description", type="string", length=255, nullable=true)
     */
    private $description;


    /**
     * Set code
     *
     * @param string $code
     *
     * @return Schema
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code
     *
     * @return string
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Schema
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set label
     *
     * @param string $label
     *
     * @return Schema
     */
    public function setLabel($label)
    {
        $this->label = $label;

        return $this;
    }

    /**
     * Get label
     *
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Schema
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }
}

