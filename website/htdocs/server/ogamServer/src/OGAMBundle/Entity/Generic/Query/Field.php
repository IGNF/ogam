<?php

namespace OGAMBundle\Entity\Generic\Query;

/**
 * A query field
 */
class Field {

    /**
     * The format of the field
     * @var string
     */
	private $format;
	
	/**
     * The data of the field
     * @var string
     */
	private $data;

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
}