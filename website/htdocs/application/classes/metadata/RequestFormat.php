<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a request format (an input file descriptor).
 * @package classes
 */
class RequestFormat {

	/**
	 * The type of the file
	 */
	var $fileType;
	
	/**
	 * The file identifier 
	 */
	var $format;
	
	/**
	 * The description of the file
	 */
	var $label;
	
	/**
	 * The path of the file (used during data upload) 
	 */
	var $filePath;

}