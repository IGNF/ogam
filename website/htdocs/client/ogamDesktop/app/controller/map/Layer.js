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
                    mappanel: '#map-panel',
                    geometryfield: 'geometryfield',
                    consultationpanel : '#consultationTab',
                    mapmainwin :  'map-mainwin'
            },
            control: {
                'geometryfield': {
                    geomCriteriaPress: 'onGeomCriteriaPress',
                    geomCriteriaUnpress: 'onGeomCriteriaUnpress',
                    geomCriteriaDestroy: 'onGeomCriteriaUnpress'
                },
                'map-mainwin': {
                    afterrender: 'afterMapMainWinRendered'
                },
                'mapcomponent': {
                    changevisibilityrange: 'updateLayerNode'
                },
                '#map-panel': {
                    featureModified: 'updateCurrentEditionFieldValue',
                    validateFeatureEdition:'onValidateFeatureEdition',
                    cancelFeatureEdition:'onCancelFeatureEdition'
                },
                'advanced-request button[action = submit]': {
                    submitRequest: 'onSubmitRequest'
                }
            }
	},
    
    afterMapMainWinRendered : function(mapMainWin) {
        // Retrieve layer services
        // Load the LayerService store
        var layersList = [];
        Ext.Ajax.request({
            url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgettreelayers',
            method: 'POST',
            scope: this,
            success: function(response, options) {
                var layerNodes = Ext.decode(response.responseText);
                for (var i in layerNodes) {
                    var lyrNode = layerNodes[i];
                    if (!lyrNode.leaf) {
                        olGrp = new ol.layer.Group({
                            name: lyrNode.text,
                            code: lyrNode.nodeGroup,
                            visible: !lyrNode.hidden,
                            displayInLayerSwitcher: !lyrNode.hidden,
                            expanded: lyrNode.expanded
                        });
                        layersList.push(olGrp);
                    }
                }
                Ext.Ajax.request({
                    url: Ext.manifest.OgamDesktop.mapServiceUrl +'ajaxgetlayers',
                    method: 'POST',
                    success: function(response, options) {
                        var result = Ext.decode(response.responseText);
                        var layers = result.layers;
                        var services = result.services;
                        for (var i in layers) {
                            var layer = layers[i];
                            var sourceWMSOpts = {};
                            var sourceWMTSOpts = {};
                            var olLayerOpts = {};
                            for (var j in services) {
                                var service = services[j];
                                if (service.name === layer.legendServiceName) {
                                    this.buildLegend(layer, service);
                                };
                                if (service.name === layer.viewServiceName) {
                                    var source;
                                    if (service.config.params.SERVICE === 'WMS') {
                                        sourceWMSOpts['params'] = {
                                            'layers': layer.params.layers,
                                            'REQUEST': service.config.params.REQUEST,
                                            'VERSION': service.config.params.VERSION,
                                            'session_id': layer.params.session_id
                                        };
                                        sourceWMSOpts['urls'] = service.config.urls;
                                        source = new ol.source.TileWMS(sourceWMSOpts);
                                    } else if (service.config.params.SERVICE === 'WMTS') {
//                                        creation and merging of wmts parameters
                                        var origin = service.config.params.tileOrigin; //coordinates of top left corner of the matrixSet
                                        var resolutions = service.config.params.serverResolutions;
                                        var matrixIds = [];
                                        for (i in resolutions){
                                            matrixIds[i] = i;
                                        };
                                        var tileGrid = new ol.tilegrid.WMTS({
                                            origin: origin,
                                            resolutions: resolutions,
                                            matrixIds: matrixIds
                                        });
                                        sourceWMTSOpts['urls'] = service.config.urls;
                                        sourceWMTSOpts['layer'] = layer.name;
                                        sourceWMTSOpts['tileGrid'] = tileGrid;
                                        sourceWMTSOpts['matrixSet'] = service.config.params.matrixSet;
                                        sourceWMTSOpts['style'] = service.config.params.style;
                                        olLayerOpts['session_id'] = layer.params.session_id;
                                        source = new ol.source.WMTS(sourceWMTSOpts);
                                    }
                                    var activateType = layer.params.activateType.toLowerCase();
                                    var mapCmp = this.getMappanel().child('mapcomponent');
                                    if (Ext.isEmpty(mapCmp.layersActivation[activateType])) {
                                        mapCmp.layersActivation[activateType] = [layer.name];
                                    } else {
                                        mapCmp.layersActivation[activateType].push(layer.name);
                                    }
                                    olLayerOpts['source'] = source;
                                    olLayerOpts['name'] = layer.options.label;
                                    olLayerOpts['opacity'] = layer.options.opacity;
                                    olLayerOpts['code'] = layer.name;
                                    olLayerOpts['printable'] = true;
                                    olLayerOpts['visible'] = !layer.params.isHidden;
                                    olLayerOpts['displayInLayerSwitcher'] = !layer.params.isHidden;
                                    olLayerOpts['disabled'] = layer.params.isDisabled;
                                    olLayerOpts['checked'] = layer.params.isChecked;
                                    if (layer.options.resolutions) {
                                        var resolutions = layer.options.resolutions;
                                        olLayerOpts['minResolution'] = resolutions[resolutions.length - 1];
                                        olLayerOpts['maxResolution'] = resolutions[0];
                                    }
                                    var olLayer = new ol.layer.Tile(olLayerOpts);
                                    olLayer.on('change:visible', function(e) {
                                        mapCmp.fireEvent('changelayervisibility', this, e.target.get(e.key));
                                    });
                                    if (layer.options.nodeGroup == -1){
                                        layersList.push(olLayer);
                                    } else {
                                        for (var k in layersList) {
                                            var lyrGrp =  layersList[k];
                                            if (layer.options.nodeGroup == lyrGrp.get('code')) {
                                                var lyrs = lyrGrp.getLayers();
                                                lyrs.push(olLayer);
                                                lyrGrp.setLayers(lyrs);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        var map = this.getMappanel().child('mapcomponent').getMap();
                        var layersCollection = new Ext.util.MixedCollection();
                        layersCollection.addAll(layersList);
                        var displayInLayerSwitcher = new Ext.util.Filter({
                            filterFn : function(item) {
                                return item.get('displayInLayerSwitcher');
                            }
                        });
                        var treeLayersCollection = layersCollection.filter(displayInLayerSwitcher);
                        var treeLayersGroup = new ol.layer.Group({
                            layers: treeLayersCollection.getRange(),
                            code: 'treeGrp'
                        });
                        map.addLayer(treeLayersGroup);
                        var treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
                            layerGroup: treeLayersGroup
                        });
                        treeLayerStore.each(function(item) {
                            cls = item.getOlLayer().get('disabled') ? 'dvp-tree-node-disabled' : '';
                            item.set("cls", cls);
                            item.set("checked", item.getOlLayer().get('checked'));
                            if (item.getOlLayer().get('expanded')) {
                                item.set("expandable", true);
//                                item.set("expanded", item.getOlLayer().get('expanded'));
                                item.expand();
                            }
                        });
                        this.getLayerspanel().setConfig('store', treeLayerStore);
                        Ext.apply(this.getLayerspanel().getView(), {
                            onCheckChange: Ext.Function.createInterceptor(this.getLayerspanel().getView().onCheckChange,function(e) {
                                console.log('event check', e);
                                if (e.record.getOlLayer().get('disabled')) {
                                    return false;
                                }
                            }, this)
                        });
                    },
                    scope: this
                });
            }
        });
    },


	/**
	 * Manage the validateFeatureEdition event
	 */
	onValidateFeatureEdition: function() {
		this.currentEditionField.fireEvent('featureEditionValidated');
		this.unpressField();
	},

	/**
	 * Manage the cancelFeatureEdition event
	 */
	onCancelFeatureEdition: function() {
		this.currentEditionField.fireEvent('featureEditionCancelled');
		this.currentEditionField.setValue(this.currentEditionFieldOldValue);
		this.unpressField();
	},

	/**
	 * Set the features of the vector layer from a WKT
	 */
	setVectorLayerFeaturesFromWKT: function(wkt) {
		var mapPanel = this.getMappanel();
		this.removeVectorLayerFeatures();
		if (!Ext.isEmpty(wkt)) {
			var feature = mapPanel.wktFormat.read(wkt);
			if (Ext.isEmpty(feature)) {
				console.error(mapPanel.invalidWKTMsg);
			} else {
				if (!Array.isArray(feature)) {
					feature = [feature];
				}
				mapPanel.vectorLayer.addFeatures(feature);
			}
		}
	},

	/**
	 * Update the WKT value of the drawn vector layer into the geometry field of request panel
	 */
	updateCurrentEditionFieldValue: function() {
		var mapPanel = this.getMappanel();
		var wktValue = null;
		var featuresNbr = mapPanel.vectorLayer.features.length;
		if (featuresNbr === 1){ // Avoid the GEOMETRYCOLLECTION for only one feature
			wktValue = mapPanel.wktFormat.write(mapPanel.vectorLayer.features[0]);
		} else if (featuresNbr > 1) { // Return a GEOMETRYCOLLECTION
			wktValue = mapPanel.wktFormat.write(mapPanel.vectorLayer.features);
		}
		if (this.currentEditionField !== null){
			this.currentEditionField.setValue(wktValue);
		}
	},

	/**
	 * Manage the geometry field press event
	 * 
	 * @param {Ext.form.field.Field} field The pressed field
	 */
	onGeomCriteriaPress: function(field) {
		if (this.currentEditionField !== null) {
			// Deactivation of the previous edition mode and field
			this.previousEditionFieldId = this.currentEditionField.getId();
			this.currentEditionField.onUnpress();
		}
		this.currentEditionField = field;
		this.currentEditionFieldOldValue = field.getValue();
		this.setVectorLayerFeaturesFromWKT(field.getValue());
		this.toggleDrawingTbar(true);
		var consultationPanel = this.getConsultationpanel();
		consultationPanel.ownerCt.setActiveTab(consultationPanel);
		var mapMainWin = this.getMapmainwin();
		mapMainWin.ownerCt.setActiveTab(mapMainWin);
	},

	/**
	 * Manage the geometry field unpress event
	 * 
	 * @param {Ext.form.field.Field} field The unpressed field
	 */
	onGeomCriteriaUnpress: function(field) {
		if(field && field.getId() === this.previousEditionFieldId){ // Do nothing
			this.previousEditionFieldId = null;
		} else {
			this.currentEditionField = null;
			this.toggleDrawingTbar(false);
			this.removeVectorLayerFeatures();
		}
	},

	/**
	 * Deactivation of the previous edition mode and field on a request launch
	 */
	onSubmitRequest: function() {
		this.unpressField();
	},

	/**
	 * Unpress the current edition field linked to the drawing toolbar
	 */
	unpressField: function() {
		if (this.currentEditionField !== null) {
			this.currentEditionField.onUnpress();
		}
	},

	/**
	 * Setup the drawing toolbar buttons (visibilities and default controls)
	 */
	setupDrawingTbarButtons: function() {
		// Set the buttons visibilities
		var drawPointButton = this.getMappanel().getDockedItems('toolbar button[action = drawpoint]');
		if (drawPointButton.length) {
			drawPointButton[0].setVisible(!this.currentEditionField.hideDrawPointButton);
		}
		var drawLineButton = this.getMappanel().getDockedItems('toolbar button[action = drawline]');
		if (drawLineButton.length) {
			drawLineButton[0].setVisible(!this.currentEditionField.hideDrawLineButton);
		}
		var drawPolygonButton = this.getMappanel().getDockedItems('toolbar button[action = drawpolygon]');
		if (drawPolygonButton.length) {
			drawPolygonButton[0].setVisible(!this.currentEditionField.hideDrawPolygonButton);
		}
		var drawValidationButtons = this.getMappanel().getDockedItems('toolbar [group = drawValidation]');
		for (var i=0; i < drawValidationButtons.length; i++) {
			drawValidationButtons[i].setVisible(!this.currentEditionField.hideValidateAndCancelButtons);
		}

		// Set the default control
		switch (this.currentEditionField.defaultActivatedDrawingButton) {
			case 'point' : drawPointButton[0].toggle(true); break;
			case 'line' : drawLineButton[0].toggle(true); break;
			case 'polygon' : drawPolygonButton[0].toggle(true); break;
		}
	},

	/**
	 * Activates / Deactivates drawing tbar
	 * 
	 * @param {boolean} enable Enable or disable the drawing toolbar
	 */
	toggleDrawingTbar: function(enable) {
		if(enable){
			// Setup the drawing toolbar buttons
			this.setupDrawingTbarButtons();
		} else {
			// Deactivates all the drawing toolbar buttons controls on the toolbar disappearance
			var drawingTbarButtons = this.getMappanel().getDockedItems('toolbar buttongroup[action = drawing] button');
			for(var i = 0; i < drawingTbarButtons.length; i++){
				drawingTbarButtons[i].toggle(false);
			}
		}
		// Show or hide drawing buttons group
		var drawingTbar = this.getMappanel().getDockedItems('toolbar buttongroup[action = drawing]');
		if (drawingTbar.length) {
			drawingTbar[0].setVisible(enable);
		}
	},

	/**
	 * Hide vector layer features
	 */
	hideVectorLayerFeatures: function () {
		var mapPanel = this.getMappanel();
		for( var i = 0; i < mapPanel.vectorLayer.features.length; i++ ) {
			mapPanel.vectorLayer.features[i].style = { display: 'none' };
		}
		mapPanel.vectorLayer.redraw();
	},

	/**
	 * Remove vector layer features
	 */
	removeVectorLayerFeatures: function () {
		this.getMappanel().child('mapcomponent').getController().getMapLayer('drawingLayer').getSource().clear({'fast':true});
	},

	/**
	 * Show vector layer features
	 */
	showVectorLayerFeatures: function () {
		var mapPanel = this.getMappanel();
		for( var i = 0; i < mapPanel.vectorLayer.features.length; i++ ) {
			mapPanel.vectorLayer.features[i].style = null;
		}
		mapPanel.vectorLayer.redraw();
	},
        
        updateLayerNode: function(lyr, toEnable) {
            this.getLayerspanel().getStore().each(function (item) {
                if (item.getOlLayer() === lyr) {
                    if (toEnable) {
                        console.log('enable ', lyr.get('code'));
                        item.getOlLayer().set('disabled', false);
                        item.set("cls", ''); 
                    } else {
                        console.log('disable ', lyr.get('code'));
                        item.getOlLayer().set('disabled', true);
                        item.set("cls", 'dvp-tree-node-disabled'); 
                    }
                }
            });
        },
	/**
	 * Build a Legend Object from a 'Layer' store record.
	 * @param {Object}
	 *            layerObject The 'Layer' store record
	 * @param {Object}
	 *            serviceObject The 'LayerService' store record for the legend
	 *            corresponding to the layer
	 * @return OpenLayers.Layer
	 */
	buildLegend : function(layerObject,serviceObject) {
            var legend = this.getLegendspanel()
                .add(new Ext.Component({
                    // Extjs 5 doesn't accept '.' into ids
                    id : this.getMappanel().id + layerObject.name.replace(/\./g,'-'),
                    autoEl : {
                        tag : 'div',
                        children : [{
                            tag : 'span',
                            html : layerObject.options.label,
                            cls : 'x-form-item x-form-item-label'
                        },{
                            tag : 'img',
                            src : serviceObject.config.urls.toString()
                            + 'LAYER='+ layerObject.params.layers
                            + '&SERVICE=' + serviceObject.config.params.SERVICE+ '&VERSION=' + serviceObject.config.params.VERSION + '&REQUEST=' + serviceObject.config.params.REQUEST
                            + '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
                        }]
                    }
                }));
		if (layerObject.params.isDisabled || layerObject.params.isHidden || !layerObject.params.isChecked) {
                    legend.on('render', function(cmp) {
                        cmp.hide();
                    });
		}
	},
        
    onLaunch:function(){
        //clean previous request or result in server side
        Ext.Ajax.request({
         url: Ext.manifest.OgamDesktop.requestServiceUrl+'ajaxrestresultlocation',
         failure: function(response, opts) {
            console.warn('server-side failure with status code ' + response.status);
         }
        });
    }
});