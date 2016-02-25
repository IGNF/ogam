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