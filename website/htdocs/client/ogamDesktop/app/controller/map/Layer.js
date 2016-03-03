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
                mapaddonspanel: 'map-addons-panel',
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
            this.buildLayersTree();
        }
    },
    
    afterLayersPanelStoresLoaded : function(treeStores) {
        this.treeStores = treeStores;
        this.eventCounter += 1;
        if (this.eventCounter === 2) {
            this.buildLayersTree();
        }
    },
    
    buildLayersTree : function() {
        var mapPanel = this.getMappanel();
        var mapCmp = mapPanel.child('mapcomponent');
        var curRes = mapCmp.getMap().getView().getResolution();
        // Creations of the tree node group
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
        // Creations of the layers list
        var layersList = [];
        for (var i in this.treeStores['layers']){
            var layer = this.treeStores['layers'][i];
            for (var j in this.treeStores['services']){
                var service = this.treeStores['services'][j];
                if (service.get('name') === layer.get('legendServiceName')) {
                    this.getLegendspanel().fireEvent('onReadyToBuildLegend', curRes, layer, service);
                };
                if (service.get('name') === layer.get('viewServiceName')) {

                    // Sets the layer source
                    var source;
                    if (service.get('config').params.SERVICE === 'WMS') {
                        // Sets the WMS layer source
                        var sourceWMSOpts = {};
                        sourceWMSOpts['params'] = {
                            'layers': layer.get('params').layers,
                            'REQUEST': service.get('config').params.REQUEST,
                            'VERSION': service.get('config').params.VERSION,
                            'session_id': layer.get('params').session_id
                        };
                        sourceWMSOpts['urls'] = service.get('config').urls;
                        source = new ol.source.TileWMS(sourceWMSOpts);
                    } else if (service.get('config').params.SERVICE === 'WMTS') {
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
                        source = new ol.source.WMTS(sourceWMTSOpts);
                    }

                    // Sets the layer options
                    var olLayerOpts = {};
                    olLayerOpts['session_id'] = layer.get('params').session_id;
                    olLayerOpts['source'] = source;
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

                    // Creates the layer
                    var olLayer = new ol.layer.Tile(olLayerOpts);

                    // Adds the layer to layersActivation
                    var activateType = layer.get('params').activateType.toLowerCase();
                    var mapCmpCtrl = mapCmp.getController();
                    if (Ext.isEmpty(mapCmpCtrl.layersActivation[activateType])) {
                        mapCmpCtrl.layersActivation[activateType] = [olLayer];
                    } else {
                        mapCmpCtrl.layersActivation[activateType].push(olLayer);
                    }

                    // Adds the layer to the layers list
                    if (layer.get('options').nodeGroup == -1){
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
        // Create a unique ol.layer.Group for the tree's layer
        var layersCollection = new Ext.util.MixedCollection();
        layersCollection.addAll(layersList);
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

        // Create the GeoExt tree store
        var treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: treeLayersGroup
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

        // Adds the store to the layers panel
        this.getLayerspanel().setConfig('store', treeLayerStore);
    }
});