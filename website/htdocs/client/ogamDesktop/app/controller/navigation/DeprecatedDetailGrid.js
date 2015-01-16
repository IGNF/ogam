Ext.define('OgamDesktop.controller.navigation.DeprecatedDetailGrid',{
	extend: 'Ext.app.Controller',
	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers
	 */
	config: {
		refs: {
			'navigationMainWin': 'navigation-mainwin'
		},
		control: {
			'grid-detail-panel': {
				clickIntoDetailGrid: 'showDetails'
			}
		}
	},
	
	/**
	 *Call the openDetails method of navigation main win
	 * 
	 * @param {object}
	 *            selected data
	 *
	 */
	showDetails: function(record) {
		this.getNavigationMainWin().openDetails(record);
	}
});