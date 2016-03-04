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
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
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
	 * Force OpenLayer to request one image each time.
	 * @var Boolean
	 */
	var $isUntiled;
	
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
	 * Indicates the service for displaying the layers in the map panel.
	 * 
	 * @var String
	 */
	var $viewServiceName;

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
	 * The transizion effect to use ('resize' or null).
	 * 
	 * @var String
	 */
	var $transitionEffect;

	/**
	 * The image format (PNG, JPEG, .
	 * ..).
	 * 
	 * @var String
	 */
	var $imageFormat;

	/**
	 * Defines if the item is checked by default.
	 * 
	 * @var Boolean.
	 */
	var $isChecked;

	/**
	 * Defines if the item is hidden by default.
	 * 
	 * @var Boolean
	 */
	var $isHidden;

	/**
	 * Defines if the item is disabled (grayed) by default.
	 * 
	 * @var Boolean
	 */
	var $isDisabled;

	/**
	 * Tells if the layer launch the generation of a SLD information.
	 * 
	 * @var Boolean.
	 */
	var $hasSLD;

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
	 * Indicates the service to call for printing map in pdf.
	 * 
	 * @var String
	 */
	var $printServiceName;

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
	var $featureInfoServiceName;

	/**
	 * Indicates the service to call for displaying legend.
	 * 
	 * @var String
	 */
	var $legendServiceName;
}