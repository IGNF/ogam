<?php

namespace OGAMBundle\Entity\Generic\Query;

/**
 * A query criteria field
 */
class CriteriaField extends Field{

    /**
     * The value of the field
     * @var string
     */
	private $value;

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