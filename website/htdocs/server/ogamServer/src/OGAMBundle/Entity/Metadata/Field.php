<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * Field
 *
 * @ORM\MappedSuperclass(repositoryClass="OGAMBundle\Repository\Metadata\FieldRepository")
 */
class Field
{
    /**
     * @var Data
     *
     * @ORM\Id 
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Metadata\Data")
     * @ORM\JoinColumns({@ORM\JoinColumn(name="data", referencedColumnName="data")})
     */
    protected $data;

    /**
     * @var Format
     *
     * @ORM\Id
	 * @ORM\ManyToOne(targetEntity="Format")
	 * @ORM\JoinColumns({@ORM\JoinColumn(name="format", referencedColumnName="format")})
     */
    protected $format;

    /**
     * Set data
     *
     * @param Data $data
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
     * @return Data
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Set format
     *
     * @param Format $format
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
     * @return Format
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
		return $this->getFormat()->getFormat() . '__' . $this->getData()->getData();
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