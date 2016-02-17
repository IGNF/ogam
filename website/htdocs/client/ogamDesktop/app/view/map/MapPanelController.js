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