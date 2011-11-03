<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a dataset file (an input file descriptor).
 * 
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Metadata_DatasetFile {

	/**
	 * The type of the file.
	 */
	var $fileType;
	
	/**
	 * The file identifier. 
	 */
	var $format;
	
	/**
	 * The description of the file.
	 */
	var $label;
	
	/**
	 * The path of the file (used during data upload). 
	 */
	var $filePath;

}