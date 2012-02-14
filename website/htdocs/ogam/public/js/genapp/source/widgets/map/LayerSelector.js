Ext.namespace('Genapp.map');
/**
 * Display the list of available Vector Layers.
 * 
 * @class Genapp.map.FieldForm
 * @extends Ext.form.Combobox
 */;

Genapp.map.LayerSelector = Ext.extend(Ext.form.ComboBox, {
	
	/**
	 * @cfg {Genapp.GeoPanel} A layer selector is always linked to a geoPanel 
	 */
	geoPanel : null,

	/**
	 * Initialize the component
	 */
	initComponent : function() {

		var config = {
			mode : 'remote',

			triggerAction : 'all',

			store : new Ext.data.JsonStore({
				autoLoad : true,
				root : 'layerNames',
				fields : [ {
					name : 'code',
					mapping : 'code'
				}, {
					name : 'label',
					mapping : 'label'
				} ],
				url : Genapp.base_url + '/map/ajaxgetvectorlayers'
			}),

			valueField : 'code',
			displayField : 'label',

			listeners : {
				select : function(combo, value) {
					// Store the selected value
					this.geoPanel.selectedVectorLayer = value.data.code;
					
					// And change the button title
					this.geoPanel.selectorButton.text = value.data.label;
				}
			}
		}

		// apply config
		Ext.apply(this, Ext.apply(this.initialConfig, config));

		// call parent init component
		Genapp.map.LayerSelector.superclass.initComponent.apply(this, arguments);
	},
	
	/**
	 * Destroy the component
	 */
	onDestroy : function() {
		Ext.destroy(this.geoPanel);
		Genapp.map.LayerSelector.superclass.onDestroy.call(this);
	}
});

// Register the item
Ext.reg('layerselector', Genapp.map.LayerSelector);