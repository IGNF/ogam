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
 * The class of the details panel.
 * This class is required because the panel class
 * can't be closed but the panel extended class can.
 * 
 * @class Genapp.DetailsPanel
 * @extends Ext.Panel
 * @constructor Create a new DetailsPanel
 * @param {Object} config The config object
 */
Ext.define('OgamDesktop.view.navigation.Tab', {
	xtype: 'navigation-tab',
	extend: 'Ext.panel.Panel',
	layout: 'card',
    /**
     * Internationalization.
     */ 
    editLinkButtonTitle : 'Edit this data',
    editLinkButtonTip : 'Edit this data in the edition page.',
    /**
     * @cfg {Number} headerWidth
     * The tab header width. (Default to 60)
     */
    headerWidth:60,
    /**
     * @cfg {Boolean} closable
     * Panels themselves do not directly support being closed, but some Panel subclasses do (like
     * {@link Ext.Window}) or a Panel Class within an {@link Ext.TabPanel}.  Specify true
     * to enable closing in such situations. Defaults to true.
     */
    closable: true,
    /**
     * @cfg {Boolean} autoScroll
     * true to use overflow:'auto' on the panel's body element and show scroll bars automatically when
     * necessary, false to clip any overflowing content (defaults to true).
     */
    autoScroll:true,
    /**
     * @cfg {String} dataUrl
     * The url to get the details.
     */
    dataUrl:null,
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-details-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
//    cls:'genapp-query-details-panel',
    /**
     * @cfg {String} hideSeeChildrenButton
     * True to hide the see children button (defaults to <tt>false</tt>)
     */
    hideSeeChildrenButton: false,
    /**
     * @cfg {String} seeChildrenButtonTip
     * The see Children Button Tip (defaults to <tt>'Display the children of the data into the grid details panel.'</tt>)
     */
    seeChildrenButtonTip: 'Display the children of the data into the grid details panel.',
    /**
     * @cfg {String} seeChildrenButtonTitleSingular
     * The see Children Button Title Singular (defaults to <tt>'See the only child'</tt>)
     */
    seeChildrenButtonTitleSingular: 'See the only child',
    /**
     * @cfg {String} seeChildrenButtonTitlePlural
     * The see Children Button Title Plural (defaults to <tt>'See the children'</tt>)
     */
    seeChildrenButtonTitlePlural: 'See the children',
    /**
     * @cfg {Number} tipDefaultWidth
     * The tip Default Width. (Default to 300)
     */
    tipDefaultWidth: 300,
    /**
     * @cfg {Number} titleCharsMaxLength
     * The title Chars Max Length. (Default to 8)
     */
    titleCharsMaxLength : 8,
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',

    initComponent : function() {
    	
        this.title = '<div style="width:'+ this.headerWidth + 'px;">'+this.loadingMsg+'</div>';
        this.on('render', this.updateDetails, this);
        this.itemId = this.rowId;
        /**
         * @cfg {Ext.XTemplate} tpl
         * A {@link Ext.XTemplate} used to setup the details panel body.
         */

        this.tpl = new Ext.XTemplate(
			'<legends style="display:block; position:absolute; left:1px; top:621px">',
//			'<legends style="display:block; position:absolute; left:1px; top:1px">',
				'<tpl for="formats">',
					'<fieldset class="o-navigation-fieldset">',
						'<legend>',
							'<div>{title}</div>',
						'</legend>',
						'<div class="genapp-query-details-panel-fieldset-body">',
							'<tpl for="fields">',
						        '<tpl switch="inputType">',
						            '<tpl case="CHECKBOX">',
						            	'<p><b>{label} :</b> {[this.convertBoolean(values)]}</p>',
						            '<tpl case="IMAGE">',
//										'{[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? \'\' : \'<img class=\"genapp-query-details-image-field\" title=\"\' + values.label + \'\" src=\"' + Genapp.base_url + '/img/photos/\' + values.value + \'\">\']}',
						            '<tpl default>',
						            	'<p><b>{label} :</b> {[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? "-" : values.value]}</p>',
						        '</tpl>',
							'</tpl>',
						'</div>',
					'</fieldset>',
				'</tpl>',
				'<tpl if="children.length != 0">',
				'<tpl for="children">',
					'<fieldset class="o-navigation-fieldset">',
					'<legend>',
						'<div>Children : {title}</div>',
					'</legend>',
					'<div class="o-navigation-childfieldset-table">',
						'<tpl for="data">',
							'<div class="o-navigation-childfieldset-tablerow">',
								'<div class="o-navigation-childfieldset-leftcolumn" onclick="Ext.ComponentQuery.query(\'navigation-mainwin\')[0].openDetails(\'{0}\');"></div>',//TODO: Throw an event
								'<div class="o-navigation-childfieldset-rightcolumn">{1}</div>',
							'</div>',
//							'<tpl if="type == \'IMAGE\'">', 
//								'{[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? \'\' : \'<img class=\"genapp-query-details-image-field\" title=\"\' + values.label + \'\" src=\"' + Genapp.base_url + '/img/photos/\' + values.value + \'\">\']}',
//							'</tpl>',
						'</tpl>',
					'</div>',
				'</fieldset>',
				'</tpl>',
				'</tpl>',
            '</legends>',
          '<tpl style="display:block" for="maps1.urls">',
        	'<img style="display:block; position:absolute; left:1px; top:1px" title="title" src="{url}">',
        '</tpl>',
        '<tpl for="maps2.urls">',
        	'<img style="display:block; position:absolute; left:1px; top:311px" title="title" src="{url}">',
        '</tpl>',
            {
                compiled: true,      // compile immediately
                disableFormats: true, // reduce apply time since no formatting
                convertBoolean: function(values){
                	switch(OgamDesktop.ux.data.field.Factory.buildCheckboxFieldConfig(values).convert(values.value)){
						case false: return OgamDesktop.ux.grid.column.Factory.gridColumnFalseText;
						case true: return OgamDesktop.ux.grid.column.Factory.gridColumnTrueText;
						default: return OgamDesktop.ux.grid.column.Factory.gridColumnUndefinedText;
                	}
                }
            }
        );

       this.callParent(arguments);
    },

    /**
     * Updates the Details panel body
     * 
     * @param {Ext.Panel} panel The details panel
     */
    
    updateDetails : function(panel) {
//        this.getUpdater().showLoading();
        console.log('rowId', this.rowId);
        Ext.Ajax.request({
        	url: Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetdetails',
			actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
            success :function(response, options){
                var details = Ext.decode(response.responseText);
                console.log('details : ', details);
                var title = details.title;
                if(details.title.length > this.titleCharsMaxLength){
                    title = details.title.substring(0,this.titleCharsMaxLength) + '...';
                }
                this.setTitle('<div style="width:'+ this.headerWidth + 'px;"'
                    +' ext:qtip="' + details.title + '"'
                    +'>'+title+'</div>');
                this.tpl.overwrite(this.body, details);
            },
            method: 'POST',
            params : {id : this.rowId},
            scope :this
        });
    }
});