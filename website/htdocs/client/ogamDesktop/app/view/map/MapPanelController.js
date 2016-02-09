/**
 * This class manages the map panel view.
 */
Ext.define('OgamDesktop.view.edition.MapPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mappanel',

	onDrawPointButtonPress : function() {
		var mapCmp = this.lookupReference('mapCmp');
		var features = new ol.Collection();
        draw = new ol.interaction.Draw({
            features: features,
            type: 'Point'
        });
        modify = new ol.interaction.Modify({
            features: features, 
            // the SHIFT key must be pressed to delete vertices, so
            // that new vertices can be drawn at the same position
            // of existing vertices
            deleteCondition: function(event) {
                return ol.events.condition.shiftKeyOnly(event) &&
                    ol.events.condition.singleClick(event);
            }
        });
        mapCmp.getMap().addInteraction(modify);
        mapCmp.getMap().addInteraction(draw);
    }
});