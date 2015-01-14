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
	tbar :[/*{
		xtype: 'button', text: 'New localisation'
	},{
		xtype: 'button', text: 'Edit'
	},{
		xtype: 'button', text: 'Delete'
	},*/{
		xtype: 'button',
		text: 'Export as PDF',
		iconCls: 'genapp-query-details-panel-pdf-export',
		listeners: {
			'click' : function(button){
				button.ownerCt.ownerCt.exportAsPDF();
			}
		}
	}],
	listeners : {
		'render' : function(panel) {
			panel.items.on('remove', function(item) {
				if (this.items.getCount() === 0) {
					this.collapse();
				}
			}, panel);
		}
	},
//	items: [{
//		xtype: 'panel',
//		layout: 'form',
//		items: Ext.create('Ext.Editor', {
//			updateEl: true,
//			items: {
//		        xtype: 'textfield',
//		        labelValue: 'test'
//		    }
//		})
//	}],
	initComponent: function() {
		
//		var resultsGridArray = Ext.ComponentQuery.query('results-grid');
//		var resultsGrid;
//		for (var i = 0 ; i < resultsGridArray.length ; i++) {
//			resultsGrid = resultsGridArray[i];
//			Ext.getCmp('main').on('onEditDataButtonClick', this.openDetails, this);
//		}
		this.callParent(arguments);
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
//			var tab = this.queryById(id);
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