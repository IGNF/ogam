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
 * Represent a map legend item.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Mapping_LegendItem {

	/**
	 * The identifier of the item.
	 * @var Integer
	 */
	var $itemId;

	/**
	 * The identifier of the parent of the item.
	 * @var Integer.
	 */
	var $parentId;

	/**
	 * Defines if the item is a layer (a leaf) or a node.
	 * @var Boolean.
	 */
	var $isLayer;

	/**
	 * Defines if the item is checked by default.
	 * @var Boolean
	 */
	var $isChecked;

	/**
	 * Defines if the node is expended by default.
	 * @var Boolean
	 */
	var $isExpended;

	/**
	 * The label of the item.
	 * @var String
	 */
	var $label;

	/**
	 * The logical name of the layer in OpenLayers.
	 * @var String
	 */
	var $layerName;

	/**
	 * Defines if the item is hidden by default (value = 1).
	 * @var Boolean
	 */
	var $isHidden;

	/**
	 * Defines if the item is disabled (grayed) by default (value = 1).
	 * @var Boolean
	 */
	var $isDisabled;

}
