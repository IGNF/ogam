/**
 * This class manages the snapping button view.
 */
Ext.define('OgamDesktop.view.map.toolbar.SnappingButtonController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.snappingbutton',

    init : function() {
        var mapCmp = this.getView().up('#map-panel').child('mapcomponent');
        this.map = mapCmp.getMap();
        this.mapCmpCtrl = mapCmp.getController();
        this.drawingLayerSnappingInteraction = new ol.interaction.Snap({
            source: this.mapCmpCtrl.getMapLayer('drawingLayer').getSource()
        });
        this.snappingLayerSnappingInteraction = null;
        this.riseSnappingInteractionListenerKey = null;
    },

    onSnappingButtonToggle : function (button, pressed, eOpts) {
        if (pressed) {
            this.map.addInteraction(this.drawingLayerSnappingInteraction);
            if(this.snappingLayerSnappingInteraction !== null){
                this.map.addInteraction(this.snappingLayerSnappingInteraction);
            } 
            this.updateRiseSnappingInteractionListener();
            this.mapCmpCtrl.getMapLayer('snappingLayer').setVisible(true);
        } else {
            this.map.removeInteraction(this.drawingLayerSnappingInteraction);
            if(this.snappingLayerSnappingInteraction !== null){
                this.map.removeInteraction(this.snappingLayerSnappingInteraction);
            }
            this.removeRiseSnappingInteractionListener();
            this.mapCmpCtrl.getMapLayer('snappingLayer').setVisible(false);
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
            source: this.mapCmpCtrl.getMapLayer('snappingLayer').getSource()
        });
    },

    updateAndAddSnappingInteraction : function(){
        this.map.removeInteraction(this.snappingLayerSnappingInteraction);
        this.updateSnappingInteraction();
        this.map.addInteraction(this.snappingLayerSnappingInteraction);
        this.updateRiseSnappingInteractionListener();
    },

    onSnappingButtonMenuItemCheckChange : function(item, checked, eOpts) {
        // Changes the checkbox behaviour to a radio button behaviour
        var menu = item.parentMenu;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(checked, true);

        if (checked) {
            // Update the data source
            var projection = this.map.getView().getProjection().getCode();
            this.snapSource = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return item.config.data.featureServiceUrl +
                        '&outputFormat=geojsonogr' +
                        '&srsname=' + projection +
                        '&typename=' + item.itemId +
                        '&bbox=' + extent.join(',') + ',' + projection;
                },
                crossOrigin: 'anonymous',
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                    maxZoom: 3
                }))
            });
            // Update the snapping layer and the snapping interaction
            this.mapCmpCtrl.getMapLayer('snappingLayer').setSource(this.snapSource);
            if (menu.ownerCmp.pressed) {
                this.updateAndAddSnappingInteraction();
            } else {
                this.updateSnappingInteraction();
                menu.ownerCmp.toggle(true);
            }
        } else {
            // Clear the snapping layer and remove the snapping interaction
            this.mapCmpCtrl.getMapLayer('snappingLayer').setSource(new ol.source.Vector({features: new ol.Collection()}));
            this.destroyAndRemoveSnappingInteraction();
            menu.ownerCmp.pressed && menu.ownerCmp.toggle(false);
        }
    }
});