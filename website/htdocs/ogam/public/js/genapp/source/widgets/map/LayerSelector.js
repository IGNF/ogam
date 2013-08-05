/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

Ext.namespace('Genapp.map');
/**
 * Display the list of available Vector Layers.
 * 
 * @class Genapp.map.FieldForm
 * @extends Ext.menu.Item
 */

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
	 * @cfg {String} The identifier of the geopanel. Used to filter the events
	 *      listening.
	 */
	geoPanelId : null,

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
					Genapp.eventManager.fireEvent('selectLayer', value, this.geoPanelId);
				},
				scope : this
			},

			valueField : 'code',
			displayField : 'label'
		};

		// The config for the menu item
		var config = {
			text : this.layerSelectorButtonLabel,
			menu : [ this.selectorBox ]
		};

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
	layerSelected : function(value, geoPanelId) {

		if (geoPanelId == this.geoPanelId) {
			// Store the selected value
			this.selectedVectorLayer = value.data.code;

			// Change the button title
			this.setText(value.data.label);
			
			// Another listerner of this event is in "geopanel"
		}

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