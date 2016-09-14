<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * FormField
 *
 * @ORM\Table(name="metadata.form_field")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\FormFieldRepository")
 */
class FormField implements \JsonSerializable 
{
    /** FIELD *************************************************/

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
     * @ORM\ManyToOne(targetEntity="FormFormat", inversedBy="fields")
     * @ORM\JoinColumn(name="format", referencedColumnName="format")
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
    
    /** /FIELD *********************************************/

    /**
     * @var bool
     *
     * @ORM\Column(name="is_criteria", type="boolean", nullable=true)
     */
    private $isCriteria;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_result", type="boolean", nullable=true)
     */
    private $isResult;

    /**
     * @var string
     *
     * @ORM\Column(name="input_type", type="string", length=128, nullable=true)
     */
    private $inputType;

    /**
     * @var int
     *
     * @ORM\Column(name="position", type="integer", nullable=true)
     */
    private $position;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_default_criteria", type="boolean", nullable=true)
     */
    private $isDefaultCriteria;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_default_result", type="boolean", nullable=true)
     */
    private $isDefaultResult;

    /**
     * @var string
     *
     * @ORM\Column(name="default_value", type="string", length=255, nullable=true)
     */
    private $defaultValue;

    /**
     * @var int
     *
     * @ORM\Column(name="decimals", type="integer", nullable=true)
     */
    private $decimals;

    /**
     * @var string
     *
     * @ORM\Column(name="mask", type="string", length=100, nullable=true)
     */
    private $mask;


    /**
     * Set isCriteria
     *
     * @param boolean $isCriteria
     *
     * @return FormField
     */
    public function setIsCriteria($isCriteria)
    {
        $this->isCriteria = $isCriteria;

        return $this;
    }

    /**
     * Get isCriteria
     *
     * @return bool
     */
    public function getIsCriteria()
    {
        return $this->isCriteria;
    }

    /**
     * Set isResult
     *
     * @param boolean $isResult
     *
     * @return FormField
     */
    public function setIsResult($isResult)
    {
        $this->isResult = $isResult;

        return $this;
    }

    /**
     * Get isResult
     *
     * @return bool
     */
    public function getIsResult()
    {
        return $this->isResult;
    }

    /**
     * Set inputType
     *
     * @param string $inputType
     *
     * @return FormField
     */
    public function setInputType($inputType)
    {
        $this->inputType = $inputType;

        return $this;
    }

    /**
     * Get inputType
     *
     * @return string
     */
    public function getInputType()
    {
        return $this->inputType;
    }

    /**
     * Set position
     *
     * @param integer $position
     *
     * @return FormField
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
     * Set isDefaultCriteria
     *
     * @param boolean $isDefaultCriteria
     *
     * @return FormField
     */
    public function setIsDefaultCriteria($isDefaultCriteria)
    {
        $this->isDefaultCriteria = $isDefaultCriteria;

        return $this;
    }

    /**
     * Get isDefaultCriteria
     *
     * @return bool
     */
    public function getIsDefaultCriteria()
    {
        return $this->isDefaultCriteria;
    }

    /**
     * Set isDefaultResult
     *
     * @param boolean $isDefaultResult
     *
     * @return FormField
     */
    public function setIsDefaultResult($isDefaultResult)
    {
        $this->isDefaultResult = $isDefaultResult;

        return $this;
    }

    /**
     * Get isDefaultResult
     *
     * @return bool
     */
    public function getIsDefaultResult()
    {
        return $this->isDefaultResult;
    }

    /**
     * Set defaultValue
     *
     * @param integer $defaultValue
     *
     * @return FormField
     */
    public function setDefaultValue($defaultValue)
    {
    	$this->defaultValue = $defaultValue;

    	return $this;
    }

    /**
     * Get defaultValue
     *
     * @return int
     */
    public function getDefaultValue()
    {
    	return $this->defaultValue;
    }


    /**
     * Set decimals
     *
     * @param integer $decimals
     *
     * @return FormField
     */
    public function setDecimals($decimals)
    {
        $this->decimals = $decimals;

        return $this;
    }

    /**
     * Get decimals
     *
     * @return int
     */
    public function getDecimals()
    {
        return $this->decimals;
    }

    /**
     * Set mask
     *
     * @param string $mask
     *
     * @return FormField
     */
    public function setMaks($mask)
    {
        $this->mask = $mask;

        return $this;
    }

    /**
     * Get mask
     *
     * @return string
     */
    public function getMask()
    {
        return $this->mask;
    }

    /**
     * Set mask
     *
     * @param string $mask
     *
     * @return FormField
     */
    public function setMask($mask)
    {
        $this->mask = $mask;

        return $this;
    }
    
    /**
     * Serialize the object as a JSON string
     *
     * @return a JSON string
     */
    public function jsonSerialize() {
        return [
            'data' => $this->data,
            'format' => $this->format->getFormat(),
            'is_criteria' => $this->isCriteria,
            'is_result' => $this->isResult,
            'input_type' => $this->inputType,
            'position' => $this->position,
            'is_default_criteria' => $this->isDefaultCriteria,
            'is_default_result' => $this->isDefaultResult,
            'default_value' => $this->defaultValue,
            'decimals' => $this->decimals,
            'mask' => $this->mask
        ];
    }
}
