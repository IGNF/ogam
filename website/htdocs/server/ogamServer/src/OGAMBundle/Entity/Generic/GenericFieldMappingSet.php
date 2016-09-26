<?php

namespace OGAMBundle\Entity\Generic;

/**
 * A data object is used to store a values of a line of data (from any table of a database).
 */
class GenericFieldMappingSet {

    /**
     * The schema use to filter the mapping
     *
     * @var string
     */
    private $schema;

    /**
     * The field mapping set
     *
     * @var [OGAMBundle\Entity\Generic\GenericFieldMapping]
     */
    private $fieldMappingSet;

    function __construct($fieldMappingSet, $schema) {
        $this->fieldMappingSet = $fieldMappingSet;
        $this->schema = $schema;
    }
    
    /**
     *
     * @return the string
     */
    public function getSchema()
    {
        return $this->schema;
    }

    /**
     *
     * @return the field mapping set
     */
    public function getFieldMappingSet()
    {
        return $this->fieldMappingSet;
    }
    
    public function getFieldMapping($srcField){
        for($i = 0; $i < count($this->fieldMappingSet); $i++){
            if($this->fieldMappingSet[$i]->getSrcField()->getId() === $srcField->getId()) {
                return $this->fieldMappingSet[$i];
            }
        }
        return null;
    }
}