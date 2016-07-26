<?php

namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * TableFormat
 *
 * @ORM\Table(name="metadata.table_format")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\TableFormatRepository")
 */
class TableFormat extends Format
{

    /**
     * The real name of the table.
     * @var string
     *
     * @ORM\Column(name="tableName", type="string", length=36)
     */
    private $tableName;

    /**
     * The schema identifier.
     * @var string
     *
     * @ORM\Column(name="schemaCode", type="string", length=36, nullable=true)
     */
    private $schemaCode;

    /**
     * The primary key.
     * Stored as a comma-separated list in a tring.
     *
     * @var string
     *
     * @ORM\Column(name="primaryKeys", type="string", length=255, nullable=true)
     */
    private $primaryKeys;

    /**
     * The label.
     * @var string
     *
     * @ORM\Column(name="label", type="string", length=255, nullable=true)
     */
    private $label;



    /**
     * Set tableName
     *
     * @param string $tableName
     *
     * @return TableFormat
     */
    public function setTableName($tableName)
    {
        $this->tableName = $tableName;

        return $this;
    }

    /**
     * Get tableName
     *
     * @return string
     */
    public function getTableName()
    {
        return $this->tableName;
    }

    /**
     * Set schemaCode
     *
     * @param string $schemaCode
     *
     * @return TableFormat
     */
    public function setSchemaCode($schemaCode)
    {
        $this->schemaCode = $schemaCode;

        return $this;
    }

    /**
     * Get schemaCode
     *
     * @return string
     */
    public function getSchemaCode()
    {
        return $this->schemaCode;
    }


    /**
     * Set primaryKeys
     *
     * @param Array $primaryKeys
     *
     * @return TableFormat
     */
    public function setPrimaryKeys($primaryKeys)
    {
        $this->primaryKeys = implode(",", $primaryKeys);

        return $this;
    }


    /**
     * Get primaryKeys
     *
     * @return Array
     */
    public function getPrimaryKeys()
    {
    	$primaryKeys = array();
    	$pks = explode(",", $this->primaryKeys);
    	foreach ($pks as $pk) {
    		$primaryKeys[] = trim($pk); // we need to trim all the values
    	}

        return $primaryKeys;
    }

    /**
     * Set label
     *
     * @param string $label
     *
     * @return TableFormat
     */
    public function setLabel($label)
    {
        $this->label = $label;

        return $this;
    }

    /**
     * Get label
     *
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }



}

