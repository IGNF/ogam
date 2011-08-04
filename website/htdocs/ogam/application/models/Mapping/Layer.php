<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a map layer.
 *
 * @package classes
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Model_Mapping_Layer {

	/**
	 * The logical name of the layer.
	 */
	var $layerName;

	/**
	 * The label of the layer.
	 */
	var $layerLabel;

	/**
	 * The names of the mapserver layers composing this logical layer.
	 */
	var $mapservLayers;

	/**
	 * Indicate if the layer is transparent.
	 * 1 for yes
	 * 0 for no
	 */
	var $isTransparent;

	/**
	 * Indicate if the layer is a base layer.
	 * 1 base layer
	 * 0 overlay layer
	 */
	var $isBaseLayer;

	/**
	 * Force OpenLayers not to tile this layer (to avoid problems with labels for exemple).
	 * 1 force untiled
	 * 0 tiled by default
	 */
	var $isUntiled;

	/**
	 * Indicate if the layer is stored in cache (tilecache).
	 * 1 in cache
	 * 0 not in cache
	 */
	var $isCached;

	/**
	 * The max scale of apparition of the layer.
	 */
	var $maxscale;

	/**
	 * The min scale of apparition of the layer.
	 */
	var $minscale;

	/**
	 * The transizion effect to use ('resize' or null).
	 */
	var $transitionEffect;

	/**
	 * The image format (PNG, JPEG, ...)
	 */
	var $imageFormat;

	/**
	 * Indicate the level of opacity of the layer by defaut.
	 * No opacity if null
	 * A value between 0 and 100 otherwise
	 */
	var $opacity;

	/**
	 * Defines if the item is checked by default (value = 1)
	 */
	var $isChecked;
		
	/**
	 * Defines if the item is hidden by default (value = 1)
	 */
	var $isHidden;
		
	/**
	 * Defines if the item is disabled (grayed) by default (value = 1)
	 */
	var $isDisabled;

	/**
	 * Tells if the layer has a legend that should be displayed (value = 1 for true).
	 */
	var $hasLegend;
	
	/**
	 * Tells if the layer launch the generation of a SLD information.
	 */
	var $hasSLD;
	
	/**
	 * If the layer is activated by an event, defines the category of event that will activate this layer.
	 * Possible values are : NONE, REQUEST, AGGREGATION, HARMONIZATION 
	 */
	var $activateType;

}
