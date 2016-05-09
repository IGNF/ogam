/**
 * This class defines the controller with actions related to 
 * tree layers, map layers, map controls.
 */
Ext.define('OgamDesktop.controller.map.Layer',{
    extend: 'Ext.app.Controller',
    requires: [
        'OgamDesktop.view.map.LayersPanel',
        'OgamDesktop.store.map.Layer',
        'OgamDesktop.store.map.LayerService',
        'OgamDesktop.store.map.LayerNode',
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
     * The layer tree store
     * @private
     * @property
     * @type Array
     */
    treeStores : [],

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
                layersPanelStoresLoaded: 'afterLayersPanelStoresLoaded'
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
     * Manages the afterLayersPanelStoresLoaded event :
     *
     *  - Sets the treeStores,
     *  - Increments the event counter,
     *  - Calls the setupMapAndTreeLayers function if the counter is equal at two.
     * @private
     * @param {Array} treeStores The layer tree store
     */
    afterLayersPanelStoresLoaded : function(treeStores) {
        this.treeStores = treeStores;
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
        var filterOnRequestActivateType = new Ext.util.Filter({
            filterFn : function(item) {
                return item.get('activateType') === 'request';
            }
        });
        var requestLayersCollection = layersCollection.filter(filterOnRequestActivateType);
        mapCmp.getController().requestLayers = requestLayersCollection.getRange();

        // Adds the layers to the map
        var map = mapCmp.getMap();
        layersCollection.each(function(item, index, len){
            map.addLayer(item);
        }, this);

        // Adds the store to the layers tree
        this.getLayerspanel().setConfig('store', this.buildGeoExtStore());
    },

   /**
     * Build a layers collection
     * @private
     * @return {Ext.util.MixedCollection} The layers collection
     */
    buildLayersCollection: function() {
        var mapCmp = this.getMappanel().child('mapcomponent');
        var curRes = mapCmp.getMap().getView().getResolution();

        // Creation of the layer group list
        var layerGrpsList = [];
        for (var i in this.treeStores['layerNodes']){
            var lyrNode = this.treeStores['layerNodes'][i];
            if (!lyrNode.get('leaf')) {
                olGrp = new ol.layer.Group({
                    name: lyrNode.get('text'),
                    text: lyrNode.get('text'),
                    grpId: lyrNode.get('nodeGroup'),
                    visible: !lyrNode.get('hidden'),
                    displayInLayerSwitcher: !lyrNode.get('hidden'),
                    expanded: lyrNode.get('expanded'),
                    checked: lyrNode.get('checked'),
                    disabled: lyrNode.get('disabled')
                });
                layerGrpsList.push(olGrp);
            }
        };

        // Creation of the layers list
        var layersList = [];
        for (var i in this.treeStores['layers']){
            var layer = this.treeStores['layers'][i];
            for (var j in this.treeStores['services']){
                var service = this.treeStores['services'][j];
                if (service.get('name') === layer.get('legendServiceName')) {
                    this.getLegendspanel().fireEvent('onReadyToBuildLegend', curRes, layer, service);
                };
                if (service.get('name') === layer.get('viewServiceName')) {

                    // Creates the layer
                    var olLayer = this.buildOlLayer(layer, service, curRes);

                    // Adds the layer to the layers list
                    if (layer.get('options').nodeGroup == -1) {
                        // Adds the layer to the list
                        layersList.push(olLayer);
                    } else {
                        // Adds the layer to its group
                        for (var k in layerGrpsList) {
                            if (layer.get('options').nodeGroup == layerGrpsList[k].get('grpId')) {
                                var lyrs = layerGrpsList[k].getLayers();
                                lyrs.push(olLayer);
                                layerGrpsList[k].setLayers(lyrs);
                                break;
                            }
                        }
                    }
                }
            }
        }
        // Add the groups to the list
        for (var k in layerGrpsList) {
            layersList.push(layerGrpsList[k]);
        }

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
            sourceWMSOpts['params'] = {
                'layers': layer.get('params').layers,
                'REQUEST': service.get('config').params.REQUEST,
                'VERSION': service.get('config').params.VERSION,
                'session_id': layer.get('params').session_id
            };
            sourceWMSOpts['urls'] = service.get('config').urls;
            sourceWMSOpts['crossOrigin'] = 'anonymous';
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
            sourceWMTSOpts['layer'] = layer.get('params').layers;
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
     * @param {OgamDesktop.model.map.Layer} layer The layer
     * @param {OgamDesktop.model.map.LayerService} service The service used per the layer
     * @param {number} curRes The map current resolution
     * @return {ol.layer.Tile} The OpenLayers layer
     */
    buildOlLayer: function(layer, service, curRes) {
        var olLayerOpts = {};
        olLayerOpts['session_id'] = layer.get('params').session_id;
        olLayerOpts['source'] = this.buildOlSource(layer, service);
        olLayerOpts['name'] = layer.get('name');
        olLayerOpts['text'] = layer.get('options').label;
        olLayerOpts['opacity'] = layer.get('options').opacity;
        olLayerOpts['printable'] = true;
        olLayerOpts['visible'] = !layer.get('params').isHidden;
        olLayerOpts['displayInLayerSwitcher'] = !layer.get('params').isHidden;
        olLayerOpts['checked'] = layer.get('params').isChecked;
        if (layer.get('options').resolutions) {
            var resolutions = layer.get('options').resolutions;
            olLayerOpts['minResolution'] = resolutions[resolutions.length - 1];
            olLayerOpts['maxResolution'] = resolutions[0];
        }
        olLayerOpts['disabled'] = layer.get('params').isDisabled;
        if (curRes < olLayerOpts['minResolution'] || curRes >= olLayerOpts['maxResolution']) {
            olLayerOpts['disabled'] = true;
        }
        olLayerOpts['activateType'] = layer.get('params').activateType.toLowerCase();

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