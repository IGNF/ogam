<?php

/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * Represent a Field of a Database.
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Metadata_TableField extends Application_Object_Metadata_Field {

	/**
	 * The physical name of the column.
	 *
	 * @var String
	 */
	var $columnName;

	/**
	 * Indicate if the field is calculated during an INSERT or UPDATE.
	 *
	 * @var bool
	 */
	var $isCalculated;

	/**
	 * Indicate if the field is editable in the edition module.
	 * Some fields present in the database and calculated by triggers or serials may not be displayed on the screen.
	 *
	 * @var bool
	 */
	var $isEditable;

	/**
	 * Indicate if the field is insertable in the edition module.
	 * Some fields may be editable in "update" mode but may not be displayed when creating a new data (for example a "departement" calculated by trigger on insert).
	 *
	 * @var bool
	 */
	var $isInsertable;

	/**
	 * Indicate if the field is mandatory in the edition module.
	 * The PK fields are always mandatory, but some other fields may be declared as mandatory by the administrator.
	 *
	 * @var bool
	 */
	var $isMandatory;

	/**
	 * These fields are only filled when the table field is of unit GEOM.
	 */
	var $xmin;

	var $xmax;

	var $ymin;

	var $ymax;

	var $center;

	/**
	 * The position of the table field to be displayed.
	 * This is used in the detail panel and in the data edition module.
	 */
	var $position;

	/**
	 * Clone the field
	 */
	function __clone() {
		foreach ($this as $name => $value) {
			if (gettype($value) == 'object') {
				$this->$name = clone ($this->$name);
			}
		}
	}
}
