Ext.namespace('Genapp.map');
/**
 * Display the list of available Vector Layers.
 * 
 * @class Genapp.map.FieldForm
 * @extends Ext.menu.Item
 */
;

Genapp.map.LayerSelector = Ext.extend(Ext.Button, {

	/**
	 * Internationalization.
	 */
	layerSelectorButtonLabel : 'Select layer',

	/**
	 * @cfg {Ext.form.ComboBox} The selection Box
	 */
	selectorBox : null,

	/**
	 * The currently selected vector layer.
	 * 
	 * @property selectedVectorLayer
	 * @type String
	 */
	selectedVectorLayer : null,

	/**
	 * Initialize the component
	 */
	initComponent : function() {

		// Register event used to link the combobox to the button
		Genapp.eventManager.addEvents('selectLayer');

		// Create a selection combobox
		this.selectorBox = {

			xtype : 'combo',
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
			listeners : {
				select : function(combo, value) {
					// Forward the event to the button
					Genapp.eventManager.fireEvent('selectLayer', value);
				}
			},

			valueField : 'code',
			displayField : 'label',
		}

		// The config for the menu item
		var config = {
			text : this.layerSelectorButtonLabel,
			menu : [ this.selectorBox ]
		}

		// apply config
		Ext.apply(this, Ext.apply(this.initialConfig, config));

		// Add events listening
		Genapp.eventManager.on('selectLayer', this.layerSelected, this);

		// call parent init component
		Genapp.map.LayerSelector.superclass.initComponent.apply(this, arguments);
	},

	/**
	 * A layer has been selected
	 */
	layerSelected : function(value) {

		console.log("layerselector layerSelected");

		// Store the selected value
		this.selectedVectorLayer = value.data.code;

		// Change the button title
		this.setText(value.data.label);

	},

	/**
	 * Destroy the component
	 */
	onDestroy : function() {
		Ext.destroy(this.selectorBox);
		Genapp.map.LayerSelector.superclass.onDestroy.call(this);
	}
});

// Register the item
Ext.reg('layerselector', Genapp.map.LayerSelector);