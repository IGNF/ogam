Ext.define('OgamDesktop.view.result.MainWin', {
	extend: 'Ext.panel.Panel',
	requires: [
		'Ext.button.Split'
	],
	xtype: 'result-mainwin',
	title: 'Results',
	layout: 'border',

	/**
	 * @cfg {Boolean} hideExportButton if true hide the
	 *      export button (defaults to false).
	 */
	hideGridCsvExportMenuItem: false,
	hideGridKmlExportMenuItem: false,
	hideGridGeoJSONExportMenuItem: false,

	/**
	 * @cfg {String} exportButtonText The csv Export Button Text
	 *      (defaults to <tt>'Export'</tt>)
	 */
	exportButtonText : 'Export',
	/**
	 * @cfg {String} csvExportMenuItemText The grid Csv Export
	 *      Menu Item Text (defaults to <tt>'Export CSV'</tt>)
	 */
	csvExportMenuItemText: 'Export CSV',
	kmlExportMenuItemText: 'Export KML',
	geojsonExportMenuItemText: 'Export GeoJSON',
	
	/**
	 * @cfg {Boolean} hideCsvExportAlert if true hide the csv
	 *      export alert for IE (defaults to true).
	 */
	hideCsvExportAlert : false,
	/**
	 * @cfg {String} csvExportAlertTitle The export CSV alert
	 *      title (defaults to <tt>'CSV exportation on IE'</tt>)
	 */
	csvExportAlertTitle : 'CSV exportation on IE',
	/**
	 * @cfg {String} csvExportAlertMsg The export CSV alert
	 *      message (defaults to
	 *      <tt>'On IE you have to:<br> - Change the opening of a csv file.<br> - Change the security.'</tt>)
	 */
	csvExportAlertMsg : "<div><H2>For your comfort on Internet Explorer you can:</H2> \
		<H3>Disable confirmation for file downloads.</H3> \
		<ul> \
		<li>In IE, expand the 'Tools' menu</li> \
		<li>Click on 'Internet Options'</li> \
		<li>Click on the 'Security' tab</li> \
		<li>Click on 'Custom Level'</li> \
		<li>Scroll down to the 'Downloads' part</li> \
		<li>Enable the confirmation for file download </li> \
		</ul> \
		<H3>Disable the file opening in the current window.</H3> \
		<ul> \
		<li>Open the workstation</li> \
		<li>Expand the 'Tools' menu</li> \
		<li>Click on 'Folder Options ...'</li> \
		<li>Click on the 'File Types' tab</li> \
		<li>Select the XLS extension</li> \
		<li>Click on the 'Advanced' button</li> \
		<li>Uncheck 'Browse in same window'</li> \
		</ul></div>",
		
		/**
		 * @cfg {String} maskMsg The Mask Msg (defaults to
		 *      <tt>'Loading...'</tt>)
		 */
		maskMsg : "Loading...",
		
	items: [{
		xtype: 'results-grid',
		region : 'center'
	}],

	initComponent: function() {
		// Init the Toolbar
		this.tbar = this.initToolbar();
		
		this.callParent(arguments);
	},

	/**
	 * Initialize the results grid toolbar
	 * 
	 * @hide
	 */
	initToolbar: function() {
		// Creation of the toolbar
		tbar = Ext.create('Ext.toolbar.Toolbar');
		tbar.add(Ext.create('Ext.toolbar.Spacer',{flex: 1}));
		
		// Add the export button
		var csvExportMenuItems = [];
		if (!this.hideGridCsvExportMenuItem) {
			csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
				text : this.csvExportMenuItemText,
				handler: function() {
					this.fireEvent('exportresults', 'csv-export');
				},
				scope: this,
				iconCls: 'o-result-tools-doc-csvexport'
			}));
			if (!this.hideGridKmlExportMenuItem) {
				csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
					text : this.kmlExportMenuItemText,
					handler: function() {
						this.fireEvent('exportresults', 'kml-export');
					},
					scope: this,
					iconCls: 'o-result-tools-doc-kmlexport'
				}));
			}
			if (!this.hideGridGeoJSONExportMenuItem) {
				csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
					text : this.geojsonExportMenuItemText,
					handler: function() {
						this.fireEvent('exportresults', 'geojson-export');
					},
					scope: this,
					iconCls: 'o-result-tools-doc-geojsonexport'
				}));
			}
		}
		// Hide the csv export button if there are no menu
		// items
		if (Ext.isEmpty(csvExportMenuItems)) {
			this.hideExportButton = true;
		}
		if (!this.hideExportButton) {
			this.exportButton = Ext.create('Ext.button.Split',{
				text : this.exportButtonText,
				disabled : true,
				handler: function() {
					this.fireEvent('exportresults', 'csv-export');
				},
				scope: this,
				menu : this.csvExportButtonMenu = new Ext.menu.Menu({
					items : csvExportMenuItems
				})
			});
		}
		tbar.add(this.exportButton);
		return tbar;
	}
});