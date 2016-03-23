/**
 * This class manages the legends panel view.
 */
Ext.define('OgamDesktop.view.map.LegendsPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.legendspanel',

    control: {
        'legends-panel': {
            onReadyToBuildLegend: 'buildLegend'
        }
    },

    /**
     * Build a Legend Object from a 'Layer' store record.
     * @param {Object}
     *            curRes The map current resolution
     * @param {OgamDesktop.model.map.Layer}
     *            layerObject The 'Layer' store record
     * @param {Object}
     *            serviceObject The 'LayerService' store record for the legend
     *            corresponding to the layer
     * @return OpenLayers.Layer
     */
    buildLegend : function(curRes, layer, service) {
        var legend = this.getView()
            .add(new Ext.Component({
                // Extjs 5 doesn't accept '.' into ids
                id : this.getView().id + layer.get('name').replace(/\./g,'-'),
                autoEl : {
                    tag : 'div',
                    children : [{
                        tag : 'span',
                        html : layer.get('options').label,
                        cls : 'x-form-item x-form-item-label'
                    },{
                        tag : 'img',
                        src : service.get('config').urls.toString()
                        + 'LAYER='+ layer.get('params').layers
                        + '&SERVICE=' + service.get('config').params.SERVICE+ '&VERSION=' + service.get('config').params.VERSION + '&REQUEST=' + service.get('config').params.REQUEST
                        + '&Format=image/png&WIDTH=160&HASSLD=' + (layer.get('params').hasSLD ? 'true' : 'false')
                    }]
                }
            }));
        var outOfRange;
        var resolutions = layer.get('options').resolutions;
        if (resolutions) {
            var minResolution = resolutions[resolutions.length - 1]; maxResolution = resolutions[0];
            if (curRes < minResolution || curRes >= maxResolution) { 
                outOfRange = true;
            }
        }
        if (layer.get('params').isDisabled || layer.get('params').isHidden || !layer.get('params').isChecked || outOfRange) {
            legend.on('render', function(cmp) {
                cmp.hide();
            });
        }
    },

    /**
     * Convenience function to hide or show a legend by boolean.
     * 
     * @param {Array}
     *            layers The layers
     * @param {Boolean}
     *            visible True to show, false to hide
     */
    setLegendsVisible : function(layers, visible) {

        // The tabPanels must be activated before to show a child component
        var mapAddonsPanel = this.getView().up('tabpanel');
        var activatedCard = mapAddonsPanel.getActiveTab();
        mapAddonsPanel.setActiveItem(this.getView());

        for (var i in layers) {
            var layerName = layers[i].get('name');
            var legendCmp = this.getView().getComponent(this.getView().id + layerName);
            if (!Ext.isEmpty(legendCmp)) {
                if (visible === true) {
                    if (layers[i] && !layers[i].isLayerGroup) {
                        if (layers[i].getVisible()){
                            legendCmp.show();
                        } else {
                            legendCmp.hide();
                        }
                    }
                } else {
                    legendCmp.hide();
                }
            }
        }
        // Keep the current activated panel activated
        mapAddonsPanel.setActiveTab(activatedCard);
    }
});