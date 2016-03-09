Ext.define('OgamDesktop.view.navigation.MainWin', {
	extend: 'Ext.tab.Panel',
	requires: ['Ext.ux.DataView.LabelEditor'],
	xtype: 'navigation-mainwin',
	itemId:'nav',
	title: 'Details',
	titleCollapse : true,
    /**
     * @cfg {String} pdfUrl
     * The url to get the pdf.
     */
    pdfUrl: 'pdfexport',
    //<locale>
    /**
     * @cfg string [exportAsPdfButtonText] button text of the toolbar, export pdf action
     */
    exportAsPdfButtonText: "Exporter en pdf",
    //</locale>

	listeners : {
		'render' : function(panel) {
			panel.items.on('remove', function(item) {
				if (this.items.getCount() === 0) {
					this.collapse();
				}
			}, panel);
		}
	},

	initComponent: function() {
		this.tbar= this.createToolbar();
		this.callParent(arguments);
	},

	/**
	 * build the (top) tool bar 
	 */
	createToolbar :function(){
		return [{
	   		xtype: 'button',
	   		text: this.exportAsPdfButtonText,
	   		iconCls: 'o-navigation-tools-doc-pdfexport',
	   		listeners: {
	   			'click' : function(button){
	   				button.ownerCt.ownerCt.exportAsPDF();
	   			}
	   		}
		}];
	},

	/**
	 * Open the row details
	 * 
	 * @param {String}
	 *            id The details id
	 * @param {String}
	 *            url The url to get the details
	 */
	openDetails : function(record) {
		console.log('this into navigation', this);
		var id = (typeof record == 'string') ? record : record.id;
		if (!Ext.isEmpty(id)) {
			this.expand();
			var tab = Ext.getCmp(id);
			if (Ext.isEmpty(tab)) {
				tab = this.add(Ext.create('OgamDesktop.view.navigation.Tab',{
					rowId : id
				}));
			}
			this.setActiveTab(tab);
		}
	},

    /**
     * Export the details panel as PDF
     */
    exportAsPDF : function(){
        document.location.href =  Ext.manifest.OgamDesktop.requestServiceUrl + this.pdfUrl + '?id=' + this.getActiveTab().rowId;
    }
});