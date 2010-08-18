/**
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Genapp.ConsultationPanel
 * @extends Ext.Panel
 * @constructor Create a new Consultation Panel
 * @param {Object} config The config object
 * @xtype consultationpanel
 */
Genapp.ConsultationPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} region 
     * Note: this config is only used when this BoxComponent is rendered
     * by a Container which has been configured to use the {@link Ext.layout.BorderLayout BorderLayout}
     * layout manager (eg. specifying layout:'border').
     * See {@link Ext.layout.BorderLayout} also.
     * Set by default to 'center'.
     */
    region :'center',
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
    cls:'genapp_consultation_panel',
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {String} id
     * <p>The <b>unique</b> id of this component (defaults to 'consultation_panel').
     * You should assign an id if you need to be able to access the component later and you do
     * not have an object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).</p>
     * <p>Note that this id will also be used as the element id for the containing HTML element
     * that is rendered to the page for this component. This allows you to write id-based CSS
     * rules to style the specific instance of this component uniquely, and also to select
     * sub-elements using this component's id as the parent.</p>
     * <p><b>Note</b>: to avoid complications imposed by a unique <tt>id</tt> see <tt>{@link #itemId}</tt>.</p>
     * <p><b>Note</b>: to access the container of an item see <tt>{@link #ownerCt}</tt>.</p>
     */
    id:'consultation_panel',
    /**
     * @cfg {String} localeCls
     * The locale css class (defaults to <tt>''</tt>).
     */
    localeCls :'',
    /**
     * @cfg {Boolean} hideCsvExportAlert
     * if true hide the csv export alert for IE (defaults to true).
     */
    hideCsvExportAlert:false,
    /**
     * @cfg {Boolean} hideCsvExportButton
     * if true hide the csv export button (defaults to false).
     */
    hideCsvExportButton : false,
    /**
     * @cfg {Boolean} hideGridCsvExportMenuItem
     * if true hide the grid csv export menu item (defaults to false).
     */
    hideGridCsvExportMenuItem : false,
    /**
     * @cfg {Boolean} hideAggregationCsvExportMenuItem
     * if true hide the aggregation csv export menu item (defaults to false).
     */
    hideAggregationCsvExportMenuItem : false,
    /**
     * @cfg {Boolean} hideInterpolationButton
     * if true hide the interpolation button (defaults to false).
     */
    hideInterpolationButton : false,
    /**
     * @cfg {Boolean} hideAggregationButton
     * if true hide the aggregation button (defaults to false).
     */
    hideAggregationButton : false,
    /**
     * @cfg {Boolean} hideDetails
     * if true hide the details button in the result panel (defaults to false).
     */
    hideDetails : false,
    /**
     * @cfg {Boolean} hideMapDetails
     * if true hide the details button in map toolbar (defaults to false).
     */
    hideMapDetails : true,
    /**
     * @cfg {Boolean} hideUserManualLink
     * if true hide the user manual link (defaults to true).
     */
    hideUserManualLink : true,
    /**
     * @cfg {Boolean} hidePredefinedRequestButton
     * if true hide the predefined request button (defaults to true).
     */
    hidePredefinedRequestButton : true,
    /**
     * @cfg {String} userManualLinkHref
     * The user Manual Link Href (defaults to <tt>'Genapp.base_url + 'pdf/User_Manual.pdf''</tt>)
     */
    userManualLinkHref : Genapp.base_url + 'pdf/User_Manual.pdf',
    /**
     * @cfg {String} userManualLinkText
     * The user Manual LinkText (defaults to <tt>'User Manual'</tt>)
     */
    userManualLinkText : 'User Manual',
    /**
     * @cfg {Boolean} hideDetailsVerticalLabel
     * if true hide the details vertical label (defaults to false).
     */
    hideDetailsVerticalLabel: false,
    /**
     * @cfg {Boolean} showGridOnSubmit if true activate the Grid Panel
     * on the form submit (defaults to false).
     */
    showGridOnSubmit: false,
    /**
     * @cfg {String} datasetComboBoxEmptyText
     * The dataset Combo Box Empty Text (defaults to <tt>'Please select a dataset'</tt>)
     */
    datasetComboBoxEmptyText :"Please select a dataset...",
    /**
     * @cfg {String} datasetPanelTitle
     * The dataset Panel Title (defaults to <tt>'Dataset'</tt>)
     */
    datasetPanelTitle :'Dataset',
    /**
     * @cfg {String} formsPanelTitle
     * The forms Panel Title (defaults to <tt>'Forms Panel'</tt>)
     */
    formsPanelTitle :'Forms Panel',
    /**
     * @cfg {String} csvExportButtonText
     * The csv Export Button Text (defaults to <tt>'Export CSV'</tt>)
     */
    csvExportButtonText: 'Csv Export',
    /**
     * @cfg {String} gridCsvExportMenuItemText
     * The grid Csv Export Menu Item Text (defaults to <tt>'Results'</tt>)
     */
    gridCsvExportMenuItemText : 'Results',
    /**
     * @cfg {String} aggregationCsvExportMenuItemText
     * The aggregation Csv Export Menu Item Text (defaults to <tt>'Aggregation cells'</tt>)
     */
    aggregationCsvExportMenuItemText : 'Aggregation cells',
    /**
     * @cfg {String} interpolationButtonText
     * The interpolation Button Text (defaults to <tt>'Interpolation'</tt>)
     */
    interpolationButtonText: 'Interpolation',
    /**
     * @cfg {String} aggregationButtonText
     * The aggregation Button Text (defaults to <tt>'Aggregation'</tt>)
     */
    aggregationButtonText: 'Aggregation',
    /**
     * @cfg {String} gridViewEmptyText
     * The grid View Empty Text (defaults to <tt>'No result...'</tt>)
     */
    gridViewEmptyText : 'No result...',
    /**
     * @cfg {String} gridPanelTitle
     * The grid Panel Title (defaults to <tt>'Results'</tt>)
     */
    gridPanelTitle :'Results',
    /**
     * @cfg {String} gridPanelTabTip
     * The grid Panel Tab Tip (defaults to <tt>'The request's results'</tt>)
     */
    gridPanelTabTip:'The request\'s results',
    /**
     * @cfg {String} centerPanelTitle
     * The center Panel Title (defaults to <tt>'Result Panel'</tt>)
     */
    centerPanelTitle:'Result Panel',
    /**
     * @cfg {String} queryPanelTitle
     * The query Panel Title (defaults to <tt>'Query Panel'</tt>)
     */
    queryPanelTitle: "Query Panel",
    /**
     * @cfg {String} queryPanelPinToolQtip
     * The query Panel Pin Tool Qtip (defaults to <tt>'Pin the panel'</tt>)
     */
    queryPanelPinToolQtip: 'Pin the panel',
    /**
     * @cfg {String} queryPanelUnpinToolQtip
     * The query Panel Unpin Tool Qtip (defaults to <tt>'Unpin the panel'</tt>)
     */
    queryPanelUnpinToolQtip:'Unpin the panel',
    /**
     * @cfg {String} queryPanelCancelButtonText
     * The query Panel Cancel Button Text (defaults to <tt>'Cancel'</tt>)
     */
    queryPanelCancelButtonText: "Cancel",
    /**
     * @cfg {String} queryPanelPredefinedRequestButtonText
     * The query Panel Predefined Request Button Text (defaults to <tt>'Predefined Requests'</tt>)
     */
    queryPanelPredefinedRequestButtonText: "Predefined Requests",
    /**
     * @cfg {String} queryPanelResetButtonText
     * The query Panel Reset Button Text (defaults to <tt>'Reset'</tt>)
     */
    queryPanelResetButtonText: "Reset",
    /**
     * @cfg {String} queryPanelSearchButtonText
     * The query Panel Search Button Text (defaults to <tt>'Search'</tt>)
     */
    queryPanelSearchButtonText:"Search",
    /**
     * @cfg {String} queryPanelCancelButtonTooltip
     * The query Panel Cancel Button Tooltip (defaults to <tt>'Cancel the request'</tt>)
     */
    queryPanelCancelButtonTooltip:"Cancel the request",
    /**
     * @cfg {String} queryPanelPredefinedRequestButtonTooltip
     * The query Panel Predefined Request Button Tooltip (defaults to <tt>'Go to the predefined request page'</tt>)
     */
    queryPanelPredefinedRequestButtonTooltip:"Go to the predefined request page",
    /**
     * @cfg {String} queryPanelResetButtonTooltip
     * The query Panel Reset Button Tooltip (defaults to <tt>'Reset the request'</tt>)
     */
    queryPanelResetButtonTooltip:"Reset the request",
    /**
     * @cfg {String} queryPanelSearchButtonTooltip
     * The query Panel Search Button Tooltip (defaults to <tt>'Launch the request'</tt>)
     */
    queryPanelSearchButtonTooltip:"Launch the request",
    /**
     * @cfg {String} detailsPanelCtTitle
     * The details PanelCt Title (defaults to <tt>'Details'</tt>)
     */
    detailsPanelCtTitle:'Details',
    /**
     * @cfg {String} detailsPanelCtPinToolQtip
     * The details PanelCt Pin Tool Qtip (defaults to <tt>'Pin the panel'</tt>)
     */
    detailsPanelCtPinToolQtip: 'Pin the panel',
    /**
     * @cfg {String} detailsPanelCtUnpinToolQtip
     * The details PanelCt Unpin Tool Qtip (defaults to <tt>'Unpin the panel'</tt>)
     */
    detailsPanelCtUnpinToolQtip:'Unpin the panel',
    /**
     * @cfg {Ext.LoadMask} mask
     * The consultation page mask
     */
    /**
     * @cfg {Ext.LoadMask} mapMask
     * The map Mask
     */
    /**
     * @cfg {String} mapMaskMsg
     * The map Mask Msg (defaults to <tt>'Loading...'</tt>)
     */
    mapMaskMsg:"Loading...",
    /**
     * @cfg {String} alertErrorTitle
     * The alert Error Title (defaults to <tt>'Error :'</tt>)
     */
    alertErrorTitle:'Error :',
    /**
     * @cfg {String} alertRequestFailedMsg
     * The alert Request Failed Msg (defaults to <tt>'Sorry, the request failed...'</tt>)
     */
    alertRequestFailedMsg:'Sorry, the request failed...',
    /**
     * @cfg {String} widthToSubstract
     * The width to substract to the consultation panel (defaults to <tt>0</tt>)
     */
    widthToSubstract:0,
    /**
     * @cfg {String} heightToSubstract
     * The height to substract to the consultation panel (defaults to <tt>0</tt>)
     */
    heightToSubstract:0,
    /**
     * @cfg {String} dateFormat
     * The date format for the date fields (defaults to <tt>'Y/m/d'</tt>)
     */
    dateFormat:'Y/m/d',
    /**
     * @cfg {String} csvExportAlertTitle
     * The export CSV alert title (defaults to <tt>'CSV exportation on IE'</tt>)
     */
    csvExportAlertTitle:'CSV exportation on IE',
    /**
     * @cfg {String} csvExportAlertMsg
     * The export CSV alert message (defaults to <tt>'On IE you have to:<br> - Change the opening of a csv file.<br> - Change the security.'</tt>)
     */
    csvExportAlertMsg:"<div><H2>For your comfort on Internet Explorer you can:</H2> \
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
     * @cfg {Ext.SplitButton} aggregationButton
     * The aggregation button
     */
    /**
     * @cfg {Ext.SplitButton} interpolationButton
     * The interpolation button
     */
    /**
     * @cfg {Ext.Button} csvExportButton
     * The csv export button
     */
    /**
     * @cfg {Ext.menu.Item} gridCsvExportMenuItem
     * The grid csv export menu item
     */
    /**
     * @cfg {Ext.menu.Item} aggregationCsvExportMenuItem
     * The aggregation csv export menu item
     */
    /**
     * @cfg {Ext.menu.Menu} aggregationButtonMenu
     * The aggregation button menu
     */
    /**
     * @cfg {Ext.form.ComboBox} aggregationButtonMenuDataCombo
     * The aggregation button menu data combo
     */
    /**
     * @cfg {Ext.form.ComboBox} aggregationButtonMenuGridsCombo
     * The aggregation button menu grids combo
     */
    /**
     * @cfg {Ext.menu.Menu} interpolationButtonMenu
     * The interpolation button menu
     */
    /**
     * @cfg {Ext.form.ComboBox} interpolationButtonMenuDataCombo
     * The interpolation button menu data combo
     */
    /**
     * @cfg {Ext.form.ComboBox} interpolationButtonMenuGridsCombo
     * The interpolation button menu grids combo
     */
    /**
     * @cfg {Ext.form.ComboBox} interpolationButtonMenuMethodsCombo
     * The interpolation button menu methods combo
     */
    /**
     * @cfg {Ext.form.ComboBox} interpolationButtonMenuMaxDistanceText
     * The interpolation button menu max distance text
     */
    /**
     * @cfg {Ext.form.ComboBox} interpolationButtonMenuMaxDistanceTextDefaultValue
     * The interpolation button menu max distance text default value (default to 5000)
     */
    interpolationButtonMenuMaxDistanceTextDefaultValue: 5000,
    /**
     * @cfg {Boolean} autoZoomOnResultsFeatures
     * True to zoom automatically on the results features
     */
    autoZoomOnResultsFeatures: false,
    /**
     * @cfg {Boolean} launchRequestOnPredefinedRequestLoad
     * True to launch the request on a prefefined request load (default to true)
     */
    launchRequestOnPredefinedRequestLoad: true,
    /**
     * @cfg {Boolean} collapseQueryPanelOnPredefinedRequestLoad
     * True to collapse the query panel on a prefefined request load (default to true)
     */
    collapseQueryPanelOnPredefinedRequestLoad: true,

    // private
    initComponent : function() {
        /**
         * The dataset Data Store.
         * @property datasetDS
         * @type Ext.data.JsonStore
         */
        this.datasetDS = new Ext.data.JsonStore({
            url: Genapp.ajax_query_url + 'ajaxgetdatasets',
            method: 'POST',
            autoLoad: true,
            listeners : {
                'load': {
                    fn : function(store, records, options) {
                        for(i = 0; i<records.length; i++){
                            if(records[i].data.is_default === '1'){
                                this.datasetComboBox.setValue(records[i].data.id);
                                this.updateDatasetFormsPanel(records[i].data.id);
                                break;
                            }
                        }
                    },
                    scope :this
                }
            }
        });

        /**
         * The dataset ComboBox.
         * @property datasetComboBox
         * @type Ext.form.ComboBox
         */
        this.datasetComboBox = new Ext.form.ComboBox( {
            name :'datasetId',
            hiddenName :'datasetId',
            hideLabel :true,
            store : this.datasetDS,
            editable :false,
            displayField :'label',
            valueField :'id',
            forceSelection :true,
            mode :'local',
            typeAhead :true,
            width :345,
            maxHeight :100,
            triggerAction :'all',
            emptyText :this.datasetComboBoxEmptyText,
            selectOnFocus :true,
            disableKeyFilter :true,
            listeners : {
            'select' : {
                fn : function(combo, record, index) {
                        this.updateDatasetFormsPanel(record.data.id);
                    },
                    scope :this
                }
            }
        });

        /**
         * The dataset Panel.
         * @property datasetPanel
         * @type Ext.Panel
         */
        this.datasetPanel = new Ext.Panel( {
            region :'north',
            layout: 'form',
            autoHeight: true,
            frame:true,
            margins:'10 0 5 0',
            cls: 'genapp_query_panel_dataset_panel',
            title : this.datasetPanelTitle,
            items : this.datasetComboBox
        });

        /**
         * The forms panel containing the dynamic forms.
         * @property formsPanel
         * @type Ext.form.FieldSet
         */
        this.formsPanel = new Ext.form.FieldSet({
            layout :'auto',
            region :'center',
            autoScroll:true,
            cls:'genapp_query_formspanel',
            frame:true,
            margins:'5 0 5 0',
            title : this.formsPanelTitle,
            keys:{
                key: Ext.EventObject.ENTER,
                fn: this.submitRequest,
                scope: this
            }
        });

        /**
         * The grid data store array reader with a customized updateMetadata function.
         * @property gridDSReader
         * @type Ext.data.ArrayReader
         */
        this.gridDSReader = new Ext.data.ArrayReader();

        // Creates a reader metadata update function
        this.gridDSReader.updateMetadata = function(meta){
            delete this.ef;
            this.meta = meta;
            this.recordType = Ext.data.Record.create(meta.fields);
            this.onMetaChange(meta, this.recordType, {metaData:meta});
        };

        /**
         * The grid data store.
         * @property gridDS
         * @type Ext.data.Store
         */
        this.gridDS = new Ext.data.Store({
            // store configs
            autoDestroy: true,
            url: Genapp.ajax_query_url + 'ajaxgetgridrows',
            remoteSort: true,
            // reader configs
            reader:this.gridDSReader
        });

        /**
         * The grid paging toolbar with a customized reset function.
         * @property pagingToolbar
         * @type Ext.PagingToolbar
         */
        this.pagingToolbar = new Ext.PagingToolbar({
            pageSize: Genapp.grid.pagesize,
            store: this.gridDS,
            displayInfo: true
        });

        // Creates a paging toolbar reset function
        this.pagingToolbar.reset = function(){
            if(!this.rendered){
                return;
            }
            this.afterTextItem.setText(String.format(this.afterPageText, 1));
            this.inputItem.setValue(1);
            this.first.setDisabled(true);
            this.prev.setDisabled(true);
            this.next.setDisabled(true);
            this.last.setDisabled(true);
            this.refresh.enable();
            if(this.displayItem){
                this.displayItem.setText(this.emptyMsg);
            }
            this.fireEvent('change', this, {
                total : 0,
                activePage : 1,
                pages :  1
            });
        };

        /**
         * The grid view with a customized reset function.
         * @property gridView
         * @type Ext.grid.GridView
         */
        this.gridView = new Ext.grid.GridView({
            autoFill:true,
            emptyText : this.gridViewEmptyText,
            deferEmptyText : true
        });

        // Creates a grid view reset function
        this.gridView.reset = function(){
            this.mainBody.dom.innerHTML = '&#160;';
        };

        /**
         * The grid panel displaying the request results.
         * @property gridPanel
         * @type Ext.grid.GridPanel
         */
        this.gridPanel = new Ext.grid.GridPanel({
            frame: true,
            tabTip: this.gridPanelTabTip,
            collapsible: true,
            titleCollapse: true,
            title :this.gridPanelTitle,
            header: false,
            layout: 'fit',
            autoScroll: true,
            loadMask: true,
            view: this.gridView,
            store: this.gridDS,
            trackMouseOver:false,
            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
            cm: new Ext.grid.ColumnModel({}),
            bbar: this.pagingToolbar
        });

        /**
         * The map panel.
         * @property mapPanel
         * @type Genapp.MapPanel
         */
        this.mapPanel = new Genapp.MapPanel({hideMapDetails: this.hideMapDetails});

        /**
         * The center panel containing the map and the grid panels.
         * @property centerPanel
         * @type Ext.TabPanel
         */
        this.centerPanel = new Ext.TabPanel( {
            activeItem: 0,
            frame:true,
            plain:true,
            region :'center',
            title :this.centerPanelTitle,
            items :[this.mapPanel, this.gridPanel]
        });

        this.centerPanel.on(
            'render',
            function(tabPanel){
                var tabEdgeDiv = tabPanel.getEl().query(".x-tab-edge");
                if(!this.hideUserManualLink){
                    Ext.DomHelper.insertBefore(tabEdgeDiv[0],{
                        tag: 'li',
                        children: [{
                            tag: 'a',
                            target: '_blank',
                            href: this.userManualLinkHref,
                            children: [{
                                tag: 'span',
                                cls: 'x-tab-strip-text genapp-query-center-panel-tab-strip-link',
                                html: this.userManualLinkText
                            }]
                        }]
                    });
                }
                function addTopButton(config){
                    var el = Ext.DomHelper.insertBefore(tabEdgeDiv[0],{
                        tag: 'li',
                        cls: 'genapp-query-center-panel-tab-strip-top-button'
                    },true);
                    //Set the ul dom to the size of the TabPanel instead of 5000px by default
                    el.parent().setWidth('100%');
                    //Stop the event propagation to avoid the TabPanel error
                    el.on('mousedown',Ext.emptyFn,null,{
                        stopPropagation:true
                    });
                    return new Ext.ComponentMgr.create(Ext.apply({renderTo:el.id},config));
                }

                this.mask = new Ext.LoadMask(this.getEl(), {msg:this.mapMaskMsg});

                this.centerPanel.doLayout();
                if(!this.hideInterpolationButton){
                    this.interpolationButton = addTopButton({
                       xtype:'splitbutton',
                       text:this.interpolationButtonText,
                       disabled:true,
                       menu: this.interpolationButtonMenu = new Ext.menu.Menu({
                           cls: 'genapp-query-center-panel-interpolation-button-menu',
                           defaults:{
                               width:200
                           },
                           items: [
                               // these items will render as dropdown menu items when the arrow is clicked:
                               //{xtype: 'label', text:'Data:'},
                               this.interpolationButtonMenuDataCombo = new Ext.form.ComboBox({
                                   xtype: 'combo',
                                   queryParam :'datasetId',
                                   store : new Ext.data.JsonStore({
                                       url : Genapp.base_url + 'interpolation/ajaxgetvariables',  
                                       method : 'POST',
                                       listeners: {
                                           load: function(store, records, options){
                                               if(records.length == 0){
                                                   this.interpolationButtonMenuDataCombo.reset();
                                                   delete this.interpolationButtonMenuDataCombo.lastQuery;
                                               }
                                           },
                                           scope:this
                                        }
                                   }),
                                   editable : false,
                                   allowBlank: false,
                                   displayField: 'label',
                                   valueField: 'name',
                                   forceSelection: true,
                                   typeAhead: true,
                                   triggerAction: 'all',
                                   emptyText: 'Select a datum...',
                                   getListParent: function() {
                                       return this.el.up('.x-menu');
                                   },
                                   lastQuery: '',
                                   listeners: {
                                       // delete the previous query in the beforequery event or set
                                       // combo.lastQuery = null (this will reload the store the next time it expands)
                                       beforequery: function(qe){
                                           //delete qe.combo.lastQuery;
                                           qe.query = this.datasetComboBox.getValue();
                                           if(Ext.isEmpty(qe.query)){
                                               qe.cancel = true;
                                           }
                                       },
                                       scope:this
                                    }
                                }),
                               //{xtype: 'label', text:'Grid:'},
                                this.interpolationButtonMenuGridsCombo = new Ext.form.ComboBox({
                                   xtype: 'combo',
                                   store : new Ext.data.JsonStore( {
                                       url : Genapp.base_url + 'interpolation/ajaxgetgrids',
                                       method : 'POST',
                                       autoLoad:true
                                   }),
                                   mode:'local',
                                   editable : false,
                                   allowBlank: false,
                                   displayField: 'label',
                                   valueField: 'name',
                                   forceSelection: true,
                                   typeAhead: true,
                                   triggerAction: 'all',
                                   emptyText: 'Select a grid...',
                                   getListParent: function() {
                                       return this.el.up('.x-menu');
                                   }
                               }),
                               this.interpolationButtonMenuMethodsCombo = new Ext.form.ComboBox({
                                   xtype: 'combo',
                                   store : new Ext.data.JsonStore( {
                                       url : Genapp.base_url + 'interpolation/ajaxgetmethods',
                                       method : 'POST',
                                       autoLoad:true
                                   }),
                                   mode:'local',
                                   editable : false,
                                   allowBlank: false,
                                   displayField: 'label',
                                   valueField: 'name',
                                   forceSelection: true,
                                   typeAhead: true,
                                   triggerAction: 'all',
                                   emptyText: 'Select a method...',
                                   getListParent: function() {
                                       return this.el.up('.x-menu');
                                   }
                               }),
                               this.interpolationButtonMenuMaxDistanceText = new Ext.form.TextField({
                                   xtype: 'textfield',
                                   allowBlank: false,
                                   emptyText: 'Select a max distance...',
                                   value: this.interpolationButtonMenuMaxDistanceTextDefaultValue,
                                   getListParent: function() {
                                       return this.el.up('.x-menu');
                                   }
                               }),{
                                   xtype: 'button',
                                   text: 'Ok',
                                   handler: function(b,e){
                                       if(this.interpolationButtonMenuDataCombo.isValid(true) 
                                               && this.interpolationButtonMenuGridsCombo.isValid(true)
                                               && this.interpolationButtonMenuMethodsCombo.isValid(true)
                                               && this.interpolationButtonMenuMaxDistanceText.isValid(true)){
                                           this.showMask();
                                           Ext.Ajax.request({
                                               url: Genapp.base_url + 'interpolation/ajax-validate-interpolation-variable-form',
                                               success: function(response, options) {
                                                   var response = Ext.decode(response.responseText);
                                                   if(Ext.isEmpty(response.success) || response.success == false){
                                                       this.hideMask();
                                                       var msg = 'An error occured during the interpolation process.';
                                                       if (!Ext.isEmpty(response.errorMsg)){
                                                           msg += ' ' + response.errorMsg;
                                                       }
                                                       Ext.Msg.alert('Error...',msg);
                                                   }else{
                                                       this.getStatus('interpolation', function(){
                                                           this.mapPanel.enableLayersAndLegends([response.layerName], true, true);
                                                       });
                                                   }
                                               },
                                               failure: function(){
                                                   this.hideMask();
                                                   Ext.Msg.alert.createCallback('Error...','An error occured during the interpolation process.');
                                               },
                                               params: {
                                                   'INTERPOLATION_VARIABLE' : this.interpolationButtonMenuDataCombo.getValue(),
                                                   'GRID_NAME' : this.interpolationButtonMenuGridsCombo.getValue(),
                                                   'METHOD' : this.interpolationButtonMenuMethodsCombo.getValue(),
                                                   'MAXDIST' : this.interpolationButtonMenuMaxDistanceText.getValue()
                                               },
                                               scope:this
                                            });
                                           this.interpolationButtonMenu.hide();
                                       }
                                   },
                                   scope:this,
                                   style:'margin:auto;'
                               }
                           ]
                       })
                   });
                }
                if(!this.hideAggregationButton){
                    this.aggregationButton = addTopButton({
                        xtype:'splitbutton',
                        text:this.aggregationButtonText,
                        disabled:true,
                        menu: this.aggregationButtonMenu = new Ext.menu.Menu({
                            cls: 'genapp-query-center-panel-aggregation-button-menu',
                            defaults:{
                                width:200
                            },
                            items: [
                                // these items will render as dropdown menu items when the arrow is clicked:
                                //{xtype: 'label', text:'Data:'},
                                this.aggregationButtonMenuDataCombo = new Ext.form.ComboBox({
                                    xtype: 'combo',
                                    queryParam :'datasetId',
                                    store : new Ext.data.JsonStore({
                                        url : Genapp.base_url + 'aggregation/ajaxgetvariables',  
                                        method : 'POST',
                                        listeners: {
                                            load: function(store, records, options){
                                                if(records.length == 0){
                                                    this.aggregationButtonMenuDataCombo.reset();
                                                    delete this.aggregationButtonMenuDataCombo.lastQuery;
                                                }
                                            },
                                            scope:this
                                         }
                                    }),
                                    editable : false,
                                    allowBlank: false,
                                    displayField: 'label',
                                    valueField: 'name',
                                    forceSelection: true,
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    emptyText: 'Select a datum...',
                                    getListParent: function() {
                                        return this.el.up('.x-menu');
                                    },
                                    lastQuery: '',
                                    listeners: {
                                        // delete the previous query in the beforequery event or set
                                        // combo.lastQuery = null (this will reload the store the next time it expands)
                                        beforequery: function(qe){
                                            //delete qe.combo.lastQuery;
                                            qe.query = this.datasetComboBox.getValue();
                                            if(Ext.isEmpty(qe.query)){
                                                qe.cancel = true;
                                            }
                                        },
                                        scope:this
                                     }
                                 }),
                                //{xtype: 'label', text:'Grid:'},
                                 this.aggregationButtonMenuGridsCombo = new Ext.form.ComboBox({
                                    xtype: 'combo',
                                    store : new Ext.data.JsonStore( {
                                        url : Genapp.base_url + 'aggregation/ajaxgetgrids',
                                        method : 'POST',
                                        autoLoad:true
                                    }),
                                    mode:'local',
                                    editable : false,
                                    allowBlank: false,
                                    displayField: 'label',
                                    valueField: 'name',
                                    forceSelection: true,
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    emptyText: 'Select a grid...',
                                    getListParent: function() {
                                        return this.el.up('.x-menu');
                                    }
                                }),{
                                    xtype: 'button',
                                    text: 'Ok',
                                    handler: function(b,e){
                                        if(this.aggregationButtonMenuDataCombo.isValid(true) 
                                                && this.aggregationButtonMenuGridsCombo.isValid(true)){
                                            this.showMask();
                                            Ext.Ajax.request({
                                                url: Genapp.base_url + 'aggregation/ajax-validate-aggregation-variable-form',
                                                success: function(response, options) {
                                                    var response = Ext.decode(response.responseText);
                                                    if(Ext.isEmpty(response.success) || response.success == false){
                                                        this.hideMask();
                                                        var msg = 'An error occured during the aggregation process.';
                                                        if (!Ext.isEmpty(response.errorMsg)){
                                                            msg += ' ' + response.errorMsg;
                                                        }
                                                        Ext.Msg.alert('Error...',msg);
                                                    }else{
                                                        this.getStatus('aggregation', function(){
                                                            this.aggregationCsvExportMenuItem.enable();
                                                            this.mapPanel.disableLayersAndLegends(this.mapPanel.layersActivation['aggregation'], true, true, true);
                                                            this.mapPanel.enableLayersAndLegends([response.layerName], true, true);
                                                        });
                                                    }
                                                },
                                                failure: function(){
                                                    this.hideMask();
                                                    Ext.Msg.alert.createCallback('Error...','An error occured during the aggregation process.');
                                                },
                                                params: {
                                                    'AGGREGATE_VARIABLE' : this.aggregationButtonMenuDataCombo.getValue(),
                                                    'GRID_NAME' : this.aggregationButtonMenuGridsCombo.getValue()
                                                },
                                                scope:this
                                             });
                                            this.aggregationButtonMenu.hide();
                                        }
                                    },
                                    scope:this,
                                    style:'margin:auto;'
                                }
                            ]
                        })
                    });
                }
                // add the export button
                var csvExportMenuItems = [];
                if(!this.hideGridCsvExportMenuItem){
                    csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
                        text:this.gridCsvExportMenuItemText,
                        handler:this.exportCSV.createDelegate(this,['grid-csv-export']),
                        iconCls:'genapp-query-center-panel-grid-csv-export-menu-item-icon'
                    }));
                }
                if(!this.hideAggregationCsvExportMenuItem){
                    csvExportMenuItems.push(this.aggregationCsvExportMenuItem = new Ext.menu.Item({
                        text:this.aggregationCsvExportMenuItemText,
                        handler:this.exportCSV.createDelegate(this,['aggregation-csv-export']),
                        iconCls:'genapp-query-center-panel-aggregation-csv-export-menu-item-icon',
                        disabled:true
                    }));
                }
                if(!this.hideCsvExportButton){
                    this.csvExportButton = addTopButton({
                        xtype:'splitbutton',
                        text:this.csvExportButtonText,
                        disabled:true,
                        menu: this.csvExportButtonMenu = new Ext.menu.Menu({
                            items: csvExportMenuItems
                        })
                    });
                }
            },
            this,
            {
                single : true
            }
        );

        this.queryPanelPinned = true;

        var queryPanelConfig = {
            region :'west',
            title :this.queryPanelTitle,
            collapsible : true,
            margins:'0 5 0 0',
            //collapseMode :'mini',
            titleCollapse : true,
            width :370,
            frame:true,
            layout:'border',
            cls: 'genapp_query_panel',
            items : [ this.datasetPanel, this.formsPanel ],
            tools:[{
                id:'pin',
                qtip: this.queryPanelPinToolQtip,
                hidden:true,
                handler: function(event, toolEl, panel){
                    toolEl.hide();
                    panel.header.child('.x-tool-unpin').show();
                    this.queryPanelPinned = true;
                },
                scope:this
            },{
                id:'unpin',
                qtip: this.queryPanelUnpinToolQtip,
                handler: function(event, toolEl, panel){
                    toolEl.hide();
                    panel.header.child('.x-tool-pin').show();
                    this.queryPanelPinned = false;
                },
                scope:this
            }],
            bbar: [{
                xtype: 'tbbutton',
                text: this.queryPanelCancelButtonText,
                tooltipType: 'title',
                tooltip: this.queryPanelCancelButtonTooltip,
                cls: 'genapp_query_formspanel_cancel_button',
                scope: this,
                handler: this.cancelRequest
            },{
                xtype: 'tbseparator'
            },{
                xtype: 'tbbutton',
                text: this.queryPanelResetButtonText,
                tooltipType: 'title',
                tooltip: this.queryPanelResetButtonTooltip,
                cls: 'genapp_query_formspanel_reset_button',
                scope: this,
                handler: this.resetRequest
            },{
                xtype: 'tbfill'
            },{
                xtype: 'tbbutton',
                text: this.queryPanelSearchButtonText,
                tooltipType: 'title',
                tooltip: this.queryPanelSearchButtonTooltip,
                cls: 'genapp_query_formspanel_search_button',
                scope: this,
                handler: this.submitRequest
            }]
        };

        if (!this.hidePredefinedRequestButton) {
            queryPanelConfig.tbar = {
                cls: 'genapp_query_panel_tbar',
                items:[{
                    xtype: 'tbbutton',
                    text: this.queryPanelPredefinedRequestButtonText,
                    tooltipType: 'title',
                    tooltip: this.queryPanelPredefinedRequestButtonTooltip,
                    scope: this,
                    handler: function(b,e){
                        Genapp.cardPanel.getLayout().setActiveItem('predefined_request');
                    }
                }]
            };
        }

        /**
         * The query form panel contains the dataset list and the corresponding forms.
         * @property queryPanel
         * @type Ext.FormPanel
         */
        this.queryPanel = new Ext.FormPanel(queryPanelConfig);

        // Add the layers and legends vertical label
        if(!this.hideRequestVerticalLabel){
            this.addVerticalLabel(this.queryPanel, 'genapp-query-request-panel-ct-xcollapsed-vertical-label-div');
        }

        /**
         * The details panel.
         * @property detailsPanel
         * @type Ext.TabPanel
         */
        this.detailsPanel = new Ext.TabPanel({
            frame:true,
            plain:true,
            enableTabScroll:true,
            cls:'genapp-query-details-panel',
            scrollIncrement:91,
            scrollRepeatInterval:100,
            idDelimiter:'___' // Avoid a conflict with the Genapp id separator('__')
        });

        this.detailsPanelPinned = true;
        /**
         * The details panel container.
         * @property detailsPanelCt
         * @type Ext.Panel
         */
        this.detailsPanelCt = new Ext.Panel({
            region:'east',
            title:this.detailsPanelCtTitle,
            frame:true,
            split:true,
            layout: 'fit',
            width:344,
            minWidth:200,
            collapsible : true,
            //collapseMode :'mini',
            titleCollapse : true,
            collapsed:true,
            items: this.detailsPanel,
            tools:[{
                id:'pin',
                qtip: this.detailsPanelCtPinToolQtip,
                hidden:true,
                handler: function(event, toolEl, panel){
                    toolEl.hide();
                    panel.header.child('.x-tool-unpin').show();
                    this.detailsPanelPinned = true;
                },
                scope:this
            },{
                id:'unpin',
                qtip: this.detailsPanelCtUnpinToolQtip,
                handler: function(event, toolEl, panel){
                    toolEl.hide();
                    panel.header.child('.x-tool-pin').show();
                    this.detailsPanelPinned = false;
                },
                scope:this
            }]
        });

        // Add the layers and legends vertical label
        if(!this.hideDetailsVerticalLabel){
            this.addVerticalLabel(this.detailsPanelCt, 'genapp-query-details-panel-ct-xcollapsed-vertical-label-div');
        }

        if (!this.items) {
            this.items = [this.queryPanel, this.centerPanel];
            if(!this.hideDetails){
                this.items.push(this.detailsPanelCt);
            }
        }

        Genapp.ConsultationPanel.superclass.initComponent.call(this);
    },

    /**
     * Update the Forms Panel by adding the Panel corresponding to the selected dataset
     * @param {Object} response The XMLHttpRequest object containing the response data.
     * @param {Object} options The parameter to the request call.
     * @param {Object} apiParams The api parameters
     * @hide
     */
    updateWestPanels : function(response, opts, apiParams, criteriaValues) {
        var forms = Ext.decode(response.responseText);
        // Removes the loading message
        this.formsPanel.body.update();
        
        // Add each form
        for ( var i = 0; i < forms.data.length; i++) {
            if(!(Ext.isEmpty(forms.data[i].criteria) && Ext.isEmpty(forms.data[i].columns))){
                this.formsPanel.add( 
                    new Genapp.FieldForm({
                        title: forms.data[i].label,
                        id: forms.data[i].id,
                        criteria: forms.data[i].criteria,
                        criteriaValues: criteriaValues,
                        columns: forms.data[i].columns
                    })
                );
            }
        }
        this.formsPanel.doLayout();
        if (apiParams.collapseQueryPanel == true) {
            this.queryPanel.collapse();
        }
        if (apiParams.launchRequest == true) {
            this.submitRequest();
        }
    },

    /**
     * Renders for the left tools column cell
     * @param {Object} value  The data value for the cell.
     * @param {Object} metadata An object in which you may set the following attributes:
     *      {String} css A CSS class name to add to the cell's TD element.
     *      {String} attr : An HTML attribute definition string to apply to the data 
     *      container element within the table cell (e.g. 'style="color:red;"').
     * @param {Ext.data.record} record The {@link Ext.data.Record} from which the data was extracted.
     * @param {Number} rowIndex  Row index
     * @param {Number} colIndex Column index
     * @param {Ext.data.Store} store The {@link Ext.data.Store} object from which the Record was extracted.
     * @return {String} The html code for the column
     * @hide
     */
    renderLeftTools : function (value, metadata, record, rowIndex, colIndex, store){

        var stringFormat = '';
        if(!this.hideDetails){
            stringFormat = '<div class="genapp-query-grid-slip" onclick="Genapp.cardPanel.consultationPanel.openDetails(\'{0}\', \'getdetails\');"></div>';
        }
        stringFormat += '<div class="genapp-query-grid-map" onclick="Genapp.cardPanel.consultationPanel.displayLocation(\'{0}\',\'{1}\');"></div>';

        return String.format(stringFormat, record.data.id, record.data.location_centroid);
    },

    /**
     * Open the row details
     * @param {String} id The details id
     * @param {String} url The url to get the details
     */
    openDetails : function(id, url){
        if(!Ext.isEmpty(id)){
            var consultationPanel = Ext.getCmp('consultation_panel');
            consultationPanel.collapseQueryPanel();
            consultationPanel.detailsPanel.ownerCt.expand();
            var tab = consultationPanel.detailsPanel.get(id);
            if(Ext.isEmpty(tab)){
                tab = consultationPanel.detailsPanel.add(
                    new Genapp.DetailsPanel({rowId:id, dataUrl:url})
                );
            }
            consultationPanel.detailsPanel.activate(tab);
        }
    },

    /**
     * Displays the location on the map
     * @param {String} id The location id
     * @param {String} wkt a point WKT to be displayed as a flag.
     */
    displayLocation : function(id, wkt){
        var consultationPanel = Ext.getCmp('consultation_panel');
        consultationPanel.centerPanel.activate(consultationPanel.mapPanel);
        consultationPanel.mapPanel.zoomToFeature(id, wkt);
    },

    /**
     * Cancel the current ajax request (submit or load)
     */
    cancelRequest : function(){
        if(this.requestConn && this.requestConn !== null){
            this.requestConn.abort();
            this.gridPanel.loadMask.hide();
            this.mapMask.hide();
        }
    },

    /**
     * Reset the current ajax request (submit or load)
     */
    resetRequest : function(){
        this.updateDatasetFormsPanel(this.datasetComboBox.getValue());
    },

    /**
     * Submit the request and get the description of the result columns
     */
    submitRequest : function(){
        // Disable the top buttons, reset the combos and force a reload
        if(!this.hideAggregationButton){
            this.aggregationButton.disable();
            this.aggregationButtonMenuDataCombo.reset();
            this.aggregationButtonMenuGridsCombo.reset();
            delete this.aggregationButtonMenuDataCombo.lastQuery;
        }
        if(!this.hideAggregationCsvExportMenuItem){
            this.aggregationCsvExportMenuItem.disable();
        }
        if(!this.hideInterpolationButton){
            this.interpolationButton.disable();
            this.interpolationButtonMenuDataCombo.reset();
            this.interpolationButtonMenuGridsCombo.reset();
            this.interpolationButtonMenuMethodsCombo.reset();
            this.interpolationButtonMenuMaxDistanceText.setValue(this.interpolationButtonMenuMaxDistanceTextDefaultValue);
            delete this.interpolationButtonMenuDataCombo.lastQuery;
        }
        if(!this.hideCsvExportButton){
            this.csvExportButton.disable();
        }
        // Hide the aggregated layer and legend
        this.mapPanel.disableLayersAndLegends(this.mapPanel.layersActivation['request'], true, false, true);
        this.mapPanel.disableLayersAndLegends(this.mapPanel.layersActivation['aggregation'], true, true, true);
        this.mapPanel.disableLayersAndLegends(this.mapPanel.layersActivation['interpolation'], true, true, true);

        // Init the mapResultLayers
        if(!this.mapResultLayers){
            var rla = this.mapPanel.layersActivation['request'];
            this.mapResultLayers = [];
            for(var i = 0; i<rla.length;i++){
                var layer = this.mapPanel.map.getLayersByName(rla[i])[0];
                //The layer visibility must be set to true to handle the 'loadend' event
                layer.events.register("loadend", this, function(info){
                    this.mapResultLayersLoadEnd[info.object.name] = 1;
                    // Hide the map mask if all the result layers are loaded
                    var count = 0;
                    for (layer in this.mapResultLayersLoadEnd) {
                        if (typeof this.mapResultLayersLoadEnd[layer] !== 'function') {
                            count += this.mapResultLayersLoadEnd[layer];
                        }
                    }
                    if(count === this.mapResultLayers.length){
                        this.mapMask.hide();
                    }
                });
                this.mapResultLayers.push(layer);
            }

        }
        // Init mapResultLayersLoadEnd
        this.mapResultLayersLoadEnd = {};
        for(var i = 0; i<this.mapResultLayers.length;i++){
            var layer = this.mapResultLayers[i];
            this.mapResultLayersLoadEnd[layer.name] = 0;
        }

        if(!this.mapMask){
            this.mapMask = new Ext.LoadMask(this.mapPanel.getEl(), {msg:this.mapMaskMsg});
        }

        // The panel must be rendered and active to show the mask correctly
        if(this.showGridOnSubmit){
            this.centerPanel.activate(this.mapPanel);
            this.mapMask.show();
            this.centerPanel.activate(this.gridPanel);
            this.gridPanel.loadMask.show();
        }else{
            this.centerPanel.activate(this.gridPanel);
            this.gridPanel.loadMask.show();
            this.centerPanel.activate(this.mapPanel);
            this.mapMask.show();
        }
        for(var i = 0; i<this.mapResultLayersLoadEnd.length;i++){
            var layer = this.mapResultLayersLoadEnd[i]
            layer.display(false);
        }
        this.mapPanel.clean();
        this.clearGrid();

        Ext.Ajax.on('beforerequest', 
            function(conn, options){
                this.requestConn = conn;
            },
            this,
            {single:true}
        );

        this.formsPanel.findParentByType('form').getForm().submit({
            url: Genapp.ajax_query_url + 'ajaxgetgridcolumns',
            timeout : 480000, 
            success : function(form, action)
            {
                this.requestConn = null;
                // Creation of the column model and the reader metadata fields
                var columns = action.result.columns;
                var newCM = new Array({
                    header:'',
                    renderer:this.renderLeftTools.createDelegate(this),
                    sortable:false,
                    fixed:true,
                    menuDisabled:true,
                    align:'center',
                    width:52
                });
                var newRF = new Array();
                var columnConf;
                var readerFieldsConf;
                for(var i=0; i<columns.length;i++){
                    columnConf = {
                        header:Genapp.util.htmlStringFormat(columns[i].label),
                        sortable:true,
                        dataIndex:columns[i].name,
                        width:100,
                        tooltip:Genapp.util.htmlStringFormat(columns[i].definition),
                        hidden:columns[i].hidden
                    };
                    readerFieldsConf = {
                        name: columns[i].name
                    };
                    switch(columns[i].type){
                        // TODO : BOOLEAN, CODE, COORDINATE
                        case 'STRING':
                            columnConf.xtype='gridcolumn';
                            readerFieldsConf.type='string';
                            break;
                        case 'INTEGER':
                            columnConf.xtype='gridcolumn';
                            //readerFieldsConf.type='int';
                            break;
                        case 'NUMERIC':
                        case 'RANGE':
                            columnConf.xtype='numbercolumn';
                            //Commented because transforms the null value to 0.00
                            //readerFieldsConf.type='float';
                            
                            break;
                        case 'DATE':
                            columnConf.xtype='datecolumn';
                            columnConf.format = this.dateFormat;
                            //Commented because transforms the date to ''
                            //readerFieldsConf.type='date';
                            //readerFieldsConf.dateFormat = this.dateFormat;
                            break;
                        default:
                            columnConf.xtype='gridcolumn';
                            readerFieldsConf.type='auto';
                            break;
                    }
                    newCM.push(columnConf);
                    newRF.push(readerFieldsConf);
                }

                // Updates of the store reader metadata
                this.gridDSReader.updateMetadata({
                    root: 'rows',
                    fields: newRF,
                    totalProperty:'total'
                });

                // The grid panel must be rendered and activated to resize correctly
                // the grid's view in proportion of the columns number
                if(this.centerPanel.getActiveTab() instanceof Genapp.MapPanel){
                    this.centerPanel.activate(this.gridPanel);
                    // Updates of the column model
                    this.gridPanel.getColumnModel().setConfig(newCM);
                    this.centerPanel.activate(this.mapPanel);
                }else{
                    // Updates of the column model
                    this.gridPanel.getColumnModel().setConfig(newCM);
                }

                this.gridPanel.getView().reset();

                // Updates the rows
                Ext.Ajax.on('beforerequest',
                    function(conn, options){
                        this.requestConn = conn;
                    },
                    this,
                    {single:true}
                );

                this.gridPanel.getStore().load({
                    params:{
                        start: 0,
                        limit: Genapp.grid.pagesize
                    },
                    callback : function(){
                        this.requestConn = null;

                        this.getResultsBBox();
                        if(this.autoZoomOnResultsFeatures != true){
                            // Display the results layer
                            this.mapPanel.enableLayersAndLegends(this.mapPanel.layersActivation['request'],true, true);
                        }

                        // Collapse the panel only if the form is valid
                        this.collapseQueryPanel();
                        this.collapseDetailsPanel();

                       // Enable the top buttons
                       if(!this.hideAggregationButton){
                           this.aggregationButton.enable();
                       }
                       if(!this.hideInterpolationButton){
                           this.interpolationButton.enable();
                       }
                       if(!this.hideCsvExportButton){
                           this.csvExportButton.enable();
                       }
                       this.gridPanel.syncSize(); //Bug in Ext 3.2.1 (The grid bottom tool bar disappear)
                    },
                    scope:this
                });
            },
            failure : function(form, action)
            {
                if(action.result && action.result.errorMessage){
                    Ext.Msg.alert(this.alertErrorTitle, action.result.errorMessage);
                }else{
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
                }
                this.gridPanel.loadMask.hide();
                this.mapMask.hide();
            },
            scope:this
        });
    },

    /**
     * Collapse the Query Form Panel if not pinned
     */
    collapseQueryPanel: function(){
        if(!this.queryPanelPinned){
            this.queryPanel.collapse();
        }
    },

    /**
     * Collapse the Details Panel if not pinned
     */
    collapseDetailsPanel: function(){
        if(!this.detailsPanelPinned){
            this.detailsPanel.ownerCt.collapse();
        }
    },

    /**
     * Updates the FormsPanel body
     * @param {Object} requestParams The parameters for the ajax request
     * @param {Object} apiParams The api parameters
     */
    updateFormsPanel : function(requestParams, apiParams, criteriaValues) {
        this.formsPanel.removeAll(true);
        this.formsPanel.getUpdater().showLoading();
        Ext.Ajax.request({
            url: Genapp.ajax_query_url + 'ajaxgetforms',
            success: this.updateWestPanels.createDelegate(this,[apiParams, criteriaValues],true),
            method: 'POST',
            params: requestParams,
            scope :this
        });
    },

    /**
     * Update the forms panel for a predefined request
     * @param {String} requestName The request name
     */
    updatePredefinedRequestFormsPanel : function(requestName, criteriaValues) {
        this.updateFormsPanel(
            {
                requestName: requestName
            },{
                'launchRequest': this.launchRequestOnPredefinedRequestLoad,
                'collapseQueryPanel': this.collapseQueryPanelOnPredefinedRequestLoad
            },
            criteriaValues
        );
    },

    /**
     * Update the forms panel for a datasetId
     * @param {String} datasetId The dataset ID
     */
    updateDatasetFormsPanel : function(datasetId) {
        this.updateFormsPanel({
            datasetId: datasetId
        });
    },

    /**
     * Load a predefined request into the request panel
     * @param {Object} A object containing the predefined request data
     */
    loadRequest : function(request) {
        this.datasetComboBox.setValue(request.datasetId);
        this.updatePredefinedRequestFormsPanel(request.name, request.fieldValues);
    },

    /**
     * Clears the grid
     */
    clearGrid : function (){
        var gridDs = this.gridPanel.getStore();
        if(gridDs.getCount() != 0){
            // Reset the paging toolbar
            this.gridPanel.getBottomToolbar().reset();
        }
        if(this.gridPanel.rendered){
            // Remove the column headers
            this.gridPanel.getColumnModel().setConfig({});
            // Remove the horizontal scroll bar if present
            this.gridPanel.getView().updateAllColumnWidths();//Bug Ext 3.0
            // Remove the emptyText message
            this.gridPanel.getView().reset();
        }
    },

    /**
     * Export the data as a CSV file
     */
    exportCSV : function (actionName) {
        var launchCsvExport = function(buttonId , text, opt){
            this.showMask(true);
            window.location = Genapp.ajax_query_url + actionName;
        };
        if(Ext.isIE && !this.hideCsvExportAlert){
            Ext.Msg.show({
                title:this.csvExportAlertTitle,
                msg: this.csvExportAlertMsg,
                cls:'genapp-query-center-panel-csv-export-alert',
                buttons: Ext.Msg.OK,
                fn: launchCsvExport,
                animEl: this.csvExportButton.getEl(),
                icon: Ext.MessageBox.INFO,
                scope: this
            });
            // The message is displayed only one time
            this.hideCsvExportAlert = true;
        }else{
            launchCsvExport.call(this);
        }
    },

    /**
     * Show the consultation page mask
     */
    showMask : function (hideOnFocus) {
        this.mask.show();
        if(hideOnFocus){
            window.onfocus = (function () {
                this.mask.hide();
                window.onfocus = Ext.emptyFn;
            }).createDelegate(this);
        }
    },

    /**
     * Hide the consultation page mask
     */
    hideMask : function () {
        this.mask.hide();
    },

    /**
     * Add a vertical label to the collapsed panel
     * @param {Object} the Ext.Panel
     * @param {String} the css class
     * @hide
     */
    addVerticalLabel : function (panel, cls){
        panel.on(
            'collapse',
            function(panel){
                Ext.get(panel.id + '-xcollapsed').createChild({
                    tag: "div", 
                    cls: cls
                });
            },
            this,
            {
                single : true
            }
        );
    },

    /**
     * Launch a ajax request to get the java service status
     * 
     * @param {String} serviceName The service name
     * @param {String} callback A callback function to call when the status is equal to 'OK'
     * @return {String} The status
     */
    getStatus : function (serviceName, callback){
        Ext.Ajax.request({
            url: Genapp.base_url + serviceName +'/ajax-get-status',
            success: function(response, options) {
                var response = Ext.decode(response.responseText);
                if (Ext.isEmpty(response.success) || response.success == false) {
                    this.hideMask();
                    var msg = 'An error occured during the status request.';
                    if (!Ext.isEmpty(response.errorMsg)) {
                        msg += ' ' + response.errorMsg;
                    }
                    Ext.Msg.alert('Error...',msg);
                } else {
                    if (response.status == 'RUNNING') {
                        this.getStatus.defer(2000,this,[serviceName, callback]);
                    } else if (response.status == 'OK'){
                        this.hideMask();
                        callback.call(this);
                    } else { // The service is done or an error occured
                        this.hideMask();
                        var msg = 'An error occured during the status request.';
                        if (!Ext.isEmpty(response.errorMsg)) {
                            msg += ' ' + response.errorMsg;
                        }
                        Ext.Msg.alert('Error...',msg);
                    }
                }
            },
            failure: function(){
                this.hideMask();
                var msg = 'An error occured during the status request.';
                Ext.Msg.alert('Error...',msg);
            },
            scope:this
         });
    },

    /**
     * Launch a ajax request to get the bounding box of the result features.
     */
    getResultsBBox: function(){
        Ext.Ajax.request({
            url: Genapp.ajax_query_url +'ajaxgetresultsbbox',
            success: function(response, options) {
            try
            {
                var response = Ext.decode(response.responseText);
                if (Ext.isEmpty(response.success) || response.success == false) {
                    if (!Ext.isEmpty(response.errorMsg)) {
                        throw(response.errorMsg);
                    }
                    throw('');
                } else {
                    if (!Ext.isEmpty(response.resultsbbox)) {
	                    this.mapPanel.resultsBBox = response.resultsbbox;
                    } else {
                        this.mapPanel.resultsBBox = null;
                    }
                    if (this.autoZoomOnResultsFeatures == true) {
                        if (this.mapPanel.resultsBBox !== null) {
                           this.mapPanel.zoomOnBBox(this.mapPanel.resultsBBox);
                        }
                        // Display the results layer
                        this.mapPanel.enableLayersAndLegends(this.mapPanel.layersActivation['request'],true, true);
                    }
                }
            } catch(err) {
                    var msg = 'An error occured during the bounding box request.';
                    if (!Ext.isEmpty(err)) {
                        msg += ' ' + err;
                    }
                    Ext.Msg.alert('Error...',msg);
                }
            },
            failure: function(response, options){
                var msg = 'An error occured during the bounding box request. Status code : ' + response.status;
                Ext.Msg.alert('Error...',msg);
            },
            scope:this
        });
    }
});
