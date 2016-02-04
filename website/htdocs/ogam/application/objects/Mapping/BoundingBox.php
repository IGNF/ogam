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
 * Represent a providers's role.
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Mapping_BoundingBox {

	/**
	 * The provider Id.
	 *
	 * @var
	 *
	 */
	var $provider_id;

	/**
	 * XMin
	 * 
	 * @var int
	 */
	var $bb_xmin = -899390;

	/**
	 * YMin
	 * 
	 * @var int
	 */
	var $bb_ymin = 6742320;

	/**
	 * XMax
	 * 
	 * @var int
	 */
	var $bb_xmax = 1351350;

	/**
	 * YMAx
	 * 
	 * @var int
	 */
	var $bb_ymax = 4883370;

	/**
	 * Zoom level
	 * 
	 * @var int
	 */
	var $zoom_level = 1;
}