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
        var layersPanel = this.getLayerspanel();
        var layersList = [];
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
        for (var i in this.treeStores['layers']){
            var layer = this.treeStores['layers'][i];
            var sourceWMSOpts = {};
            var sourceWMTSOpts = {};
            var olLayerOpts = {};
            for (var j in this.treeStores['services']){
                var service = this.treeStores['services'][j];
                if (service.get('name') === layer.get('legendServiceName')) {
                    this.getLegendspanel().fireEvent('onReadyToBuildLegend', curRes, layer, service);
                };
                if (service.get('name') === layer.get('viewServiceName')) {
                    var source;
                    if (service.get('config').params.SERVICE === 'WMS') {
                        sourceWMSOpts['params'] = {
                            'layers': layer.get('params').layers,
                            'REQUEST': service.get('config').params.REQUEST,
                            'VERSION': service.get('config').params.VERSION,
                            'session_id': layer.get('params').session_id
                        };
                        sourceWMSOpts['urls'] = service.get('config').urls;
                        source = new ol.source.TileWMS(sourceWMSOpts);
                    } else if (service.get('config').params.SERVICE === 'WMTS') {
                        //creation and merging of wmts parameters
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
                        sourceWMTSOpts['urls'] = service.get('config').urls;
                        sourceWMTSOpts['layer'] = layer.get('name');
                        sourceWMTSOpts['tileGrid'] = tileGrid;
                        sourceWMTSOpts['matrixSet'] = service.get('config').params.matrixSet;
                        sourceWMTSOpts['style'] = service.get('config').params.style;
                        olLayerOpts['session_id'] = layer.get('params').session_id;
                        source = new ol.source.WMTS(sourceWMTSOpts);
                    }
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
                    var olLayer = new ol.layer.Tile(olLayerOpts);
                    var activateType = layer.get('params').activateType.toLowerCase();
                    var mapCmpCtrl = mapCmp.getController();
                    if (Ext.isEmpty(mapCmpCtrl.layersActivation[activateType])) {
                        mapCmpCtrl.layersActivation[activateType] = [olLayer];
                    } else {
                        mapCmpCtrl.layersActivation[activateType].push(olLayer);
                    }
                    olLayer.on('change:visible', function(e) {
                        mapCmpCtrl.fireEvent('changelayervisibility', this, e.target.get(e.key));
                    });
                    if (layer.get('options').nodeGroup == -1){
                        layersList.push(olLayer);
                    } else {
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
        var map = mapPanel.child('mapcomponent').getMap();
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
        map.addLayer(treeLayersGroup);
        var treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: treeLayersGroup
        });
        function eachRecursive(item) {
            if (item.childNodes.length > 0){
                if (item.getOlLayer().get('expanded')) {
                    item.expand();
                    item.set("expanded", item.getOlLayer().get('expanded'));
                };
                for (var k in item.childNodes) {
                    eachRecursive(item.childNodes[k]);
                }
            } else {
                var cls = item.getOlLayer().get('disabled') ? 'dvp-tree-node-disabled' : '';
                item.set("cls", cls);
                item.set("checked", item.getOlLayer().get('checked'));
            }
        };
        treeLayerStore.each(eachRecursive);
        layersPanel.setConfig('store', treeLayerStore);
        Ext.apply(layersPanel.getView(), {
            onCheckChange: Ext.Function.createInterceptor(layersPanel.getView().onCheckChange,function(e) {
                if (e.record.getOlLayer().get('disabled')) {
                    return false;
                }
            })
        });
    }
});