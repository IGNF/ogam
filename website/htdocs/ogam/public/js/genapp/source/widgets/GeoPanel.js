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
 * Panel containing the dynamic map.
 * <p>
 * Contains : <br>
 * a GeoExt mapPanel for the map.<br>
 * a GeoExt widgets.LayerTree for the legend.<br>
 * <br>
 * 
 * @class Genapp.GeoPanel
 * @extends Ext.Panel
 * @constructor Create a new GeoPanel
 * @param {Object}
 *            config The config object
 */
Genapp.GeoPanel = Ext
		.extend(
				Ext.Panel,
				{

					/**
					 * Internationalization.
					 */
					title : 'Map',
					popupTitle : 'Feature information',
					tabTip : 'The map with the request\'s results\'s location',
					layerPanelTitle : "Layers",
					layerPanelTabTip : "The layers's tree",
					legendPanelTitle : "Legends",
					legendPanelTabTip : "The layers's legends",
					panZoomBarControlTitle : "Zoom",
					navigationControlTitle : "Drag the map",
					invalidWKTMsg : "The feature cannot be displayed",
					zoomToFeaturesControlTitle : "Zoom to the features",
					zoomToResultControlTitle : "Zoom to the results",
					drawPointControlTitle : "Draw a point",
					drawLineControlTitle : "Draw a line",
					drawFeatureControlTitle : "Draw a polygon",
					modifyFeatureControlTitle : "Update the feature",
					tbarDeleteFeatureButtonTooltip : "Delete the feature",
					tbarPreviousButtonTooltip : "Previous Position",
					tbarNextButtonTooltip : "Next Position",
					zoomBoxInControlTitle : "Zoom in",
					zoomBoxOutControlTitle : "Zoom out",
					zoomToMaxExtentControlTitle : "Zoom to max extend",
					locationInfoControlTitle : "Get information about the result location",
					selectFeatureControlTitle : "Select a feature from the selected layer",
					featureInfoControlTitle : "Get information about the selected layer",
					legalMentionsLinkText : "Legal Mentions",
					addGeomCriteriaButtonText : "Select an area",

					/**
					 * @cfg {Boolean} frame See {@link Ext.Panel#frame}.
					 *      Default to true.
					 */
					frame : true,
					/**
					 * @cfg {Boolean} collapsible True to make the panel
					 *      collapsible and have the expand/collapse toggle
					 *      button automatically rendered into the header tool
					 *      button area, false to keep the panel statically
					 *      sized with no button (defaults to true).
					 */
					collapsible : true,
					/**
					 * @cfg {Boolean} titleCollapse true to allow expanding and
					 *      collapsing the panel (when {@link #collapsible} =
					 *      true) by clicking anywhere in the header bar, false)
					 *      to allow it only by clicking to tool button
					 *      (defaults to true)). If this panel is a child item
					 *      of a border layout also see the
					 *      {@link Ext.layout.BorderLayout.Region BorderLayout.Region}
					 *      {@link Ext.layout.BorderLayout.Region#floatable floatable}
					 *      config option.
					 */
					titleCollapse : true,

					/**
					 * @cfg {Boolean} header true to create the Panel's header
					 *      element explicitly, false to skip creating it. If a
					 *      {@link #title} is set the header will be created
					 *      automatically, otherwise it will not. If a
					 *      {@link #title} is set but header is explicitly set
					 *      to false, the header will not be rendered.
					 */
					header : false,
					/**
					 * @cfg {String/Object} layout Specify the layout manager
					 *      class for this container either as an Object or as a
					 *      String. See
					 *      {@link Ext.Container#layout layout manager} also.
					 *      Default to 'border'.
					 */
					layout : 'border',
					/**
					 * @cfg {Boolean} isDrawingMap true to display the drawing
					 *      tools on the toolbar. (Default to false)
					 */
					isDrawingMap : false,
					/**
					 * @cfg {String} featureWKT A wkt feature to draw on the
					 *      map. (Default to null)
					 */
					featureWKT : null,

					/**
					 * @cfg {Boolean} hideLayersAndLegendVerticalLabel if true
					 *      hide the layers and legends vertical label (defaults
					 *      to false).
					 */
					hideLayersAndLegendVerticalLabel : false,
					/**
					 * @cfg {Boolean} rightPanelCollapsed True to start with the
					 *      right panel collapsed (defaults to false)
					 */
					rightPanelCollapsed : false,
					/**
					 * @cfg {Number} rightPanelWidth The rigth panel default
					 *      width (defaults to 170)
					 */
					rightPanelWidth : 170,

					/**
					 * @cfg {Boolean} hideDrawPointButton Hide the "Draw Point"
					 *      button
					 */
					hideDrawPointButton : false,
					/**
					 * @cfg {Boolean} hideLegalMentions if true hide the legal
					 *      mentions link.
					 */
					hideLegalMentions : true,
					/**
					 * @cfg {Boolean} hideLayerSelector if true hide the layer
					 *      selector. The layer selector is required for the
					 *      following tools.
					 */
					hideLayerSelector : true,
					hideSnappingButton : true,
					hideGetFeatureButton : true,
					hideFeatureInfoButton : true,
					hideGeomCriteriaToolbarButton : true,

					/**
					 * @cfg {Boolean} zoom to features extend on init.
					 */
					zoomToFeatureOnInit : false,
					/**
					 * @cfg {String} legalMentionsLinkHref The user Manual Link
					 *      Href (defaults to
					 *      <tt>'Genapp.base_url + 'map/show-legal-mentions''</tt>)
					 */
					legalMentionsLinkHref : Genapp.base_url + 'map/show-legal-mentions',
					/**
					 * @cfg {Integer} minZoomLevel The min zoom level for the
					 *      map (defaults to <tt>0</tt>)
					 */
					minZoomLevel : 0,
					/**
					 * @cfg {String} resultsBBox The results bounding box
					 *      (defaults to <tt>null</tt>)
					 */
					resultsBBox : null,
					/**
					 * @cfg {Object} layersActivation A object containing few
					 *      arrays of layers ordered by activation type
					 *      (defaults to <tt>{}</tt>) {
					 *      'request':[resultLayer, resultLayer0, resultLayer1]
					 */
					layersActivation : {},

					/**
					 * @cfg Array[OpenLayer.Layer] The list of available layers.
					 */
					layersList : [],

					/**
					 * The vector layer.
					 * 
					 * @type {OpenLayers.Layer.Vector}
					 * @property vectorLayer
					 */
					vectorLayer : null,
					info : new OpenLayers.Control.WMSGetFeatureInfo(),
					/**
					 * The WFS layer.
					 * 
					 * @type {OpenLayers.Layer.Vector}
					 * @property wfsLayer
					 */
					wfsLayer : null,

					/**
					 * The base layer.
					 * 
					 * @type {OpenLayers.Layer}
					 * @property baseLayer
					 */
					baseLayer : null,

					/**
					 * The wkt format.
					 * 
					 * @type {OpenLayers.Format.WKT}
					 * @property wktFormat
					 */
					wktFormat : new OpenLayers.Format.WKT(),

					/**
					 * The map panel.
					 * 
					 * @type GeoExt.MapPanel
					 * @property mapPanel
					 */
					mapPanel : null,

					/**
					 * The map object (linked to the map panel).
					 * 
					 * @type {OpenLayers.Map}
					 * @property map
					 */
					map : null,

					/**
					 * The map panel top toolbar.
					 * 
					 * @type {Ext.Toolbar}
					 * @property mapToolbar
					 */
					mapToolbar : null,

					/**
					 * The container of the layers and the legends panels.
					 * 
					 * @property layersAndLegendsPanel
					 * @type Ext.TabPanel
					 */
					layersAndLegendsPanel : null,

					/**
					 * The layers panel.
					 * 
					 * @property layerPanel
					 * @type Ext.Panel
					 */
					layerPanel : null,

					/**
					 * The layer tree object (linked to the layer panel).
					 * 
					 * @type {Genapp.tree.LayerTreePanel}
					 * @property layerTree
					 */
					layerTree : null,

					/**
					 * The legends panel.
					 * 
					 * @property legendPanel
					 * @type Ext.Panel
					 */
					legendPanel : null,

					/**
					 * The vector layer selector.
					 * 
					 * @property layerSelector
					 * @type Genapp.map.LayerSelector
					 */
					layerSelector : null,

					/**
					 * @cfg {String} projectionLabel The projection to be
					 *      displayed next to the mouse position (defaults to
					 *      <tt> m (L2e)</tt>)
					 */
					projectionLabel : " m (L2e)",

					/**
					 * @cfg {OpenLayers.Control.ZoomToFeatures} zoom to vector
					 *      feature Control
					 */
					zoomToFeatureControl : null,

					/**
					 * @cfg { OpenLayers.Control.Snapping } snapping control
					 */
					snappingControl : null,

					/**
					 * @cfg { OpenLayers.Control.FeatureInfoControl } feature
					 *      info control
					 */
					featureInfoControl : null,

					/**
					 * Initialisation of the component.
					 */
					initComponent : function() {
						/**
						 * Used in the openMap function of the GeometryField
						 * object.
						 * 
						 * @event afterinit Fires after the geo panel is
						 *        rendered and after all the initializations
						 *        (map, tree, toolbar).
						 * @param {Genapp.MapPanel}
						 *            this
						 */

						this.addEvents('afterinit');

						// Create a zoom slider
						var zSlider = new GeoExt.ZoomSlider({
							vertical : true,
							height : 150,
							x : 18,
							y : 85,
							plugins : new GeoExt.ZoomSliderTip({
								template : '<div><b>{zoom}</b></div>'
							})
						});

						// Create the layer panel
						this.layerPanel = new Ext.Panel({
							layout : 'fit',
							cls : 'genapp-query-layer-tree-panel',
							title : this.layerPanelTitle,
							tabTip : this.layerPanelTabTip,
							frame : true,
							layoutConfig : {
								animate : true
							}
						});

						// Create the legend panel
						this.legendPanel = new Ext.Panel({
							cls : 'genapp-query-legend-panel',
							title : this.legendPanelTitle,
							tabTip : this.legendPanelTabTip,
							frame : true,
							autoScroll : true,
							layoutConfig : {
								animate : true
							}
						});

						// Create the layer and legend panel
						this.layersAndLegendsPanel = new Ext.TabPanel({
							region : 'east',
							width : this.rightPanelWidth,
							collapsed : this.rightPanelCollapsed,
							collapsible : true,
							titleCollapse : false,
							cls : 'genapp-query-map-right-panel',
							activeItem : 0,
							split : true,
							items : [ this.layerPanel, this.legendPanel ]
						});

						// Add the layers and legends vertical label
						if (!this.hideLayersAndLegendVerticalLabel) {
							this.layersAndLegendsPanel.on('collapse', function(panel) {
								Ext.get(panel.id + '-xcollapsed').createChild({
									tag : "div",
									cls : 'genapp-query-map-right-panel-xcollapsed-vertical-label-div'
								});
							}, this, {
								single : true
							});
						}

						// Create the Toolbar
						this.mapToolbar = new Ext.Toolbar();

						// Creates the map Object (OpenLayers)
						this.map = this.initMap();

						// Create the map panel
						this.mapPanel = new GeoExt.MapPanel({
							region : 'center',
							cls : 'genapp_query_mappanel',
							frame : true,
							layout : 'anchor',
							tbar : this.mapToolbar,
							items : [ zSlider ],
							map : this.map
						});
						
						// Add the panel to the items
						this.items = [ this.mapPanel, this.layersAndLegendsPanel ];

						// Show the legal mentions on the map
						if (!this.hideLegalMentions) {
							this.mapPanel.addListener('render', this.addLegalMentions, this);
						}

						// Init the toolbar
						this.initToolbar();

						// Add the layers and the layers tree
						Ext.Ajax.request({
							url : Genapp.base_url + 'map/ajaxgetlayers',
							scope : this,
							success : this.addLayersAndLayersTree
						});

						// Auto-Zoom to the selected feature
					    if (this.isDrawingMap) {
							this.on('treerendered', function() { // Don't use the 'afterlayout' event because it's called more that one time
							    if (this.zoomToFeatureOnInit && this.vectorLayer.features && this.vectorLayer.features.length > 0) {
									this.zoomToFeatureControl.activate();
									this.zoomToFeatureControl.trigger();
								}
							});
						}

						Genapp.GeoPanel.superclass.initComponent.call(this);
					},

					/**
					 * Add the legal mentions to the map
					 */
					addLegalMentions : function(cmp) {
						// Create the link
						cmp.el.createChild({
							tag : 'div',
							cls : 'genapp-map-panel-legal-mentions',
							children : [ {
								tag : 'a',
								target : '_blank',
								href : this.legalMentionsLinkHref,
								html : this.legalMentionsLinkText
							} ]
						}, cmp.el.child('.olMapViewport', true)).on('click', Ext.emptyFn, null, {
							// stop the event propagation to avoid conflicts
							// with the underlying map
							stopPropagation : true
						});
					},

					/**
					 * Build the layers from a JSON response and add it to the
					 * map. Get the layers tree from the server and build the
					 * layers tree.
					 */
					addLayersAndLayersTree : function(response) {
						
						// Reset the arrays
						this.layersList = [];
						this.layersActivation = {};
						var layersObject = Ext.decode(response.responseText), i;

						// Rebuild the list of available layers
						for (j = 0; j < layersObject.layers.length; j++) {
							// Get the JSON description of the layer
							var layerObject = layersObject.layers[j];

							// Get the JSON view service name
							var viewServiceName=layerObject.viewServiceName;
							var viewServiceNameStr = 'layersObject.view_services.'+viewServiceName.toString();
							var viewServiceObject=eval('('+viewServiceNameStr+')');
							
							// Build the new OpenLayers layer object and add it
							// to the list
							var newLayer = this.buildLayer(layerObject,viewServiceObject);
							this.layersList.push(newLayer);
							
							// Fill the list of active layers
							var activateType = layerObject.params.activateType.toLowerCase();
							if (Ext.isEmpty(this.layersActivation[activateType])) {
								this.layersActivation[activateType] = [ layerObject.name ];
							} else {
								this.layersActivation[activateType].push(layerObject.name);
							}

							// Create the legends
							if (layerObject.legendServiceName != '' && layerObject.hasLegend) {

								// Get the JSON legend service name
								var legendServiceName=layerObject.legendServiceName;
								var legendServiceNameStr = 'layersObject.legend_services.'+legendServiceName.toString();
								var legendServiceObject=eval('('+legendServiceNameStr+')');
								
								this.buildLegend(layerObject, legendServiceObject);
							}
						}
						
						// Define the WFS layer, used as a grid for snapping
						if (!this.hideLayerSelector) {
							
							// Openlayers have to pass through a proxy to request external 
							// server
							OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
							
							// Set the style
							var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
								fillOpacity : 0,
								strokeColor : "green",
								strokeWidth : 3,
								strokeOpacity : 1
							}, OpenLayers.Feature.Vector.style["default"]));
							this.wfsLayer = new OpenLayers.Layer.Vector("WFS Layer", 
								{
									strategies:[new OpenLayers.Strategy.BBOX()],
									protocol: new OpenLayers.Protocol.HTTP({
										url: null,
										params:
										{
											typename: null,
											service: "WFS",
											format: "WFS",
											version: "1.0.0",
											request: "GetFeature",
											srs: Genapp.map.projection
										}, 
										format: new OpenLayers.Format.GML({extractAttributes: true})
									})									
								});
							this.wfsLayer.printable = false;
							this.wfsLayer.displayInLayerSwitcher = false;
							this.wfsLayer.extractAttributes = false;
							this.wfsLayer.styleMap = styleMap;
							this.wfsLayer.visibility = false;
							
						}
						this.setMapLayers(this.map);
												
						// Gets the layer tree model to initialise the Layer
						// Tree
						Ext.Ajax.request({
							url : Genapp.base_url + 'map/ajaxgettreelayers',
							success : this.initLayerTree,
							scope : this
						});
					},
					
					/**
					 * Build one OpenLayer Layer from a JSON object.
					 * 
					 * @return OpenLayers.Layer
					 */
					buildLayer : function(layerObject,serviceObject) {
						
						var url = serviceObject.urls;
							//Merges the service parameters and the layer parameters
							var paramsObj = {};
						    for (var attrname in layerObject.params) { paramsObj[attrname] = layerObject.params[attrname]; }
						    for (var attrname in serviceObject.params) { paramsObj[attrname] = serviceObject.params[attrname]; }
						    if (serviceObject.params.SERVICE=="WMTS") {
						    	//creation and merging of wmts parameters
						    	var layer=paramsObj.layers[0];
						    	var tileOrigin = new OpenLayers.LonLat(-20037508,20037508); //coordinates of top left corner of the matrixSet : usual value of geoportal, google maps 
						    	var serverResolutions = [156543.033928,78271.516964,39135.758482,19567.879241,9783.939621,4891.969810,2445.984905,1222.992453,611.496226,305.748113,152.874057,76.437028,38.218514,19.109257,9.554629,4.777302,2.388657,1.194329,0.597164,0.298582,0.149291,0.074646]; 
						    	// the usual 22 values of resolutions accepted by wmts servers geoportal
						    	
						    	var obj={options:layerObject.options,name:layerObject.name,url:url.toString(),layer:layer,tileOrigin:tileOrigin,serverResolutions:serverResolutions,opacity:layerObject.options.opacity,visibility:layerObject.options.visibility,isBaseLayer:layerObject.options.isBaseLayer};
						    	var objMergeParams= {};
						    	for (var attrname in obj) { objMergeParams[attrname] = obj[attrname]; }
						    	for (var attrname in paramsObj) { objMergeParams[attrname] = paramsObj[attrname]; }
						    	newLayer = new OpenLayers.Layer.WMTS(objMergeParams);

						    } else if (serviceObject.params.SERVICE=="WMS"){
						    	newLayer = new OpenLayers.Layer.WMS(layerObject.name , url , paramsObj , layerObject.options);
						    } else {
						    	Ext.Msg.alert("Please provide the \"" + layerObject.servicename + "\" service type.");
						    }
						newLayer.displayInLayerSwitcher = false;

						return newLayer;
					},

					/**
					 * Build a Legend Object from a JSON object.
					 * 
					 * @return OpenLayers.Layer
					 */
					buildLegend : function(layerObject,serviceObject) {
						var legend = this.legendPanel
								.add(new Ext.BoxComponent(
										{
											id : this.id + layerObject.name,
											autoEl : {
												tag : 'div',
												children : [
														{
															tag : 'span',
															html : layerObject.options.label,
															cls : 'x-form-item x-form-item-label'
														},
														{
															tag : 'img',
															src : serviceObject.urls.toString()
																	+ 'LAYER='+ layerObject.params.layers
																	+ '&SERVICE=' + serviceObject.params.SERVICE+ '&VERSION=' + serviceObject.params.VERSION + '&REQUEST=' + serviceObject.params.REQUEST
																	+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
														} ]
											}
										}));
						if (layerObject.params.isDisabled || layerObject.params.isHidden || !layerObject.params.isChecked) {
							legend.on('render', function(cmp) {
								cmp.hide();
							});
							legend.on('show', (function(cmp, params) {
								if (cmp.rendered) {
									cmp.getEl().child('img').dom.src = serviceObject.urls.toString()
									+ 'LAYER='+ layerObject.params.layers
									+ '&SERVICE=' + serviceObject.params.SERVICE+ '&VERSION=' + serviceObject.params.VERSION + '&REQUEST=' + serviceObject.params.REQUEST
									+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
								}
							}).createCallback(legend, layerObject.params));
						}
					},

					/**
					 * Set the layers of the map
					 */
					setMapLayers : function(map) {

						// Add the base layer (always first)
						map.addLayer(this.baseLayer);

						// Add the available layers
						for ( var i = 0; i < this.layersList.length; i++) {
							map.addLayer(this.layersList[i]);
						}

						// Add the WFS layer
						if (!this.hideLayerSelector && this.wfsLayer !== null) {
							map.addLayer(this.wfsLayer);
							this.snappingControl.addTargetLayer(this.wfsLayer);
						}

						// Add the vector layer
						map.addLayer(this.vectorLayer);

					},

					/**
					 * Initialize the map
					 * 
					 * @param {String}
					 *            consultationMapDivId The consultation map div
					 *            id
					 * @hide
					 */
					initMap : function() {

						// Create the map config resolution array
						var resolutions = [];
						for ( var i = this.minZoomLevel; i < Genapp.map.resolutions.length; i++) {
							resolutions.push(Genapp.map.resolutions[i]);
						}
						

						// Create the map object
						var map = new OpenLayers.Map({
							'controls' : [],
							'resolutions' : resolutions,
							'numZoomLevels' : Genapp.map.numZoomLevels,
							'projection' : Genapp.map.projection,
							'units' : 'm',
							'tileSize' : new OpenLayers.Size(Genapp.map.tilesize, Genapp.map.tilesize),
							'maxExtent' : new OpenLayers.Bounds(Genapp.map.x_min, Genapp.map.y_min, Genapp.map.x_max, Genapp.map.y_max),
							'eventListeners' : {// Hide the legend if needed
								"changelayer" : function(o) {
									if (o.property === 'visibility') {
										this.toggleLayersAndLegendsForZoom(o.layer);
									}
								},
								scope : this
							}
						});
						
						// Define the vector layer, used to draw polygons
						this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
							printable : false, // This layers is never printed
							displayInLayerSwitcher : false
						});

						// Define the base layer of the map
						this.baseLayer = new OpenLayers.Layer("Empty baselayer", {
							isBaseLayer : true,
							printable : false, // This layers is never printed
							displayInLayerSwitcher : false
						});

						//
						// Set the minimum mandatory layer for the map
						// 
						this.setMapLayers(map);

						//
						// Add the controls
						//
						map.addControl(new OpenLayers.Control.Navigation());

						// Mouse position
						map.addControl(new OpenLayers.Control.MousePosition({
							prefix : 'X: ',
							separator : ' - Y: ',
							suffix : this.projectionLabel,
							numDigits : 0,
							title : 'MousePosition'
						}));

						// Scale
						map.addControl(new OpenLayers.Control.Scale());
						map.addControl(new OpenLayers.Control.ScaleLine({
							title : 'ScaleLine',
							bottomOutUnits : '',
							bottomInUnits : ''
						}));
						

						// Zoom the map to the user country level
						map.setCenter(new OpenLayers.LonLat(Genapp.map.x_center, Genapp.map.y_center), Genapp.map.defaultzoom);

						// For the GEOM criteria
						// TODO : Split this in another file
						if (this.isDrawingMap) {
							if (!Ext.isEmpty(this.maxFeatures)) {
								this.vectorLayer.preFeatureInsert = function(feature) {
									if (this.features.length > this.maxFeatures) {
										// remove first drawn feature:
										this.removeFeatures([ this.features[0] ]);
									}
								};
							}

							var sfDraw = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								multiple : false,
								clickout : true,
								toggle : true,
								title : this.selectFeatureControlTitle
							});
							map.addControl(sfDraw);
							sfDraw.activate();

							if (this.featureWKT) {
								// display it with WKT format reader.
								var feature = this.wktFormat.read(this.featureWKT);
								if (feature) {
									this.vectorLayer.addFeatures([ feature ]);
								} else {
									alert(this.invalidWKTMsg);
								}
							}
						} else {
							// Add a control that display a tooltip on the
							// features
							var selectControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								hover : true
							});
							map.addControl(selectControl);
							selectControl.activate();
						}

						return map;
					},

					/**
					 * Initialize the layer tree.
					 */
					initLayerTree : function(response) {

						// Decode the JSON
						var responseJSON = Ext.decode(response.responseText);

						// Add a Tree Panel
						this.layerTree = new Genapp.tree.LayerTreePanel({
							"rootChildren" : responseJSON,
							map : this.map
						});
						// Toggle layers and legends for zoom
						this.layerTree.on('afterrender', function(treePanel) {

							this.layerTree.eachLayerChild(function(child) {
								if (child.attributes.disabled === true) {
									child.forceDisable = true;
								} else {
									child.forceDisable = false;
								}
							});
							for ( var i = 0; i < this.map.layers.length; i++) {
;								this.toggleLayersAndLegendsForZoom(this.map.layers[i]);
							}
						}, this);

						this.layerPanel.add(this.layerTree);
						this.layerPanel.doLayout();

						this.fireEvent('treerendered', this);

					},

					/**
					 * Initialize the map toolbar
					 * 
					 * @hide
					 */
					initToolbar : function() {

						// Link the toolbar to the map
						this.mapToolbar.map = this.map;

						//
						// Drawing tools
						//
						if (this.isDrawingMap) {
							// Zoom to features button
							this.zoomToFeatureControl = new OpenLayers.Control.ZoomToFeatures(this.vectorLayer, {
								map : this.map,
								maxZoomLevel : 9,
								ratio : 1.05,
								autoActivate : false
							// otherwise will
							// desactivate after
							// first init
							});
							var zoomToFeatureButton = new GeoExt.Action({
								control : this.zoomToFeatureControl,
								iconCls : 'zoomstations',
								tooltip : this.zoomToFeaturesControlTitle
							});
							this.mapToolbar.add(zoomToFeatureButton);

							// Draw point button
							if (!this.hideDrawPointButton) {
								var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);

								var drawPointButton = new GeoExt.Action({
									control : drawPointControl,
									map : this.map,
									tooltip : this.drawPointControlTitle,
									toggleGroup : "editing",
									group : "drawControl",
									checked : false,
									iconCls : 'drawpoint'
								});
								this.mapToolbar.add(drawPointButton);
							}

							// Draw line button
							if (!this.hideDrawLineButton) {
								var drawLineControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path);

								var drawLineButton = new GeoExt.Action({
									control : drawLineControl,
									map : this.map,
									tooltip : this.drawLineControlTitle,
									toggleGroup : "editing",
									group : "drawControl",
									checked : false,
									iconCls : 'drawline'
								});
								this.mapToolbar.add(drawLineButton);
							}

							// Draw polygon button
							var drawPolygonControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Polygon);

							var drawPolygonButton = new GeoExt.Action({
								control : drawPolygonControl,
								map : this.map,
								tooltip : this.drawFeatureControlTitle,
								toggleGroup : "drawControl",
								toggleGroup : "editing",
								checked : false,
								iconCls : 'drawpolygon'
							});
							this.mapToolbar.add(drawPolygonButton);

							// Modify feature
							var modifyFeatureControl = new OpenLayers.Control.ModifyFeature(this.vectorLayer, {
								mode : OpenLayers.Control.ModifyFeature.RESHAPE
							});

							var modifyFeatureButton = new GeoExt.Action({
								control : modifyFeatureControl,
								map : this.map,
								tooltip : this.modifyFeatureControlTitle,
								toggleGroup : "editing",
								group : "drawControl",
								checked : false,
								iconCls : 'modifyfeature'
							});
							this.mapToolbar.add(modifyFeatureButton);

							// Delete feature
							var deleteFeatureControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								displayClass : 'olControlModifyFeature',
								onSelect : function(feature) {
									this.vectorLayer.destroyFeatures([ feature ]);
								},
								scope : this,
								type : OpenLayers.Control.TYPE_TOOL
							});

							var deleteFeatureButton = new GeoExt.Action({
								control : deleteFeatureControl,
								map : this.map,
								tooltip : this.tbarDeleteFeatureButtonTooltip,
								toggleGroup : "editing",
								group : "drawControl",
								checked : false,
								iconCls : 'deletefeature'
							});
							this.mapToolbar.add(deleteFeatureButton);

							// Separator
							this.mapToolbar.addSeparator();

						} else {
							if (!this.hideGeomCriteriaToolbarButton) {
	    						// Add geom criteria tool
	    						var addGeomCriteriaButton = new Ext.Button({
	                                text : this.addGeomCriteriaButtonText,
	                                iconCls : 'addgeomcriteria',
	                                handler : function(){
	                                    this.fireEvent('addgeomcriteria');
	                                },
	                                scope:this
	                            });
	                            this.mapToolbar.add(addGeomCriteriaButton);
							}
						}

						this.mapToolbar.addFill();

						//
						// Layer Based Tools
						//
						if (!this.hideLayerSelector) {

							// Layer selector
							this.layerSelector = {
								xtype : 'layerselector',
								geoPanelId : this.id
							};

							// Snapping tool
							this.snappingControl = new OpenLayers.Control.Snapping({
								layer : this.vectorLayer,
								targets : [ this.vectorLayer ],
								greedy : false
							});
							var snappingButton = new GeoExt.Action({
								control : this.snappingControl,
								map : this.map,
								tooltip : 'Snapping',
								toggleGroup : "snapping",  // his own independant group
								group : "LayerTools",
								checked : false,
								iconCls : 'snapping'
							});
							
							// Listen for the layer selector events
							Genapp.eventManager.on('selectLayer', this.layerSelected, this);
							// Get Feature tool
							this.getFeatureControl = new OpenLayers.Control.GetFeatureControl({
								map : this.map
							});
							var getFeatureButton = new GeoExt.Action({
								control : this.getFeatureControl,
								map : this.map,
								tooltip : this.selectFeatureControlTitle,
								toggleGroup : "editing",
								group : "LayerTools",
								checked : false,
								iconCls : 'selectFeature'
							});

							// Listen the get feature tool events
							Genapp.eventManager.on('getFeature', this.getFeature, this);
							// Feature Info Tool
							this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
								layerName : this.vectorLayer.name,
								map : this.map
							});

							var featureInfoButton = new GeoExt.Action({
								control : this.featureInfoControl,
								map : this.map,
								toggleGroup : "editing",
								group : "LayerTools",
								checked : false,
								tooltip : this.featureInfoControlTitle,
								iconCls : 'feature-info'
							});
							if (!this.hideSnappingButton) {
								this.mapToolbar.add(snappingButton);
							}
							if (!this.hideGetFeatureButton) {
								this.mapToolbar.add(getFeatureButton);
							}
							if (!this.hideFeatureInfoButton) {
								this.mapToolbar.add(featureInfoButton);
							}
							this.mapToolbar.add(this.layerSelector);

							// Separator
							this.mapToolbar.addSeparator();
						}

						//
						// Navigation history : back and next
						//
						var historyControl = new OpenLayers.Control.NavigationHistory({});
						this.map.addControl(historyControl);
						historyControl.activate();

						var buttonPrevious = new Ext.Toolbar.Button({
							iconCls : 'back',
							tooltip : this.tbarPreviousButtonTooltip,
							disabled : true,
							handler : historyControl.previous.trigger
						});

						var buttonNext = new Ext.Toolbar.Button({
							iconCls : 'next',
							tooltip : this.tbarNextButtonTooltip,
							disabled : true,
							handler : historyControl.next.trigger
						});

						this.mapToolbar.add(buttonPrevious);
						this.mapToolbar.add(buttonNext);

						historyControl.previous.events.register("activate", buttonPrevious, function() {
							this.setDisabled(false);
						});

						historyControl.previous.events.register("deactivate", buttonPrevious, function() {
							this.setDisabled(true);
						});

						historyControl.next.events.register("activate", buttonNext, function() {
							this.setDisabled(false);
						});

						historyControl.next.events.register("deactivate", buttonNext, function() {
							this.setDisabled(true);
						});

						//
						// Get info on the feature
						//

						var locationInfoControl = new OpenLayers.Control.LocationInfoControl({
							layerName : Genapp.map.featureinfo_typename,
							geoPanelId : this.id
						});

						var locationInfoButton = new GeoExt.Action({
							control : locationInfoControl,
							map : this.map,
							toggleGroup : "editing",
							group : "navControl",
							checked : false,
							tooltip : this.locationInfoControlTitle,
							iconCls : 'feature-info'
						});
						this.mapToolbar.add(locationInfoButton);

						//
						// Navigation controls
						//

						// Zoom In
						var zoomInControl = new OpenLayers.Control.ZoomBox({
							title : this.zoomBoxInControlTitle
						});

						var zoomInButton = new GeoExt.Action({
							control : zoomInControl,
							map : this.map,
							tooltip : this.zoomBoxInControlTitle,
							toggleGroup : "editing",
							group : "navControl",
							checked : false,
							iconCls : 'zoomin'
						});
						this.mapToolbar.add(zoomInButton);

						// Zoom Out
						var zoomOutControl = new OpenLayers.Control.ZoomBox({
							out : true,
							title : this.zoomBoxOutControlTitle
						});

						var zoomOutButton = new GeoExt.Action({
							control : zoomOutControl,
							map : this.map,
							tooltip : this.zoomBoxOutControlTitle,
							toggleGroup : "editing",
							group : "navControl",
							checked : false,
							iconCls : 'zoomout'
						});

						this.mapToolbar.add(zoomOutButton);

						// Navigation
						var navigationControl = new OpenLayers.Control.Navigation({
							isDefault : true,
							mouseWheelOptions : {
								interval : 100
							}
						});

						var navigationButton = new GeoExt.Action({
							control : navigationControl,
							map : this.map,
							tooltip : this.navigationControlTitle,
							toggleGroup : "editing",
							group : "navControl",
							checked : true,
							iconCls : 'pan'
						});

						this.mapToolbar.add(navigationButton);

						// Séparateur
						this.mapToolbar.addSeparator();

						// Zoom to the Results
						var zoomToResultButton = new GeoExt.Action({
							handler : this.zoomOnResultsBBox,
							scope : this,
							map : this.map,
							tooltip : this.zoomToResultControlTitle,
							checked : false,
							iconCls : 'zoomstations'
						});

						this.mapToolbar.add(zoomToResultButton);

						// Zoom to max extend
						var zoomToMaxControl = new OpenLayers.Control.ZoomToMaxExtent({
							map : this.map,
							active : false
						});

						var zoomToMaxButton = new GeoExt.Action({
							control : zoomToMaxControl,
							map : this.map,
							tooltip : this.zoomToMaxExtentControlTitle,
							checked : false,
							iconCls : 'zoomfull'
						});

						this.mapToolbar.add(zoomToMaxButton);

					},

					/**
					 * Clean the map panel
					 */
					clean : function() {
						// Remove previous features
						this.vectorLayer.destroyFeatures(this.vectorLayer.features);
					},

					/**
					 * Zoom to the passed feature on the map
					 * 
					 * @param {String}
					 *            id The plot id
					 * @param {String}
					 *            wkt The wkt feature
					 */
					zoomToFeature : function(id, wkt) {

						// Parse the feature location and create a Feature
						// Object
						var feature = this.wktFormat.read(wkt);

						// Add the plot id as an attribute of the object
						feature.attributes.id = id.substring(id.lastIndexOf('__') + 2);

						// Remove previous features
						this.vectorLayer.destroyFeatures(this.vectorLayer.features);

						// Move the vector layer above all others
						this.map.setLayerIndex(this.vectorLayer, 100);
						if (feature) {
							// Add the feature
							this.vectorLayer.addFeatures([ feature ]);
						} else {
							alert(this.invalidWKTMsg);
						}

						// Center on the feature
						this.map.setCenter(new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y), 7);
					},

					/**
					 * Zoom on the provided bounding box
					 * 
					 * {String} wkt The wkt of the bounding box
					 */
					zoomOnBBox : function(wkt) {

						if (!Ext.isEmpty(wkt)) {

							// The ratio by which features' bounding box should
							// be scaled
							var ratio = 1;

							// The maximum zoom level to zoom to
							var maxZoomLevel = this.map.numZoomLevels - 1;

							// Parse the feature location and create a Feature
							// Object
							var feature = this.wktFormat.read(wkt);

							var bounds = feature.geometry.getBounds();

							bounds = bounds.scale(ratio);

							var zoom = 0;
							if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)) {
								zoom = maxZoomLevel;
							} else {
								var desiredZoom = this.map.getZoomForExtent(bounds);
								zoom = (desiredZoom > maxZoomLevel) ? maxZoomLevel : desiredZoom;
							}
							this.map.setCenter(bounds.getCenterLonLat(), zoom);
						}
					},

					/**
					 * Zoom on the results bounding box
					 */
					zoomOnResultsBBox : function() {
						this.zoomOnBBox(this.resultsBBox);
					},

					/**
					 * Toggle the layer(s) and legend(s)
					 * 
					 * @param {Object}
					 *            layerNames An object like : { 'layerName1' :
					 *            'checked', 'layerName2' : 'unchecked',
					 *            'layerName3' : 'disable', 'layerName4' :
					 *            'hide', ... } Four values are possible for
					 *            each layer: checked: enable and show the
					 *            layer, check the tree node, display the legend
					 *            unchecked: enable but hide the layer, uncheck
					 *            the tree node, display the legend disable:
					 *            disable the layer, uncheck the tree node,
					 *            disable the legend hide: disable and hide the
					 *            layer, uncheck the tree node, hide the legend
					 * 
					 */
					toggleLayersAndLegends : function(layerNames) {

						var layersAndLegendsToEnableChecked = [], layersAndLegendsToEnableUnchecked = [], layersAndLegendsToDisable = [], layersAndLegendsToHide = [], layerName;
						for (layerName in layerNames) {
							if (layerNames.hasOwnProperty(layerName)) {
								switch (layerNames[layerName]) {
								case 'checked':
									layersAndLegendsToEnableChecked.push(layerName);
									break;
								case 'unchecked':
									layersAndLegendsToEnableUnchecked.push(layerName);
									break;
								case 'disable':
									layersAndLegendsToDisable.push(layerName);
									break;
								case 'hide':
									layersAndLegendsToHide.push(layerName);
									break;
								default:
									break;
								}
							}
						}
						this.enableLayersAndLegends(layersAndLegendsToEnableChecked, true, true);
						this.enableLayersAndLegends(layersAndLegendsToEnableUnchecked, false, true);
						this.disableLayersAndLegends(layersAndLegendsToDisable, true, false, true);
						this.disableLayersAndLegends(layersAndLegendsToHide, true, true, true);
					},

					/**
					 * Enable and show the layer(s) node and show the legend(s)
					 * 
					 * @param {Array}
					 *            layerNames The layer names
					 * @param {Boolean}
					 *            check True to check the layerTree node
					 *            checkbox (default to false)
					 * @param {Boolean}
					 *            setForceDisable Set the layerTree node
					 *            forceDisable parameter (default to true) The
					 *            forceDisable is used by the
					 *            'toggleLayersAndLegendsForZoom' function to
					 *            avoid to enable, a node disabled for another
					 *            cause that the zoom range.
					 */
					enableLayersAndLegends : function(layerNames, check, setForceDisable) {
						if (!Ext.isEmpty(layerNames)) {
							// The tabPanels must be activated before to show a
							// child component
							var isLayerPanelVisible = this.layerPanel.isVisible(), i;

							this.layersAndLegendsPanel.activate(this.layerPanel);
							for (i = 0; i < layerNames.length; i++) {
								var node = this.layerTree.getNodeByLayerName(layerNames[i]);
								if (!Ext.isEmpty(node)) {
									var nodeId = node.id;
									if (setForceDisable !== false) {
										this.layerTree.getNodeById(nodeId).forceDisable = false;
									}
									if (this.layerTree.getNodeById(nodeId).zoomDisable !== true) {
										this.layerTree.getNodeById(nodeId).enable();
									}
									this.layerTree.getNodeById(nodeId).getUI().show();

									if (check === true) {
										// Note: the redraw must be done before
										// to
										// check the node
										// to avoid to redisplay the old layer
										// images before the new one
										var layers = this.map.getLayersByName(layerNames[i]);
										layers[0].redraw(true);
										this.layerTree.toggleNodeCheckbox(nodeId, true);
									}
								}
							}

							this.layersAndLegendsPanel.activate(this.legendPanel);
							this.setLegendsVisible(layerNames, true);

							// Keep the current activated panel activated
							if (isLayerPanelVisible) {
								this.layersAndLegendsPanel.activate(this.layerPanel);
							}
						} else {
							console.warn('EnableLayersAndLegends : layerNames parameter is empty.');
						}
					},

					/**
					 * Disable (and hide if asked) the layer(s) And hide the
					 * legend(s)
					 * 
					 * @param {Array}
					 *            layerNames The layer names
					 * @param {Boolean}
					 *            uncheck True to uncheck the layerTree node
					 *            checkbox (default to false)
					 * @param {Boolean}
					 *            hide True to hide the layer(s) and legend(s)
					 *            (default to false)
					 * @param {Boolean}
					 *            setForceDisable Set the layerTree node
					 *            forceDisable parameter (default to true) The
					 *            forceDisable is used by the
					 *            'toggleLayersAndLegendsForZoom' function to
					 *            avoid to enable, a node disable for another
					 *            cause that the zoom range.
					 */
					disableLayersAndLegends : function(layerNames, uncheck, hide, setForceDisable) {
						var i;
						if (!Ext.isEmpty(layerNames) && (this.layerTree !== null)) {
							for (i = 0; i < layerNames.length; i++) {
								var node = this.layerTree.getNodeByLayerName(layerNames[i]);
								if (!Ext.isEmpty(node)) {
									var nodeId = node.id;
									if (uncheck === true) {
										this.layerTree.toggleNodeCheckbox(nodeId, false);
									}
									var node = this.layerTree.getNodeById(nodeId);
									if (hide === true) {
										node.getUI().hide();
									}
									node.disable();
									if (setForceDisable !== false) {
										node.forceDisable = true;
									}
								}
								this.setLegendsVisible([ layerNames[i] ], false);
							}
						}
					},

					/**
					 * Toggle the layer node and legend in function of the zoom
					 * range
					 * 
					 * @param {OpenLayers.Layer}
					 *            layer The layer to check
					 */
					toggleLayersAndLegendsForZoom : function(layer) {
						if (!Ext.isEmpty(this.layerTree)) {
							var node = this.layerTree.getNodeByLayerName(layer.name);
							
							if (!Ext.isEmpty(node) && !node.hidden) {
								if (!layer.calculateInRange()) {
									node.zoomDisable = true;
									this.disableLayersAndLegends([ layer.name ], false, false, false);
								} else {
									node.zoomDisable = false;
									if (node.forceDisable !== true) {
										this.enableLayersAndLegends([ layer.name ], false, false);
									}
								}
							}
						}
					},

					/**
					 * Convenience function to hide or show a legend by boolean.
					 * 
					 * @param {Array}
					 *            layerNames The layers name
					 * @param {Boolean}
					 *            visible True to show, false to hide
					 */
					setLegendsVisible : function(layerNames, visible) {
						var i;
						for (i = 0; i < layerNames.length; i++) {
							var legendCmp = this.legendPanel.findById(this.id + layerNames[i]);
							if (!Ext.isEmpty(legendCmp)) {
								if (visible === true) {
									var layers = this.map.getLayersByName(layerNames[i]);
									if (layers[0].calculateInRange() && layers[0].getVisibility()) {
										legendCmp.show();
									} else {
										legendCmp.hide();
									}
								} else {
									legendCmp.hide();
								}
							}
						}
					},

					/**
					 * A layer has been selected in the layer selector
					 */
					layerSelected : function(value, geoPanelId) {
						if (this.info) {
							this.info.destroy();
						}
						if (geoPanelId == this.id) {
							if (value.data.code !== null) {
								var layerName = value.data.code;
								var url = value.data.url;
								var popupTitle = this.popupTitle;
								
								// Change the WFS layer typename
								this.wfsLayer.protocol.featureType = layerName;
								this.wfsLayer.protocol.options.featureType = layerName;
								this.wfsLayer.protocol.format.featureType = layerName;
								this.wfsLayer.protocol.params.typename = layerName;
								this.wfsLayer.protocol.options.url = url;

								// Remove all current features
								this.wfsLayer.destroyFeatures();

								// Copy the visibility range from the original
								// layer
								originalLayers = this.map.getLayersByName(layerName);
								if (originalLayers != null) {
									originalLayer = originalLayers[0];
									this.wfsLayer.maxResolution = originalLayer.maxResolution;
									this.wfsLayer.maxScale = originalLayer.maxScale;
									this.wfsLayer.minResolution = originalLayer.minResolution;
									this.wfsLayer.minScale = originalLayer.minScale;
									this.wfsLayer.alwaysInRange = false;
									this.wfsLayer.calculateInRange();
								}

								// Make it visible
								this.wfsLayer.setVisibility(true);

								// Force a refresh (rebuild the WFS URL)
								this.wfsLayer.moveTo(null, true, false);
								
								// Set the getfeature control
								if (this.getFeatureControl !== null) {
									this.getFeatureControl.protocol = new OpenLayers.Protocol.WFS({
										url : this.wfsLayer.protocol.url,
										featureType : this.wfsLayer.protocol.featureType
									});

								}
								// Set the layer name in other tools
								if (this.featureInfoControl !== null) {
									this.featureInfoControl.layerName = layerName;
								}
								if (this.getFeatureControl !== null) {
									this.getFeatureControl.layerName = layerName;
								}
								
								this.wfsLayer.refresh();
								this.wfsLayer.strategies[0].update({force:true});

							} else {
								// Hide the layer
								this.wfsLayer.setVisibility(false);
							}
							
							for (var i = 0 ; i < this.layersList.length ; i++) {
							if (this.layersList[i].name == layerName) {
							this.info = new OpenLayers.Control.WMSGetFeatureInfo({
								//title: 'Identify features by clicking',
								queryVisible: true,
								infoFormat : 'application/vnd.ogc.gml', // format utilisé pour la récupération des infos de la feature interrogée sur la couche WMS
								maxFeatures:1,
								multiple: false,
								layers: [this.layersList[i]],
								eventListeners: {
									getfeatureinfo: function(event) {
										if (window.DOMParser) {
											parser = new DOMParser();
											xmlDoc = parser.parseFromString(event.text,"text/xml");
										} else {// Internet Explorer
											xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
											xmlDoc.async=false;
											xmlDoc.loadXML(event.text);
										}

										var html = '<ul>';


										if (typeof(xmlDoc.children[0].children[0].children[0]) != 'undefined') {
										countXmlDoc = xmlDoc.children[0].children[0].children[0].children.length;
										for (var i = 1 ; i < countXmlDoc ; i++){
												html += '<li>';
												html += xmlDoc.children[0].children[0].children[0].children[i].localName + ': '+ xmlDoc.children[0].children[0].children[0].children[i].childNodes[0].nodeValue;
												html += '</li>';
											}
										}
										html += '</ul>';
										popup = new GeoExt.Popup({
											title : popupTitle,
											location : this.map.getLonLatFromPixel(event.xy),
											width : 200,
											map : this.map,
											html : html,
											maximizable : false,
											collapsible : false,
											unpinnable : false
										});
										popup.show();
									}
								}
							});
							this.map.addControl(this.info);
							this.info.activate();
							break;
							}
						}
						}
						
					},
					

					/**
					 * A feature has been selected using the GetFeatureControl
					 * tool.
					 */
					getFeature : function(feature, mapId) {
						if (mapId == this.map.id) {
							// Add the feature to the vector layer
							if (this.vectorLayer !== null) {
								this.vectorLayer.addFeatures(feature);
							}
						}

					},

					/**
					 * Destroy this component.
					 */
					destroy : function() {
						this.baseLayer = null;
						this.wktFormat = null;
						this.layersActivation = null;
						this.layersList = null;
						this.featureInfoControl = null;

						if (this.map) {
							this.map.destroy();
							this.map = null;
						}
						if (this.selectorButton) {
							this.selectorButton.destroy();
							this.selectorButton = null;
						}
						if (this.vectorLayer) {
							this.vectorLayer.destroy();
							this.vectorLayer = null;
						}
						if (this.wfsLayer) {
							this.wfsLayer.destroy();
							this.wfsLayer = null;
						}
						if (this.mapPanel) {
							this.mapPanel.destroy();
							this.mapPanel = null;
						}
						if (this.mapToolbar) {
							this.mapToolbar.destroy();
							this.mapToolbar = null;
						}
						if (this.layersAndLegendsPanel) {
							this.layersAndLegendsPanel.destroy();
							this.layersAndLegendsPanel = null;
						}
						if (this.layerPanel) {
							this.layerPanel.destroy();
							this.layerPanel = null;
						}
						if (this.layerTree) {
							this.layerTree.destroy();
							this.layerTree = null;
						}
						if (this.legendPanel) {
							this.legendPanel.destroy();
							this.legendPanel = null;
						}
						Genapp.GeoPanel.superclass.destroy.call(this);

					}
				});