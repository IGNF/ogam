/**
 * This class manages the selectwfsfeature button view.
 */
Ext.define('OgamDesktop.view.map.toolbar.SelectWFSFeatureButtonController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.selectwfsfeaturebutton',

    init : function() {
        var mapCmp = this.getView().up('#map-panel').child('mapcomponent');
        this.map = mapCmp.getMap();
        this.mapCmpCtrl = mapCmp.getController();
        this.selectWFSFeatureListenerKey = null;
        this.coordinateExtentDefaultBuffer = OgamDesktop.map.featureinfo_margin ? OgamDesktop.map.featureinfo_margin : 1000;
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
        var projection = this.map.getView().getProjection().getCode();
        this.selectWFSFeatureListenerKey = this.map.on('singleclick', function(evt) {
            var url = item.config.data.url +
                '&outputFormat=geojsonogr' +
                '&srsname=' + projection +
                '&typename=' + item.itemId +
                '&bbox=' + ol.extent.buffer(ol.extent.boundingExtent([evt.coordinate]), this.coordinateExtentDefaultBuffer).join(',') + ',' + projection;
            ol.featureloader.xhr(
                url,
                new ol.format.GeoJSON()
            ).call(this.mapCmpCtrl.getMapLayer('drawingLayer').getSource());
        },this);
    },

    onSelectWFSFeatureButtonMenuItemCheckChange : function(item, checked, eOpts) {
        // Changes the checkbox behaviour to a radio button behaviour
        var menu = item.parentMenu;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(checked, true);

        if (checked) {
            if (menu.ownerCmp.pressed) {
                this.updateAndAddSelectWFSFeatureListener(item);
            } else {
                menu.ownerCmp.toggle(true);
            }
        } else {
            this.removeSelectWFSFeatureListener();
            menu.ownerCmp.pressed && menu.ownerCmp.toggle(false);
        }
    }
});