/**
 * This class manages the layerfeatureinfo button view.
 */
Ext.define('OgamDesktop.view.map.toolbar.LayerFeatureInfoButtonController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.layerfeatureinfobutton',

    init : function() {
        var mapCmp = this.getView().up('#map-panel').child('mapcomponent');
        this.map = mapCmp.getMap();
        this.layerFeatureInfoListenerKey = null;
        this.popup = Ext.create('GeoExt.component.Popup', {
            map: this.map,
            width: 160,
            tpl: [
                '<p><tpl for="features">',
                    '<u>Feature {#}:</u><br />',
                    '<tpl foreach=".">',
                        '{$}: {.}<br />',
                    '</tpl>',
                '<br /></tpl></p>'
            ]
        });
        this.coordinateExtentDefaultBuffer = OgamDesktop.map.featureinfo_margin ? OgamDesktop.map.featureinfo_margin : 1000;
    },

    onLayerFeatureInfoButtonToggle : function (button, pressed, eOpts) {
        if (pressed) {
            var checkedItem = null;
            button.getMenu().items.each(function(item, index, len) {
                item.checked && (checkedItem = item);
            });
            if (checkedItem !== null) {
                this.updateAndAddLayerFeatureInfoListener(checkedItem);
            } else {
                Ext.Msg.alert('Select feature(s) :', 'Please select a layer.');
                button.toggle(false);
            }
        } else {
            this.removeLayerFeatureInfoListener();
        }
    },

    removeLayerFeatureInfoListener: function () {
        ol.Observable.unByKey(this.layerFeatureInfoListenerKey);
        this.layerFeatureInfoListenerKey = null;
        this.popup.hide();
    },

    updateAndAddLayerFeatureInfoListener: function(item) {
        this.removeLayerFeatureInfoListener();
        var projection = this.map.getView().getProjection().getCode();
        this.layerFeatureInfoListenerKey = this.map.on('singleclick', function(evt) {
            var url = item.config.data.url +
                '&outputFormat=geojsonogr' +
                '&srsname=' + projection +
                '&typename=' + item.itemId +
                '&bbox=' + ol.extent.buffer(ol.extent.boundingExtent([evt.coordinate]), this.coordinateExtentDefaultBuffer).join(',') + ',' + projection;
            ol.featureloader.loadFeaturesXhr(
                url,
                new ol.format.GeoJSON(),
                function(features, dataProjection) {
                    // Set up the data object
                    var data = {features:[]};
                    features.forEach(function(feature){
                        var properties = feature.getProperties();
                        delete properties.geometry;
                        data.features.push(properties);
                    });
                    // Set content and position popup
                    if (data.features.length !== 0) {
                        this.popup.setData(data);
                        this.popup.position(evt.coordinate);
                        this.popup.show();
                    }
                },
                ol.nullFunction /* FIXME handle error */
            ).call(this);
        },this);
    },

    onLayerFeatureInfoButtonMenuItemCheckChange : function(item, checked, eOpts) {
        // Changes the checkbox behaviour to a radio button behaviour
        var menu = item.parentMenu;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(checked, true);

        if (checked) {
            if (menu.ownerCmp.pressed) {
                this.updateAndAddLayerFeatureInfoListener(item);
            } else {
                menu.ownerCmp.toggle(true);
            }
        } else {
            this.removeLayerFeatureInfoListener();
            menu.ownerCmp.pressed && menu.ownerCmp.toggle(false);
        }
    }
});