/**
 * This class manages the map panel view.
 */
Ext.define('OgamDesktop.view.edition.MapPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mappanel',

    init : function() {
        this.map = this.lookupReference('mapCmp').getMap();
        this.selectInteraction = new ol.interaction.Select({
            layers: [this.getMapLayer('drawingLayer')]
        });
        this.drawingLayerSnappingInteraction = new ol.interaction.Snap({
            source: this.getMapLayer('drawingLayer').getSource()
        });
        this.snappingLayerSnappingInteraction = null;
        this.riseSnappingInteractionListenerKey = null;
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
        layerStr += '"name":"' + layer.name + '",';
        layerStr += '"opacity":' + layer.opacity;
        if (layer.tileSize) {
            tileSizeArray = [layer.tileSize.h, layer.tileSize.w];
            layerStr += ', "tileSize": [' + tileSizeArray.toString() + ']';
        };
        layerStr += '}';
        return layerStr;
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

        }
    },

    onSelectWFSFeatureButtoMenuItemPress : function(menu, item, e, eOpts) {

    },
/*
    onLoadVectorLayerButtonPress : function (button, e, eOpts) {
        button.setMenu({
            xtype:'menu',
            defaults: {
                iconCls: 'o-map-tools-map-addicon'
            },
            items: [{
                text: 'plain item 1'
            },{
                text: 'plain item 2'
            },{
                text: 'plain item 3'
            }]
        })
    },*/

