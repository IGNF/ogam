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
Genapp.DetailsPanel = Ext.extend(Ext.Panel, {
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
    cls:'genapp-query-details-panel',
    /**
     * @cfg {String} hideSeeChildrenButton
     * True to hide the see children button (defaults to <tt>false</tt>)
     */
    hideSeeChildrenButton: false,
    /**
     * @cfg {String} seeChildrenButtonTitle
     * The see Children Button Title (defaults to <tt>'Display the children'</tt>)
     */
    seeChildrenButtonTitle: 'Display the children',
    /**
     * @cfg {String} seeChildrenButtonTip
     * The see Children Button Tip (defaults to <tt>'Display the children of the data into the grid details panel.'</tt>)
     */
    seeChildrenButtonTip: 'Display the children of the data into the grid details panel.',
    /**
     * @cfg {String} seeChildrenTextSingular
     * The see Children Text Singular (defaults to <tt>'&gt;&gt;&gt; See the only child'</tt>)
     */
    seeChildrenTextSingular: '&gt;&gt;&gt; See the only child',
    /**
     * @cfg {String} seeChildrenTextPlural
     * The see Children Text Plural (defaults to <tt>'&gt;&gt;&gt; See the {children_count} children'</tt>)
     */
    seeChildrenTextPlural: '&gt;&gt;&gt; See the {children_count} children',
    /**
     * @cfg {Number} tipDefaultWidth
     * The tip Default Width. (Default to 300)
     */
    tipDefaultWidth: 300,
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',

    // private
    initComponent : function() {
        this.title = '<div style="width:'+ this.headerWidth + 'px;">'+this.loadingMsg+'</div>';
        this.on('render', this.updateDetails, this);
        this.itemId = this.rowId;
        /**
         * @cfg {Ext.XTemplate} tpl
         * A {@link Ext.XTemplate} used to setup the details panel body.
         */
        this.tpl = new Ext.XTemplate(
            '<tpl for="maps">',
                '<img title="{title}" src="{url}">',
            '</tpl>',
            '<tpl for="formats">',
                '<fieldset>',
                    '<legend align="top"> {title} </legend>',
                    '<tpl for="fields">',
                        '<p><b>{label} :</b> {[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? "-" : values.value]}</p>',
                    '</tpl>',
                    '<tpl if="!'+ this.hideSeeChildrenButton +'">',
                        '<div class="genapp-query-details-panel-see-children" ',
                            'onclick="Genapp.cardPanel.consultationPage.displayChildren(\'{id}\');"',
                            'ext:qtitle="' + this.seeChildrenButtonTitle + '" ',
                            'ext:qwidth="' + this.tipDefaultWidth + '" ',
                            'ext:qtip="' + this.seeChildrenButtonTip + '">',
                                '<tpl if="children_count == 1">',
                                    this.seeChildrenTextSingular,
                                '</tpl>',
                                '<tpl if="children_count &gt; 1">',
                                    this.seeChildrenTextPlural,
                                '</tpl>',
                        '</div>',
                    '</tpl>',
                '</fieldset>',
            '</tpl>',
            {
                compiled: true,      // compile immediately
                disableFormats: true // reduce apply time since no formatting
            }
        );

        Genapp.DetailsPanel.superclass.initComponent.call(this);
    },

    /**
     * Updates the Details panel body
     * 
     * @param {Ext.Panel} panel The details panel
     */
    updateDetails : function(panel) {
        this.getUpdater().showLoading();
        Ext.Ajax.request({
            url : Genapp.ajax_query_url + this.dataUrl,
            success :function(response, options){
                var details = Ext.decode(response.responseText);
                this.setTitle('<div style="width:'+ this.headerWidth + 'px;">'+details.title+'</div>');
                this.tpl.overwrite(this.body, details);
            },
            method: 'POST',
            params : {id : this.rowId},
            scope :this
        });
    }
});