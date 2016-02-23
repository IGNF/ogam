
Ext.define("OgamDesktop.view.map.MapComponent",{
    extend: "GeoExt.component.Map",
    xtype: 'mapcomponent',
    controller: 'mapcomponent',
    listeners: {
        resultswithautozoom: 'zoomToResultFeatures'
    },

//  requires: [
//    'GeoExt.tree.LayerContainer',
//    'GeoExt.Action',
//    'GeoExt.slider.Zoom',
//    'GeoExt.slider.Tip',
//    'OgamDesktop.view.map.LayersPanel',
//    'OgamDesktop.view.map.LegendsPanel',
//    'OgamDesktop.ux.form.field.GeometryField',
//    'GeoExt.window.Popup',
//    'Ext.container.ButtonGroup'
//  ],
//  // Mixins: ['OgamDesktop.view.interface.MapPanel'],
//
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
//  
  /**
   * @cfg {Boolean} autoZoomOnResultsFeatures True to zoom
   *      automatically on the results features
   */
  autoZoomOnResultsFeatures : true,
//  
//  /**
//   * @cfg {Boolean} hidePrintMapButton if true hide the Print
//   *      Map Button (defaults to false).
//   */
//  hidePrintMapButton : false,
//  
//  /**
//   * @cfg {Boolean} isDrawingMap true to display the drawing
//   *      tools on the toolbar. (Default to false)
//   */
//  isDrawingMap: true,
//  
//  
//  /**
//   * @cfg {String} resultsBBox The results bounding box
//   *      (defaults to <tt>null</tt>)
//   */
//  resultsBBox : null,
  
  /**
   * @cfg {Object} layersActivation A object containing few
   *      arrays of layers ordered by activation type
   *      (defaults to <tt>{}</tt>) {
   *      'request':[resultLayer, resultLayer0, resultLayer1]
   */
  layersActivation : {},

//  /**
//   * The list of OL layers.
//   * 
//   * @property layersList
//   * @type array of OpenLayers.Layer
//   */
//  layersList: [],
//  
//  /**
//   * The 'LayerService' store records.
//   * @private
//   * @property services
//   * @type array
//   */
//  services: [],
//
//  /**
//   * The WFS layer.
//   * 
//   * @type {OpenLayers.Layer.Vector}
//   * @property wfsLayer
//   */
  wfsLayer : null,
//  
//  /**
//   * The vector layer.
//   * 
//   * @type {OpenLayers.Layer.Vector}
//   * @property vectorLayer
//   */
//  vectorLayer : null,
//  vector: null,
//  /**
//   * The map object (linked to the map panel).
//   * 
//   * @type {OpenLayers.Map}
//   * @property map
//   */
//  map : null,
//  

    map: new ol.Map({
        logo: false, // no attributions to ol
        interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false}), // disable rotation
        layers: [
            new ol.layer.Vector({
                code: 'drawingLayer',
                name: 'Drawing layer',
                printable: false,
                source: new ol.source.Vector({features: new ol.Collection()}),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                          color: '#ffcc33'
                        })
                    })
                })
            }),
            new ol.layer.Vector({
                code: 'wfsLayer',
                name: 'WFS Layer',
                source: new ol.source.Vector({
                    format: new ol.format.GML()
                    //strategy: ol.loadingstrategy.bbox()
                }),
                style: new ol.style.Style({
                    fillOpacity : 0,
                    stroke : new ol.style.Stroke({
                        color: 'rgba(0, 255, 0, 1.0)',
                        width: 3
                    })
                }),
                printable: false
            }),
            new ol.layer.Vector({
                code: 'snappingLayer',
                name: 'Snapping layer',
                source: new ol.source.Vector({features: new ol.Collection()}),
                visible: false,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 255, 1.0)',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 2,
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 0, 255, 1.0)'
                        })
                    })
                })
            })
        ],
        view: new ol.View({
            resolutions: OgamDesktop.map.resolutions,
            projection : OgamDesktop.map.projection,
            center: [OgamDesktop.map.x_center, OgamDesktop.map.y_center],
            zoom: OgamDesktop.map.defaultzoom,
            extent: [
                OgamDesktop.map.x_min,
                OgamDesktop.map.y_min,
                OgamDesktop.map.x_max,
                OgamDesktop.map.y_max
            ]
        }),
        controls:  [
            new ol.control.ZoomSlider(),
            new ol.control.ScaleLine(),
            new ol.control.Scale ({className:'o-map-tools-map-scale'}),
            new ol.control.MousePosition({
                className:'o-map-tools-map-mouse-position',
                coordinateFormat :function(coords){
                    var template = 'X: {x} - Y: {y} ' + OgamDesktop.map.projection;
                    return ol.coordinate.format(coords, template);
            }})
        ]
    }),
            
    isResInLayerRange: function(lyr, res){
        if (res >= lyr.getMinResolution() && res < lyr.getMaxResolution()) { // in range
            return true;
        } else { // out of range
            return false;
        }
    },
    
    retrieveChangedLayers : function(layerGrp, resDep, resDest) {
        layerGrp.getLayers().forEach(function(lyr) {
            if (lyr.isLayerGroup) {
                this.retrieveChangedLayers(lyr, resDep, resDest);
            } else {
                if (this.isResInLayerRange(lyr, resDest) && !this.isResInLayerRange(lyr, resDep)) {
                       this.fireEvent('changevisibilityrange', lyr, true);
                   } else if (!this.isResInLayerRange(lyr, resDest) && this.isResInLayerRange(lyr, resDep)) {
                       this.fireEvent('changevisibilityrange', lyr, false);
                   };
                }
        }, this);
    },
    
    initComponent: function(){
        this.getMap().getLayers().forEach(function(lyr){
             lyr.setVisible(lyr.getVisible());
        });
        this.getMap().getView().on('change:resolution', function(e){
            curRes = e.target.get(e.key); // new value of resolution
            oldRes = e.oldValue; // old value of resolution
            this.retrieveChangedLayers(this.getMap().getLayerGroup(), oldRes, curRes);
        }, this);
        this.callParent(arguments);
    }
});
