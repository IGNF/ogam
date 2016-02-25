/**
 * This class manages the map panel toolbar view.
 */
Ext.define('OgamDesktop.view.map.MapToolbarController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.maptoolbar',

    config: {
        listen: {
            store:{
                '#vectorLayerStore': {
                    load: 'onVectorLayerStoreLoad'
                }
            }
        }
    },

    init : function() {
        var mapCmp = this.getView().up('panel').child('mapcomponent');
        this.map = mapCmp.getMap();
        this.mapCmpCtrl = mapCmp.getController();
        this.selectInteraction = new ol.interaction.Select({
            layers: [this.mapCmpCtrl.getMapLayer('drawingLayer')]
        });
        this.drawingLayerSnappingInteraction = new ol.interaction.Snap({
            source: this.mapCmpCtrl.getMapLayer('drawingLayer').getSource()
        });
        this.snappingLayerSnappingInteraction = null;
        this.riseSnappingInteractionListenerKey = null;
        this.selectWFSFeatureListenerKey = null;
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

    onVectorLayerStoreLoad : function(store, records, successful, eOpts) {
        var menuItems = [];
        store.each( function(record) {
            menuItems.push({
                text : record.get('label'),
                itemId : record.get('code'),
                data : {
                    url : record.get('url'),
                    url_wms : record.get('url_wms')
                }
            });
        });
        this.lookupReference('snappingButton').getMenu().add(menuItems);
        this.lookupReference('selectWFSFeatureButton').getMenu().add(menuItems);
        this.lookupReference('layerFeatureInfoButton').getMenu().add(menuItems);
    },

// ********************************************************************************************************* //
//                                                                                                           //
//          Edition buttons                                                                                  //
//                                                                                                           //
// ********************************************************************************************************* //

    onZoomToDrawingFeaturesButtonPress : function (button, e, eOpts) {
        var extent = this.mapCmpCtrl.getMapLayer('drawingLayer').getSource().getExtent();
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

    onSnappingButtonMenuItemPress : function(menu, item, e, eOpts) {

        // Changes the checkbox behaviour to a radio button behaviour
        var itemIsChecked = item.checked;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(itemIsChecked, true);

        if (itemIsChecked) {
            // Update the data source
            var projection = this.map.getView().getProjection().getCode();
            this.snapSource = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return item.config.data.url +
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
    },

    onModifyfeatureButtonToggle : function (button, pressed, eOpts) {
        pressed && this.onControlButtonPress(button, new ol.interaction.Modify({
            features: this.mapCmpCtrl.getMapLayer('drawingLayer').getSource().getFeaturesCollection(),
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
            features: this.mapCmpCtrl.getMapLayer('drawingLayer').getSource().getFeaturesCollection(),
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

    onSelectWFSFeatureButtonMenuItemPress : function(menu, item, e, eOpts) {

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
        var drawingLayerSource = this.mapCmpCtrl.getMapLayer('drawingLayer').getSource();
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


// ********************************************************************************************************* //
//                                                                                                           //
//          Consultation buttons                                                                             //
//                                                                                                           //
// ********************************************************************************************************* //

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

    onLayerFeatureInfoButtonMenuItemPress : function(menu, item, e, eOpts) {

        // Changes the checkbox behaviour to a radio button behaviour
        var itemIsChecked = item.checked;
        menu.items.each(function(item, index, len){
            item.setChecked(false, true);
        });
        item.setChecked(itemIsChecked, true);

        if (itemIsChecked) {
            if (menu.ownerCmp.pressed) {
                this.updateAndAddLayerFeatureInfoListener(item);
            } else {
                menu.ownerCmp.toggle(true);
            }
        } else {
            this.removeLayerFeatureInfoListener();
            menu.ownerCmp.pressed && menu.ownerCmp.toggle(false);
        }
    },

//   onLayerFeatureInfoButtonPress : function (button, e, eOpts) {
//       this.mapCmpCtrl.activateVectorLayerInfo();
//   },

//    fillVectorList : function(button, e) {
//        console.log('fill vector list ');
//        
//        var vectorLyrStore = Ext.create('Ext.data.Store',{
//            autoLoad: true,
//            proxy: {
//                type: 'ajax',
//                url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgetvectorlayers',
//                actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
//                reader: {
//                    type: 'json',
//                    rootProperty: 'layerNames'
//                }
//            },
//            fields : [ {
//                name : 'code',
//                mapping : 'code'
//            }, {
//                name : 'label',
//                mapping : 'label'
//            }, {
//                name : 'url',
//                mapping : 'url'
//            }, {
//                name : 'url_wms',
//                mapping : 'url_wms'
//            }]
//        });
//        var menu = new Ext.menu.Menu();
//        vectorLyrStore.on('load', function(me, vLyrs, success) {
//            console.log('success', success)
//            console.log('v lyr store', me);
//            console.log('vLyrs', vLyrs);
//            console.log('button vector layers', button);
//            if (success) {
//                var items = [];
//                for (var i in vLyrs) {
//                    vLyr = vLyrs[i];
//                    console.log('data label', vLyr.getData().label);
//                    item = new Ext.Component({
//                        text : vLyr.getData().label
//                    });
//                    console.log('item', item);
//                    console.log('item text', item.text);
//                    items.push(item);
//                }
//                menu.setConfig('items', items)
//                console.log('menu', menu);
//                button.setMenu(menu);
//                button.showMenu(e);
//            }
//        });
//    },

//    onSelectVectorLayer : function(combo, vLyr, eOpts) {
//        this.selectedVectorLayer = vLyr;
//    },

    getLocationInfo : function(e) {
        var lon = e.coordinate[0], lat=e.coordinate[1];
        var url = Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetlocationinfo?LON='+lon+'&LAT='+lat;
        if (OgamDesktop.map.featureinfo_maxfeatures !== 0) {
            url = url + "&MAXFEATURES=" + OgamDesktop.map.featureinfo_maxfeatures;
        }
        Ext.Ajax.request({
            url : url,
            success : function(rpse, options) {
                var result = Ext.decode(rpse.responseText);
                this.getView().up('panel').fireEvent('getLocationInfo', {'result': result});
            },
            failure : function(rpse, options) {
                Ext.Msg.alert('Erreur', 'Sorry, bad request...');
            },
            scope: this
        });
    },
    
    onResultFeatureInfoButtonPress : function(button, pressed, eOpts) {
        if (pressed) {
            this.map.on("click", this.getLocationInfo, this);
        } else {
            this.map.un("click", this.getLocationInfo, this);
        }
    },

    onZoomInButtonPress : function (button, pressed, eOpts) {
        dzInter = new ol.interaction.DragZoom({
            condition: ol.events.condition.always,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: [255, 255, 255, 0.4]
                })
            })
        });
        pressed && this.onControlButtonPress(button, dzInter);
    },

    onMapPanButtonPress : function (button, pressed, eOpts) {
        this.map.getInteractions().forEach(function(interaction){
          if (interaction instanceof ol.interaction.DragPan) {
              interaction.setActive(true);
          }
       });
    },

    onZoomToResultFeaturesButtonPress : function (button, e, eOpts) {
        this.mapCmpCtrl.zoomToResultFeatures();
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
    },

    /**
     * Create and submit a form
     * 
     * @param {String}
     *            url The form url
     * @param {object}
     *            params The form params
     */
    post: function(url, params) {
        var temp = document.createElement("form"), x;
        temp.action = url;
        temp.method = "POST";
        temp.style.display = "none";
        for (x in params) {
            var opt = document.createElement("textarea");
            opt.name = x;
            opt.value = params[x];
            temp.appendChild(opt);
        }
        document.body.appendChild(temp);
        temp.submit();
        return temp;
    }, 

    olLayerToString : function(layer){
        layerStr = '{';
        layerStr += '"name":"' + layer.get('code') + '",';
        layerStr += '"opacity":' + layer.opacity;
        if (layer.tileSize) {
            tileSizeArray = [layer.tileSize.h, layer.tileSize.w];
            layerStr += ', "tileSize": [' + tileSizeArray.toString() + ']';
        };
        layerStr += '}';
        return layerStr;
    },
    
    retrieveLayersToPrint : function(layerGrp) {
        var layersToPrint = [];
        layerGrp.getLayers().forEach(function(lyr) {
            if (lyr.isLayerGroup) {
                for (var i in this.retrieveLayersToPrint(lyr)) {
                    layersToPrint.push(this.retrieveLayersToPrint(lyr)[i]);
                };
            } else {
                
                if (lyr.getVisible() && lyr.get('printable')) {
                    layersToPrint.push(this.olLayerToString(lyr));
                }
            }  
        }, this);
        return layersToPrint;
    },
    
    onPrintMapButtonPress : function(button, pressed, eOpts) {
        // Get the BBOX
        var center = this.map.getView().getCenter(), zoom = this.map.getView().getZoom(), i;
        // Get the layers
        var layersToPrint = this.retrieveLayersToPrint(this.mapCmpCtrl.getMapLayer('treeGrp'));
        console.log('layers to print array', layersToPrint);
        this.post(Ext.manifest.OgamDesktop.mapServiceUrl +'printmap', {
                center : center,
                zoom : zoom,
                layers : layersToPrint
        });
    }
});