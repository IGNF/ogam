<?php

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
