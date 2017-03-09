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
 * @class OgamDesktop.view.navigation.Tab
 * @extends Ext.Panel
 * @constructor Create a new navigation Tab
 * @param {Object} config The config object
 */
Ext.define('OgamDesktop.view.navigation.Tab', {
    xtype: 'navigation-tab',
    extend: 'Ext.panel.Panel',
    layout: 'card',

    /*
     * Internationalization.
     */ 
    editLinkButtonTitle : 'Edit this data',
    editLinkButtonTip : 'Edit this data in the edition page.',
    linkFieldDefaultText : 'Consult',
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
     * @cfg {Number} titleCharsMaxLength
     * The title Chars Max Length. (Default to 8)
     */
    titleCharsMaxLength : 8,
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',

    /**
     * Initializes the component.
     * @private
     */
    initComponent : function() {
        
        this.title = '<div style="width:'+ this.headerWidth + 'px;">'+this.loadingMsg+'</div>';
        this.on('render', this.updateDetails, this);
        this.itemId = this.rowId;

        /**
         * @cfg {Ext.XTemplate} tpl
         * A {@link Ext.XTemplate} used to setup the details panel body.
         */

        this.tpl = new Ext.XTemplate(
            '<div>', // Required by the print function
                '<h2 class="o-navigation-title">{title}</h2>',
                '<div class="o-navigation-map-table">',
                    '<div class="o-navigation-map-left-col">',
                        '<div class="o-navigation-map-img">',
                            '<tpl for="maps1.urls">',
                                '<img src="{url}">',
                            '</tpl>',
                        '</div>',
                    '</div>',
                    '<div class="o-navigation-map-intercol"></div>',
                    '<div class="o-navigation-map-right-col">',
                        '<div class="o-navigation-map-img">',
                            '<tpl for="maps2.urls">',
                                '<img src="{url}">',
                            '</tpl>',
                        '</div>',
                    '</div>',
                '</div>',
                '<tpl for="formats">',
                    '<div class="o-navigation-fieldset">',
                        '<div class="o-navigation-fieldset-title">',
                            '<tpl if="xindex &lt; xcount">',
                                '<tpl if="!Ext.isEmpty(editURL)">',
                                    '<div class="o-navigation-fieldset-title-link" onclick="Ext.ComponentQuery.query(\'navigation-mainwin\')[0].openDetails(\'{editURL}\');"></div>',
                                '</tpl>',
                            '</tpl>',
                            '<span>{title}</span>',
                        '</div>',
                            '<tpl for="fields">',
                                '<tpl switch="inputType">',
                                    '<tpl case="CHECKBOX">',
                                        '<span><b>{label} :</b> {[this.convertBoolean(values)]}</span>',
                                    '<tpl case="IMAGE">',
                                        '{[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? \'\' : \'<img title=\"\' + values.label + \'\" src=\"' + window.location.origin + '/img/photos/\' + values.value + \'\">\']}',
                                    '<tpl default>',
                                        '<tpl if="type ==\'STRING\' && subtype==\'LINK\' && value.length &gt; 0">',
                                            '<span><b>{label} :</b> <a class="external" href="{value}" target="_blank"><span>' + this.linkFieldDefaultText + '</span></a></span>',
                                        '<tpl else>',
                                            '<span><b>{label} :</b> {[(Ext.isEmpty(values.valueLabel) || (Ext.isEmpty(values.valueLabel.toString().trim()))) ? "-" : values.valueLabel.toString()]}</span>',
                                        '</tpl>',
                                '</tpl>',
                            '</tpl>',
                    '</div>',
                '</tpl>',
                '<tpl if="this.hasChildren(values)">',
                    '<tpl for="children">',
                        '<div class="o-navigation-fieldset">',
                        '<div  class="o-navigation-fieldset-title">{title}</div>',
                        '<div>',
                            '<tpl for="data">',
                                '<div class="o-navigation-childfieldset-row">',
                                    '<div class="o-navigation-childfieldset-leftcolumn" data-qtip="{1}" onclick="Ext.ComponentQuery.query(\'navigation-mainwin\')[0].openDetails(\'{0}\');"></div>',// OGAM-614 - TODO: Throw an event
                                    '<div class="o-navigation-childfieldset-rightcolumn">{1}</div>',
                                '</div>',
    //                            '<tpl if="type == \'IMAGE\'">', 
    //                                '{[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? \'\' : \'<img title=\"\' + values.label + \'\" src=\"' + window.location.origin + '/img/photos/\' + values.value + \'\">\']}',
    //                            '</tpl>',
                            '</tpl>',
                        '</div>',
                    '</div>',
                    '</tpl>',
                '</tpl>',
            '</div>',
            {
                compiled: true, // compile immediately
                disableFormats: true, // reduce apply time since no formatting
                convertBoolean: function(values){
                    switch(OgamDesktop.ux.data.field.Factory.buildCheckboxFieldConfig(values).convert(values.value)){
                        case false: return OgamDesktop.ux.grid.column.Factory.gridColumnFalseText;
                        case true: return OgamDesktop.ux.grid.column.Factory.gridColumnTrueText;
                        default: return OgamDesktop.ux.grid.column.Factory.gridColumnUndefinedText;
                    }
                },
                hasChildren: function(values){
                    return !Ext.isEmpty(values.children) && values.children.length != 0;
                }
            }
        );

       this.callParent(arguments);
    },

    /**
     * Updates the Details panel body.
     */
    updateDetails : function() {
        Ext.Ajax.request({
            url: Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetdetails',
            actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
            success :function(response, options){
                var data = Ext.decode(response.responseText).data;
                var title = data.title;
                if(data.title.length > this.titleCharsMaxLength){
                    title = data.title.substring(0,this.titleCharsMaxLength) + '...';
                }
                this.setTitle('<div style="width:'+ this.headerWidth + 'px;"'
                    +' ext:qtip="' + data.title + '"'
                    +'>'+title+'</div>');
                this.tpl.overwrite(this.body, data);
            },
            method: 'POST',
            params : {id : this.rowId},
            scope :this
        });
    }
});