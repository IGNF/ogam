
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

	/**
	 * The class of the Card Grid Details Panel.
	 * 
	 * @class Genapp.CardGridDetailsPanel
	 * @extends Ext.Panel
	 * @constructor Create a new CardGridDetailsPanel
	 * @param {Object} config The config object
	 */
	Ext.define('OgamDesktop.view.navigation.DeprecatedDetailGrid', {
	
		extend: 'Ext.tab.Panel',
		
		xtype: 'deprecated-detail-grid',
	    /**
	     * @cfg {Number} headerWidth
	     * The tab header width. (Default to 60)
	     */
	    headerWidth:95,
	    title: 'Features Information',
	    /**
	     * @cfg {Boolean} autoScroll
	     * true to use overflow:'auto' on the panel's body element and show scroll bars automatically when
	     * necessary, false to clip any overflowing content (defaults to true).
	     */
	    autoScroll:true,
	    /**
	     * @cfg {String} cls
	     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-grid-details-panel').
	     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
	     */
	    cls:'genapp-query-card-grid-details-panel',
	    /**
	     * @cfg {String} loadingMsg
	     * The loading message (defaults to <tt>'Loading...'</tt>)
	     */
	    loadingMsg: 'Loading...',
	    header: true,
	    layout: 'card',
	    listeners : {
			'render' : function(panel) {
				panel.items.on('remove', function(item) {
					if (this.items.getCount() === 0) {
						this.collapse();
					}
				}, panel);
			}
	    },
	    /**
	     * @cfg {String} gridDetailsPanelTitle
	     * The grid Details Panel Title (default to 'Locations')
	     */
	    cardGridDetailsPanelTitle: 'Selection',
	    activeItem: 0, // make sure the active item is set on the container config!

	    // private
//	    initComponent : function() {
	    	
//	            this.itemId = this.initConf.id;

//	            this.title = '<div style="width:'+ this.headerWidth + 'px;">'
//	            + this.cardGridDetailsPanelTitle + ' ' + this.initConf.featuresInformationSearchNumber
//	            + '</div>';

//	            this.items = new Genapp.GridDetailsPanel({
//	                initConf:this.initConf
//	            });

//	        this.callParent(arguments);
//	    }
	});