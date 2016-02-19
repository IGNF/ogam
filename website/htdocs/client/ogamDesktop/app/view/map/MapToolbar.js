/**
 * Toolbar class associated to the map
 *
 * @constructor
 * Creates a new Toolbar
 * @param {Object/Object[]} config A config object or an array of buttons to {@link #method-add}
 */
Ext.define('OgamDesktop.view.map.MapToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    controller: 'maptoolbar',
    viewModel: {
        type: 'maptoolbar'
    },
    requires: [
        'OgamDesktop.view.map.MapToolbarController',
        'OgamDesktop.view.map.MapToolbarModel'
    ],
    uses: [
    ],
    alias: 'widget.maptoolbar',
    xtype:'maptoolbar',
    items:[{
        xtype:'buttongroup',
        itemId: 'drawingButtonsGroup',
        hidden: true,
        action: 'drawing',
        defaults: {
          iconAlign:'top'
        },
        items:[{
            iconCls : 'o-map-tools-map-zoomtodrawingfeatures',
            tooltip: this.zoomToDrawingFeaturesButtonTooltip,
            listeners: {
                click: 'onZoomToDrawingFeaturesButtonPress'
            }
        },{ // Use of tbtext because tbseparator doesn't work...
            xtype:'tbtext',
            html: '|',
            margin:'3 -3 0 -2',
            style:'color:#aaa'
        },{
            xtype:'splitbutton',
            reference: 'snappingButton',
            iconCls: 'o-map-tools-map-snapping',
            tooltip: this.snappingButtonTooltip,
            enableToggle: true,
            listeners: {
                toggle: 'onSnappingButtonToggle'
            },
            menu : {
                xtype: 'menu',
                defaults: {
                    xtype: 'menucheckitem'
                },
                listeners:{
                    click : 'onSnappingButtonMenuItemPress'
                }
            }
        },{
            iconCls : 'o-map-tools-map-modifyfeature',
            tooltip: this.modifyfeatureButtonTooltip,
            enableToggle: true,
            listeners: {
                toggle: 'onModifyfeatureButtonToggle'
            }
        },{ // Use of tbtext because tbseparator doesn't work...
            xtype:'tbtext',
            html: '|',
            margin:'3 -3 0 -2',
            style:'color:#aaa'
        },{
            iconCls : 'o-map-tools-map-select',
            tooltip: this.selectButtonTooltip,
            toggleGroup : "editing",
            listeners: {
                toggle: 'onSelectButtonToggle'
            }
        },{
            itemId: 'drawPointButton',
            iconCls: 'o-map-tools-map-drawpoint',
            tooltip: this.drawPointButtonTooltip,
            toggleGroup : "editing",
            listeners: {
                toggle: 'onDrawPointButtonToggle'
            }
        },{
            itemId: 'drawLineButton',
            iconCls: 'o-map-tools-map-drawline',
            tooltip: this.drawLineButtonTooltip,
            toggleGroup : "editing",
            listeners: {
                toggle: 'onDrawLineButtonToggle'
            }
        },{
            itemId: 'drawPolygonButton',
            iconCls: 'o-map-tools-map-drawpolygon',
            tooltip: this.drawPolygonButtonTooltip,
            toggleGroup : "editing",
            listeners: {
                toggle: 'onDrawPolygonButtonToggle'
            }
        },{
            xtype:'splitbutton',
            reference: 'selectWFSFeatureButton',
            itemId: 'selectWFSFeatureButton',
            iconCls: 'o-map-tools-map-selectWFSFeature',
            tooltip: this.selectWFSFeatureButtonTooltip,
            toggleGroup : "editing",
            listeners: {
                toggle: 'onSelectWFSFeatureButtonToggle'
            },
            menu : {
                xtype: 'menu',
                defaults: {
                    xtype: 'menucheckitem'
                },
                listeners:{
                    click : 'onSelectWFSFeatureButtonMenuItemPress'
                }
            }
        },{
            iconCls : 'o-map-tools-map-deletefeature',
            tooltip: this.deleteFeatureButtonTooltip,
            listeners: {
                click: 'onDeleteFeatureButtonPress'
            }
        },{ // Use of tbtext because tbseparator doesn't work...
            xtype:'tbtext',
            group: 'drawValidation',
            html: '|',
            margin:'3 -3 0 -2',
            style:'color:#aaa'
        },{
            group: 'drawValidation',
            iconCls : 'o-map-tools-map-validateedition',
            tooltip: this.validateEditionButtonTooltip,
            listeners: {
                click: 'onValidateEditionButtonPress'
            }
        },{
            group: 'drawValidation',
            iconCls : 'o-map-tools-map-canceledition',
            tooltip: this.cancelEditionButtonTooltip,
            listeners: {
                click: 'onCancelEditionButtonPress'
            }
        }]
    },{
        xtype : 'tbspacer',
        flex: 1
    },{
        xtype:'splitbutton',
        reference: 'layerFeatureInfoButton',
        iconCls: 'o-map-tools-map-layerfeatureinfo',
        tooltip: this.layerFeatureInfoButtonTooltip,
        toggleGroup : "consultation",
        listeners: {
            toggle: 'onLayerFeatureInfoButtonToggle'
        },
        menu : {
            xtype: 'menu',
            defaults: {
                xtype: 'menucheckitem'
            },
            listeners:{
                click : 'onLayerFeatureInfoButtonMenuItemPress'
            }
        }
    },{
        iconCls : 'o-map-tools-map-resultfeatureinfo',
        tooltip: this.resultFeatureInfoButtonTooltip,
        toggleGroup : "consultation",
        listeners: {
            toggle: 'onResultFeatureInfoButtonPress'
        }
    },'-',{
        iconCls : 'o-map-tools-map-zoomin',
        tooltip: this.zoomInButtonTooltip,
        toggleGroup : "consultation",
        listeners: {
            toggle: 'onZoomInButtonPress'
        }
    },{
        iconCls : 'o-map-tools-map-pan',
        tooltip: this.mapPanButtonTooltip,
        toggleGroup : "consultation",
        listeners: {
            toggle: 'onMapPanButtonPress'
        }
    },'-',{
        iconCls : 'o-map-tools-map-zoomtoresultfeatures',
        tooltip: this.zoomToResultFeaturesButtonTooltip,
        listeners: {
            click: 'onZoomToResultFeaturesButtonPress'
        }
    },{
        iconCls : 'o-map-tools-map-zoomtomaxextent',
        tooltip: this.zoomToMaxExtentButtonTooltip,
        listeners: {
            click: 'onZoomToMaxExtentButtonPress'
        }
    },'-',{
        iconCls : 'o-map-tools-map-printMap',
        tooltip: this.printMapButtonTooltip,
        listeners: {
            click: 'onPrintMapButtonPress'
        }
    }]
});