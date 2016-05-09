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
		'map.LayerService',
		'request.fieldset.Criterion',
		'request.fieldset.Column',
		'request.object.field.Code'
	],
	stores: [
		'map.LayerNode',
		'map.Layer',
		'map.LayerService',
		'result.Grid'
	],
	controllers: [
		'map.Drawing',
		'map.Layer',
		'map.Main',
		'result.Grid',
		'result.Main',
		'navigation.Main',
		'request.PredefinedRequest'
	],
	views: [
		'main.Main',
		'map.LayersPanel',
		'map.LegendsPanel',
		'map.MainWin',
		'request.AdvancedRequest',
		'request.AdvancedRequestController',
		'request.AdvancedRequestModel',
		'request.MainWin',
		'result.MainWin',
		'result.GridTab',
		'navigation.GridDetailsPanel',
		'navigation.MainWin',
		'navigation.Tab'
	],
	session: true,

	/**
	 * Fonction handling the application launch
	 */
	launch: function () {
		Ext.Loader.loadScript(Ext.manifest.OgamDesktop.requestServiceUrl +'getgridparameters');
	}
});