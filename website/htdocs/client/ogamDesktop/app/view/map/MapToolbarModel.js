/**
 * This class is the ViewModel for the advanced request view.
 * 
 * TODO: Refactor this code for the next version
 * @deprecated
 */
Ext.define('OgamDesktop.view.map.MapToolbarModel', {
    extend: 'Ext.app.ViewModel',
    requires: [
        'OgamDesktop.store.map.VectorLayer'
    ],

    // This enables "viewModel: { type: 'advancedrequest' }" in the view:
    alias: 'viewmodel.maptoolbar',

    stores: {
    	/**
         * @property {OgamDesktop.store.map.VectorLayer} vectorLayerStore The vector layer store
         */
        vectorLayerStore: {
        	storeId:'vectorLayerStore', // Required by the ViewController for listening
    		xclass: 'OgamDesktop.store.map.VectorLayer',
    		autoLoad : true
    	}
    }
});