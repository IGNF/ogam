/**
 * This class manages the map panel toolbar view.
 */
Ext.define('OgamDesktop.view.map.MapToolbarController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.maptoolbar',

    init : function() {
        this.map = this.getView().up('map-panel').child('mapcomponent').getMap();
        this.selectInteraction = new ol.interaction.Select({
            layers: [this.getMapLayer('drawingLayer')]
        });
        this.drawingLayerSnappingInteraction = new ol.interaction.Snap({
            source: this.getMapLayer('drawingLayer').getSource()
        });
        this.snappingLayerSnappingInteraction = null;
        this.riseSnappingInteractionListenerKey = null;
        this.selectWFSFeatureListenerKey = null;
    },

    getMapLayer : function (layerCode) {
        var me = {"layerCode":layerCode};
        this.map.getLayers().forEach(
            function(el, index, c_array){
                if (el.get('code') === this.layerCode) {
                    this.layer = el;
                }
            },
            me
        );
        return me.layer;
    },

    onZoomToDrawingFeaturesButtonPress : function (button, e, eOpts) {
        var extent = this.getMapLayer('drawingLayer').getSource().getExtent();
        if (ol.extent.isEmpty(extent)) {
            Ext.Msg.alert('Zoom to drawing features :', 'The drawing layer contains no feature on which to zoom.');
        } else {
            this.map.getView().fit(
                extent, 
                this.map.getSize()
            );
        }
    },

    onControlButtonPress : function (button, interaction) {
        this.map.addInteraction(interaction);
        button.on({
            toggle: {
                fn: this.map.removeInteraction.bind(this.map, interaction),
                scope: this,
                single: true
            }
        });
    },

    onSnappingButtonRender :  function (button, eOpts) {
        this.onSelectWFSFeatureButtonRender(button, eOpts);
    },

    onSnappingButtonToggle : function (button, pressed, eOpts) {
        if (pressed) {
            this.map.addInteraction(this.drawingLayerSnappingInteraction);
            if(this.snappingLayerSnappingInteraction !== null){
                this.map.addInteraction(this.snappingLayerSnappingInteraction);
            } 
            this.updateRiseSnappingInteractionListener();
            this.getMapLayer('snappingLayer').setVisible(true);
        } else {
            this.map.removeInteraction(this.drawingLayerSnappingInteraction);
            if(this.snappingLayerSnappingInteraction !== null){
                this.map.removeInteraction(this.snappingLayerSnappingInteraction);
            }
            this.removeRiseSnappingInteractionListener();
            this.getMapLayer('snappingLayer').setVisible(false);
        }
    },

    removeRiseSnappingInteractionListener: function () {
        ol.Observable.unByKey(this.riseSnappingInteractionListenerKey);
        this.riseSnappingInteractionListenerKey = null;
    },

    updateRiseSnappingInteractionListener: function () {
            // The snap interaction must be added last, as it needs to be the first to handle the pointermove event.
            if (this.riseSnappingInteractionListenerKey !== null){
                this.removeRiseSnappingInteractionListener();
            }
            this.riseSnappingInteractionListenerKey = this.map.getInteractions().on("add", function (collectionEvent) {
                if (!(collectionEvent.element instanceof ol.interaction.Snap)) { // To avoid an infinite loop
                    this.map.removeInteraction(this.drawingLayerSnappingInteraction);
                    this.map.removeInteraction(this.snappingLayerSnappingInteraction);
                    this.map.addInteraction(this.drawingLayerSnappingInteraction);
                    if (this.snappingLayerSnappingInteraction !== null) {
                        this.map.addInteraction(this.snappingLayerSnappingInteraction);
                    }
                }
            }, this);
    },

    destroyAndRemoveSnappingInteraction : function(){
        this.map.removeInteraction(this.snappingLayerSnappingInteraction);
        this.snappingLayerSnappingInteraction = null;
        this.updateRiseSnappingInteractionListener();
    },

    updateSnappingInteraction : function(){
        this.snappingLayerSnappingInteraction = new ol.interaction.Snap({
            source: this.getMapLayer('snappingLayer').getSource()
        });
    },

    updateAndAddSnappingInteraction : function(){
        this.map.removeInteraction(this.snappingLayerSnappingInteraction);
        this.updateSnappingInteraction();
        this.map.addInteraction(this.snappingLayerSnappingInteraction);
        this.updateRiseSnappingInteractionListener();
    },

    onSnappingButtonMenuItemPress : function(menu, item, e, eOpts) {

        // Changes the checkbox behaviour to a radio button behaviour
        var itemIsChecked = item.checked;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(itemIsChecked, true);

        if (itemIsChecked) {
            // Update the data source
            this.snapSource = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return item.config.data.url +
                        '&outputFormat=geojsonogr' +
                        '&srsname=EPSG:3857' +
                        '&typename=' + item.itemId +
                        '&bbox=' + extent.join(',') + ',EPSG:3857';
                },
                crossOrigin: 'anonymous',
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 3
                }))
            });
            // Update the snapping layer and the snapping interaction
            this.getMapLayer('snappingLayer').setSource(this.snapSource);
            if (menu.ownerCmp.pressed) {
                this.updateAndAddSnappingInteraction();
            } else {
                this.updateSnappingInteraction();
                menu.ownerCmp.toggle(true);
            }
        } else {
            // Clear the snapping layer and remove the snapping interaction
            this.getMapLayer('snappingLayer').setSource(new ol.source.Vector({features: new ol.Collection()}));
            this.destroyAndRemoveSnappingInteraction();
            menu.ownerCmp.pressed && menu.ownerCmp.toggle(false);
        }
    },

    onModifyfeatureButtonToggle : function (button, pressed, eOpts) {
        pressed && this.onControlButtonPress(button, new ol.interaction.Modify({
            features: this.getMapLayer('drawingLayer').getSource().getFeaturesCollection(),
            deleteCondition: function(event) {
                return ol.events.condition.shiftKeyOnly(event) &&
                    ol.events.condition.singleClick(event);
            }
        }));
    },

    onSelectButtonToggle : function (button, pressed, eOpts) {
        // TODO : http://openlayers.org/en/v3.13.0/examples/box-selection.html
        pressed && this.onControlButtonPress(button, this.selectInteraction);
    },

    onDrawButtonToggle : function (button, pressed, drawType) {
        pressed && this.onControlButtonPress(button, new ol.interaction.Draw({
            features: this.getMapLayer('drawingLayer').getSource().getFeaturesCollection(),
            type: drawType
        }));
    },

    onDrawPointButtonToggle : function (button, pressed, eOpts) {
        this.onDrawButtonToggle(button, pressed, 'Point');
    },

    onDrawLineButtonToggle : function (button, pressed, eOpts) {
        this.onDrawButtonToggle(button, pressed, 'LineString');
    },

    onDrawPolygonButtonToggle : function (button, pressed, eOpts) {
        this.onDrawButtonToggle(button, pressed, 'Polygon');
    },

    onSelectWFSFeatureButtonRender : function (button, eOpts) {
        // TODO : Create a OgamDesktop.store.map.VectorLayer or use the OgamDesktop.store.map.Layer
        Ext.create('Ext.data.Store', {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgetvectorlayers',
                actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
                reader: {
                    type: 'json',
                    rootProperty: 'layerNames'
                }
            },
            fields : [{
                name : 'code',
                mapping : 'code'
            }, {
                name : 'label',
                mapping : 'label'
            }, {
                name : 'url',
                mapping : 'url'
            }, {
                name : 'url_wms',
                mapping : 'url_wms'
            }],
            listeners: {
                'load': function(store, records, successful, eOpts){
                    var menu = button.getMenu();
                    store.each(function(record){
                        menu.add({
                            text : record.get('label'),
                            itemId : record.get('code'),
                            data : {
                                url : record.get('url'),
                                url_wms : record.get('url_wms')
                            }
                        });
                    },this);
                }
            }
        });
    },

    onSelectWFSFeatureButtonToggle : function (button, pressed, eOpts) {
        if (pressed) {
            var checkedItem = null;
            button.getMenu().items.each(function(item, index, len) {
                item.checked && (checkedItem = item);
            });
            if (checkedItem !== null) {
                this.updateAndAddSelectWFSFeatureListener(checkedItem);
            } else {
                Ext.Msg.alert('Select feature(s) :', 'Please select a layer.');
                button.toggle(false);
            }
        } else {
            this.removeSelectWFSFeatureListener();
        }
    },

    removeSelectWFSFeatureListener: function () {
        ol.Observable.unByKey(this.selectWFSFeatureListenerKey);
        this.selectWFSFeatureListenerKey = null;
    },

    updateAndAddSelectWFSFeatureListener: function(item) {
        this.removeSelectWFSFeatureListener();
        this.selectWFSFeatureListenerKey = this.map.on('singleclick', function(evt) {
            var url = item.config.data.url +
                '&outputFormat=geojsonogr' +
                '&srsname=EPSG:3857' +
                '&typename=' + item.itemId +
                '&bbox=' + ol.extent.boundingExtent([evt.coordinate]).join(',') + ',EPSG:3857';
            ol.featureloader.xhr(
                url,
                new ol.format.GeoJSON()
            ).call(this.getMapLayer('drawingLayer').getSource());
        },this);
    },

    onSelectWFSFeatureButtoMenuItemPress : function(menu, item, e, eOpts) {

        // Changes the checkbox behaviour to a radio button behaviour
        var itemIsChecked = item.checked;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(itemIsChecked, true);

        if (itemIsChecked) {
            if (menu.ownerCmp.pressed) {
                this.updateAndAddSelectWFSFeatureListener(item);
            } else {
                menu.ownerCmp.toggle(true);
            }
        } else {
            this.removeSelectWFSFeatureListener();
            menu.ownerCmp.pressed && menu.ownerCmp.toggle(false);
        }
    },

    onDeleteFeatureButtonPress : function (button, e, eOpts) {
        var drawingLayerSource = this.getMapLayer('drawingLayer').getSource();
        var featuresCollection = this.selectInteraction.getFeatures();
        featuresCollection.forEach(
            function(el, index, c_array){
                // Remove the feature of the drawing layer
                drawingLayerSource.removeFeature(el);
            }
        );
        // Remove all the features of the selection layer
        featuresCollection.clear();
    },

    onValidateEditionButtonPress : function (button, e, eOpts) {
        this.getView().fireEvent('validateFeatureEdition');
    },

    onCancelEditionButtonPress : function (button, e, eOpts) {
        this.getView().fireEvent('cancelFeatureEdition');
    },

    // TODO: @PEG : Ajouter l'attribut code: 'results' à la couche des résultats,
    onZoomToResultFeaturesButtonPress : function (button, e, eOpts) {
        var extent = this.getMapLayer('results').getSource().getExtent();
        if (ol.extent.isEmpty(extent)) {
            Ext.Msg.alert('Zoom to result features :', 'The results layer contains no feature on which to zoom.');
        } else {
            this.map.getView().fit(
                extent, 
                this.map.getSize()
            );
        }
    },

    onZoomToMaxExtentButtonPress : function (button, e, eOpts) {
        this.map.getView().fit(
            [
                OgamDesktop.map.x_min,
                OgamDesktop.map.y_min,
                OgamDesktop.map.x_max,
                OgamDesktop.map.y_max
            ], 
            this.map.getSize()
        );
    }
});