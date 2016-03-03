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
    eventCounter : 0,
    treeStores : [],

    afterMapMainWinRendered : function() {
        this.eventCounter += 1;
        if (this.eventCounter === 2) {
            this.setupMapAndTreeLayers();
        }
    },

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
     * @return void
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
        var filterOnDisplayInLayerSwitcher = new Ext.util.Filter({
            filterFn : function(item) {
                return item.get('displayInLayerSwitcher');
            }
        });
        var treeLayersCollection = layersCollection.filter(filterOnDisplayInLayerSwitcher);
        var treeLayersGroup = new ol.layer.Group({
            layers: treeLayersCollection.getRange(),
            code: 'treeGrp'
        });
        mapCmp.getMap().addLayer(treeLayersGroup);

        // Adds the store to the layers tree
        this.getLayerspanel().setConfig('store', this.buildGeoExtStore(treeLayersGroup));
    },

   /**
     * Build a layers collection
     * @private
     * @return Ext.util.MixedCollection
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
                        // Adds the layer to its group and add the group to the list
                        for (var k in layerGrpsList) {
                            var lyrGrp =  layerGrpsList[k];
                            if (layer.get('options').nodeGroup == lyrGrp.get('grpId')) {
                                var lyrs = lyrGrp.getLayers();
                                lyrs.push(olLayer);
                                lyrGrp.setLayers(lyrs);
                                layersList.push(lyrGrp);
                                break;
                            }
                        }
                    }
                }
            }
        }

        var layersCollection = new Ext.util.MixedCollection();
        layersCollection.addAll(layersList);

        return layersCollection;
    },

   /**
     * Build a OpenLayers source
     * @private
     * @param {OgamDesktop.model.map.Layer}
     *            layer The layer
     * @param {OgamDesktop.model.map.LayerService}
     *            service The service used per the layer
     * @return ol.source...
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
            sourceWMTSOpts['layer'] = layer.get('name');
            sourceWMTSOpts['tileGrid'] = tileGrid;
            sourceWMTSOpts['matrixSet'] = service.get('config').params.matrixSet;
            sourceWMTSOpts['style'] = service.get('config').params.style;
            return new ol.source.WMTS(sourceWMTSOpts);
        default:
            console.error('buildSource: The "' + serviceType + '" service type is not supported.');
        }
    },

   /**
     * Build a OpenLayers layer
     * @private
     * @param {OgamDesktop.model.map.Layer}
     *            layer The layer
     * @param {OgamDesktop.model.map.LayerService}
     *            service The service used per the layer
     * @param {number}
     *            curRes The map current resolution
     * @return ol.layer.Tile
     */
    buildOlLayer: function(layer, service, curRes) {
        var olLayerOpts = {};
        olLayerOpts['session_id'] = layer.get('params').session_id;
        olLayerOpts['source'] = this.buildOlSource(layer, service);
        olLayerOpts['name'] = layer.get('options').label;
        olLayerOpts['opacity'] = layer.get('options').opacity;
        olLayerOpts['code'] = layer.get('name');
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
     * @param {ol.layer.Group}
     *            layerGroup The store layer group
     * @return GeoExt.data.store.LayersTree
     */
    buildGeoExtStore: function(layerGroup) {
        // Create the GeoExt tree store
        var treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: layerGroup
        });

        // Sets up the store records
        function eachRecursive(item) {
            if (item.childNodes.length > 0){
                // Node group
                if (item.getOlLayer().get('expanded')) {
                    item.expand();
                    item.set("expanded", true);
                };
                for (var k in item.childNodes) {
                    eachRecursive(item.childNodes[k]);
                }
            } else {
                // Node
                var cls = item.getOlLayer().get('disabled') ? 'dvp-tree-node-disabled' : '';
                item.set("cls", cls);
                item.set("checked", item.getOlLayer().get('checked'));
            }
        };
        treeLayerStore.each(eachRecursive);

        return treeLayerStore;
    }
});