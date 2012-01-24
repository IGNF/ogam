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
					 * @cfg {String} title The title text to be used as
					 *      innerHTML (html tags are accepted) to display in the
					 *      panel {@link #header} (defaults to 'Map'). When a
					 *      title is specified the {@link #header} element will
					 *      automatically be created and displayed unless
					 *      {@link #header} is explicitly set to false. If you
					 *      do not want to specify a title at config time, but
					 *      you may want one later, you must either specify a
					 *      non-empty title (a blank space ' ' will do) or
					 *      header:true so that the container element will get
					 *      created.
					 */
					title : 'Map',
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
					 * @cfg {String} tabTip A string to be used as innerHTML
					 *      (html tags are accepted) to show in a tooltip when
					 *      mousing over the tab of a Ext.Panel which is an item
					 *      of a {@link Ext.TabPanel}. {@link Ext.QuickTips}.init()
					 *      must be called in order for the tips to render.
					 *      Default to 'The map with the request's results's
					 *      location'
					 */
					tabTip : 'The map with the request\'s results\'s location',
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
					 * @cfg {String} layerPanelTitle The layer Panel Title
					 *      (defaults to <tt>'Layers'</tt>)
					 */
					layerPanelTitle : "Layers",
					/**
					 * @cfg {String} layerPanelTabTip The layer Panel Tab Tip
					 *      (defaults to <tt>'The layers's tree'</tt>)
					 */
					layerPanelTabTip : "The layers's tree",
					/**
					 * @cfg {String} legendPanelTitle The legend Panel Title
					 *      (defaults to <tt>'Legends'</tt>)
					 */
					legendPanelTitle : "Legends",
					/**
					 * @cfg {String} legendPanelTabTip The legend Panel Tab Tip
					 *      (defaults to <tt>'The layers's legends'</tt>)
					 */
					legendPanelTabTip : "The layers's legends",
					/**
					 * @cfg {String} panZoomBarControlTitle The panZoomBar
					 *      Control Title (defaults to <tt>'Zoom'</tt>)
					 */
					panZoomBarControlTitle : "Zoom",
					/**
					 * @cfg {String} navigationControlTitle The navigation
					 *      Control Title (defaults to <tt>'Drag the map'</tt>)
					 */
					navigationControlTitle : "Drag the map",
					/**
					 * @cfg {String} selectFeatureControlTitle The selectFeature
					 *      Control Title (defaults to <tt>'Select Feature'</tt>)
					 */
					selectFeatureControlTitle : "Select Feature",
					/**
					 * @cfg {String} invalidWKTMsg The invalid WKT Msg (defaults
					 *      to <tt>'The feature cannot be displayed'</tt>)
					 */
					invalidWKTMsg : "The feature cannot be displayed",
					/**
					 * @cfg {String} zoomToFeaturesControlTitle The
					 *      zoomToFeatures Control Title (defaults to
					 *      <tt>'Zoom to the features'</tt>)
					 */
					zoomToFeaturesControlTitle : "Zoom to the features",
					/**
					 * @cfg {Boolean} hideDrawPointButton Hide the "Draw Point"
					 *      button
					 */
					hideDrawPointButton : false,
					/**
					 * @cfg {String} drawPointControlTitle The drawFeature
					 *      Control Title (defaults to <tt>'Draw a polygon'</tt>)
					 */
					drawPointControlTitle : "Draw a point",
					/**
					 * @cfg {Boolean} hideDrawPointButton Hide the "Draw Line"
					 *      button
					 */
					hideDrawLineButton : false,
					/**
					 * @cfg {String} drawLineControlTitle The drawFeature
					 *      Control Title (defaults to <tt>'Draw a polygon'</tt>)
					 */
					drawLineControlTitle : "Draw a line",
					/**
					 * @cfg {String} drawFeatureControlTitle The drawFeature
					 *      Control Title (defaults to <tt>'Draw a polygon'</tt>)
					 */
					drawFeatureControlTitle : "Draw a polygon",
					/**
					 * @cfg {String} modifyFeatureControlTitle The modifyFeature
					 *      Control Title (defaults to
					 *      <tt>'Update the feature'</tt>)
					 */
					modifyFeatureControlTitle : "Update the feature",
					/**
					 * @cfg {String} tbarDeleteFeatureButtonTooltip The tbar
					 *      Delete Feature Button Tooltip (defaults to
					 *      <tt>'Delete the feature'</tt>)
					 */
					tbarDeleteFeatureButtonTooltip : "Delete the feature",
					/**
					 * @cfg {String} tbarPreviousButtonTooltip The tbar Previous
					 *      Button Tooltip (defaults to
					 *      <tt>'Previous Position'</tt>)
					 */
					tbarPreviousButtonTooltip : "Previous Position",
					/**
					 * @cfg {String} tbarNextButtonTooltip The tbar Next Button
					 *      Tooltip (defaults to <tt>'Next Position'</tt>)
					 */
					tbarNextButtonTooltip : "Next Position",
					/**
					 * @cfg {String} zoomBoxInControlTitle The zoomBox In
					 *      Control Title (defaults to <tt>'Zoom in'</tt>)
					 */
					zoomBoxInControlTitle : "Zoom in",
					/**
					 * @cfg {String} zoomBoxOutControlTitle The zoomBox Out
					 *      Control Title (defaults to <tt>'Zoom out'</tt>)
					 */
					zoomBoxOutControlTitle : "Zoom out",
					/**
					 * @cfg {String} zoomToMaxExtentControlTitle The zoomToMax
					 *      Extent Control Title (defaults to
					 *      <tt>'Zoom to max extend'</tt>)
					 */
					zoomToMaxExtentControlTitle : "Zoom to max extend",
					/**
					 * @cfg {String} featureInfoControlTitle The feature Info
					 *      Control Title (defaults to
					 *      <tt>'Get the plot location information'</tt>)
					 */
					featureInfoControlTitle : "Get the plot location information",
					/**
					 * @cfg {Boolean} hideLegalMentions if true hide the legal
					 *      mentions link.
					 */
					hideLegalMentions : true,
					/**
					 * @cfg {String} legalMentionsLinkHref The user Manual Link
					 *      Href (defaults to
					 *      <tt>'Genapp.base_url + 'map/show-legal-mentions''</tt>)
					 */
					legalMentionsLinkHref : Genapp.base_url + 'map/show-legal-mentions',
					/**
					 * @cfg {String} legalMentionsLinkText The legal mentions
					 *      LinkText (defaults to <tt>'User Manual'</tt>)
					 */
					legalMentionsLinkText : 'Legal Mentions',
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
					 * @type {Ext.tree.TreePanel}
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
					 * @cfg {String} projectionLabel The projection to be
					 *      displayed next to the mouse position (defaults to
					 *      <tt> m (L2e)</tt>)
					 */
					projectionLabel : " m (L2e)",

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
							url : Genapp.base_url + 'map/getLayers',
							scope : this,
							success : this.addLayersAndLayersTree
						});

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

						// Store the base URLs
						this.urlArrayTiled = layersObject.url_array_tiled;
						this.urlArrayCached = layersObject.url_array_cached;

						// Rebuild the list of available layers
						for (i = 0; i < layersObject.layers.length; i++) {

							// Get the JSON description of the layer
							var layerObject = layersObject.layers[i];

							// Build the new OpenLayers layer object and add it
							// to the list
							var newLayer = this.buildLayer(layerObject);
							this.layersList.push(newLayer);

							// Fill the list of active layers
							var activateType = layerObject.params.activateType.toLowerCase();
							if (Ext.isEmpty(this.layersActivation[activateType])) {
								this.layersActivation[activateType] = [ layerObject.name ];
							} else {
								this.layersActivation[activateType].push(layerObject.name);
							}

							// Create the legends
							if (layerObject.hasLegend) {
								this.buildLegend(layerObject);
							}
						}

						this.setMapLayers(this.map);

						// Gets the layer tree model to initialise the Layer
						// Tree
						Ext.Ajax.request({
							url : Genapp.base_url + 'map/get-tree-layers',
							success : this.initLayerTree,
							scope : this
						});
					},

					/**
					 * Build one OpenLayer Layer from a JSON object.
					 * 
					 * @return OpenLayers.Layer
					 */
					buildLayer : function(layerObject) {

						var url = '';
						if (layerObject.url == 'url_array_tiled') {
							url = this.urlArrayTiled; // an array of URLs for
							// mapserver
						} else if (layerObject.url == 'url_array_cached') {
							url = this.urlArrayCached; // an array of URLs for
							// Tilecache
						} else {
							url = layerObject.url; // default case, a real url
						}

						if (layerObject.untiled) {
							newLayer = new OpenLayers.Layer.WMS.Untiled(layerObject.name, url, layerObject.params, layerObject.options);
						} else {
							newLayer = new OpenLayers.Layer.WMS(layerObject.name, url, layerObject.params, layerObject.options);
						}

						newLayer.displayInLayerSwitcher = true;

						return newLayer;
					},

					/**
					 * Build a Legend Object from a JSON object.
					 * 
					 * @return OpenLayers.Layer
					 */
					buildLegend : function(layerObject) {

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
															src : Genapp.base_url
																	+ 'proxy/getlegendimage?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&Format=image/png&WIDTH=160&LAYER='
																	+ layerObject.params.layers + '&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
														} ]
											}
										}));
						if (layerObject.params.isDisabled || layerObject.params.isHidden || !layerObject.params.isChecked) {
							legend.on('render', function(cmp) {
								cmp.hide();
							});
							legend.on('show', (function(cmp, params) {
								if (cmp.rendered) {
									cmp.getEl().child('img').dom.src = Genapp.base_url
											+ 'proxy/getlegendimage?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&Format=image/png&WIDTH=160&LAYER='
											+ params.layers + '&HASSLD=' + (params.hasSLD ? 'true' : 'false') + '&dc=' + (new Date()).getTime();
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
							this.vectorLayer.preFeatureInsert = function(feature) {
								if (this.features.length > 1) {
									// remove first drawn feature:
									this.removeFeatures([ this.features[0] ]);
								}
							};

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
						this.layerTree = new Genapp.tree.LayerTreePanel({"rootChildren":responseJSON});
				        // Toggle layers and legends for zoom
						this.layerTree.on('afterrender', function(treePanel) {
					        this.layerTree.eachLayerChild(function(child){
					            if(child.attributes.disabled == true){
					                child.forceDisable = true;
					            }else{
					                child.forceDisable = false;
					            }
					        });
						    for (var i = 0; i < this.map.layers.length; i++){
				                this.toggleLayersAndLegendsForZoom(this.map.layers[i]);
				            }
				        }, this);

						// TODO : add GeoExt.LayerOpacitySlider
						this.layerPanel.add(this.layerTree);
						this.layerPanel.doLayout();

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

							// Draw point button
							if (!this.hideDrawPointButton) {
								var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);

								var drawPointButton = new GeoExt.Action({
									control : drawPointControl,
									map : this.map,
									tooltip : this.drawPointControlTitle,
									toggleGroup : "drawControl",
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
									toggleGroup : "drawControl",
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
								group : "drawControl",
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
								toggleGroup : "drawControl",
								group : "drawControl",
								checked : false,
								iconCls : 'modifyfeature'
							});
							this.mapToolbar.add(modifyFeatureButton);

							// Delete feature
							var deleteFeatureControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								displayClass : 'olControlModifyFeature',
								onSelect : function(feature) {
									this.vectorLayer.destroyFeatures([ feature ])
								},
								scope : this,
								type : OpenLayers.Control.TYPE_TOOL
							});

							var deleteFeatureButton = new GeoExt.Action({
								control : deleteFeatureControl,
								map : this.map,
								tooltip : this.tbarDeleteFeatureButtonTooltip,
								toggleGroup : "drawControl",
								group : "drawControl",
								checked : false,
								iconCls : 'deletefeature'
							});
							this.mapToolbar.add(deleteFeatureButton);

						}

						this.mapToolbar.addFill();

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
							toggleGroup : "navControl",
							group : "navControl",
							checked : true,
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
							toggleGroup : "navControl",
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
							toggleGroup : "navControl",
							group : "navControl",
							checked : false,
							iconCls : 'pan'
						});

						this.mapToolbar.add(navigationButton);

						// Séparateur
						this.mapToolbar.addSeparator();

						// Zoom to feature
						var zoomToFeatureControl = new OpenLayers.Control.ZoomToMaxExtent({
							map : this.map,
							active : true
						});

						var zoomToFeatureButton = new GeoExt.Action({
							handler : this.zoomOnResultsBBox,
							scope : this,
							map : this.map,
							tooltip : this.zoomToFeaturesControlTitle,
							checked : false,
							iconCls : 'zoomstations'
						});

						this.mapToolbar.add(zoomToFeatureButton);

						// Zoom to max extend
						var zoomToMaxControl = new OpenLayers.Control.ZoomToMaxExtent({
							map : this.map,
							active : true
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
							var maxZoomLevel = map.numZoomLevels - 1;

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
									// Note: the redraw must be done before to
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
						if (!Ext.isEmpty(layerNames)) {
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
				    toggleLayersAndLegendsForZoom : function(layer){
				        if (!Ext.isEmpty(this.layerTree)) {
				            var node = this.layerTree.getNodeByLayerName(layer.name);
				            if(!Ext.isEmpty(node) && !node.hidden){
			                    if (!layer.calculateInRange()) {
			                        node.zoomDisable = true;
			                        this.disableLayersAndLegends([layer.name], false, false, false);
			                    } else {
			                        node.zoomDisable = false;
			                        if (node.forceDisable !== true) {
			                            this.enableLayersAndLegends([layer.name], false, false);
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

					// private
					beforeDestroy : function() {
						if (this.map) {
							this.map.destroy();
						}
						Genapp.GeoPanel.superclass.beforeDestroy.call(this);
					}
				});