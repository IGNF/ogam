<?php

namespace OGAMBundle\Entity\Generic;

/**
 * A data object is used to store a values of a line of data (from any table of a database).
 */
class GenericFieldMapping {

    /**
     * The schema use to filter the mapping
     *
     * @var string
     */
    private $schema;

    /**
     * The source field
     *
     * @var OGAMBundle\Entity\Generic\GenericField
     */
    private $srcField;

    /**
     * The destination field
     *
     * @var OGAMBundle\Entity\Generic\GenericField
     */
    private $dstField;

    /**
     *
     * @return the GenericField
     */
    public function getSchema()
    {
        return $this->schema;
    }

    /**
     *
     * @param string $schema
     */
    public function setSchema($schema)
    {
        $this->schema = $schema;
        return $this;
    }

    /**
     *
     * @return the GenericField
     */
    public function getSrcField()
    {
        return $this->srcField;
    }

    /**
     *
     * @param OGAMBundle\Entity\Generic\GenericField $srcField
     */
    public function setSrcField(GenericField $srcField)
    {
        $this->srcField = $srcField;
        return $this;
    }

    /**
     *
     * @return the GenericField
     */
    public function getDstField()
    {
        return $this->dstField;
    }

    /**
     *
     * @param OGAMBundle\Entity\Generic\GenericField $dstField
     */
    public function setDstField(GenericField $dstField)
    {
        $this->dstField = $dstField;
        return $this;
    }
}
