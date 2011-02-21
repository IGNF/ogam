<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent the status of a process (integration or harmonization service).
 *
 * @package classes
 */
class ProcessStatus {

	/**
	 * The status.
	 */
	var $status;

	/**
	 * The name of the current task.
	 */
	var $taskName;

	/**
	 * The position of the process in the current task.
	 */
	var $currentCount;

	/**
	 * The total count of items in the current task.
	 */
	var $totalCount;

}
