<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * FormFormat
 *
 * @ORM\Table(name="metadata.form_format")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\FormFormatRepository")
 */
class FormFormat extends Format
{

    /**
     * The label of the form.
     * @var string
     *
     * @ORM\Column(name="label", type="string", length=60, nullable=true)
     */
    private $label;

    /**
     * The definition of the form.
     * @var string
     *
     * @ORM\Column(name="definition", type="string", length=255, nullable=true)
     */
    private $definition;

    /**
     * @var int
     *
     * @ORM\Column(name="position", type="integer", nullable=true)
     */
    private $position;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_opened", type="boolean", nullable=true)
     */
    private $isOpened;


    /**
     * The list of result columns.
     */
    var $resultsList = array();

    /**
     * The list of criteria columns.
     */
    var $criteriaList = array();



    /**
     * Set label
     *
     * @param string $label
     *
     * @return FormFormat
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
     * Set definition
     *
     * @param string $definition
     *
     * @return FormFormat
     */
    public function setDefinition($definition)
    {
        $this->definition = $definition;

        return $this;
    }

    /**
     * Get definition
     *
     * @return string
     */
    public function getDefinition()
    {
        return $this->definition;
    }

    /**
     * Set position
     *
     * @param integer $position
     *
     * @return FormFormat
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

    /**
     * Set isOpened
     *
     * @param boolean $isOpened
     *
     * @return FormFormat
     */
    public function setIsOpened($isOpened)
    {
        $this->isOpened = $isOpened;

        return $this;
    }

    /**
     * Get isOpened
     *
     * @return bool
     */
    public function getIsOpened()
    {
        return $this->isOpened;
    }


    /**
     * Serialize the object as a JSON string
     *
     * @return a JSON string
     */
    public function toJSON() {
    	return '"id":' . json_encode($this->format) . ',"label":' . json_encode($this->label);
    }
}

