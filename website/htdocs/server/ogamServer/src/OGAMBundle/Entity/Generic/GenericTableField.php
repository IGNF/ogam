<?php
namespace OGAMBundle\Entity\Generic;

use OGAMBundle\Entity\Metadata\TableField;

/**
 * A query field
 */
class GenericTableField extends GenericField
{

    /**
     * The table field metadata
     *
     * @var OGAMBundle\Entity\Metadata\TableField
     */
    private $metadata;

    /**
     *
     * @return the TableField
     */
    public function getMetadata()
    {
        return $this->metadata;
    }

    /**
     *
     * @param OGAMBundle\Entity\Metadata\TableField $metadata
     */
    public function setMetadata(TableField $metadata)
    {
        $this->metadata = $metadata;
        return $this;
    }
}