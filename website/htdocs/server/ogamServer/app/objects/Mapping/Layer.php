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
 * Represent a map layer.
 *
 * @SuppressWarnings checkUnusedVariables
 *
 * @package Application_Object
 * @subpackage Mapping
 */
class Application_Object_Mapping_Layer {

	/**
	 * The logical name of the layer.
	 *
	 * @var String
	 */
	var $layerName;

	/**
	 * The label of the layer.
	 *
	 * @var String
	 */
	var $layerLabel;

	/**
	 * The name of the service layer composing this logical layer.
	 *
	 * @var String
	 */
	var $serviceLayerName;

	/**
	 * Indicate if the layer is transparent.
	 *
	 * @var Boolean
	 */
	var $isTransparent;

	/**
	 * Default value of layer opacity : 0 to 100, default value = 100.
	 *
	 * @var Integer
	 */
	var $defaultOpacity;

	/**
	 * Indicate if the layer is a base layer.
	 *
	 * @var Boolean
	 */
	var $isBaseLayer;

	/**
	 * Force OpenLayer to request one image each time.
	 *
	 * @var Boolean
	 */
	var $isUntiled;

	/**
	 * The max scale of apparition of the layer.
	 *
	 * @var Integer
	 */
	var $maxscale;

	/**
	 * The min scale of apparition of the layer.
	 *
	 * @var Integer
	 */
	var $minscale;

	/**
	 * Indicate if the layer has a Legend available.
	 *
	 * @var Boolean
	 */
	var $hasLegend;

	/**
	 * If empty, the layer can be seen by any country, if not it is limited to one country.
	 *
	 * @var String
	 */
	var $providerId;

	/**
	 * If the layer is activated by an event, defines the category of event that will activate this layer.
	 * Possible values are : NONE, REQUEST, AGGREGATION, HARMONIZATION.
	 *
	 * @var String
	 */
	var $activateType;

	/**
	 * Allow to regroup layers.
	 *
	 * If two layers are in the same group, they will appear with a radio button in the layer tree.
	 *
	 * @var String
	 */
	var $checkedGroup;

	/**
	 * Indicates the service for displaying the layers in the map panel.
	 *
	 * @var String
	 */
	var $viewServiceName;

	/**
	 * Indicates the service to call for displaying legend.
	 *
	 * @var String
	 */
	var $legendServiceName;

	/**
	 * Indicates the service to call for detail panel.
	 *
	 * @var String
	 */
	var $detailServiceName;

	/**
	 * Indicates the service to call for wfs menu.
	 *
	 * @var String
	 */
	var $featureServiceName;

	/**
	 * Layer Tree info linked to the layer.
	 * (Used only when retreiving the layers list).
	 *
	 * @var Application_Object_Mapping_LegendItem
	 */
	var $treeItem;
}
