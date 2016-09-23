<?php
namespace OGAMBundle\Entity\Generic;

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
     * @param
     *            $format
     */
    public function setFormat($format)
    {
        $this->format = $format;
        return $this;
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
     * @param
     *            $data
     */
    public function setData($data)
    {
        $this->data = $data;
        return $this;
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
}