//          this.layerSelector = Ext.create('Ext.form.field.ComboBox',{
//              xtype: 'layerselector',
//              editable: false,
//              emptyText: this.LayerSelectorEmptyTextValue,
//              triggerAction : 'all',
//              store : Ext.create('Ext.data.Store',{
//                  autoLoad: true,
//                  proxy: {
//                      type: 'ajax',
//                      url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgetvectorlayers',
//                      actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
//                      reader: {
//                          type: 'json',
//                          rootProperty: 'layerNames'
//                      }
//                  },
//                  fields : [ {
//                      name : 'code',
//                      mapping : 'code'
//                  }, {
//                      name : 'label',
//                      mapping : 'label'
//                  }, {
//                      name : 'url',
//                      mapping : 'url'
//                  }, {
//                      name : 'url_wms',
//                      mapping : 'url_wms'
//                  }]
//              }),
//              valueField : 'code',
//              displayField : 'label'
//          });

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
    
    zoomToResultFeatures : function () {
        // Get wkt geometry corresponding to the result BBOX
        var resultsBBox = this.getView().resultsBBox ? this.getView().resultsBBox : 'POLYGON EMPTY';
        var wktGeom = this.getView().wktFormat.readGeometry(resultsBBox);
        var extent = wktGeom.getExtent();
        if (ol.extent.isEmpty(extent)) {
            Ext.Msg.alert('Zoom to result features :', 'The results layer contains no feature on which to zoom.');
        } else {
            this.map.getView().fit(
                extent, 
                this.map.getSize()
            );
        }
    },

	/**
	 * Zoom to the passed feature on the map
	 * 
	 * @param {String}
	 *            id The plot id
	 * @param {String}
	 *            wkt The wkt feature
	 */
	zoomToFeature : function(id, wkt) {
            var feature = this.getView().wktFormat.readFeature(wkt);
            var source = new ol.source.Vector();
            var vectorLyr = new ol.layer.Vector({
               source : source
            });

            var start = new Date().getTime();
            var listenerKey;
            var duration = 1500; // Animation duration
            var map = this.map;
                    map.addLayer(vectorLyr);
            function animate(event) {
                var vectorContext = event.vectorContext;
                var frameState = event.frameState;
                var flashGeom = feature.getGeometry().clone();
                var elapsed = frameState.time - start;
                var elapsedRatio = elapsed / duration;
                // radius will be 5 at start and 30 at end.
                var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
                var opacity = ol.easing.easeOut(1 - elapsedRatio);
      //          console.log(flashGeom);
                var flashStyle = new ol.style.Circle({
                    radius: radius,
                    snapToPixel: false,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 1
                    })
                });
                var highlightStyle = new ol.style.Style({
                    geometry: flashGeom,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 0, 0, ' + opacity + ')'
                    }),
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                  color: 'rgba(255, 0, 0, ' + opacity + ')'
                                })
                            })
                });
                var geomType = feature.getGeometry().getType();
                if (geomType === 'Polygon'){
                    vectorContext.setImageStyle(flashStyle);
                    vectorContext.drawPointGeometry(flashGeom, null);
                    if (elapsed > duration) {
                        ol.Observable.unByKey(listenerKey);
                        return;
                    }
                    // tell OL3 to continue postcompose animation
                    map.render();
//                } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
                    // @TODO 
                } else if (geomType === 'Point' || geomType === 'MultiPolygon') {
                    vectorLyr.setStyle(highlightStyle);
                    if (source.getFeatures().length == 0) {
                        source.addFeature(feature);
                    }
                    if (elapsed > duration) {
                        ol.Observable.unByKey(listenerKey);
                        return;
                    }
                    map.render();
                }
            }
            listenerKey = map.on('postcompose', animate);
            map.getView().fit(feature.getGeometry().getExtent(), map.getSize());
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

    onPrintMapButtonPress : function(button, pressed, eOpts) {
        // Get the BBOX
        var center = this.map.getView().getCenter(), zoom = this.map.getView().getZoom(), i;
        // Get the layers
        var activatedLayers = [];
        this.map.getLayers().forEach(function(lyr){
            if (lyr.getVisible()){
                activatedLayers.push(lyr);
            }
        });
        var layersToPrint = [];
        for (i in activatedLayers) {
                lyr = activatedLayers[i];
                if (lyr.get('printable') !== false &&
                    lyr.getVisible() === true) {
                    layersToPrint.push(this.olLayerToString(lyr));
                }
        }
        console.log('layers to print array', layersToPrint);
        this.post(Ext.manifest.OgamDesktop.mapServiceUrl +'printmap', {
                center : center,
                zoom : zoom,
                layers : layersToPrint
        });
    },
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
                this.getView().fireEvent('getLocationInfo', {'result': result});
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
//    
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

    onSelectVectorLayer : function(combo, vLyr, eOpts) {
        this.selectedVectorLayer = vLyr;
    },
    
    activateVectorLayerInfo : function(button, e) {
        if (this.selectedVectorLayer && this.selectedVectorLayer !== null) {
            var layerName = this.selectedVectorLayer.getData().code;
            var url = this.selectedVectorLayer.getData().url;
        }
//        if (value[0].data.code !== null) {
//            var layerName = value[0].data.code;
//            var url = value[0].data.url;
//            var popupTitle = this.popupTitle;
//            // Change the WFS layer typename
//            this.mapPanel.wfsLayer.protocol.featureType = layerName;
//            this.mapPanel.wfsLayer.protocol.options.featureType = layerName;
//            this.mapPanel.wfsLayer.protocol.format.featureType = layerName;
//            this.mapPanel.wfsLayer.protocol.params.typename = layerName;
//            this.mapPanel.wfsLayer.protocol.options.url = url;
//
//            // Remove all current features
//            this.mapPanel.wfsLayer.destroyFeatures();
//
//            // Copy the visibility range from the original
//            // layer
//            originalLayers = this.mapPanel.map.getLayersByName(layerName);
//            if (originalLayers != null) {
//                    originalLayer = originalLayers[0];
//                this.mapPanel.wfsLayer.maxResolution = originalLayer.maxResolution;
//                this.mapPanel.wfsLayer.maxScale = originalLayer.maxScale;
//                this.mapPanel.wfsLayer.minResolution = originalLayer.minResolution;
//                this.mapPanel.wfsLayer.minScale = originalLayer.minScale;
//                this.mapPanel.wfsLayer.alwaysInRange = false;
//                this.mapPanel.wfsLayer.calculateInRange();
//            }
//
//            // Make it visible
//            this.mapPanel.wfsLayer.setVisibility(true);
//
//            // Force a refresh (rebuild the WFS URL)
//            this.mapPanel.wfsLayer.moveTo(null, true, false);
//
//            // Set the layer name in other tools
//            if (this.mapPanel.getFeatureControl !== null) {
//                this.mapPanel.getFeatureControl.layerName = layerName;
//            }
//
//            this.mapPanel.wfsLayer.refresh();
//            this.mapPanel.wfsLayer.strategies[0].update({force:true});
//
//        } else {
//            // Hide the layer
//            this.mapPanel.wfsLayer.setVisibility(false);
//        }
//
//        // Set the layer name in feature info tool
//        if (this.mapPanel.featureInfoControl !== null) {
//            this.mapPanel.featureInfoControl.layerName = layerName;
//        }
    }
});


