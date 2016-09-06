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
    protected $data;

    /**
     * @var string
     *
     * @ORM\Id
	 * @ORM\Column(name="format", type="string", length=36)
     */
    protected $format;


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


	/**
	 * The value of the field (this is not defined in the metadata databae, it's the raw value of the data).
	 * Can be an array in case of a select multiple (will generate a OR clause).
	 *
	 * @var mixed Examples of valid values :
	 *      toto
	 *      12.6
	 *      0.2 - 0.6
	 *      2010/05/12
	 *      2010/05/12 - 2010/06/30
	 *      POINT(3.51, 4.65)
	 */
	var $value;

	/**
	 * The label corresponding to value of the field.
	 *
	 * @var String
	 */
	var $valueLabel;

	/**
	 * Return the unique identifier of the field.
	 *
	 * @return String the identifier of the field
	 */
	function getName() {
		return $this->format . '__' . $this->data;
	}

	/**
	 * Return the label.
	 *
	 * @return String the label
	 */
	function getLabel() {
		if ($this->label != null) {
			return $this->label;
		} else {
			return $this->data;
		}
	}

	/**
	 * Return the label corresponding to the value.
	 * For a code, will return the description.
	 *
	 * @return String the label
	 */
	function getValueLabel() {
		if ($this->valueLabel != null) {
			return $this->valueLabel;
		} else {
			return $this->value;
		}
	}

}