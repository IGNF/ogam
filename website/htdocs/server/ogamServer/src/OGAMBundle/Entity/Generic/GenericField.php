<?php
namespace OGAMBundle\Entity\Generic;

use OGAMBundle\Entity\Metadata\Field;

/**
 * A query field
 */
class GenericField
{

    /**
     * The format of the field
     *
     * @var string
     */
    private $format;

    /**
     * The data of the field
     *
     * @var string
     */
    private $data;

    /**
     * The value of the field
     *
     * @var string
     */
    private $value;

    /**
     * The metadata locale
     *
     * @var string
     */
    private $locale;

    /**
     * The field metadata
     *
     * @var OGAMBundle\Entity\Metadata\Field
     */
    private $metadata;
    
    function __construct($format, $data) {
        $this->format = $format;
        $this->data = $data;
    }
    
    /**
     *
     * @return the string
     */
    public function getId()
    {
        return $this->format . '__' . $this->data;
    }

    /**
     *
     * @return the string
     */
    public function getFormat()
    {
        return $this->format;
    }

    /**
     *
     * @return the string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     *
     * @return the string
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     *
     * @param
     *            $value
     */
    public function setValue($value)
    {
        $this->value = $value;
        return $this;
    }

    /**
     *
     * @return the string
     */
    public function getLocale()
    {
        return $this->locale;
    }

    /**
     *
     * @return the Field
     */
    public function getMetadata()
    {
        return $this->metadata;
    }
    

    public function setMetadata(Field $metadata, $locale)
    {
        $this->locale = $locale;
        $this->metadata = $metadata;
    }
}
