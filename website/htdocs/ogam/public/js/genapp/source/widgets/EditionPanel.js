/**
 * An EditionPanel correspond to the complete page for editing/inserting a table
 * row.
 * 
 * @class Genapp.EditionPanel
 * @extends Ext.Panel
 * @constructor Create a new Edition Panel
 * @param {Object}
 *            config The config object
 * @xtype editionpanel
 */
Genapp.EditionPanel = Ext.extend(Ext.Panel, {

    /**
     * @cfg {String} title The title text to be used as innerHTML (html tags are
     *      accepted) to display in the panel <code>{@link #header}</code>
     *      (defaults to ''). When a <code>title</code> is specified the
     *      <code>{@link #header}</code> element will automatically be created
     *      and displayed unless {@link #header} is explicitly set to
     *      <code>false</code>. If you do not want to specify a
     *      <code>title</code> at config time, but you may want one later, you
     *      must either specify a non-empty <code>title</code> (a blank space ' '
     *      will do) or <code>header:true</code> so that the container element
     *      will get created.
     */
    title : 'Edition',

    /**
     * @cfg {String} cls An optional extra CSS class that will be added to this
     *      component's Element (defaults to 'genapp_edition_panel'). This can
     *      be useful for adding customized styles to the component or any of
     *      its children using standard CSS rules.
     */
    cls : 'genapp_edition_panel',

    /**
     * @cfg {String} id
     *      <p>
     *      The <b>unique</b> id of this component (defaults to an
     *      {@link #getId auto-assigned id}). You should assign an id if you
     *      need to be able to access the component later and you do not have an
     *      object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).
     *      </p>
     *      <p>
     *      Note that this id will also be used as the element id for the
     *      containing HTML element that is rendered to the page for this
     *      component. This allows you to write id-based CSS rules to style the
     *      specific instance of this component uniquely, and also to select
     *      sub-elements using this component's id as the parent.
     *      </p>
     *      <p>
     *      <b>Note</b>: to avoid complications imposed by a unique <tt>id</tt>
     *      also see <code>{@link #itemId}</code> and
     *      <code>{@link #ref}</code>.
     *      </p>
     *      <p>
     *      <b>Note</b>: to access the container of an item see
     *      <code>{@link #ownerCt}</code>.
     *      </p>
     */
    id : 'edition_panel',

    /**
     * @cfg {String} ref
     *      <p>
     *      A path specification, relative to the Component's
     *      <code>{@link #ownerCt}</code> specifying into which ancestor
     *      Container to place a named reference to this Component.
     *      </p>
     *      <p>
     *      Also see the <code>{@link #added}</code> and
     *      <code>{@link #removed}</code> events.
     *      </p>
     */
    ref : 'editionPage',
    padding: 20,
    autoScroll :true,

    // private
    initComponent : function () {
        /**
         * The form fields Data Store.
         * 
         * @property criteriaDS
         * @type Ext.data.JsonStore
         */
        this.formDS = new Ext.data.JsonStore({
            url: Genapp.base_url + 'dataedition/ajaxgeteditform/SCHEMA/RAW_DATA/FORMAT/FICHE_OBSERVATION_DATA/PROVIDER_ID/1/PLOT_CODE/000020/ID_OBSERVATION/1',
            method: 'POST',
            autoLoad: true,
            fields:[
                    {name:'name',mapping:'name'},
                    {name:'data',mapping:'data'},
                    {name:'format',mapping:'format'},
                    {name:'label',mapping:'label'},
                    {name:'inputType',mapping:'inputType'},
                    {name:'unit',mapping:'unit'},
                    {name:'type',mapping:'type'},
                    {name:'subtype',mapping:'subtype'},
                    {name:'definition',mapping:'definition'},
                    {name:'decimals',mapping:'decimals'},     
                    {name:'value',mapping:'value'},     // the current value  
                    {name:'editable',mapping:'editable'},       // is the field editable?
                    {name:'params',mapping:'params'} // reserved for min/max or list of codes
                ],
            idProperty : 'name',
            listeners : {
                'load': {
                    fn : function(store, records, options) {
                         var i, formItems = [];
                         for(i = 0; i<records.length; i++){
                            //alert(records[i].data);
                            //this.getEditFormConfig(records[i].data.id);
                             formItems.push(Genapp.FieldForm.prototype.getCriteriaConfig(records[i].data, true));
                         }
                         this.slipFS.add(formItems);
                         this.slipFS.doLayout();
                        }
                    },
                    scope :this
                }
            
        });

        this.headerPanel = new Ext.BoxComponent({html:this.contentTitle});
        this.messagePanel = new Ext.BoxComponent({html:this.message, cls:'message'});
        this.parentsFS = new Ext.form.FieldSet({
            title: '&nbsp;Parents Summary&nbsp;',
            html:this.parentsLinks
        });
        this.slipFS = new Ext.form.FieldSet({
            url:'save-form.php',
            title: '&nbsp;' + this.dataTitle + '&nbsp;',
            labelWidth: 150,
            defaults: {
                msgTarget: 'side',
                width: 250
            },
            buttonAlign : 'center',
            buttons: [{
                text: 'Supprimer',
                disabled: this.disableDeleteButton,
                tooltip: this.deleteButtonTooltip
            },{
                text: 'Valider'
            }]
        });
        var childrenItems = [];
        for(var i in this.childrenConfigOptions){
            if (typeof this.childrenConfigOptions[i] !== 'function') {
                childrenItems.push(new Ext.form.FieldSet(this.childrenConfigOptions[i]));
            }
        }
        this.childrenFS = new Ext.form.FieldSet({
            title: '&nbsp;Children Summary&nbsp;',
            items:childrenItems
        });
        
        this.items = [this.headerPanel, this.parentsFS, this.slipFS, this.childrenFS];

        Genapp.EditionPanel.superclass.initComponent.call(this);
    }
});

Ext.reg('editionpage', Genapp.EditionPanel);