<?php
namespace Ign\Bundle\OGAMBundle\Entity\Generic;

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

	function __construct($srcField, $dstField, $schema) {
		$this->srcField = $srcField;
		$this->dstField = $dstField;
		$this->schema = $schema;
	}

	/**
	 *
	 * @return the GenericField
	 */
	public function getSrcField() {
		return $this->srcField;
	}

	/**
	 *
	 * @return the GenericField
	 */
	public function getDstField() {
		return $this->dstField;
	}

	/**
	 *
	 * @return the GenericField
	 */
	public function getSchema() {
		return $this->schema;
	}
}
