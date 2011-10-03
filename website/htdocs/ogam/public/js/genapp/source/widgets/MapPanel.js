/**
 * Panel containing the dynamic map.
 * <p>
 * Contains : <br/>
 * a panel for the map.<br/> 
 * a mapfish.widgets.LayerTree for the legend.<br/>
 * <br/>
 * @class Genapp.MapPanel
 * @extends Ext.Panel
 * @constructor Create a new MapPanel
 * @param {Object} config The config object
 */
Genapp.MapPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} frame
     * See {@link Ext.Panel#frame}.
     * Default to true.
     */
    frame : true,
    /**
     * @cfg {Boolean} collapsible
     * True to make the panel collapsible and have the expand/collapse toggle button automatically rendered into
     * the header tool button area, false to keep the panel statically sized with no button (defaults to true).
     */
    collapsible : true,
    /**
     * @cfg {Boolean} titleCollapse
     * true to allow expanding and collapsing the panel (when {@link #collapsible} = true)
     * by clicking anywhere in the header bar, false) to allow it only by clicking to tool button
     * (defaults to true)). If this panel is a child item of a border layout also see the
     * {@link Ext.layout.BorderLayout.Region BorderLayout.Region}
     * {@link Ext.layout.BorderLayout.Region#floatable floatable} config option.
     */
    titleCollapse : true,
    /**
     * @cfg {String} title
     * The title text to be used as innerHTML (html tags are accepted) to display in the panel
     * {@link #header} (defaults to 'Map'). When a title is specified the
     * {@link #header} element will automatically be created and displayed unless
     * {@link #header} is explicitly set to false.  If you do not want to specify a
     * title at config time, but you may want one later, you must either specify a non-empty
     * title (a blank space ' ' will do) or header:true so that the container
     * element will get created.
     */
    title : 'Map',
    /**
     * @cfg {Boolean} header
     * true to create the Panel's header element explicitly, false to skip creating
     * it.  If a {@link #title} is set the header will be created automatically, otherwise it will not.
     * If a {@link #title} is set but header is explicitly set to false, the header
     * will not be rendered.
     */
    header: false,
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'border'.
     */
    layout : 'border',
    /**
     * @cfg {Boolean} isDrawingMap
     * true to display the drawing tools on the toolbar. (Default to false)
     */
    isDrawingMap : false,
    /**
     * @cfg {String} featureWKT
     * A wkt feature to draw on the map. (Default to null)
     */
    featureWKT : null,
    /**
     * @cfg {String} tabTip
     * A string to be used as innerHTML (html tags are accepted) to show in a tooltip when mousing over
     * the tab of a Ext.Panel which is an item of a {@link Ext.TabPanel}. {@link Ext.QuickTips}.init()
     * must be called in order for the tips to render.
     * Default to 'The map with the request's results's location'
     */
    tabTip: 'The map with the request\'s results\'s location',
    /**
     * @cfg {Boolean} hideLayersAndLegendVerticalLabel
     * if true hide the layers and legends vertical label (defaults to false).
     */
    hideLayersAndLegendVerticalLabel: false,
    /**
     * @cfg {Boolean} rightPanelCollapsed
     * True to start with the right panel collapsed (defaults to false)
     */
    rightPanelCollapsed : false,
    /**
     * @cfg {Number} rightPanelWidth
     * The rigth panel default width (defaults to 170)
     */
    rightPanelWidth : 170,
    /**
     * @cfg {String} layerPanelTitle
     * The layer Panel Title (defaults to <tt>'Layers'</tt>)
     */
    layerPanelTitle:"Layers",
    /**
     * @cfg {String} layerPanelTabTip
     * The layer Panel Tab Tip (defaults to <tt>'The layers's tree'</tt>)
     */
    layerPanelTabTip:"The layers's tree",
    /**
     * @cfg {String} legendPanelTitle
     * The legend Panel Title (defaults to <tt>'Legends'</tt>)
     */
    legendPanelTitle:"Legends",
    /**
     * @cfg {String} legendPanelTabTip
     * The legend Panel Tab Tip (defaults to <tt>'The layers's legends'</tt>)
     */
    legendPanelTabTip:"The layers's legends",
    /**
     * @cfg {String} panZoomBarControlTitle
     * The panZoomBar Control Title (defaults to <tt>'Zoom'</tt>)
     */
    panZoomBarControlTitle:"Zoom",
    /**
     * @cfg {String} navigationControlTitle
     * The navigation Control Title (defaults to <tt>'Drag the map'</tt>)
     */
    navigationControlTitle: "Drag the map",
    /**
     * @cfg {String} selectFeatureControlTitle
     * The selectFeature Control Title (defaults to <tt>'Select Feature'</tt>)
     */
    selectFeatureControlTitle: "Select Feature",
    /**
     * @cfg {String} invalidWKTMsg
     * The invalid WKT Msg (defaults to <tt>'The feature cannot be displayed'</tt>)
     */
    invalidWKTMsg:"The feature cannot be displayed",
    /**
     * @cfg {String} zoomToFeaturesControlTitle
     * The zoomToFeatures Control Title (defaults to <tt>'Zoom to the features'</tt>)
     */
    zoomToFeaturesControlTitle:"Zoom to the features",
    /**
     * @cfg {String} drawFeatureControlTitle
     * The drawFeature Control Title (defaults to <tt>'Draw a polygon'</tt>)
     */
    drawFeatureControlTitle: "Draw a polygon",
    /**
     * @cfg {String} modifyFeatureControlTitle
     * The modifyFeature Control Title (defaults to <tt>'Update the feature'</tt>)
     */
    modifyFeatureControlTitle: "Update the feature",
    /**
     * @cfg {String} tbarDeleteFeatureButtonTooltip
     * The tbar Delete Feature Button Tooltip (defaults to <tt>'Delete the feature'</tt>)
     */
    tbarDeleteFeatureButtonTooltip:"Delete the feature",
    /**
     * @cfg {String} tbarPreviousButtonTooltip
     * The tbar Previous Button Tooltip (defaults to <tt>'Previous Position'</tt>)
     */
    tbarPreviousButtonTooltip:"Previous Position",
    /**
     * @cfg {String} tbarNextButtonTooltip
     * The tbar Next Button Tooltip (defaults to <tt>'Next Position'</tt>)
     */
    tbarNextButtonTooltip:"Next Position",
    /**
     * @cfg {String} zoomBoxInControlTitle
     * The zoomBox In Control Title (defaults to <tt>'Zoom in'</tt>)
     */
    zoomBoxInControlTitle:"Zoom in",
    /**
     * @cfg {String} zoomBoxOutControlTitle
     * The zoomBox Out Control Title (defaults to <tt>'Zoom out'</tt>)
     */
    zoomBoxOutControlTitle:"Zoom out",
    /**
     * @cfg {String} zoomToMaxExtentControlTitle
     * The zoomToMax Extent Control Title (defaults to <tt>'Zoom to max extend'</tt>)
     */
    zoomToMaxExtentControlTitle: "Zoom to max extend",
    /**
     * @cfg {String} featureInfoControlTitle
     * The feature Info Control Title (defaults to <tt>'Get the plot location information'</tt>)
     */
    featureInfoControlTitle: "Get the plot location information",
    /**
     * @cfg {Boolean} hideLegalMentions
     * if true hide the legal mentions link.
     */
    hideLegalMentions : true,
    /**
     * @cfg {String} legalMentionsLinkHref
     * The user Manual Link Href (defaults to <tt>'Genapp.base_url + 'map/show-legal-mentions''</tt>)
     */
    legalMentionsLinkHref : Genapp.base_url + 'map/show-legal-mentions',
    /**
     * @cfg {String} legalMentionsLinkText
     * The legal mentions LinkText (defaults to <tt>'User Manual'</tt>)
     */
    legalMentionsLinkText : 'Legal Mentions',
    /**
     * @cfg {Integer} minZoomLevel
     * The min zoom level for the map (defaults to <tt>0</tt>)
     */
    minZoomLevel: 0,
    /**
     * @cfg {String} resultsBBox
     * The results bounding box (defaults to <tt>null</tt>)
     */
    resultsBBox: null,
    /**
     * @cfg {Object} layersActivation
     * A object containing few arrays of layers ordered by activation type (defaults to <tt>{}</tt>)
     * {
     *     'request':[resultLayer, resultLayer0, resultLayer1],
     *     'aggregation':[aggregatedLayer0, aggregatedLayer1, aggregatedLayer2],
     *     'interpolation':[interpolatedLayer]
     * }
     */
    layersActivation: {},
    
    /**
     * @cfg {String} projectionLabel
     * The projection to be displayed next to the mouse position (defaults to <tt> m (L2e)</tt>)
     */
    projectionLabel: " m (L2e)",

    // private
    initComponent : function() {

        this.addEvents(
            /**
             * @event afterinit
             * Fires after the map panel is rendered and after all the initializations (map, tree, toolbar).
             * @param {Genapp.MapPanel} this
             */
            'afterinit'
        );

        /**
         * The map top toolbar.
         * @type {mapfish.widgets.toolbar.Toolbar}
         * @property toolbar
         */
        this.toolbar = new mapfish.widgets.toolbar.Toolbar({
            configurable: false
        });

        /**
         * The container of the layers and the legends panels.
         * @property layersAndLegendsPanel
         * @type Ext.TabPanel
         */
        this.layersAndLegendsPanel = new Ext.TabPanel({
            region : 'east',
            width : this.rightPanelWidth,
            collapsed : this.rightPanelCollapsed,
            collapsible : true,
            titleCollapse : false,
            cls : 'genapp-query-map-right-panel',
            activeItem: 0,
            split:true,
            items:[
                /**
                 * The layers panel.
                 * @property layerPanel
                 * @type Ext.Panel
                 */
                this.layerPanel = new Ext.Panel({
                    layout: 'fit',
                    cls : 'genapp-query-layer-tree-panel',
                    title : this.layerPanelTitle,
                    tabTip : this.layerPanelTabTip,
                    frame : true,
                    layoutConfig : {
                        animate: true
                    }
                }),
                /**
                 * The legends panel.
                 * @property legendPanel
                 * @type Ext.Panel
                 */
                this.legendPanel = new Ext.Panel({
                    cls : 'genapp-query-legend-panel',
                    title:this.legendPanelTitle,
                    tabTip : this.legendPanelTabTip,
                    frame : true,
                    layoutConfig : {
                        animate : true
                    }
                })
            ]
        });

        // Add the layers and legends vertical label
        if(!this.hideLayersAndLegendVerticalLabel){
            this.layersAndLegendsPanel.on(
                'collapse',
                function(panel){
                    Ext.get(panel.id + '-xcollapsed').createChild({
                        tag: "div", 
                        cls: 'genapp-query-map-right-panel-xcollapsed-vertical-label-div'
                    });
                },
                this,
                {
                    single : true
                }
            );
        }

        this.items = [
            /**
             * The map panel.
             * @property mapPanel
             * @type Ext.Panel
             */
            this.mapPanel = new Ext.Panel({
                region : 'center',
                cls : 'genapp_query_mappanel',
                frame : true,
                layout : 'fit',
                tbar : this.toolbar,
                xtype : 'panel',
                listeners : {
                    'render' : function(cmp) {
                        // Set the map container height and width to avoid css bug in standard mode.
                        // See https://trac.mapfish.org/trac/mapfish/ticket/85
                        cmp.body.setStyle('width', '100%');
                        cmp.body.setStyle('height', '100%');

                        // Gets the layers
                        Ext.Ajax.request({
                            url: Genapp.base_url + 'map/getLayers',
                            success :function(response, options){
                                var layersObject = Ext.decode(response.responseText), i;
                                this.layersList = [];
                                this.layersActivation = {}; // Avoid a conflict between the geometryField mapPanel and the consultation mapPanel
                                for ( i = 0; i < layersObject.layers.length; i++) {
                                    var newLayer;
                                    if(layersObject.layers[i].untiled){
                                        newLayer = new OpenLayers.Layer.WMS.Untiled(
                                            layersObject.layers[i].name,
                                            layersObject[layersObject.layers[i].url],
                                            layersObject.layers[i].params,
                                            layersObject.layers[i].options
                                        );
                                    }else{
                                        newLayer = new OpenLayers.Layer.WMS(
                                            layersObject.layers[i].name,
                                            layersObject[layersObject.layers[i].url],
                                            layersObject.layers[i].params,
                                            layersObject.layers[i].options
                                        );
                                    }
                                    this.layersList.push(newLayer);
                                    var activateType = layersObject.layers[i].params.activateType.toLowerCase();
                                    if (Ext.isEmpty(this.layersActivation[activateType])) {
                                        this.layersActivation[activateType] = [layersObject.layers[i].name];
                                    }else{
                                        this.layersActivation[activateType].push(layersObject.layers[i].name);
                                    }

                                    // Create the legends
                                    if(layersObject.layers[i].hasLegend){
                                        var legend = cmp.ownerCt.items.get(1).items.get(1).add(
                                            new Ext.BoxComponent({
                                                id:this.id + layersObject.layers[i].name,
                                                autoEl: {
                                                    tag :'div',
                                                    children:[{
                                                        tag:'span',
                                                        html:layersObject.layers[i].options.label,
                                                        cls:'x-form-item x-form-item-label'
                                                    },{
                                                        tag: 'img',
                                                        src: Genapp.base_url + 'proxy/getlegendimage?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&Format=image/png&WIDTH=160&LAYER='+layersObject.layers[i].params.layers + '&HASSLD=' + (layersObject.layers[i].params.hasSLD ? 'true' : 'false')
                                                    }]
                                                }
                                            })
                                        );
                                        if (layersObject.layers[i].params.isDisabled 
                                                || layersObject.layers[i].params.isHidden
                                                || !layersObject.layers[i].params.isChecked){
                                            legend.on('render',function(cmp){cmp.hide();});
                                            legend.on('show',(function(cmp, params){
                                                if(cmp.rendered){
                                                    cmp.getEl().child('img').dom.src = Genapp.base_url + 'proxy/getlegendimage?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&Format=image/png&WIDTH=160&LAYER='+params.layers +'&HASSLD=' + (params.hasSLD ? 'true' : 'false') + '&dc='+(new Date()).getTime();
                                                }
                                            }).createCallback(legend, layersObject.layers[i].params));
                                        }
                                    }
                                }

                                // Updates the legends panel
                                cmp.ownerCt.items.get(1).items.get(1).doLayout();

                                // Creates the map
                                this.initMap(cmp.body.id);
                                cmp.on("bodyresize", this.map.updateSize, this.map);
                                /*this.ownerCt.on("move", this.map.updateSize, this.map);
                                this.map.events.register('changelayer', this.map, this.map.updateSize);*/

                                if(!this.hideLegalMentions){
                                    // Create the link and 
                                    // stop the event propagation to avoid conflicts with the underlying map
                                    cmp.el.createChild({
                                        tag: 'div',
                                        cls: 'genapp-map-panel-legal-mentions',
                                        children: [{
                                            tag: 'a',
                                            target: '_blank',
                                            href: this.legalMentionsLinkHref,
                                            html: this.legalMentionsLinkText
                                        }]
                                    }, cmp.el.child('.olMapViewport',true)).on('click',Ext.emptyFn,null,{
                                            stopPropagation:true
                                        }
                                    );
                                }

                                // Gets the layer tree model
                                Ext.Ajax.request({
                                    url: Genapp.base_url + 'map/get-tree-layers',
                                    success :function(response, options){
                                        this.layerTreeModel = Ext.decode(response.responseText);

                                        // Creates the layer tree
                                        this.initLayerTree();
                                        cmp.ownerCt.items.get(1).items.get(0).add(this.layertree);
                                        cmp.ownerCt.items.get(1).items.get(0).doLayout();

                                        // Creates the map toolbar
                                        this.initToolbar();
                                        cmp.ownerCt.items.get(0).getTopToolbar().doLayout();

                                        // Fire the afterinit event
                                        this.fireEvent('afterinit',this);
                                    },
                                    scope :this
                                });
                            },
                            scope :this
                        });
                    },
                scope : this
                }
            }),
            this.layersAndLegendsPanel
        ];
        Genapp.MapPanel.superclass.initComponent.call(this);
    },

    /**
     * Initialize the map
     * @param {String} consultationMapDivId The consultation map div id
     * @hide
     */
    initMap : function(consultationMapDivId) {

        // Create the map config resolution array
        var resolutions = [], i;
        for (i = this.minZoomLevel; i < Genapp.map.resolutions.length; i++) {
            resolutions.push(Genapp.map.resolutions[i]);
        }

        /**
         * The map.
         * @type {OpenLayers.Map}
         * @property map
         */
        this.map = new OpenLayers.Map(consultationMapDivId, {
            'controls' : [],
            'resolutions' : resolutions,
            'numZoomLevels': Genapp.map.numZoomLevels, 
            'projection' : Genapp.map.projection,
            'units' : 'm',
            'tileSize' : new OpenLayers.Size(Genapp.map.tilesize, Genapp.map.tilesize),
            'maxExtent' : new OpenLayers.Bounds(Genapp.map.x_min, Genapp.map.y_min, Genapp.map.x_max, Genapp.map.y_max),
            'eventListeners' : {// Hide the legend if needed
                changelayer: function(o){
                    if(o.property === 'visibility'){
                        this.toggleLayersAndLegendsForZoom(o.layer);
                    }
                },
                scope:this
            }
        });
        /**
         * The wkt format.
         * @type {OpenLayers.Format.WKT}
         * @property wktFormat
         */
        this.wktFormat = new OpenLayers.Format.WKT();
        /**
         * The vector layer.
         * @type {OpenLayers.Layer.Vector}
         * @property vectorLayer
         */
        this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
            printable : false // This layers is never printed
        });

        //
        // Initialize the layers
        // 
        // Always add the base layers first

        // Add a base layer
        var baseLayer = new OpenLayers.Layer("Empty baselayer", {
            isBaseLayer : true,
            printable : false // This layers is never printed
        });
        this.map.addLayer(baseLayer);

        // Add the available layers
        for (i = 0; i < this.layersList.length; i++) {
            this.map.addLayer(this.layersList[i]);
        }

        // Add the vector layer
        this.map.addLayer(this.vectorLayer);

        //
        // Add the controls
        //

        // Zoom bar
        this.map.addControl(new OpenLayers.Control.PanZoomBar( {
            title : this.panZoomBarControlTitle
        }));

        // Mouse position
        this.map.addControl(new OpenLayers.Control.MousePosition({ 
            prefix: 'X: ', 
            separator: ' - Y: ', 
            suffix: this.projectionLabel, 
            numDigits: 0,
            title: 'MousePosition'
        }));

        // Scale
        this.map.addControl(new OpenLayers.Control.Scale());
        this.map.addControl(new OpenLayers.Control.ScaleLine({
                title: 'ScaleLine',
                bottomOutUnits:'',
                bottomInUnits:''
            })
        );

        // Zoom the map to the user country level
        this.map.setCenter(new OpenLayers.LonLat(Genapp.map.x_center, Genapp.map.y_center), Genapp.map.defaultzoom);

        if (this.isDrawingMap){
            this.vectorLayer.preFeatureInsert = function(feature) {
                if (this.features.length > 1){
                    // remove first drawn feature:
                    this.removeFeatures([this.features[0]]);
                }
            };

            var sfDraw = new OpenLayers.Control.SelectFeature(
                    this.vectorLayer, {
                    multiple: false,
                    clickout: true,
                    toggle: true,
                    title: this.selectFeatureControlTitle
                }
            ); 
            this.map.addControl(sfDraw);
            sfDraw.activate();

            if (this.featureWKT) {
                // display it with WKT format reader.
                var feature = this.wktFormat.read(this.featureWKT);
                if (feature) {
                    this.vectorLayer.addFeatures([feature]);
                } else {
                    alert(this.invalidWKTMsg); //'Invalid WKT string: the feature cannot be displayed.'
                }
            }
        }else{
            // Add a control that display a tooltip on the features
            var selectControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {hover: true});
            this.map.addControl(selectControl);
            selectControl.activate();
        }
    },

    /**
     * Initialize the layer tree
     * @hide
     */
    initLayerTree : function() {
        var i;
        /**
         * The layer tree.
         * @type {mapfish.widgets.LayerTree}
         * @property layertree
         */
        this.layertree = new mapfish.widgets.LayerTree( {
            title : '',
            border : false,
            map : this.map,
            model : this.layerTreeModel,
            enableDD : true,
            listeners:{
                'afterrender':function(){
                    for (i = 0; i < this.map.layers.length; i++){
                        this.toggleLayersAndLegendsForZoom(this.map.layers[i]);
                    }
                },
                scope:this
            },
            plugins : [
               {
                    init: function(layerTree) {
                        layerTree.getRootNode().cascade(
                        function(child) {
                            if(child.attributes.disabled === true){
                                child.forceDisable = true;
                            }else{
                                child.forceDisable = false;
                            }
                        }
                        );
                    }
                },
                mapfish.widgets.LayerTree.createContextualMenuPlugin(['opacitySlide'])                
                ],
            ascending : false
        });
        // Move the vector layer above all others
        this.map.setLayerIndex(this.vectorLayer, 100);
    },

    /**
     * Initialize the map toolbar
     * @hide
     */
    initToolbar : function() {

        this.toolbar.map = this.map;

        if (this.isDrawingMap){
            // Zoom to features button
            this.toolbar.addControl(
                    new OpenLayers.Control.ZoomToFeatures(this.vectorLayer, {
                        title:this.zoomToFeaturesControlTitle,
                        maxZoomLevel: 9,
                        ratio: 1.05,
                        autoActivate: true
                    }), {
                    iconCls: 'zoomstations'
                }
            );

            // Draw feature button
            this.toolbar.addControl(
                new OpenLayers.Control.DrawFeature(
                    this.vectorLayer, 
                    OpenLayers.Handler.Polygon/*, 
                    drawControlOptions*/), 
                {
                    iconCls: 'drawpolygon', 
                    tooltip: this.drawFeatureControlTitle
                }
            );

            // Modify feature button
            this.toolbar.addControl(
                    new OpenLayers.Control.ModifyFeature(
                        this.vectorLayer, {
                            displayClass: 'olControlModifyFeature',
                            deleteCodes: [46, 100], // delete vertices on 'delete' and 'd' keypressed
                            type: OpenLayers.Control.TYPE_TOOL,
                            title: this.modifyFeatureControlTitle
                        }
                    ),{
                    iconCls: 'modifyfeature',
                    disabled: false
                }
            );

            // Delete feature button
            var deleteFeatureButton = new Ext.Toolbar.Button({
                iconCls: 'deletefeature',
                tooltip: this.tbarDeleteFeatureButtonTooltip,
                disabled: false,//((this.featureWKT) ? (this.featureWKT.length == 0) : true),
                handler: OpenLayers.Function.bind(function (){
                    if (this.vectorLayer.features.length){
                            var sfDraw = this.map.getControlsBy('title', this.selectFeatureControlTitle);
                            if (this.vectorLayer.selectedFeatures.length){
                                sfDraw[0].unselect(this.vectorLayer.selectedFeatures[0]);
                            }
                            this.vectorLayer.removeFeatures(this.vectorLayer.features);
                    }
                    else {
                        //Ext.Msg.alert('Info', 'No geometry found.');
                    }
                }, this)
            });
            this.toolbar.add(deleteFeatureButton);
        }//endif isDrawingMap

        this.toolbar.addFill();

        // Navigation history : back and next.
        var nav = new OpenLayers.Control.NavigationHistory({});
        this.map.addControl(nav);
        nav.activate();

        var buttonPrevious = new Ext.Toolbar.Button({
            iconCls: 'back',
            tooltip: this.tbarPreviousButtonTooltip,
            disabled: true,
            handler: nav.previous.trigger
        });

        var buttonNext = new Ext.Toolbar.Button({
            iconCls: 'next',
            tooltip: this.tbarNextButtonTooltip,
            disabled: true, 
            handler: nav.next.trigger
        });

        this.toolbar.add(buttonPrevious);
        this.toolbar.add(buttonNext);

        nav.previous.events.register(
            "activate", 
            buttonPrevious,
            function() { 
                this.setDisabled(false); 
            }
        );

        nav.previous.events.register(
            "deactivate", 
            buttonPrevious,
            function() { 
                this.setDisabled(true); 
            }
        );

        nav.next.events.register(
            "activate", 
            buttonNext, 
            function(){ 
                this.setDisabled(false); 
            }
        );

        nav.next.events.register(
            "deactivate", 
            buttonNext,
            function() { 
                this.setDisabled(true); 
            }
        );

        this.toolbar.addSeparator();

        if(!this.hideMapDetails){
            // Get info on the feature
            this.toolbar.addControl(
                new OpenLayers.Control.FeatureInfoControl(),
                {
                    iconCls: 'feature-info',
                    tooltip: this.featureInfoControlTitle
                }
            );
        }

        this.toolbar.addControl(
            new OpenLayers.Control.ZoomBox({
                title:this.zoomBoxInControlTitle
            }), {
                iconCls: 'zoomin'
            }
        );

        this.toolbar.addControl(
            new OpenLayers.Control.ZoomBox({
                out: true,
                title: this.zoomBoxOutControlTitle
            }), {
                iconCls: 'zoomout'
            }
        );

        this.toolbar.addControl(
            new OpenLayers.Control.Navigation({
                isDefault: true,
                title: this.navigationControlTitle,
                mouseWheelOptions: {interval: 100}
            }), {
                iconCls: 'pan'
            }
        );

        this.toolbar.addSeparator();

        this.toolbar.addButton({
            handler : this.zoomOnResultsBBox,
            scope: this,
            iconCls: 'zoomstations',
            tooltip: this.zoomToFeaturesControlTitle
        });

        this.toolbar.addControl(
            new OpenLayers.Control.ZoomToMaxExtent({
                map: this.map,
                active:true,
                title: this.zoomToMaxExtentControlTitle
            }), {
                iconCls: 'zoomfull'
            }
        );
      
        this.toolbar.activate();
    },
    
    /**
     * Clean the map panel
     */
    clean: function() {
        // Remove previous features
        this.vectorLayer.destroyFeatures(this.vectorLayer.features);
        
        // Zoom the map to the user country level
        //this.map.setCenter(new OpenLayers.LonLat(Genapp.map.x_center, Genapp.map.y_center), Genapp.map.defaultzoom);
        
    },

    /**
     * Zoom to the passed feature on the map
     * @param {String} id The plot id
     * @param {String} wkt The wkt feature
     */
    zoomToFeature: function(id, wkt){
        
        // Parse the feature location and create a Feature Object
        var feature = this.wktFormat.read(wkt);
        
        // Add the plot id as an attribute of the object
        feature.attributes.id = id.substring(id.lastIndexOf('__')+2);
        
        // Remove previous features
        this.vectorLayer.destroyFeatures(this.vectorLayer.features);
        
        // Move the vector layer above all others
        this.map.setLayerIndex(this.vectorLayer, 100);
        if (feature) {
             // Add the feature
            this.vectorLayer.addFeatures([feature]);
        } else {
            alert(this.invalidWKTMsg); //'Invalid WKT string: the feature cannot be displayed.'
        }

        // Center on the feature
        this.map.setCenter(
            new OpenLayers.LonLat(
                feature.geometry.x, 
                feature.geometry.y
            ), 7
        );
    },

    /**
     * Zoom on the provided bounding box
     * 
     * {String} wkt The wkt of the bounding box
     */
    zoomOnBBox: function(wkt){
        if(!Ext.isEmpty(wkt)){
            var map = this.map;
            /**
             * The ratio by which features' bounding box should be scaled
             */
            var ratio = 1;
            /**
             * The maximum zoom level to zoom to
             */
            var maxZoomLevel = map.numZoomLevels-1;

            // Parse the feature location and create a Feature Object
            var feature = this.wktFormat.read(wkt);

            var bounds = feature.geometry.getBounds();

            bounds = bounds.scale(ratio);
            
            if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)){
                var zoom = maxZoomLevel;
            } else {
                var desiredZoom = map.getZoomForExtent(bounds);
                var zoom = (desiredZoom > maxZoomLevel) ? maxZoomLevel : desiredZoom;
            }
            map.setCenter(bounds.getCenterLonLat(), zoom);
        }
    },

    /**
     * Zoom on the results bounding box
     */
    zoomOnResultsBBox: function(){
        this.zoomOnBBox(this.resultsBBox);
    },

    /**
     * Toggle the layer(s) and legend(s)
     * 
     * @param {Object} layerNames An object like :
     * {
     *     'layerName1' : 'checked',
     *     'layerName2' : 'unchecked',
     *     'layerName3' : 'disable',
     *     'layerName4' : 'hide',
     *     ...
     * }
     * Four values are possible for each layer:
     * checked: enable and show the layer, check the tree node, display the legend 
     * unchecked: enable but hide the layer, uncheck the tree node, display the legend
     * disable: disable the layer, uncheck the tree node, disable the legend
     * hide: disable and hide the layer, uncheck the tree node, hide the legend
     * 
     */
    toggleLayersAndLegends: function(layerNames){

        var layersAndLegendsToEnableChecked = [],
            layersAndLegendsToEnableUnchecked = [],
            layersAndLegendsToDisable = [],
            layersAndLegendsToHide = [],
            layerName;
        for(layerName in layerNames){
            if (layerNames.hasOwnProperty(layerName)) {
                switch (layerNames[layerName])
                {
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
     * @param {Array} layerNames The layer names
     * @param {Boolean} check True to check the layerTree node checkbox (default to false)
     * @param {Boolean} setForceDisable Set the layerTree node forceDisable parameter (default to true)
     * The forceDisable is used by the 'toggleLayersAndLegendsForZoom' function to avoid to enable, 
     * a node disable for another cause that the zoom range.
     */
    enableLayersAndLegends: function(layerNames, check, setForceDisable){

        //The tabPanels must be activated before to show a child component
        var isLayerPanelVisible = this.layerPanel.isVisible(), i;

        this.layersAndLegendsPanel.activate(this.layerPanel);
        for(i = 0; i<layerNames.length ;i++){
            var nodeId = this.layertree.layerToNodeIds[layerNames[i]];
            if(!Ext.isEmpty(nodeId)){
                if (setForceDisable !== false){
                    this.layertree.getNodeById(nodeId).forceDisable = false;
                }
                if(this.layertree.getNodeById(nodeId).zoomDisable !== true){
                    this.layertree.getNodeById(nodeId).enable();
                }
                this.layertree.getNodeById(nodeId).getUI().show();
                /*var layers = this.layertree.nodeIdToLayers[nodeId];
                layers[0].display(true);*/
                if (check === true) {
                    // Note: the redraw must be done before to check the node
                    // to avoid to redisplay the old layer images before the new one
                    var layers = this.map.getLayersByName(layerNames[i]);
                    layers[0].redraw(true);
                    this.layertree.setNodeChecked(nodeId,true);
                }
            }
        }

        this.layersAndLegendsPanel.activate(this.legendPanel);
        this.setLegendsVisible(layerNames,true);

        //Keep the current activated panel activated
        if(isLayerPanelVisible){
            this.layersAndLegendsPanel.activate(this.layerPanel);
        }
    },

    /**
     * Disable (and hide if asked) the layer(s)
     * And hide the legend(s)
     * 
     * @param {Array} layerNames The layer names
     * @param {Boolean} uncheck True to uncheck the layerTree node checkbox (default to false)
     * @param {Boolean} hide True to hide the layer(s) and legend(s) (default to false)
     * @param {Boolean} setForceDisable Set the layerTree node forceDisable parameter (default to true)
     * The forceDisable is used by the 'toggleLayersAndLegendsForZoom' function to avoid to enable, 
     * a node disable for another cause that the zoom range.
     */
    disableLayersAndLegends: function(layerNames, uncheck, hide, setForceDisable){

        var i;
        if(!Ext.isEmpty(layerNames)){
            for(i = 0; i<layerNames.length ;i++){
                var nodeId = this.layertree.layerToNodeIds[layerNames[i]];
                if(!Ext.isEmpty(nodeId)){
                    if (uncheck === true) {
                        this.layertree.setNodeChecked(nodeId,false);
                    }
                    var node = this.layertree.getNodeById(nodeId);
                    if (hide === true) {
                        node.getUI().hide();
                    }
                    node.disable();
                    if (setForceDisable !== false) {
                        node.forceDisable = true;
                    }
                    /*var layers = this.layertree.nodeIdToLayers[nodeId];
                    layers[0].display(false);*/
                }
                this.setLegendsVisible([layerNames[i]],false);
            }
        }
    },

    /**
     * Toggle the layer node and legend in function of the zoom range
     * 
     * @param {OpenLayers.Layer} layer The layer to check
     */
    toggleLayersAndLegendsForZoom : function(layer){
        if (!Ext.isEmpty(this.layertree)) {
            var nodeId = this.layertree.layerToNodeIds[layer.name];
            if(!Ext.isEmpty(nodeId)){
                var node = this.layertree.getNodeById(nodeId);
                if (!Ext.isEmpty(node) && !node.hidden){
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
        }
    },

    /**
     * Convenience function to hide or show a legend by boolean.
     * 
     * @param {Array} layerNames The layers name
     * @param {Boolean} visible True to show, false to hide
     */
    setLegendsVisible: function(layerNames, visible){
        var i;
        for(i = 0; i<layerNames.length ;i++){
            var legendCmp = this.legendPanel.findById(this.id + layerNames[i]);
            if(!Ext.isEmpty(legendCmp)){
                if (visible === true) {
                    var layers = this.map.getLayersByName(layerNames[i]);
                    if(layers[0].calculateInRange() && layers[0].getVisibility()){
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
    beforeDestroy : function(){
        if(this.map){
            this.map.destroy();
        }
        Genapp.MapPanel.superclass.beforeDestroy.call(this);
    }
});