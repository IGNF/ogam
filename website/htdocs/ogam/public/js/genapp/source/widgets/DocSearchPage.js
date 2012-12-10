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
 * A DocSearchPage.
 * 
 * @class Genapp.DocSearchPage
 * @extends Ext.Panel
 * @constructor Create a new DocSearchPage 
 * @param {Object} config The config object
 * @xtype docsearchpage
 */
Genapp.DocSearchPage = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} title
     * The title text to be used as innerHTML (html tags are accepted) to display in the panel
     * <code>{@link #header}</code> (defaults to ''). When a <code>title</code> is specified the
     * <code>{@link #header}</code> element will automatically be created and displayed unless
     * {@link #header} is explicitly set to <code>false</code>.  If you do not want to specify a
     * <code>title</code> at config time, but you may want one later, you must either specify a non-empty
     * <code>title</code> (a blank space ' ' will do) or <code>header:true</code> so that the container
     * element will get created.
     * Default to 'Predefined Request'.
     */
    title: 'Documents',
    /**
     * @cfg {Boolean} frame
     * <code>false</code> by default to render with plain 1px square borders. <code>true</code> to render with
     * 9 elements, complete with custom rounded corners (also see {@link Ext.Element#boxWrap}).
     * @hide
     */
    frame:true,
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'border'.
     */
    layout :'border',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp_consultation_panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-doc-search-page',
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {String} id
     * <p>The <b>unique</b> id of this component (defaults to an {@link #getId auto-assigned id}).
     * You should assign an id if you need to be able to access the component later and you do
     * not have an object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).</p>
     * <p>Note that this id will also be used as the element id for the containing HTML element
     * that is rendered to the page for this component. This allows you to write id-based CSS
     * rules to style the specific instance of this component uniquely, and also to select
     * sub-elements using this component's id as the parent.</p>
     * <p><b>Note</b>: to avoid complications imposed by a unique <tt>id</tt> also see
     * <code>{@link #itemId}</code> and <code>{@link #ref}</code>.</p>
     * <p><b>Note</b>: to access the container of an item see <code>{@link #ownerCt}</code>.</p>
     */
    id:'doc_search_page',
    /**
     * @cfg {String} ref
     * <p>A path specification, relative to the Component's <code>{@link #ownerCt}</code>
     * specifying into which ancestor Container to place a named reference to this Component.</p>
     * <p>The ancestor axis can be traversed by using '/' characters in the path.
     * For example, to put a reference to a Toolbar Button into <i>the Panel which owns the Toolbar</i>:</p><pre><code>
var myGrid = new Ext.grid.EditorGridPanel({
title: 'My EditorGridPanel',
store: myStore,
colModel: myColModel,
tbar: [{
    text: 'Save',
    handler: saveChanges,
    disabled: true,
    ref: '../saveButton'
}],
listeners: {
    afteredit: function() {
//      The button reference is in the GridPanel
        myGrid.saveButton.enable();
    }
}
});
</code></pre>
     * <p>In the code above, if the <code>ref</code> had been <code>'saveButton'</code>
     * the reference would have been placed into the Toolbar. Each '/' in the <code>ref</code>
     * moves up one level from the Component's <code>{@link #ownerCt}</code>.</p>
     * <p>Also see the <code>{@link #added}</code> and <code>{@link #removed}</code> events.</p>
     */
    ref:'docSearchPage',
    /**
     * @cfg {String} alertRequestFailedMsg The alert Request
     *      Failed Msg (defaults to
     *      <tt>'Sorry, the request failed...'</tt>)
     */
    alertRequestFailedMsg : 'Sorry, the request failed...',
    indexKey:'pdfIndex',
    centerPanelTitle: 'Document',

    // private
    initComponent : function() {

        // West Panel
        this.requestPanel = new Genapp.DocSearchRequestPanel({
            indexKey:this.indexKey,
            listeners:{
                'requestResponse':function(hits){
                    this.addResultPanel(hits);
                },
                scope: this
            }
        });

        this.westPanel = new Ext.Panel({
            region:'west',
            layout:'accordion',
            width:'400px',
            items:[
                this.requestPanel
            ]
        });

        // Center Panel
        this.pdf = new Genapp.PDFComponent({
            xtype: 'pdf',
            url: 'pdf'
        });

        this.centerPanel = new Ext.Panel({
            title: this.centerPanelTitle,
            region: 'center',
            frame: true,
            margins:{
                top: 0,
                right: 0,
                bottom: 0,
                left: 5
            },
            items: this.pdf
        });

        if (!this.items) {
            this.items = [this.westPanel, this.centerPanel];
        }

        Genapp.ConsultationPanel.superclass.initComponent.call(this);
    },

    addResultPanel: function(hits) {
        if(!Ext.isEmpty(this.resultPanel)){
            this.resultPanel.destroy();
        }
        this.resultPanel = new Genapp.DocSearchResultPanel({
            'hits': hits,
            'listeners':{
                'rowselect': function(data){
                    this.pdf.reset();
                },
                'pdfselect': function(data){
                    this.pdf.updateUrl(Genapp.base_url + data.url);
                },
                scope:this
            }
        });
        this.westPanel.add(this.resultPanel);
        this.westPanel.doLayout();
        this.resultPanel.expand();
    }
});
Ext.reg('docsearchpage', Genapp.DocSearchPage);