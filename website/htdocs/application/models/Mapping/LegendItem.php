<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a map legend item.
 *
 * @package classes
 */
class Application_Model_Mapping_LegendItem {

	/**
	 * The identifier of the item.
	 */
	var $itemId;

	/**
	 * The identifier of the parent of the item.
	 */
	var $parentId;

	/**
	 * Defines if the item is a layer (a leaf) or a node.
	 */
	var $isLayer;

	/**
	 * Defines if the item is checked by default.
	 */
	var $isChecked;

	/**
	 * Defines if the node is expended by default.
	 */
	var $isExpended;

	/**
	 * The label of the item.
	 */
	var $label;

	/**
	 * The logical name of the layer in OpenLayers.
	 */
	var $layerName;

	/**
	 * Defines if the item is hidden by default (value = 1)
	 */
	var $isHidden;

	/**
	 * Defines if the item is disabled (grayed) by default (value = 1)
	 */
	var $isDisabled;

}
