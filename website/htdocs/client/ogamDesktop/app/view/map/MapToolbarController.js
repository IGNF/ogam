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

//  /**
//   * Internationalization.
//   */
//  popupTitle : 'Feature information',
//  tabTip : 'The map with the request\'s results\'s location',
////  layerPanelTitle : "Layers",
////  layerPanelTabTip : "The layers's tree",
////  legendPanelTitle : "Legends",
////  legendPanelTabTip : "The layers's legends",
//  panZoomBarControlTitle : "Zoom",
//  navigationControlTitle : "Drag the map",
//  zoomToFeaturesControlTitle : "Zoom to the features",
//  zoomToResultControlTitle : "Zoom to the results",
//  drawPointControlTitle : "Draw a point",
//  drawLineControlTitle : "Draw a line",
//  drawFeatureControlTitle : "Draw a polygon",
//  modifyFeatureControlTitle : "Update the feature",
//  tbarDeleteFeatureButtonTooltip : "Delete the feature",
//  tbarValidateEditionButtonTooltip : "Validate the modification(s)",
//  tbarCancelEditionButtonTooltip : "Cancel the modification(s)",
//  tbarPreviousButtonTooltip : "Previous Position",
//  tbarNextButtonTooltip : "Next Position",
//  zoomBoxInControlTitle : "Zoom in",
//  zoomBoxOutControlTitle : "Zoom out",
//  zoomToMaxExtentControlTitle : "Zoom to max extend",
//  snappingControlTitle:'Snapping',
//  locationInfoControlTitle : "Get information about the result location",
//  LayerSelectorEmptyTextValue: "Select Layer",
//  selectFeatureControlTitle : "Select a feature from the selected layer",
//  featureInfoControlTitle : "Get information about the selected layer",
//  legalMentionsLinkText : "Legal Mentions",
//  addGeomCriteriaButtonText : "Select an area",
//  printMapButtonText : 'Print map',
//  
//  /**
//   * @cfg {Boolean} hideLayerSelector if true hide the layer
//   *      selector. The layer selector is required for the
//   *      following tools.
//   */
//  hideLayerSelector : false,
//  hideSnappingButton : false,
//  hideGetFeatureButton : false,
//  hideFeatureInfoButton : false,
////  hideGeomCriteriaToolbarButton : true,
//  /**
//   * @cfg {Boolean} hidePrintMapButton if true hide the Print
//   *      Map Button (defaults to false).
//   */
//  hidePrintMapButton : false,

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
                text : record.get('layerLabel'),
                itemId : record.get('serviceLayerName'),
                data : {
                    featureServiceUrl : record.get('featureServiceUrl')
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
        layerStr += '"name":"' + layer.get('name') + '",';
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
        var layersToPrint = this.retrieveLayersToPrint(this.map.getLayerGroup());
        console.log('layers to print array', layersToPrint);
        this.post(Ext.manifest.OgamDesktop.mapServiceUrl +'printmap', {
                center : center,
                zoom : zoom,
                layers : layersToPrint
        });
    }
});