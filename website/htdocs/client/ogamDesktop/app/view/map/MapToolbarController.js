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

    /**
     * Initializes the controller.
     * @private
     */
    init : function() {
        var mapCmp = this.getView().up('panel').child('mapcomponent');
        this.map = mapCmp.getMap();
        this.mapCmpCtrl = mapCmp.getController();
        this.selectInteraction = new ol.interaction.Select({
            layers: [this.mapCmpCtrl.getMapLayer('drawingLayer')]
        });
    },

    /**
     * Fonction handling the load event on the vector layer store.
     * @private
     * @param {Ext.data.Store} store The store
     * @param {Ext.data.Model[]} records An array of records
     * @param {Boolean} successful True if the operation was successful.
     * @param {Ext.data.operation.Read} operation The 
     * {@link Ext.data.operation.Read Operation} object that was used in the data 
     */
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

    /**
     * Fonction handling the click event on the zoom to drawing features button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
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

    /**
     * Fonction handling the click event on the control buttons.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {ol.interaction} interaction The corresponding interaction
     */
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

    /**
     * Fonction handling the toggle event on the modify feature button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onModifyfeatureButtonToggle : function (button, pressed, eOpts) {
        pressed && this.onControlButtonPress(button, new ol.interaction.Modify({
            features: this.mapCmpCtrl.getMapLayer('drawingLayer').getSource().getFeaturesCollection(),
            deleteCondition: function(event) {
                return ol.events.condition.shiftKeyOnly(event) &&
                    ol.events.condition.singleClick(event);
            }
        }));
    },

    /**
     * Fonction handling the toggle event on the select button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onSelectButtonToggle : function (button, pressed, eOpts) {
        // OGAM-603 - TODO : http://openlayers.org/en/v3.13.0/examples/box-selection.html
        pressed && this.onControlButtonPress(button, this.selectInteraction);
    },

    /**
     * Fonction handling the toggle event on the draw buttons.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed
     * @param {String} drawType The type of drawing ('Point'/'LineString'/'Polygon')
     */
    onDrawButtonToggle : function (button, pressed, drawType) {
        pressed && this.onControlButtonPress(button, new ol.interaction.Draw({
            features: this.mapCmpCtrl.getMapLayer('drawingLayer').getSource().getFeaturesCollection(),
            type: drawType
        }));
    },

    /**
     * Fonction handling the toggle event on the draw point button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onDrawPointButtonToggle : function (button, pressed, eOpts) {
        this.onDrawButtonToggle(button, pressed, 'Point');
    },

    /**
     * Fonction handling the toggle event on the draw line button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onDrawLineButtonToggle : function (button, pressed, eOpts) {
        this.onDrawButtonToggle(button, pressed, 'LineString');
    },

    /**
     * Fonction handling the toggle event on the draw polygon button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onDrawPolygonButtonToggle : function (button, pressed, eOpts) {
        this.onDrawButtonToggle(button, pressed, 'Polygon');
    },

    /**
     * Fonction handling the click event on the delete feature button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
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

    /**
     * Fonction handling the click event on the validate edition button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onValidateEditionButtonPress : function (button, e, eOpts) {
        this.getView().fireEvent('validateFeatureEdition');
    },

    /**
     * Fonction handling the click event on the cancel edition button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onCancelEditionButtonPress : function (button, e, eOpts) {
        this.getView().fireEvent('cancelFeatureEdition');
    },


// ********************************************************************************************************* //
//                                                                                                           //
//          Consultation buttons                                                                             //
//                                                                                                           //
// ********************************************************************************************************* //

    /**
     * Makes a ajax request to get some information about a location.
     * @param {ol.MapBrowserEvent} e the map click event
     */
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
    
    /**
     * Fonction handling the click event on the result feature info button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onResultFeatureInfoButtonPress : function(button, pressed, eOpts) {
        if (pressed) {
            this.map.on("click", this.getLocationInfo, this);
        } else {
            this.map.un("click", this.getLocationInfo, this);
        }
    },

    /**
     * Fonction handling the click event on the zoom in button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
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

    /**
     * Fonction handling the click event on the zoom to result features button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onZoomToResultFeaturesButtonPress : function (button, e, eOpts) {
        this.mapCmpCtrl.zoomToResultFeatures();
    },

    /**
     * Fonction handling the click event on the zoom to max extent button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
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

    /*
     * Create and submit a form.
     * @param {String}  url The form url
     * @param {object} params The form params
     * @return {DOM element} The form dom element
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

    /**
     * Resizes the map.
     */
    resizeMap : function() {
        var mapTarget = Ext.get('o-map-print-map-overview');
        var squareCheckbox = Ext.get('o-map-print-options-square-checkbox');
        // Remove the height and width of the style attribute
        mapTarget.setHeight(); 
        mapTarget.setWidth();
        if (squareCheckbox.dom.checked) {
            if (window.matchMedia("(orientation: landscape)").matches) {
                mapTarget.setWidth(mapTarget.getHeight());
                this.map.updateSize();
            } else {
                mapTarget.setHeight(mapTarget.getWidth());
                this.map.updateSize();
            }
        } else {
            this.map.updateSize();
        }
    },
    
    /**
     * Fonction handling the click event on the print map button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}
     */
    onPrintMapButtonPress : function(button, e, eOpts) {
        var mapAddonsPanel = this.getView().up('map-mainwin').child('map-addons-panel');
        var legendsPanel = mapAddonsPanel.child('legends-panel');

        // Forces the render of the legends panel items
        // OGAM-604 - TODO: Find a workaround
        if(!legendsPanel.isVisible()){
            var activeTab = mapAddonsPanel.getActiveTab();
            mapAddonsPanel.setActiveTab(legendsPanel);
            mapAddonsPanel.setActiveTab(activeTab);
        }

        // Gets the activated legends
        // Note: The legend panel body is not fully taken to avoid the ids duplication
        // OGAM-605 - TODO: Find a workaround (Use a filtered legends store...)
        var legendBody = [{
            tag:'div',
            cls:'o-map-print-legends-title',
            html: OgamDesktop.view.map.LegendsPanel.prototype.title
        }];
        legendsPanel.items.each(function(item){
            if(item.isVisible()){
                legendBody.push({
                    tag:'div',
                    cls:'o-map-print-legend-div',
                    children: [{
                        tag:'span',
                        html: item.el.first().getHtml()
                    },{
                        tag:'img',
                        src: item.el.last().dom.src
                    }]
                });
            }
        });

        // Builds the print preview
        Ext.getBody().createChild({
            tag: 'div',
            id: 'o-map-print-main-div',
            children: [{ // Map
                tag: 'div',
                id: 'o-map-print-map-overview',
                children: [{ // Screenshot
                    tag:'div',
                    id:'o-map-print-map-screenshot',
                    children:[{ // Screenshot image of the map
                        tag: 'img',
                        id: 'o-map-print-map-img'
                    },{ // Scale line with a relative width
                        tag:'div',
                        cls:'ol-scale-line ol-unselectable',
                        children:[{
                            tag: 'div',
                            id: 'o-map-print-map-scale-line-inner',
                            cls: 'ol-scale-line-inner'
                        }]
                    }]
                }]
            },{ // Legends
                tag: 'div',
                cls: 'o-map-print-addons-div',
                children: [{
                    tag: 'div',
                    cls: 'o-map-print-legends-div',
                    children: legendBody
                },{ // Comment
                    tag: 'div',
                    cls: 'o-map-print-comment-div',
                    children: [{
                        tag: 'div',
                        cls: 'o-map-print-comment-title',
                        html: 'Commentaire'
                    },{
                        tag: 'textarea',
                        id: 'o-map-print-comment-textarea',
                        placeholder: 'Vous pouvez commenter ici votre impression.'
                    },{
                        tag: 'div',
                        id: 'o-map-print-comment-div',
                        html: 'Aucun commentaire.'
                    }]
                },{ // Print options
                    tag: 'div',
                    cls: 'o-map-print-options-div',
                    children: [{
                        tag: 'div',
                        cls: 'o-map-print-options-title',
                        html: 'Impression'
                    },{
                        tag:'div',
                        cls:'o-map-print-option-div',
                        children: [{
                            tag: 'input',
                            type: 'checkbox',
                            id: 'o-map-print-options-adjust-checkbox'
                        },{
                            tag: 'label',
                            html: 'Ajuster la carte à la page'
                        }]
                    },{
                        tag:'div',
                        cls:'o-map-print-option-div',
                        children: [{
                            tag: 'input',
                            type: 'checkbox',
                            id: 'o-map-print-options-square-checkbox'
                        },{
                            tag: 'label',
                            html: 'Formater la carte au 1/1'
                        }]
                    },{ // Toolbar with print and cancel buttons
                        tag: 'div',
                        cls: 'o-map-print-tbar',
                        children: [{
                            tag: 'button',
                            id: 'o-map-print-tbar-print-button',
                            html: 'Imprimer'
                        },{
                            tag: 'button',
                            id: 'o-map-print-tbar-cancel-button',
                            html: 'Annuler'
                        }]
                    }]
                }]
            }]
        },Ext.getBody().first());

        // Teleports the map to improve the screenshot resolution (enlarges the map before the screenshot)
        this.map.setTarget('o-map-print-map-overview');

        // Adds/Removes the class "page-map-adjust" on adjust checkbox change
        Ext.get('o-map-print-options-adjust-checkbox').on('change', function(event, el) {
            if (el.checked) {
                Ext.get('o-map-print-main-div').addCls('page-map-adjust');
            } else {
                Ext.get('o-map-print-main-div').removeCls('page-map-adjust');
            }
        },this);

        // Checks by default the adjust checkbox
        Ext.get('o-map-print-main-div').addCls('page-map-adjust');
        Ext.get('o-map-print-options-adjust-checkbox').dom.checked = true; // Doesn't fires the change event

        // Resizes the map on square checkbox change
        Ext.get('o-map-print-options-square-checkbox').on('change', this.resizeMap, this);

        // Resizes the map on window resizing
        Ext.getWin().on('resize', this.resizeMap, this);

        // Prepares the preview on print button click
        Ext.get('o-map-print-tbar-print-button').on('click', function() {
            
            // Updates the comment div with the text area content
            var textareaValue = Ext.get('o-map-print-comment-textarea').dom.value;
            Ext.get('o-map-print-comment-div').dom.innerHTML = (textareaValue !== '') ? textareaValue:'Aucun commentaire.';            

            // Updates the map and scale line screenshot
            // Note: The default navigator screenshot doesn't work well in landscape mode
            this.map.once('postcompose', function(event) {
                var canvas = event.context.canvas;

                // Updates the map screenshot image source
                Ext.get('o-map-print-map-img').dom.src = canvas.toDataURL('image/png');

                // Updates the relative scale line text and width
                var olScaleLine = Ext.get('o-map-print-map-overview').query('.ol-viewport .ol-scale-line-inner',false)[0];
                var relativeScaleLine = Ext.get('o-map-print-map-scale-line-inner').dom;
                relativeScaleLine.style = 'width:' + olScaleLine.getWidth()*100/canvas.width + '%';
                relativeScaleLine.innerHTML = olScaleLine.getHtml();
            },this);

            this.map.renderSync();
            window.print();

        },this);

        // Destroys the print div and teleports the map on cancel button click
        Ext.get('o-map-print-tbar-cancel-button').on('click', function() {
            Ext.getWin().un('orientationchange', this.resizeMap, this);
            this.map.setTarget('o-map');
            Ext.get('o-map-print-main-div').destroy();
        },this);
    }
});