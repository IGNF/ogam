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
 * Represent a Bounding Box.
 *
 * @SuppressWarnings checkUnusedVariables
 *
 * @package Application_Object
 * @subpackage Mapping
 */
class Application_Object_Mapping_BoundingBox {

	/**
	 * X Min.
	 *
	 * @var int
	 */
	var $xmin = 0;

	/**
	 * Y Min.
	 *
	 * @var int
	 */
	var $ymin = 0;

	/**
	 * X Max.
	 *
	 * @var int
	 */
	var $xmax = 0;

	/**
	 * Y Max.
	 *
	 * @var int
	 */
	var $ymax = 0;

	/**
	 * Zoom Level (optional).
	 *
	 * @var int
	 */
	var $zoomLevel = 1;

	/**
	 * Create a new BoundingBox object with default values.
	 *
	 * @return Application_Object_Mapping_BoundingBox the BoundingBox
	 */
	public static function createDefaultBoundingBox() {

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");

		return Application_Object_Mapping_BoundingBox::createBoundingBox($configuration->bbox_x_min, $configuration->bbox_x_max, $configuration->bbox_y_min, $configuration->bbox_y_max);
	}

	/**
	 * Create a new BoundingBox object, making sure that the Box is square.
	 *
	 * @param Integer $xmin
	 *        	x min position
	 * @param Integer $xmax
	 *        	x max position
	 * @param Integer $ymin
	 *        	y min position
	 * @param Integer $ymax
	 *        	y max position
	 * @param Integer $minSize
	 *        	min size (default to 10 000)
	 * @return Application_Object_Mapping_BoundingBox the BoundingBox
	 */
	public static function createBoundingBox($xmin, $xmax, $ymin, $ymax, $minSize = 10000) {
		$diffX = abs($xmax - $xmin);
		$diffY = abs($ymax - $ymin);

		// Enlarge the bb if it's too small (like for the point)
		if ($diffX < $minSize) {
			$addX = ($minSize - $diffX) / 2;
			$xmin = $xmin - $addX;
			$xmax = $xmax + $addX;
			$diffX = $minSize;
		}
		if ($diffY < $minSize) {
			$addY = ($minSize - $diffY) / 2;
			$ymin = $ymin - $addY;
			$ymax = $ymax + $addY;
			$diffY = $minSize;
		}

		// Setup the bb like a square
		$diffXY = $diffX - $diffY;

		if ($diffXY < 0) {
			// The bb is highter than large
			$xmin = $xmin + $diffXY / 2;
			$xmax = $xmax - $diffXY / 2;
		} else if ($diffXY > 0) {
			// The bb is larger than highter
			$ymin = $ymin - $diffXY / 2;
			$ymax = $ymax + $diffXY / 2;
		}

		$bb = new Application_Object_Mapping_BoundingBox();
		$bb->xmin = $xmin;
		$bb->ymin = $ymin;
		$bb->xmax = $xmax;
		$bb->ymax = $ymax;

		return $bb;
	}
}