//initToolbar : function() {
//      // Creation of the toolbar
//      tbar = Ext.create('Ext.toolbar.Toolbar');
//      // Link the toolbar to the map
//      tbar.map = this.map;
//      
//      drawingBtnGroup = Ext.create('Ext.container.ButtonGroup', {
//          hidden: true,
//          action: 'drawing',
//          defaults: {
//              iconAlign:'top'
//          }
//      });
//      // Zoom to features button
//      var zoomToFeatureControl = new OpenLayers.Control.ZoomToFeatures({
//          map : this.map,
//          layer: this.vectorLayer,
//          maxZoomLevel : 9
//      });
//      var zoomToFeatureAction = Ext.create('GeoExt.Action',{
//          control : zoomToFeatureControl,
//          iconCls : 'o-map-tools-map-zoomstations',
//          action: 'zoomstations',
//          tooltip : this.zoomToFeaturesControlTitle
//      });
//      var zoomToFeatureButton = new Ext.button.Button(zoomToFeatureAction);
//      drawingBtnGroup.add(zoomToFeatureButton);
//
//              // Use of tbtext because tbseparator doesn't work...
//      drawingBtnGroup.add({xtype:'tbtext', html: '|', margin:'3 -3 0 -2', style:'color:#aaa'});
//
//      // Draw point button
//          var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);
//
//              var drawPointAction = Ext.create('GeoExt.Action',{
//                      control : drawPointControl,
//                      map : this.map,
//                      tooltip : this.drawPointControlTitle,
//                      toggleGroup : "editing",
//                      group : "drawControl",
//                      checked : false,
//                      iconCls : 'o-map-tools-map-drawpoint',
//                      action : 'drawpoint'
//              });
//              var drawPointButton = new Ext.button.Button(drawPointAction)
//              drawingBtnGroup.add(drawPointButton);
//
//      // Draw line button
//      var drawLineControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path);
//
//      var drawLineAction = Ext.create('GeoExt.Action',{
//          control : drawLineControl,
//          map : this.map,
//          tooltip : this.drawLineControlTitle,
//          toggleGroup : "editing",
//          group : "drawControl",
//          checked : false,
//          iconCls : 'o-map-tools-map-drawline',
//          action : 'drawline'
//      });
//      var drawLineButton = new Ext.button.Button(drawLineAction);
//      drawingBtnGroup.add(drawLineButton);
//
//      // Draw polygon button.
//      var drawPolygonControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Polygon, {
//          ref: this
//      });
//
//      var drawPolygonAction = Ext.create('GeoExt.Action',{
//          control : drawPolygonControl,
//          map : this.map,
//          tooltip : this.drawFeatureControlTitle,
//          toggleGroup : "drawControl",
//          toggleGroup : "editing",
//          checked : false,
//          iconCls : 'o-map-tools-map-drawpolygon',
//          action : 'drawpolygon'
//      });
//      var drawPolygonButton = new Ext.button.Button(drawPolygonAction);
//      drawingBtnGroup.add(drawPolygonButton);
//
//      // Modify feature.
//      var modifyFeatureControl = new OpenLayers.Control.ModifyFeature(this.vectorLayer, {
//          mode : OpenLayers.Control.ModifyFeature.RESHAPE
//      });
//
//      var modifyFeatureAction = Ext.create('GeoExt.Action',{
//          control : modifyFeatureControl,
//          map : this.map,
//          tooltip : this.modifyFeatureControlTitle,
//          toggleGroup : "editing",
//          group : "drawControl",
//          checked : false,
//          iconCls : 'o-map-tools-map-modifyfeature',
//          action : 'modifyfeature'
//      });
//      var modifyFeatureButton = new Ext.button.Button(modifyFeatureAction);
//      drawingBtnGroup.add(modifyFeatureButton);
//
//      // Delete feature.
//      var deleteFeatureControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
//          displayClass : 'olControlModifyFeature',
//          onSelect : function(feature) {
//              this.vectorLayer.destroyFeatures([ feature ]);
//          },
//          scope : this,
//          type : OpenLayers.Control.TYPE_TOOL
//      });
//
//      var deleteFeatureAction = Ext.create('GeoExt.Action',{
//          control : deleteFeatureControl,
//          map : this.map,
//          tooltip : this.tbarDeleteFeatureButtonTooltip,
//          toggleGroup : "editing",
//          group : "drawControl",
//          checked : false,
//          iconCls : 'o-map-tools-map-deletefeature',
//          action : 'deletefeature'
//      });
//      var deleteFeatureButton = new Ext.button.Button(deleteFeatureAction);
//      drawingBtnGroup.add(deleteFeatureButton);
//
//              // Use of tbtext because tbseparator doesn't work...
//      drawingBtnGroup.add({
//          group : "drawValidation",
//          xtype:'tbtext',
//          html: '|',
//          margin:'3 -3 0 -2',
//          style:'color:#aaa'
//      });
//
//      // Validate edition
//      drawingBtnGroup.add({
//          group : "drawValidation",
//          iconCls : 'o-map-tools-map-validate-edition',
//          tooltip : this.tbarValidateEditionButtonTooltip,
//          handler: function(button, event) {
//              this.fireEvent('validateFeatureEdition');
//          },
//          scope : this
//      });
//
//      // Cancel edition
//      drawingBtnGroup.add({
//          group : "drawValidation",
//          iconCls : 'o-map-tools-map-cancel-edition',
//          tooltip : this.tbarCancelEditionButtonTooltip,
//          handler: function(button, event) {
//              this.fireEvent('cancelFeatureEdition');
//          },
//          scope : this
//      });
//
//      // As a feature is modified, fire an event on the vector layer.
//      this.vectorLayer.events.on({
//          'afterfeaturemodified': this.onVectorLayerChange,
//          'featureadded': this.onVectorLayerChange,
//          'featureremoved': this.onVectorLayerChange,
//          scope: this
//      });
//
//      tbar.add(drawingBtnGroup);
//
//      tbar.add(Ext.create('Ext.toolbar.Spacer', {flex: 1}));
//
//      wfsBtnGroup = Ext.create('Ext.container.ButtonGroup', {
//          defaults: {
//              iconAlign:'top'
//          }
//      });
//
//      //
//      // Layer Based Tools
//      //
//      if (!this.hideLayerSelector) {
//          
//          // Snapping tool
//          this.snappingControl = new OpenLayers.Control.Snapping({
//              layer : this.vectorLayer,
//              targets : [ this.vectorLayer ],
//              greedy : false
//          });
//          var snappingAction = Ext.create('GeoExt.Action',{
//              control : this.snappingControl,
//              map : this.map,
//              tooltip : this.snappingControlTitle,
//              toggleGroup : "snapping",  // his own independant group
//              group : "LayerTools",
//              checked : false,
//              iconCls : 'o-map-tools-map-snapping'
//          });
//          if (!this.hideSnappingButton) {
//              wfsBtnGroup.add(new Ext.button.Button(snappingAction));
//          }
//          
//          // Get Feature tool
//          this.getFeatureControl = new OpenLayers.Control.GetFeatureControl({
//              map : this.map
//          });
//          var getFeatureAction = Ext.create('GeoExt.Action',{
//              control : this.getFeatureControl,
//              map : this.map,
//              tooltip : this.selectFeatureControlTitle,
//              toggleGroup : "editing",
//              group : "LayerTools",
//              checked : false,
//              iconCls : 'o-map-tools-map-selectFeature'
//          });
//          var getFeatureButton = new Ext.button.Button(getFeatureAction);
//          
//          if (!this.hideGetFeatureButton) {
//              wfsBtnGroup.add(getFeatureButton);
//          }
//
//          // Feature Info Tool
//          this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
//              popupTitle:this.popupTitle,
//              layerName : this.vectorLayer.name,
//              map : this.map
//          });
//          
//          var featureInfoAction = Ext.create('GeoExt.Action',{
//              control : this.featureInfoControl,
//              map : this.map,
//              toggleGroup : "editing",
//              group : "LayerTools",
//              checked : false,
//              tooltip : this.featureInfoControlTitle,
//              iconCls : 'o-map-tools-map-featureinfo'
//          });
//          if (!this.hideFeatureInfoButton) {
//              wfsBtnGroup.add(new Ext.button.Button(featureInfoAction));
//          }
//
//          // Layer selector
//          this.layerSelector = Ext.create('Ext.form.field.ComboBox',{
//              xtype: 'layerselector',
//              editable: false,
//              emptyText: this.LayerSelectorEmptyTextValue,
//              triggerAction : 'all',
//              store : Ext.create('Ext.data.Store',{
//                  autoLoad: true,
//                  proxy: {
//                      type: 'ajax',
//                      url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgetvectorlayers',
//                      actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
//                      reader: {
//                          type: 'json',
//                          rootProperty: 'layerNames'
//                      }
//                  },
//                  fields : [ {
//                      name : 'code',
//                      mapping : 'code'
//                  }, {
//                      name : 'label',
//                      mapping : 'label'
//                  }, {
//                      name : 'url',
//                      mapping : 'url'
//                  }, {
//                      name : 'url_wms',
//                      mapping : 'url_wms'
//                  }]
//              }),
//              valueField : 'code',
//              displayField : 'label'
//          });
//          wfsBtnGroup.add(this.layerSelector);
//          
//          tbar.add(wfsBtnGroup);
//          
//          // Add separator
//          tbar.add('-');
//      }       
//
//      navBtnGroup = Ext.create('Ext.container.ButtonGroup', {
//          defaults: {
//              iconAlign:'top'
//          }
//      });
//      //
//      // Navigation history : back and next
//      //
//      var historyControl = new OpenLayers.Control.NavigationHistory({});
//      this.map.addControl(historyControl);
//      historyControl.activate();
//
//      var buttonPrevious = new Ext.button.Button({
//          iconCls : 'o-map-tools-map-back',
//          tooltip : this.tbarPreviousButtonTooltip,
//          disabled : true,
//          handler : historyControl.previous.trigger
//      });
//
//      var buttonNext = new Ext.button.Button({
//          iconCls : 'o-map-tools-map-next',
//          tooltip : this.tbarNextButtonTooltip,
//          disabled : true,
//          handler : historyControl.next.trigger
//      });
//      navBtnGroup.add(buttonPrevious);
//      navBtnGroup.add(buttonNext);
//
//      historyControl.previous.events.register("activate", buttonPrevious, function() {
//          this.setDisabled(false);
//      });
//
//      historyControl.previous.events.register("deactivate", buttonPrevious, function() {
//          this.setDisabled(true);
//      });
//
//      historyControl.next.events.register("activate", buttonNext, function() {
//          this.setDisabled(false);
//      });
//
//      historyControl.next.events.register("deactivate", buttonNext, function() {
//          this.setDisabled(true);
//      });
//
//      //
//      // Get info on the feature
//      //
//      var locationInfoControl = new OpenLayers.Control.LocationInfoControl({
//          layerName : OgamDesktop.map.featureinfo_typename,
//          geoPanelId : this.id,
//          requestServiceUrl: Ext.manifest.OgamDesktop.requestServiceUrl,
//          maxfeatures: OgamDesktop.map.featureinfo_maxfeatures
//      });
//      locationInfoControl.events.register('activate', this, function(){
//          this.fireEvent('getLocationInfoActivated', true);
//      });
//
//      locationInfoControl.events.register('deactivate', this, function(){
//          this.fireEvent('getLocationInfoActivated', false);
//      });
//
//      locationInfoControl.events.register('getLocationInfo', this, function(evt){
//          this.fireEvent('getLocationInfo', evt);
//      });
//      
//      var locationInfoAction = Ext.create('GeoExt.Action',{
//          control : locationInfoControl,
//          map : this.map,
//          toggleGroup : "editing",
//          group : "navControl",
//          checked : false,
//          tooltip : this.locationInfoControlTitle,
//          iconCls : 'o-map-tools-map-featureinfo'
//      });
//      navBtnGroup.add(new Ext.button.Button(locationInfoAction));
//      
//      //
//      // Navigation controls
//      //
//
//      // Zoom In
//      var zoomInControl = new OpenLayers.Control.ZoomBox({
//          title : this.zoomBoxInControlTitle
//      });
//
//      var zoomInAction = Ext.create('GeoExt.Action',{
//          control : zoomInControl,
//          map : this.map,
//          tooltip : this.zoomBoxInControlTitle,
//          toggleGroup : "editing",
//          group : "navControl",
//          checked : false,
//          iconCls : 'o-map-tools-map-zoomin'
//      });
//      navBtnGroup.add(new Ext.button.Button(zoomInAction));
//
//      // Zoom Out
//      var zoomOutControl = new OpenLayers.Control.ZoomBox({
//          out : true,
//          title : this.zoomBoxOutControlTitle
//      });
//
//      var zoomOutAction = Ext.create('GeoExt.Action',{
//          control : zoomOutControl,
//          map : this.map,
//          tooltip : this.zoomBoxOutControlTitle,
//          toggleGroup : "editing",
//          group : "navControl",
//          checked : false,
//          iconCls : 'o-map-tools-map-zoomout'
//      });
//
//      navBtnGroup.add(new Ext.button.Button(zoomOutAction));
//
//      // Navigation
//      var navigationControl = new OpenLayers.Control.Navigation({
//          isDefault : true,
//          mouseWheelOptions : {
//              interval : 100
//          }
//      });
//
//      var navigationAction =Ext.create('GeoExt.Action',{
//          control : navigationControl,
//          map : this.map,
//          tooltip : this.navigationControlTitle,
//          toggleGroup : "editing",
//          group : "navControl",
//          checked : true,
//          iconCls : 'o-map-tools-map-pan'
//      });
//
//      navBtnGroup.add(new Ext.button.Button(navigationAction));
//
//      tbar.add(navBtnGroup);
//      
//      // Separator
//      tbar.add('-');
//
//      extentBtnGroup = Ext.create('Ext.container.ButtonGroup', {
//          defaults: {
//              iconAlign:'top'
//          }
//      });
//      // Zoom to the Results
//      var zoomToResultAction = Ext.create('GeoExt.Action',{
//          scope : this,
//          action: 'zoomtoresults',
//          map : this.map,
//          tooltip : this.zoomToResultControlTitle,
//          checked : false,
//          iconCls : 'o-map-tools-map-zoomstations'
//      });
//
//      extentBtnGroup.add(new Ext.button.Button(zoomToResultAction));
//
//      // Zoom to max extend
//      var zoomToMaxControl = new OpenLayers.Control.ZoomToMaxExtent({
//          map : this.map,
//          active : false
//      });
//
//      var zoomToMaxAction = Ext.create('GeoExt.Action',{
//          control : zoomToMaxControl,
//          map : this.map,
//          tooltip : this.zoomToMaxExtentControlTitle,
//          checked : false,
//          iconCls : 'o-map-tools-map-zoomfull'
//      });
//
//      extentBtnGroup.add(new Ext.button.Button(zoomToMaxAction));
//      
//      tbar.add(extentBtnGroup);
//
//      // Separator
//      tbar.add('-');
//      
//      // Print the displayed map
//      if (!this.hidePrintMapButton) {
//          var printMapButton = new Ext.button.Button({
//              xtype : 'button',
//              action: 'print',
//              iconCls : 'o-map-tools-map-printMap',
//              text : this.printMapButtonText,
//              scope : this
//          });
//          
//      }
//      tbar.add(printMapButton);
//      return tbar;
//  },