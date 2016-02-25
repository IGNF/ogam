/**
 * This class defines the controller with actions related to 
 * map main view.
 */
Ext.define('OgamDesktop.controller.map.Main',{
	extend: 'OgamDesktop.controller.AbstractWin',
	requires: [
		'Ext.grid.column.Number'
	],

	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers of the
	 * MapPanel.
	 */
	config: {
		refs: {
			mappanel: '#map-panel'
		},		
		control: {
			'deprecated-detail-grid': {
				beforedetailsgridrowenter: 'setResultStateToSelected',
				beforedetailsgridrowleave: 'setResultStateToDefault'
			}
		}
	},

	setResultStateToSelected: function(record) {
		this.getMappanel().highlightObject(record);
	},

	setResultStateToDefault: function(record) {
		this.getMappanel().showObjectInDefaultStyle(record);
	}
});