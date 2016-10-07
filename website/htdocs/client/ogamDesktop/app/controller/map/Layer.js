/**
 * This class defines the controller with actions related to 
 * tree layers, map layers, map controls.
 */
Ext.define('OgamDesktop.controller.map.Layer',{
    extend: 'Ext.app.Controller',
    requires: [
        'OgamDesktop.view.map.LayersPanel',
        'OgamDesktop.store.map.LayerTreeNode',
        'Ext.window.MessageBox'
    ],

    /**
     * The map panel view.
     * @private
     * @property
     * @type OgamDesktop.view.map.MapPanel
     */
    mapPanel: null,

    /**
     * The current edition field linked to the drawing toolbar
     * @private
     * @property
     * @type OgamDesktop.ux.form.field.GeometryField
     */
    currentEditionField: null,

    /**
     * The previous edition field id linked to the drawing toolbar
     * @private
     * @property
     * @type String
     */
    previousEditionFieldId: null,

    /**
     * A count of events to synchronize
     * @private
     * @property
     * @type Number
     */
    eventCounter : 0,
    
    /**
     * The layer tree nodes store
     * @private
     * @property
     * @type {object}
     */
    layerTreeNodesStore : null,

    /**
     * The refs to get the views concerned
     * and the control to define the handlers of the
     * MapPanel, toolbar and LayersPanel events
     */
    config: {
        refs: {
                layerspanel: 'layers-panel',
                legendspanel: 'legends-panel',
                mappanel: '#map-panel'
        },
        control: {
            'map-mainwin': {
                afterrender: 'afterMapMainWinRendered'
            },
            'layerspanel': {
                storeLoaded: 'afterLayersPanelStoreLoaded'
            }
        }
    },

    /**
     * Manages the afterMapMainWinRendered event :
     *
     *  - Increments the event counter,
     *  - Calls the setupMapAndTreeLayers function if the counter is equal at two.
     * @private
     */
    afterMapMainWinRendered : function() {
        this.eventCounter += 1;
        if (this.eventCounter === 2) {
            this.setupMapAndTreeLayers();
        }
    },

    /**
     * Manages the afterLayersPanelStoreLoaded event :
     *
     *  - Sets the treeStore,
     *  - Increments the event counter,
     *  - Calls the setupMapAndTreeLayers function if the counter is equal at two.
     * @private
     * @param {Object} store The layer tree nodes store
     * @param {Array} records The layer tree nodes records
     */
    afterLayersPanelStoreLoaded : function(store, records) {
        this.layerTreeNodesStore = store;
        this.eventCounter += 1;
        if (this.eventCounter === 2) {
            this.setupMapAndTreeLayers();
        }
    },

   /**
     * Sets up the map and the tree layers
     * @private
     */
    setupMapAndTreeLayers : function() {
        var mapCmp = this.getMappanel().child('mapcomponent');

        // Creation of the layers collection
        var layersCollection = this.buildLayersCollection();

        // Identifies the request layers
        mapCmp.getController().requestLayers = this.getRequestLayers(layersCollection);

        // Adds the layers to the map
        var map = mapCmp.getMap();
        layersCollection.each(function(item, index, len){
            map.addLayer(item);
        }, this);

        // Adds the store to the layers tree
        this.getLayerspanel().setConfig('store', this.buildGeoExtStore());
    },

   /**
     * Return an array containing the request layers
     * @private
     * @param {Ext.util.Collection} layersCollection The full map layers collection
     * @return {Array} The request layers
     */
    getRequestLayers: function(layersCollection) {
        var requestLayers = [];
        var addRequestLayerFn = function(item, index, len){
            if(item instanceof ol.layer.Group){
                item.getLayers().forEach(function(el, index, layers){
                    addRequestLayerFn(el, index, layers.length);
                });
            } else {
                if (item.get('activateType') === 'request') {
                    requestLayers.push(item);
                }
            }
        };
        layersCollection.each(addRequestLayerFn);
        return requestLayers;
    },

   /**
     * Adds the children to their parent
     * @param {Array} parentChildrenArray The current node parent children array
     * @param {OgamDesktop.model.map.LayerTreeNode} node The current node
     * @private
     */
    addChild: function (parentChildrenArray, node) {
    	var newNode;
		if (!node.get('isLayer')) { // Create a group
			newNode = new ol.layer.Group({
                // TODO check if necessary (sylvain) name: node.get('label'),
                text: node.get('label'),
                grpId: node.get('nodeId'),
                visible: !node.get('isHidden'),
                displayInLayerSwitcher: !node.get('isHidden'),
                expanded: node.get('isExpanded'),
                checked: node.get('isChecked'),
                disabled: node.get('isDisabled')
            });
			// Add the child to its parent
        	node.getChildren().each(
    			function(child){
    				this.addChild(newNode.getLayers(), child);
    			},
    			this
        	);
            parentChildrenArray.push(newNode);
		} else { // Create a layer
	        var mapCmp = this.getMappanel().child('mapcomponent');
	        var curRes = mapCmp.getMap().getView().getResolution();
			var layer = node.getLayer();
            if (!Ext.isEmpty(layer.getLegendService())) {
                this.getLegendspanel().fireEvent('readyToBuildLegend', node, curRes);
            };
            if (!Ext.isEmpty(layer.getViewService())) {
                newNode = this.buildOlLayer(node, curRes);
                // Add the child to its parent
                parentChildrenArray.push(newNode);
            }
		}
	},

   /**
     * Build a layers collection
     * @private
     * @return {Ext.util.MixedCollection} The layers collection
     */
    buildLayersCollection: function() {
        var layersList = [];
        this.layerTreeNodesStore.each(
    		function(node){
    			this.addChild(layersList,node);
    		},
    		this
        );

        var layersCollection = new Ext.util.MixedCollection();
        layersCollection.addAll(layersList.reverse());

        return layersCollection;
    },

   /**
     * Build a OpenLayers source
     * @private
     * @param {OgamDesktop.model.map.Layer} layer The layer
     * @param {OgamDesktop.model.map.LayerService} service The service used per the layer
     * @return {ol.source} The OpenLayers source
     */
    buildOlSource: function(layer, service) {
        var serviceType = service.get('config').params.SERVICE;
        switch (serviceType) {
        case 'WMS':
            // Sets the WMS layer source
            var sourceWMSOpts = {};
            sourceWMSOpts['params'] = Ext.apply({
                'layers': layer.get('serviceLayerName')
                //TODO To remove after check (sylvain) 'session_id': layer.get('params').session_id
            }, service.get('config').params);
            sourceWMSOpts['urls'] = service.get('config').urls;
            sourceWMSOpts['crossOrigin'] = 'anonymous';
            sourceWMSOpts['projection'] = OgamDesktop.map.projection;
            sourceWMSOpts['tileGrid'] = new ol.tilegrid.TileGrid({
                extent : [
                    OgamDesktop.map.x_min,
                    OgamDesktop.map.y_min,
                    OgamDesktop.map.x_max,
                    OgamDesktop.map.y_max
                ],
                resolutions: OgamDesktop.map.resolutions,
                tileSize: [256, 256],
                origin:[OgamDesktop.map.x_min, OgamDesktop.map.y_min]
            });
            return new ol.source.TileWMS(sourceWMSOpts);
        case 'WMTS':
            // Sets the WMTS layer source
            var origin = service.get('config').params.tileOrigin; //coordinates of top left corner of the matrixSet
            var resolutions = service.get('config').params.serverResolutions;
            var matrixIds = [];
            for (var i in resolutions){
                matrixIds[i] = i;
            };
            var tileGrid = new ol.tilegrid.WMTS({
                origin: origin,
                resolutions: resolutions,
                matrixIds: matrixIds
            });
            var sourceWMTSOpts = {};
            sourceWMTSOpts['urls'] = service.get('config').urls;
            sourceWMTSOpts['layer'] = layer.get('serviceLayerName');
            sourceWMTSOpts['tileGrid'] = tileGrid;
            sourceWMTSOpts['matrixSet'] = service.get('config').params.matrixSet;
            sourceWMTSOpts['style'] = service.get('config').params.style;
            sourceWMTSOpts['crossOrigin'] = 'anonymous';
            return new ol.source.WMTS(sourceWMTSOpts);
        default:
            console.error('buildSource: The "' + serviceType + '" service type is not supported.');
        }
    },

   /**
     * Build a OpenLayers layer
     * @private
     * @param {OgamDesktop.model.map.LayerTreeNode} node The node of the layer
     * @param {number} curRes The map current resolution
     * @return {ol.layer.Tile} The OpenLayers layer
     */
    buildOlLayer: function(node, curRes) {
        var olLayerOpts = {};
        var layer = node.getLayer();
        //TODO to remove after check (sylvain) olLayerOpts['session_id'] = layer.get('params').session_id;
        olLayerOpts['source'] = this.buildOlSource(layer, layer.getViewService());
        olLayerOpts['name'] = layer.get('name');
        olLayerOpts['text'] = layer.get('label');
        olLayerOpts['opacity'] = layer.get('defaultOpacity');
        olLayerOpts['printable'] = true;
        olLayerOpts['visible'] = !node.get('isHidden');
        olLayerOpts['displayInLayerSwitcher'] = !node.get('isHidden');
        olLayerOpts['checked'] = node.get('isChecked');
        if(!Ext.isEmpty(layer.getMinZoomLevel())){
        	olLayerOpts['minResolution'] = layer.getMinZoomLevel().get('resolution');
        }
        if(!Ext.isEmpty(layer.getMaxZoomLevel())){
        	olLayerOpts['maxResolution'] = layer.getMaxZoomLevel().get('resolution');
        }
        olLayerOpts['disabled'] = node.get('isDisabled');
        if ((olLayerOpts['minResolution'] != undefined && curRes < olLayerOpts['minResolution']) 
                || (olLayerOpts['maxResolution'] != undefined && curRes >= olLayerOpts['maxResolution'])) {
            olLayerOpts['disabled'] = true;
        }
        olLayerOpts['activateType'] = layer.get('activateType').toLowerCase();
        return new ol.layer.Tile(olLayerOpts);
    },

   /**
     * Build a GeoExt tree store
     * @private
     * @return {GeoExt.data.store.LayersTree} The GeoExt tree store
     */
    buildGeoExtStore: function() {
        var mapCmp = this.getMappanel().child('mapcomponent');

        // Create the GeoExt tree store
        var treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: mapCmp.getMap().getLayerGroup(),
            textProperty: 'text',
            folderToggleMode: 'classic'
        });

        // Filters the layers in function of their 'displayInLayerSwitcher' property
        treeLayerStore.filterBy(function(record) {
            return record.getOlLayer().get('displayInLayerSwitcher') === true;
        }, this);

        // Sets up the store records 
        // See GeoExt.data.model.LayerTreeNode and Ext.data.NodeInterface for the item properties
        // The each fonction doesn't work as expected in extjs v6.0.1.250
        // The getRoot().cascaseBy() function doesn't use the filtered store
        treeLayerStore.getRoot().cascadeBy({
            'after' : function(node) {
                var layer = node.getOlLayer();
                if(layer && layer.get('displayInLayerSwitcher') === true){
                    if (node.childNodes.length > 0){ // Node group
                        if (layer.get('expanded')) {
                            node.expand();
                        };
                    } else { // Node
                        var cls = layer.get('disabled') ? 'dvp-tree-node-disabled' : '';
                        node.set("cls", cls);
                        node.set("checked", layer.get('checked'));
                    }
                }
            }
        });

        return treeLayerStore;
    }
});