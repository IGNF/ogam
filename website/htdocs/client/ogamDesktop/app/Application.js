/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */
Ext.define('OgamDesktop.Application', {
	extend: 'Ext.app.Application',
	
	name: 'OgamDesktop',
	models: [
		'map.LayerNode',
		'map.Layer',
		'map.LayerService'
	],
	stores: [
		'map.LayerNode',
		'map.Layer',
		'map.LayerService'
	],
	controllers: [
		'map.Layer',
		'map.Legend'
	],
	views: [
		'map.MapPanel'
	],

	launch: function () {
		// TODO - Launch the application
	}
});
