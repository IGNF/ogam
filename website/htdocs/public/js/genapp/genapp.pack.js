Genapp.buildApplication = function(config){

    // Activate the tooltips system
    // Init the singleton.  Any tag-based quick tips will start working.
    Ext.QuickTips.init();

    // Apply a set of config properties to the singleton
    Ext.apply(Ext.QuickTips.getQuickTip(), {
        showDelay: 250,
        dismissDelay: 0,
        trackMouse: true
    });

    // Turn on validation errors beside the field globally
    Ext.form.Field.prototype.msgTarget = 'qtip'; // The side option poses problems rendering in IE7

    // Set the form label separator
    Ext.layout.FormLayout.prototype.labelSeparator = ' :';

    // Set the blank image to a local one
    Ext.BLANK_IMAGE_URL = Genapp.base_url + "/img/s.gif";
    
    // Set the default timeout for AJAX calls
    // The JS timeout must be inferior or equal to the PHP execution time to avoid the not catchable php timeout fatal error
    Ext.Ajax.timeout = 30000;

    Genapp.cardPanel = new Genapp.CardPanel(config);
};

/**
 * Format the string in html
 * @param {String} value The string to format
 * @return {String} The formated string
 */
Genapp.util.htmlStringFormat = function(value){
    value = value.replace(new  RegExp("'", "g"),"&#39;");
    value = value.replace(new  RegExp("\"", "g"),"&#34;");
    return value;
};

/**
 * Create and submit a form
 * @param {String} url The form url
 * @param {object} params The form params
 */
Genapp.util.post = function(url, params) {
    var temp=document.createElement("form");
    temp.action=url;
    temp.method="POST";
    temp.style.display="none";
    for (var x in params) {
        var opt=document.createElement("textarea");
        opt.name=x;
        opt.value=params[x];
        temp.appendChild(opt);
    }
    document.body.appendChild(temp);
    temp.submit();
    return temp;
};OpenLayers.Handler.FeatureInfo = OpenLayers.Class.create();
OpenLayers.Handler.FeatureInfo.prototype = 
  OpenLayers.Class.inherit( OpenLayers.Handler, {
    
      /**
       * @cfg {String} alertErrorTitle
       * The alert Error Title (defaults to <tt>'Error :'</tt>)
       */
      alertErrorTitle:'Error :',
      /**
       * @cfg {String} alertRequestFailedMsg
       * The alert Request Failed Msg (defaults to <tt>'Sorry, the request failed...'</tt>)
       */
      alertRequestFailedMsg:'Sorry, the feature info request failed...',

      click: function(evt) {
        // Calcul de la coordonnée correspondant au point cliqué par l'utilisateur
        var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
        var ll = this.map.getLonLatFromPixel(px);
        
        // Construction d'une URL pour faire une requête WFS sur le point
        var url = Genapp.base_url+"proxy/getInfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=result_locations&MAXFEATURES=1&BBOX="+(ll.lon-500)+","+(ll.lat+500)+","+(ll.lon+500)+","+(ll.lat-500);

        OpenLayers.loadURL(
            url,
            '',
            this,
            function(response) {
                try {
                    var result = Ext.decode(response.responseText);
                    Genapp.cardPanel.consultationPanel.openDetails(result.id, 'getmapdetails');
                } catch (e) {
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
                }
            },
            function(response){
                Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
            }
        );

        Event.stop(evt);
    }
  }
);


OpenLayers.Control.FeatureInfoControl = OpenLayers.Class.create();
OpenLayers.Control.FeatureInfoControl.prototype = 
  OpenLayers.Class.inherit( OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_TOOL,
    
    /**
     * Constructor: OpenLayers.Control.FeatureInfoControl
     * 
     * Parameters:
     * options - {Object} 
     */
    initialize: function(map, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },
    
    draw: function() {
        this.handler = new OpenLayers.Handler.FeatureInfo( this, {'click':this.click});   
        this.activate();
    },
     
     /** @final @type String */
    CLASS_NAME: "OpenLayers.Control.FeatureInfoControl"
        
  }
);
/**
 * A CardPanel correspond to the panel containing the application pages.
 * 
 * @class Genapp.CardPanel
 * @extends Ext.Panel
 * @constructor Create a new Card Panel
 * @param {Object} config The config object
 * @xtype cardpanel
 */
Genapp.CardPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.
     * For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * @hide
     */
    layout:'card',
    /**
     * @cfg {String/Number} activeItem
     * A string component id or the numeric index of the component that should be initially activated within the
     * container's layout on render.  For example, activeItem: 'item-1' or activeItem: 0 (index 0 = the first
     * item in the container's collection).  activeItem only applies to layout styles that can display
     * items one at a time (like {@link Ext.layout.AccordionLayout}, {@link Ext.layout.CardLayout} and
     * {@link Ext.layout.FitLayout}).  Related to {@link Ext.layout.ContainerLayout#activeItem}.
     * 0 : PredefinedRequestPanel
     * 1 : ConsultationPanel
     */
    activeItem: 1,
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {Mixed} renderTo
     * Specify the id of the element, a DOM element or an existing Element that this component will be rendered into.
     * Notes :
     * When using this config, a call to render() is not required.
     * Do not use this option if the Component is to be a child item of
     * a {@link Ext.Container Container}. It is the responsibility of the
     * {@link Ext.Container Container}'s {@link Ext.Container#layout layout manager}
     * to render its child items (Default to 'page').
     *
     * See {@link #render} also.
     */
    renderTo:'page',
    /**
     * @cfg {String} localeCls
     * The locale css class (defaults to <tt>''</tt>).
     */
    localeCls :'',
    /**
     * @cfg {String} widthToSubstract
     * The width to substract to the consultation panel (defaults to <tt>0</tt>)
     */
    widthToSubstract:120,
    /**
     * @cfg {String} heightToSubstract
     * The height to substract to the consultation panel (defaults to <tt>0</tt>)
     */
    heightToSubstract:210,

    // private
    initComponent : function() {

    this.addEvents(
            /**
             * @event resizewrapper
             * Fires after the Panel has been resized to resize the container (div html) of this consultation panel if exist.
             * This event is not the same that the 'bodyresize' event.
             * @param {Ext.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel's new width.
             * @param {Number} height The Panel's new height.
             */
            'resizewrapper'
        );
        Ext.getBody().addClass(this.localeCls);

        this.height = Ext.getBody().getViewSize().height - this.heightToSubstract;
        this.width = Ext.getBody().getViewSize().width - this.widthToSubstract;

        Ext.EventManager.onWindowResize(
            function(w, h){
                var newSize = {
                        width:Ext.getBody().getViewSize().width - this.widthToSubstract,
                        height:Ext.getBody().getViewSize().height - this.heightToSubstract
                };
                this.setSize(newSize);
                this.fireEvent('resizewrapper', newSize.width, newSize.height);
            },
            this
        );
        if (!this.items) {
            this.items = [
                this.predefinedRequestPanel = new Genapp.PredefinedRequestPanel(),
                this.consultationPanel = new Genapp.ConsultationPanel()
            ]
        }

        Genapp.CardPanel.superclass.initComponent.call(this);
    }
});/**
 * A ConsultationPanel correspond to the complete page for querying request
 * results.
 * 
 * @class Genapp.ConsultationPanel
 * @extends Ext.Panel
 * @constructor Create a new Consultation Panel
 * @param {Object}
 *            config The config object
 * @xtype consultationpanel
 */
Genapp.ConsultationPanel = Ext.extend(Ext.Panel, {
    /**
	 * @cfg {String} region Note: this config is only used when this
	 *      BoxComponent is rendered by a Container which has been configured to
	 *      use the {@link Ext.layout.BorderLayout BorderLayout} layout manager
	 *      (eg. specifying layout:'border'). See
	 *      {@link Ext.layout.BorderLayout} also. Set by default to 'center'.
	 */
    region :'center',
    /**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to
	 *      'border'.
	 */
    layout :'border',
    /**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'genapp_consultation_panel'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
    cls:'genapp_consultation_panel',
    /**
	 * @cfg {Boolean} border True to display the borders of the panel's body
	 *      element, false to hide them (defaults to false). By default, the
	 *      border is a 2px wide inset border, but this can be further altered
	 *      by setting {@link #bodyBorder} to false.
	 */
    border :false,
    /**
	 * @cfg {String} id
	 *      <p>
	 *      The <b>unique</b> id of this component (defaults to
	 *      'consultation_panel'). You should assign an id if you need to be
	 *      able to access the component later and you do not have an object
	 *      reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).
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
	 *      see <tt>{@link #itemId}</tt>.
	 *      </p>
	 *      <p>
	 *      <b>Note</b>: to access the container of an item see
	 *      <tt>{@link #ownerCt}</tt>.
	 *      </p>
	 */
    id:'consultation_panel',
    /**
	 * @cfg {String} localeCls The locale css class (defaults to <tt>''</tt>).
	 */
    localeCls :'',
    /**
	 * @cfg {Boolean} hideCsvExportAlert if true hide the csv export alert for
	 *      IE (defaults to true).
	 */
    hideCsvExportAlert:false,
    /**
	 * @cfg {Boolean} hideCsvExportButton if true hide the csv export button
	 *      (defaults to false).
	 */
    hideCsvExportButton : false,
    /**
	 * @cfg {Boolean} hideGridCsvExportMenuItem if true hide the grid csv export
	 *      menu item (defaults to false).
	 */
    hideGridCsvExportMenuItem : false,
    /**
	 * @cfg {Boolean} hideAggregationCsvExportMenuItem if true hide the
	 *      aggregation csv export menu item (defaults to false).
	 */
    hideAggregationCsvExportMenuItem : false,
    /**
	 * @cfg {Boolean} hideInterpolationButton if true hide the interpolation
	 *      button (defaults to false).
	 */
    hideInterpolationButton : false,
    /**
	 * @cfg {Boolean} hideAggregationButton if true hide the aggregation button
	 *      (defaults to false).
	 */
    hideAggregationButton : false,
    /**
	 * @cfg {Boolean} hidePrintMapButton if true hide the Print Map Button
	 *      (defaults to false).
	 */
    hidePrintMapButton : true,
    /**
	 * @cfg {Boolean} hideDetails if true hide the details button in the result
	 *      panel (defaults to false).
	 */
    hideDetails : false,
    /**
	 * @cfg {Boolean} hideMapDetails if true hide the details button in map
	 *      toolbar (defaults to false).
	 */
    hideMapDetails : true,
    /**
	 * @cfg {Boolean} hideUserManualLink if true hide the user manual link
	 *      (defaults to true).
	 */
    hideUserManualLink : true,
    /**
	 * @cfg {Boolean} hidePredefinedRequestButton if true hide the predefined
	 *      request button (defaults to true).
	 */
    hidePredefinedRequestButton : true,
    /**
	 * @cfg {String} userManualLinkHref The user Manual Link Href (defaults to
	 *      <tt>'Genapp.base_url + 'pdf/User_Manual.pdf''</tt>)
	 */
    userManualLinkHref : Genapp.base_url + 'pdf/User_Manual.pdf',
    /**
	 * @cfg {String} userManualLinkText The user Manual LinkText (defaults to
	 *      <tt>'User Manual'</tt>)
	 */
    userManualLinkText : 'User Manual',
    /**
	 * @cfg {Boolean} hideDetailsVerticalLabel if true hide the details vertical
	 *      label (defaults to false).
	 */
    hideDetailsVerticalLabel: false,
    /**
	 * @cfg {Boolean} showGridOnSubmit if true activate the Grid Panel on the
	 *      form submit (defaults to false).
	 */
    showGridOnSubmit: false,
    /**
	 * @cfg {String} datasetComboBoxEmptyText The dataset Combo Box Empty Text
	 *      (defaults to <tt>'Please select a dataset'</tt>)
	 */
    datasetComboBoxEmptyText :"Please select a dataset...",
    /**
	 * @cfg {String} datasetPanelTitle The dataset Panel Title (defaults to
	 *      <tt>'Dataset'</tt>)
	 */
    datasetPanelTitle :'Dataset',
    /**
	 * @cfg {String} formsPanelTitle The forms Panel Title (defaults to
	 *      <tt>'Forms Panel'</tt>)
	 */
    formsPanelTitle :'Forms Panel',
    /**
	 * @cfg {String} csvExportButtonText The csv Export Button Text (defaults to
	 *      <tt>'Export CSV'</tt>)
	 */
    csvExportButtonText: 'Csv Export',
    /**
	 * @cfg {String} gridCsvExportMenuItemText The grid Csv Export Menu Item
	 *      Text (defaults to <tt>'Results'</tt>)
	 */
    gridCsvExportMenuItemText : 'Results',
    /**
	 * @cfg {String} aggregationCsvExportMenuItemText The aggregation Csv Export
	 *      Menu Item Text (defaults to <tt>'Aggregation cells'</tt>)
	 */
    aggregationCsvExportMenuItemText : 'Aggregation cells',
    /**
	 * @cfg {String} interpolationButtonText The interpolation Button Text
	 *      (defaults to <tt>'Interpolation'</tt>)
	 */
    interpolationButtonText: 'Interpolation',
    /**
	 * @cfg {String} aggregationButtonText The aggregation Button Text (defaults
	 *      to <tt>'Aggregation'</tt>)
	 */
    aggregationButtonText: 'Aggregation',
    /**
	 * @cfg {String} printMapButtonText The print Map Button Text (defaults to
	 *      <tt>'Print map'</tt>)
	 */
    printMapButtonText: 'Print map',
    /**
	 * @cfg {String} gridViewEmptyText The grid View Empty Text (defaults to
	 *      <tt>'No result...'</tt>)
	 */
    gridViewEmptyText : 'No result...',
    /**
	 * @cfg {String} gridPanelTitle The grid Panel Title (defaults to
	 *      <tt>'Results'</tt>)
	 */
    gridPanelTitle :'Results',
    /**
	 * @cfg {String} gridPanelTabTip The grid Panel Tab Tip (defaults to
	 *      <tt>'The request's results'</tt>)
	 */
    gridPanelTabTip:'The request\'s results',
    /**
	 * @cfg {String} centerPanelTitle The center Panel Title (defaults to
	 *      <tt>'Result Panel'</tt>)
	 */
    centerPanelTitle:'Result Panel',
    /**
	 * @cfg {String} queryPanelTitle The query Panel Title (defaults to
	 *      <tt>'Query Panel'</tt>)
	 */
    queryPanelTitle: "Query Panel",
    /**
	 * @cfg {String} queryPanelPinToolQtip The query Panel Pin Tool Qtip
	 *      (defaults to <tt>'Pin the panel'</tt>)
	 */
    queryPanelPinToolQtip: 'Pin the panel',
    /**
	 * @cfg {String} queryPanelUnpinToolQtip The query Panel Unpin Tool Qtip
	 *      (defaults to <tt>'Unpin the panel'</tt>)
	 */
    queryPanelUnpinToolQtip:'Unpin the panel',
    /**
	 * @cfg {String} queryPanelCancelButtonText The query Panel Cancel Button
	 *      Text (defaults to <tt>'Cancel'</tt>)
	 */
    queryPanelCancelButtonText: "Cancel",
    /**
	 * @cfg {String} queryPanelPredefinedRequestButtonText The query Panel
	 *      Predefined Request Button Text (defaults to
	 *      <tt>'Predefined Requests'</tt>)
	 */
    queryPanelPredefinedRequestButtonText: "Predefined Requests",
    /**
	 * @cfg {String} queryPanelResetButtonText The query Panel Reset Button Text
	 *      (defaults to <tt>'Reset'</tt>)
	 */
    queryPanelResetButtonText: "Reset",
    /**
	 * @cfg {String} queryPanelSearchButtonText The query Panel Search Button
	 *      Text (defaults to <tt>'Search'</tt>)
	 */
    queryPanelSearchButtonText:"Search",
    /**
	 * @cfg {String} queryPanelCancelButtonTooltip The query Panel Cancel Button
	 *      Tooltip (defaults to <tt>'Cancel the request'</tt>)
	 */
    queryPanelCancelButtonTooltip:"Cancel the request",
    /**
	 * @cfg {String} queryPanelPredefinedRequestButtonTooltip The query Panel
	 *      Predefined Request Button Tooltip (defaults to
	 *      <tt>'Go to the predefined request page'</tt>)
	 */
    queryPanelPredefinedRequestButtonTooltip:"Go to the predefined request page",
    /**
	 * @cfg {String} queryPanelResetButtonTooltip The query Panel Reset Button
	 *      Tooltip (defaults to <tt>'Reset the request'</tt>)
	 */
    queryPanelResetButtonTooltip:"Reset the request",
    /**
	 * @cfg {String} queryPanelSearchButtonTooltip The query Panel Search Button
	 *      Tooltip (defaults to <tt>'Launch the request'</tt>)
	 */
    queryPanelSearchButtonTooltip:"Launch the request",
    /**
	 * @cfg {String} detailsPanelCtTitle The details PanelCt Title (defaults to
	 *      <tt>'Details'</tt>)
	 */
    detailsPanelCtTitle:'Details',
    /**
	 * @cfg {String} detailsPanelCtPinToolQtip The details PanelCt Pin Tool Qtip
	 *      (defaults to <tt>'Pin the panel'</tt>)
	 */
    detailsPanelCtPinToolQtip: 'Pin the panel',
    /**
	 * @cfg {String} detailsPanelCtUnpinToolQtip The details PanelCt Unpin Tool
	 *      Qtip (defaults to <tt>'Unpin the panel'</tt>)
	 */
    detailsPanelCtUnpinToolQtip:'Unpin the panel',
    /**
	 * @cfg {Ext.LoadMask} mask The consultation page mask
	 */
    /**
	 * @cfg {Ext.LoadMask} mapMask The map Mask
	 */
    /**
	 * @cfg {String} mapMaskMsg The map Mask Msg (defaults to
	 *      <tt>'Loading...'</tt>)
	 */
    mapMaskMsg:"Loading...",
    /**
	 * @cfg {String} alertErrorTitle The alert Error Title (defaults to
	 *      <tt>'Error :'</tt>)
	 */
    alertErrorTitle:'Error :',
    /**
	 * @cfg {String} alertRequestFailedMsg The alert Request Failed Msg
	 *      (defaults to <tt>'Sorry, the request failed...'</tt>)
	 */
    alertRequestFailedMsg:'Sorry, the request failed...',

    /**
	 * @cfg {String} dateFormat The date format for the date fields (defaults to
	 *      <tt>'Y/m/d'</tt>)
	 */
    dateFormat:'Y/m/d',
    /**
	 * @cfg {String} csvExportAlertTitle The export CSV alert title (defaults to
	 *      <tt>'CSV exportation on IE'</tt>)
	 */
    csvExportAlertTitle:'CSV exportation on IE',
    /**
	 * @cfg {String} csvExportAlertMsg The export CSV alert message (defaults to
	 *      <tt>'On IE you have to:<br> - Change the opening of a csv file.<br> - Change the security.'</tt>)
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
	 * @cfg {Ext.SplitButton} aggregationButton The aggregation button
	 */
    /**
	 * @cfg {Ext.SplitButton} interpolationButton The interpolation button
	 */
    /**
	 * @cfg {Ext.Button} csvExportButton The csv export button
	 */
    /**
	 * @cfg {Ext.menu.Item} gridCsvExportMenuItem The grid csv export menu item
	 */
    /**
	 * @cfg {Ext.menu.Item} aggregationCsvExportMenuItem The aggregation csv
	 *      export menu item
	 */
    /**
	 * @cfg {Ext.menu.Menu} aggregationButtonMenu The aggregation button menu
	 */
    /**
	 * @cfg {Ext.form.ComboBox} aggregationButtonMenuDataCombo The aggregation
	 *      button menu data combo
	 */
    /**
	 * @cfg {Ext.form.ComboBox} aggregationButtonMenuGridsCombo The aggregation
	 *      button menu grids combo
	 */
    /**
	 * @cfg {Ext.menu.Menu} interpolationButtonMenu The interpolation button
	 *      menu
	 */
    /**
	 * @cfg {Ext.form.ComboBox} interpolationButtonMenuDataCombo The
	 *      interpolation button menu data combo
	 */
    /**
	 * @cfg {Ext.form.ComboBox} interpolationButtonMenuGridsCombo The
	 *      interpolation button menu grids combo
	 */
    /**
	 * @cfg {Ext.form.ComboBox} interpolationButtonMenuMethodsCombo The
	 *      interpolation button menu methods combo
	 */
    /**
	 * @cfg {Ext.form.ComboBox} interpolationButtonMenuMaxDistanceText The
	 *      interpolation button menu max distance text
	 */
    /**
	 * @cfg {Ext.form.ComboBox}
	 *      interpolationButtonMenuMaxDistanceTextDefaultValue The interpolation
	 *      button menu max distance text default value (default to 5000)
	 */
    interpolationButtonMenuMaxDistanceTextDefaultValue: 5000,
    /**
	 * @cfg {Ext.Button} mapPrintButton The map print button
	 */
    /**
	 * @cfg {Boolean} autoZoomOnResultsFeatures True to zoom automatically on
	 *      the results features
	 */
    autoZoomOnResultsFeatures: false,
    /**
	 * @cfg {Boolean} launchRequestOnPredefinedRequestLoad True to launch the
	 *      request on a prefefined request load (default to true)
	 */
    launchRequestOnPredefinedRequestLoad: true,
    /**
	 * @cfg {Boolean} collapseQueryPanelOnPredefinedRequestLoad True to collapse
	 *      the query panel on a prefefined request load (default to true)
	 */
    collapseQueryPanelOnPredefinedRequestLoad: true,

    // private
    initComponent : function() {
        /**
		 * The dataset Data Store.
		 * 
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
		 * 
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
		 * 
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
		 * 
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
		 * The grid data store array reader with a customized updateMetadata
		 * function.
		 * 
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
		 * 
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
		 * 
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
		 * 
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
		 * 
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
            bbar: this.pagingToolbar,
            listeners:{
                'activate': function (panel) {
                    if(!this.hideInterpolationButton){
                        this.interpolationButton.hide();
                    }
                    if(!this.hideAggregationButton){
                        this.aggregationButton.hide();
                    }
                    if(!this.hideCsvExportButton){
                        this.csvExportButton.show();
                    }
                    if(!this.hidePrintMapButton){
                        this.printMapButton.hide();
                    }
                },
                scope: this
            }
        });

        /**
		 * The map panel.
		 * 
		 * @property mapPanel
		 * @type Genapp.MapPanel
		 */
        this.mapPanel = new Genapp.MapPanel({
            hideMapDetails: this.hideMapDetails,
            listeners:{
                'activate': function (panel) {
                    if(!this.hideInterpolationButton){
                        this.interpolationButton.show();
                    }
                    if(!this.hideAggregationButton){
                        this.aggregationButton.show();
                    }
                    if(!this.hideCsvExportButton){
                        this.csvExportButton.hide();
                    }
                    if(!this.hidePrintMapButton){
                        this.printMapButton.show();
                    }
                },
                scope: this
            }
        });

        /**
		 * The center panel containing the map and the grid panels.
		 * 
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
                    // Set the ul dom to the size of the TabPanel instead of
					// 5000px by default
                    el.parent().setWidth('100%');
                    // Stop the event propagation to avoid the TabPanel error
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
                               // these items will render as dropdown menu
								// items when the arrow is clicked:
                               // {xtype: 'label', text:'Data:'},
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
                                       // delete the previous query in the
										// beforequery event or set
                                       // combo.lastQuery = null (this will
										// reload the store the next time it
										// expands)
                                       beforequery: function(qe){
                                           // delete qe.combo.lastQuery;
                                           qe.query = this.datasetComboBox.getValue();
                                           if(Ext.isEmpty(qe.query)){
                                               qe.cancel = true;
                                           }
                                       },
                                       scope:this
                                    }
                                }),
                               // {xtype: 'label', text:'Grid:'},
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
                                // these items will render as dropdown menu
								// items when the arrow is clicked:
                                // {xtype: 'label', text:'Data:'},
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
                                        // delete the previous query in the
										// beforequery event or set
                                        // combo.lastQuery = null (this will
										// reload the store the next time it
										// expands)
                                        beforequery: function(qe){
                                            // delete qe.combo.lastQuery;
                                            qe.query = this.datasetComboBox.getValue();
                                            if(Ext.isEmpty(qe.query)){
                                                qe.cancel = true;
                                            }
                                        },
                                        scope:this
                                     }
                                 }),
                                // {xtype: 'label', text:'Grid:'},
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
                if(!this.hidePrintMapButton){
                    this.printMapButton = addTopButton({
                        xtype:'button',
                        iconCls:'genapp-query-center-panel-print-map-button-icon',
                        text:this.printMapButtonText,
                        handler: this.printMap,
                        scope: this
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
            // collapseMode :'mini',
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
		 * The query form panel contains the dataset list and the corresponding
		 * forms.
		 * 
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
		 * 
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
            idDelimiter:'___' // Avoid a conflict with the Genapp id
								// separator('__')
        });

        this.detailsPanelPinned = true;
        /**
		 * The details panel container.
		 * 
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
            // collapseMode :'mini',
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
	 * Update the Forms Panel by adding the Panel corresponding to the selected
	 * dataset
	 * 
	 * @param {Object}
	 *            response The XMLHttpRequest object containing the response
	 *            data.
	 * @param {Object}
	 *            options The parameter to the request call.
	 * @param {Object}
	 *            apiParams The api parameters
	 * @param {Object}
	 *            criteriaValues The criteria values
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
        if(!Ext.isEmpty(apiParams)){
            if (apiParams.collapseQueryPanel == true) {
                this.queryPanel.collapse();
            }
            if (apiParams.launchRequest == true) {
                this.submitRequest();
            }
        }
    },

    /**
	 * Renders for the left tools column cell
	 * 
	 * @param {Object}
	 *            value The data value for the cell.
	 * @param {Object}
	 *            metadata An object in which you may set the following
	 *            attributes: {String} css A CSS class name to add to the cell's
	 *            TD element. {String} attr : An HTML attribute definition
	 *            string to apply to the data container element within the table
	 *            cell (e.g. 'style="color:red;"').
	 * @param {Ext.data.record}
	 *            record The {@link Ext.data.Record} from which the data was
	 *            extracted.
	 * @param {Number}
	 *            rowIndex Row index
	 * @param {Number}
	 *            colIndex Column index
	 * @param {Ext.data.Store}
	 *            store The {@link Ext.data.Store} object from which the Record
	 *            was extracted.
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
	 * 
	 * @param {String}
	 *            id The details id
	 * @param {String}
	 *            url The url to get the details
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
	 * 
	 * @param {String}
	 *            id The location id
	 * @param {String}
	 *            wkt a point WKT to be displayed as a flag.
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
                // The layer visibility must be set to true to handle the
				// 'loadend' event
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
                            break;
                        case 'NUMERIC':
                        	columnConf.xtype='numbercolumn';
                        	if (columns[i].decimals != null) {
                        		columnConf.format= this.numberPattern('.', columns[i].decimals);
                        	}
                        	break;
                        case 'RANGE':
                            columnConf.xtype='numbercolumn';
                            if (columns[i].decimals != null) {
                        		columnConf.format= this.numberPattern('.', columns[i].decimals);
                        	}                       
                            break;
                        case 'DATE':
                            columnConf.xtype='datecolumn';
                            columnConf.format = this.dateFormat;
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

                // The grid panel must be rendered and activated to resize
				// correctly
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
                       this.gridPanel.syncSize(); // Bug in Ext 3.2.1 (The
													// grid bottom tool bar
													// disappear)
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
	 * 
	 * @param {Object}
	 *            requestParams The parameters for the ajax request
	 * @param {Object}
	 *            apiParams The api parameters
	 * @param {Object}
	 *            criteriaValues The criteria values
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
	 * 
	 * @param {String}
	 *            requestName The request name
	 * @param {Object}
	 *            criteriaValues The criteria values
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
	 * 
	 * @param {String}
	 *            datasetId The dataset ID
	 */
    updateDatasetFormsPanel : function(datasetId) {
        this.updateFormsPanel({
            datasetId: datasetId
        });
    },

    /**
	 * Load a predefined request into the request panel
	 * 
	 * @param {Object}
	 *            request A object containing the predefined request data
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
            this.gridPanel.getView().updateAllColumnWidths();// Bug Ext 3.0
            // Remove the emptyText message
            this.gridPanel.getView().reset();
        }
    },

    /**
	 * Export the data as a CSV file
	 * 
	 * @param {String}
	 *            actionName The name of the action to call
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
	 * Print the map
	 * 
	 * @param {Ext.Button}
	 *            button The print map button
	 * @param {EventObject}
	 *            event The click event
	 */
    printMap : function (button, event) {
        // Get the BBOX
        var center = this.mapPanel.map.center;
        var zoom = this.mapPanel.map.zoom;
        
        // Get the layers
        var activatedLayers = this.mapPanel.map.getLayersBy('visibility', true);
        var activatedLayersNames = '';
        for (var i=0; i<activatedLayers.length; i++) {
        	if (activatedLayers[i].printable !== false) {
        		activatedLayersNames += activatedLayers[i].name + ',';
        	}
        }
        activatedLayersNames = activatedLayersNames.substr(0,activatedLayersNames.length - 1);

        Genapp.util.post(Genapp.base_url + 'map/ajaxgeneratemap', {
            center: center, 
            zoom : zoom, 
            layers: activatedLayersNames
        });
    },

    /**
	 * Show the consultation page mask
	 * 
	 * @param {Boolean}
	 *            hideOnFocus True to hide the mask on window focus
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
	 * Return the pattern used to format a number.
	 * 
	 * @param {String}
	 *            decimalSeparator the decimal separator (default to',')
	 * @param {Integer}
	 *            decimalPrecision the decimal precision
	 * @param {String}
	 *            groupingSymbol the grouping separator (absent by default)
	 */
    numberPattern: function (decimalSeparator, decimalPrecision, groupingSymbol) {
        // Building the number format pattern for use by ExtJS
		// Ext.util.Format.number
        var pattern = [];
        pattern.push('0');
        if (groupingSymbol) {
        	pattern.push(groupingSymbol + '000');
        }
        if (decimalPrecision) {
            pattern.push(decimalSeparator);
            for (var i = 0; i < decimalPrecision; i++) {
            	pattern.push('0');
            }
        }
        return pattern.join('');
    },

    /**
	 * Hide the consultation page mask
	 */
    hideMask : function () {
        this.mask.hide();
    },

    /**
	 * Add a vertical label to the collapsed panel
	 * 
	 * @param {Object}
	 *            the Ext.Panel
	 * @param {String}
	 *            the css class
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
	 * @param {String}
	 *            serviceName The service name
	 * @param {String}
	 *            callback A callback function to call when the status is equal
	 *            to 'OK'
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
/**
 * Simple date range picker class.
 * 
 * @class Genapp.DateRangePicker
 * @extends Ext.Panel
 * @constructor Create a new DateRangePicker
 * @param {Object} config The config object
 * @xtype daterangepicker
 */

Ext.namespace('Genapp');

Genapp.DateRangePicker = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'column'.
     */
    layout: 'column',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-menu-date-range-item').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-menu-date-range-item',
    /**
     * @cfg {String} buttonAlign
     * The alignment of any {@link #buttons} added to this panel.  Valid values are 'right',
     * 'left' and 'center' (defaults to 'center').
     */
    buttonAlign: 'center',
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to false).
     */
    hideValidationButton : false,
    /**
     * @cfg {String} tbarStartDateButtonText
     * The tbar start date button text (defaults to <tt>'Start Date ...'</tt>)
     */
    tbarStartDateButtonText:'Start Date ...',
    /**
     * @cfg {String} tbarRangeDateButtonText
     * The tbar range date button text (defaults to <tt>'Range Date'</tt>)
     */
    tbarRangeDateButtonText:'Range Date',
    /**
     * @cfg {String} tbarEndDateButtonText
     * The tbar end date button text (defaults to <tt>'... End Date'</tt>)
     */
    tbarEndDateButtonText:'... End Date',
    /**
     * @cfg {String} fbarOkButtonText
     * The fbar ok button text (defaults to <tt>'ok'</tt>)
     */
    fbarOkButtonText:'ok',
    /**
     * The selected dates (Default to '{startDate:null, endDate:null}'). Read-only.
     * @type Object
     * @property selectedDate
     */
    selectedDate: {startDate:null, endDate:null},

    // private
    initComponent : function(){
        this.items = [
            /**
             * The start date picker (The left picker).
             * @property startDatePicker
             * @type Ext.DatePicker
             */
            this.startDatePicker = new Ext.DatePicker(Ext.apply({
                internalRender: this.strict || !Ext.isIE,
                ctCls: 'x-menu-date-item',
                columnWidth: .5
                }, this.initialConfig)
            ),{
                xtype:'spacer',
                width:5,
                html:'&nbsp;' // For FF and IE8
            },
            /**
             * The end date picker (The right picker).
             * @property endDatePicker
             * @type Ext.DatePicker
             */
            this.endDatePicker = new Ext.DatePicker(Ext.apply({
                internalRender: this.strict || !Ext.isIE,
                ctCls: 'x-menu-date-item',
                columnWidth: .5
                }, this.initialConfig)
            )
        ];

        this.startDatePicker.on('select',this.startDateSelect, this);
        this.endDatePicker.on('select',this.endDateSelect, this);

        /**
         * The top toolbar.
         * @property tbar
         * @type Ext.Toolbar
         */
        this.tbar= new Ext.Toolbar({
             items: [
             this.startDateButton = new Ext.Button({
                 text: this.tbarStartDateButtonText,
                 cls: 'x-menu-date-range-item-start-date-button',
                 enableToggle: true,
                 allowDepress: false,
                 toggleGroup: 'DateButtonsGroup',
                 toggleHandler: this.onStartDatePress.createDelegate(this)
             }),
             this.rangeDateButton = new Ext.Button({
                 text: this.tbarRangeDateButtonText,
                 cls: 'x-menu-date-range-item-range-date-button',
                 pressed:true,
                 enableToggle: true,
                 allowDepress: false,
                 toggleGroup: 'DateButtonsGroup',
                 toggleHandler: this.onRangeDatePress.createDelegate(this)
             }),'->',
             this.endDateButton = new Ext.Button({
                 text: this.tbarEndDateButtonText,
                 cls: 'x-menu-date-range-item-end-date-button',
                 enableToggle: true,
                 allowDepress: false,
                 toggleGroup: 'DateButtonsGroup',
                 toggleHandler: this.onEndDatePress.createDelegate(this)
             })]
         });

        if(!this.hideValidationButton){
            this.fbar = new Ext.Toolbar({
                cls: 'x-date-bottom',
                items: [{
                    xtype:'button',
                    text:this.fbarOkButtonText,
                    width:'auto',
                    handler:this.onOkButtonPress.createDelegate(this)
                }]
            });
        }

        Genapp.DateRangePicker.superclass.initComponent.call(this);
    },

    // private
    onRangeDatePress: function (button, state){
        if(state){
            this.startDatePicker.enable();
            this.endDatePicker.enable();
            this.resetDates();
        }
    },

    // private
    onStartDatePress: function (button, state){
        if(state){
            this.startDatePicker.enable();
            this.endDatePicker.disable();
            this.resetDates();
        }
    },

    // private
    onEndDatePress: function (button, state){
        if(state){
            this.startDatePicker.disable();
            this.endDatePicker.enable();
            this.resetDates();
        }
    },

    // private
    startDateSelect: function (startDatePicker, date){
        this.selectedDate.startDate = date;
        if(this.startDateButton.pressed){
            this.returnSelectedDate();
        }else{ // rangeDateButton is pressed
            if(this.selectedDate.endDate !== null){
                this.returnSelectedDate();
            }
        }
    },

    // private
    endDateSelect: function (endDatePicker, date){
        this.selectedDate.endDate = date;
        if(this.endDateButton.pressed){
            this.returnSelectedDate();
        }else{ // rangeDateButton is pressed
            if(this.selectedDate.startDate !== null){
                this.returnSelectedDate();
            }
        }
    },

    // private
    resetselectedDate: function(){
        this.selectedDate = {
            startDate:null,
            endDate:null
        };
    },

    /**
     * Reset the dates
     */
    resetDates: function(){
        this.resetselectedDate();
        this.startDatePicker.setValue(this.startDatePicker.defaultValue);
        this.endDatePicker.setValue(this.endDatePicker.defaultValue);
    },

    // private
    returnSelectedDate: function(){
        this.fireEvent('select', this, this.selectedDate);
        this.resetselectedDate();
    },

    /**
     * Checks if the date is in the interval [minDate,maxDate] of the picker
     */
    isEnabledDate: function (picker){
        if((picker.activeDate.getTime() - picker.minDate.getTime() >= 0) 
                && (picker.maxDate.getTime() - picker.activeDate.getTime() >= 0)){
            return true;
        } else {
            return false;
        }
    },

    // private
    onOkButtonPress: function (button, state){
        if (state){
            if (this.startDateButton.pressed){
                if (this.isEnabledDate(this.startDatePicker)){
                    this.selectedDate = {
                        startDate:this.startDatePicker.activeDate,
                        endDate:null
                    };
                    this.returnSelectedDate();
                }
            } else if(this.endDateButton.pressed){
                if (this.isEnabledDate(this.endDatePicker)){
                    this.selectedDate = {
                        startDate:null,
                        endDate:this.endDatePicker.activeDate
                    };
                    this.returnSelectedDate();
                }
            } else {
                if (this.isEnabledDate(this.startDatePicker) && this.isEnabledDate(this.endDatePicker)){
                    this.selectedDate = {
                        startDate:this.startDatePicker.activeDate,
                        endDate:this.endDatePicker.activeDate
                    };
                    this.returnSelectedDate();
                }
            }
        }
    }
});
Ext.reg('daterangepicker', Genapp.DateRangePicker);/**
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
     * @cfg {Ext.XTemplate} tpl
     * A {@link Ext.XTemplate} used to setup the details panel body.
     */
    tpl : new Ext.XTemplate(
        '<tpl for="map">',
            '<img title="{title}" src="{url}">',
        '</tpl>',
        '<tpl for="formats">',
            '<tpl if="is_array != true">',
                '<fieldset>',
                    '<legend align="top"> {title} </legend>',
                    '<tpl for="fields">',
                        '<p><b>{label} :</b> {value}</p>',
                    '</tpl>',
                '</fieldset>',
            '</tpl>',
            '<tpl if="is_array == true">',
                '<table>',
                '<caption>{title}</caption>',
                '<tr>',
                    '<tpl for="columns">',
                        '<th>{label}</th>',
                    '</tpl>',
                '</tr>',
                    '<tpl for="rows">',
                        '<tr>',
                            '<tpl for=".">',
                                '<td>{.}</td>',
                            '</tpl>',
                        '</tr>',
                    '</tpl>',
                '</table>',
            '</tpl>',
        '</tpl>'
    ),
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
});/**
 * Show one field form.
 * 
 * The following parameters are expected :
 * title : The title of the form
 * id : The identifier of the form
 * 
 * @class Genapp.FieldForm
 * @extends Ext.Panel
 * @constructor Create a new FieldForm
 * @param {Object} config The config object
 */
Genapp.FieldForm = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} frame
     * See {@link Ext.Panel#frame}.
     * Default to true.
     */
    frame:true,
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-field-form-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-query-field-form-panel',
    /**
     * @cfg {String} criteriaPanelTbarLabel
     * The criteria Panel Tbar Label (defaults to <tt>'Criteria'</tt>)
     */
    criteriaPanelTbarLabel:'Criteria',
    /**
     * @cfg {String} criteriaPanelTbarComboLoadingText
     * The criteria Panel Tbar Combo Loading Text (defaults to <tt>'searching...'</tt>)
     */
    criteriaPanelTbarComboLoadingText:'searching...',
    /**
     * @cfg {String} columnsPanelTbarLabel
     * The columns Panel Tbar Label (defaults to <tt>'Columns'</tt>)
     */
    columnsPanelTbarLabel:'Columns',
    /**
     * @cfg {String} columnsPanelTbarComboEmptyText
     * The columns Panel Tbar Combo Empty Text (defaults to <tt>'Select...'</tt>)
     */
    columnsPanelTbarComboEmptyText:'Select...',
    /**
     * @cfg {String} columnsPanelTbarComboLoadingText
     * The columns Panel Tbar Combo Loading Text (defaults to <tt>'searching...'</tt>)
     */
    columnsPanelTbarComboLoadingText:'searching...',
    /**
     * @cfg {String} columnsPanelTbarAddAllButtonTooltip
     * The columns Panel Tba rAdd All Button Tooltip (defaults to <tt>'Add all the columns'</tt>)
     */
    columnsPanelTbarAddAllButtonTooltip:'Add all the columns',
    /**
     * @cfg {String} columnsPanelTbarRemoveAllButtonTooltip
     * The columns Panel Tbar Remove All Button Tooltip (defaults to <tt>'Remove all the columns'</tt>)
     */
    columnsPanelTbarRemoveAllButtonTooltip:'Remove all the columns',

    // private
    initComponent : function() {
        /**
         * The criteria Data Store.
         * @property criteriaDS
         * @type Ext.data.JsonStore
         */
        this.criteriaDS = new Ext.data.JsonStore({
            fields:[
                {name:'name',mapping:'a'},
                {name:'label',mapping:'b'},
                {name:'inputType',mapping:'c'},
                {name:'type',mapping:'d'},
                {name:'definition',mapping:'e'},
                {name:'is_default',mapping:'f'},
                {name:'default_value',mapping:'g'},
                {name:'params',mapping:'p'}
            ],
            data:this.criteria
        });

        /**
         * The columns Data Store.
         * @property columnsDS
         * @type Ext.data.JsonStore
         */
        this.columnsDS = new Ext.data.JsonStore({
            fields:[
                {name:'name',mapping:'a'},
                {name:'label',mapping:'b'},
                {name:'definition',mapping:'c'},
                {name:'is_default',mapping:'d'},
                {name:'params',mapping:'p'}
            ],
            data:this.columns
        });

        /**
         * The panel used to show the criteria.
         * @property criteriaPanel
         * @type Ext.Panel
         */
        this.criteriaPanel = new Ext.Panel({
            layout:'form',
            hidden:Ext.isEmpty(this.criteria) ? true:false,
            hideMode:'offsets',
            labelWidth:120,
            cls:'genapp-query-criteria-panel',
            defaults: {
                labelStyle: 'padding: 0; margin-top:3px', 
                width: 180
            },
            listeners:{
                'add': function(container, cmp, index){
                    if(container.defaultType === 'panel') { // The add event is not only called for the items
                        // Add a class to the first child for IE7 layout
                        if(index == 0){
                            var className = 'first-child';
                            if (cmp.rendered) {
                                cmp.getEl().addClass(className);
                            } else {
                                cmp.itemCls ? cmp.itemCls += ' ' + className : cmp.itemCls = className;
                            }
                        }
                        // Setup the name of the field
                        var subName = cmp.name;
                        var i = 0;
                        var foundComponents;
                        var tmpName = '';
                        var criteriaPanel = cmp.ownerCt;
                        do {
                            tmpName = subName + '[' + i++ + ']';
                        }
                        while (criteriaPanel.items.findIndex('name',tmpName) !== -1);
                        cmp.name = cmp.hiddenName = tmpName;
                    }          
                },
                scope: this
            },
            items:  this.getDefaultCriteriaConfig(),
            tbar: [
                {
                    // Filler
                    xtype: 'tbfill'
                },
                    //The label
                    new Ext.Toolbar.TextItem(this.criteriaPanelTbarLabel),
                {
                    // A spacer
                    xtype: 'tbspacer'
                },
                {
                    // The combobox with the list of available criterias
                    xtype: 'combo',
                    hiddenName: 'Criteria',
                    store : this.criteriaDS,
                    editable :false,
                    displayField :'label',
                    valueField :'name',
                    mode :'local',
                    width :220,
                    maxHeight :100,
                    triggerAction :'all',
                    emptyText:this.criteriaPanelTbarComboEmptyText,
                    loadingText :this.criteriaPanelTbarComboLoadingText,
                    listeners : {
                        scope :this,
                        'select' : {
                            fn : this.addCriteria,
                            scope :this
                        }
                    }
                },
                {
                    // A spacer
                    xtype: 'tbspacer'
                }
            ]
        });

        /**
         * The panel used to show the columns.
         * @property columnsPanel
         * @type Ext.Panel
         */
        this.columnsPanel = new Ext.Panel({
            layout:'form',
            hidden:Ext.isEmpty(this.columns) ? true:false,
            hideMode:'offsets',
            cls:'genapp-query-columns-panel',
            items: this.getDefaultColumnsConfig(),
            tbar: [
               {
                    // The add all button
                    xtype: 'tbbutton',
                    tooltip:this.columnsPanelTbarAddAllButtonTooltip,
                    ctCls: 'genapp-tb-btn',
                    iconCls: 'genapp-tb-btn-add',
                    handler: this.addAllColumns,
                    scope:this
               },
               {
                    // The remove all button
                    xtype: 'tbbutton',
                    tooltip:this.columnsPanelTbarRemoveAllButtonTooltip,
                    ctCls: 'genapp-tb-btn',
                    iconCls: 'genapp-tb-btn-remove',
                    handler: this.removeAllColumns,
                    scope:this
               },
               {
                    // Filler
                    xtype: 'tbfill'
               },
                    // The label
                    new Ext.Toolbar.TextItem(this.columnsPanelTbarLabel),
               {
                    // A space
                    xtype: 'tbspacer'
               },
               {
                    // The combobox with the list of available columns
                    xtype: 'combo',
                    fieldLabel: 'Columns',
                    hiddenName: 'Columns',
                    store : this.columnsDS,
                    editable :false,
                    displayField :'label',
                    valueField :'name',
                    mode :'local',
                    width :220,
                    maxHeight :100,
                    triggerAction :'all',
                    emptyText:this.columnsPanelTbarComboEmptyText,
                    loadingText :this.columnsPanelTbarComboLoadingText,
                    listeners : {
                        scope :this,
                        'select' : {
                            fn : this.addColumn,
                            scope :this
                        }
                    }
                },
                {xtype: 'tbspacer'}
            ]
        });

        if (!this.items) {
            this.items = [ this.criteriaPanel, this.columnsPanel ];
        }
        this.collapsible = true;
        this.titleCollapse = true;
        Genapp.FieldForm.superclass.initComponent.call(this);
        
        this.doLayout();
        
    },

    /**
     * Add the selected criteria to the list of criteria.
     * @param {Ext.form.ComboBox} combo The criteria combobox
     * @param {Ext.data.Record} record The criteria combobox record to add
     * @param {Number} index The criteria combobox record index
     * @hide
     */
    addCriteria : function(combo, record, index) {
        if(combo !== null){
            combo.clearValue();
            combo.collapse();
        }
        // Add the field
        this.criteriaPanel.add(this.getCriteriaConfig(record.data, false));
        this.criteriaPanel.doLayout();
    },

    /**
     * Construct the default criteria
     * @return {Array} An array of the default criteria config
     */
    getDefaultCriteriaConfig : function() {
        var items = [];
        this.criteriaDS.each(function(record){
            if(record.data.is_default){
                // if the field have multiple default values, duplicate the criteria
                var defaultValue = record.data.default_value;
                if(!Ext.isEmpty(defaultValue)){
                    var defaultValues = defaultValue.split(';');
                    var criteriaValuesEmpty = Ext.isEmpty(this.form.criteriaValues);
                    for (var i = 0; i < defaultValues.length; i++) {
                        // clone the object
                        var newRecord = record.copy();
                        if(criteriaValuesEmpty){
                            newRecord.data.default_value = defaultValues[i];
                        }else{
                            var fieldValues = this.form.criteriaValues['criteria__'+newRecord.data.name];
                            if(!Ext.isEmpty(fieldValues)){
                                if(Ext.isArray(fieldValues)){
                                    newRecord.data.default_value = fieldValues[i];
                                }else{
                                    newRecord.data.default_value = fieldValues;
                                }
                            }else{
                                newRecord.data.default_value = defaultValues[i];
                            }
                        }
                        this.items.push(this.form.getCriteriaConfig(newRecord.data, false));
                    }
                }
            }
        },{form:this, items:items})
        return items;
    },

    /**
     * Add the selected column to the column list.
     * @param {Ext.form.ComboBox} combo The column combobox
     * @param {Ext.data.Record} record The column combobox record to add
     * @param {Number} index The column combobox record index
     * @hide
     */
    addColumn : function(combo, record, index) {
        if(combo !== null){
            combo.clearValue();
            combo.collapse();
        }
        if (this.columnsPanel.find('name', 'column__' + record.data.name).length === 0){
            // Add the field
            this.columnsPanel.add(this.getColumnConfig(record.data));
            this.columnsPanel.doLayout();
        }
    },

    /**
     * Construct a column for the record
     * @param {Ext.data.Record} record The column combobox record to add
     * @hide
     */
    getColumnConfig : function(record){
        var field = {
            xtype: 'container',
            autoEl: 'div',
            cls: 'genapp-query-column-item',
            items: [{
                xtype:'box',
                autoEl:{
                    tag:'div',
                    cls:'columnLabelBin',
                    html:'&nbsp;&nbsp;&nbsp;&nbsp;'
                },
                listeners:{
                    'render':function(cmp){
                        cmp.getEl().on(
                            'click',
                            function(event,el,options){
                                this.columnsPanel.remove(cmp.ownerCt);
                            },
                            this,
                            {
                                single:true
                            }
                        );
                    },
                    scope:this
                }
            },{
                xtype:'box',
                autoEl:{
                    tag:'span',
                    cls: 'columnLabel',
                    'ext:qtitle':Genapp.util.htmlStringFormat(record.label),
                    'ext:qwidth':200,
                    'ext:qtip':Genapp.util.htmlStringFormat(record.definition),
                    html:record.label
                }
            },{
                xtype: 'hidden',
                name: 'column__' + record.name,
                value: '1'
            }]
        };
        return field;
    },

    /**
     * Construct the default columns
     * @return {Array} An array of the default columns config
     */
    getDefaultColumnsConfig : function(){
        var items = [];
        this.columnsDS.each(function(record){
            if(record.data.is_default){
                this.items.push(this.form.getColumnConfig(record.data));
            }
        },{form:this, items:items})
        return items;
    },

    /**
     * Adds all the columns of a column panel
     */
    addAllColumns: function() {
        this.columnsDS.each( 
            function(record){
                this.addColumn(null, record);
            }, 
            this
        );
    },

    /**
     * Adds all the columns of a column panel
     */
    removeAllColumns: function() {
        this.columnsPanel.removeAll();
    }

});

Ext.apply(Genapp.FieldForm.prototype, {
    /**
     * @cfg {String} criteriaPanelTbarComboEmptyText
     * The criteria Panel Tbar Combo Empty Text (defaults to <tt>'Select...'</tt>)
     */
    criteriaPanelTbarComboEmptyText:'Select...',

    /**
     * @cfg {String} dateFormat
     * The date format for the date fields (defaults to <tt>'Y/m/d'</tt>)
     */
    dateFormat:'Y/m/d',

    /**
     * Construct a criteria from the record
     * @param {Ext.data.Record} record The criteria combobox record to add
     * @param {Boolean} hideBin True to hide the bin
     * @hide
     */
    getCriteriaConfig : function(record, hideBin){
        // If the field have multiple default values, duplicate the criteria
        if(!Ext.isEmpty(record.default_value) && Ext.isString(record.default_value) && record.default_value.indexOf(';') != -1){
            var fields = [];
            var defaultValues = record.default_value.split(';');
            for (var i = 0; i < defaultValues.length; i++) {
                record.default_value = defaultValues[i];
                fields.push(Genapp.FieldForm.prototype.getCriteriaConfig(record, hideBin));
            }
            return fields;
        }
        var field = {};
        field.name = 'criteria__' + record.name;

        // Creates the ext field config
        switch(record.inputType){
            case 'SELECT':  // The input type SELECT correspond generally to a data type CODE
                field.xtype = 'combo';
                field.itemCls = 'trigger-field'; // For IE7 layout
                field.hiddenName = field.name;
                field.triggerAction = 'all';
                field.typeAhead = true;
                field.mode = 'local';
                field.displayField = 'label';
                field.valueField  = 'code';
                field.emptyText = Genapp.FieldForm.prototype.criteriaPanelTbarComboEmptyText;
                field.disableKeyFilter = true;
                field.store = new Ext.data.ArrayStore({
                    fields:['code','label'],
                    data : record.params.options
                });
                break;
            case 'DATE': // The input type DATE correspond generally to a data type DATE
                field.xtype = 'daterangefield';
                field.itemCls = 'trigger-field'; // For IE7 layout
                field.format = Genapp.FieldForm.prototype.dateFormat;
                break;
            case 'NUMERIC': // The input type NUMERIC correspond generally to a data type NUMERIC or RANGE
                field.xtype = 'numberrangefield';
                field.itemCls = 'trigger-field'; // For IE7 layout
                // If RANGE we set the min and max values
                if (record.type=='RANGE') {
                    field.minValue = record.params.min;
                    field.maxValue = record.params.max;
                }
                // IF INTEGER we remove the decimals
                if (record.type=='INTEGER') {
                    field.allowDecimals = false;
                    field.decimalPrecision = 0;
                }
                break;
            case 'CHECKBOX':
                 field.xtype = 'switch_checkbox';
                 field.ctCls = 'improvedCheckbox';
                 switch(record.default_value){
                     case 1:
                     case '1':
                     case true:
                     case 'true':
                         field.inputValue = '1';
                         break;
                     default:
                         field.inputValue = '0';
                     break;
                 }
                 //field.boxLabel = record.label;
                 break;
            case 'RADIO':
            case 'TEXT':
                switch(record.type){
                    // TODO : BOOLEAN, COORDINATE
                    case 'INTEGER':
                        field.xtype  = 'numberfield';
                        field.allowDecimals = false;
                        break;
                    case 'NUMERIC':
                        field.xtype  = 'numberfield';
                        break;
                    default : // STRING
                        field.xtype  = 'textfield';
                        break;
                }
                break;
            case 'GEOM':
                field.xtype = 'geometryfield';
                field.itemCls = 'trigger-field'; // For IE7 layout
                break;
            default: 
                field.xtype  = 'field';
            break;
        }
        if(!Ext.isEmpty(record.default_value)){
            field.value = record.default_value;
        }
        if(!Ext.isEmpty(record.fixed)){
            field.disabled = record.fixed;
        }
        field.fieldLabel = record.label;

        if (!hideBin) {
            field.listeners = {
                'render':function(cmp){
                    // Add the bin
                    var binCt = Ext.get('x-form-el-' + cmp.id).parent();
                    var labelDiv = binCt.child('.x-form-item-label');
                    labelDiv.set({
                        'ext:qtitle':record.label,
                        'ext:qwidth':200,
                        'ext:qtip':record.definition
                    });
                    labelDiv.addClass('labelNextBin');
                    var binDiv = binCt.createChild({
                        tag: "div",
                        cls: "filterBin"
                    }, labelDiv);
                    binDiv.insertHtml('afterBegin', '&nbsp;&nbsp;&nbsp;');
                    binDiv.on(
                        'click',
                        function(event,el,options){
                            cmp.ownerCt.remove(cmp);
                        },
                        this,
                        {
                            single:true
                        }
                    );
                },
                scope:this
            };
        }
        return field;
    }
});/**
 * Panel containing the dynamic map.
 * <p>
 * Contains : <br/>
 * a panel for the map.<br/> 
 * a mapfish.widgets.LayerTree for the legend.<br/>
 * <br/>
 * @class Genapp.MapPanel
 * @extends Ext.Panel
 * @constructor Create a new MapPanel
 * @param {Object} config The config object
 */
Genapp.MapPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} frame
     * See {@link Ext.Panel#frame}.
     * Default to true.
     */
    frame : true,
    /**
     * @cfg {Boolean} collapsible
     * True to make the panel collapsible and have the expand/collapse toggle button automatically rendered into
     * the header tool button area, false to keep the panel statically sized with no button (defaults to true).
     */
    collapsible : true,
    /**
     * @cfg {Boolean} titleCollapse
     * true to allow expanding and collapsing the panel (when {@link #collapsible} = true)
     * by clicking anywhere in the header bar, false) to allow it only by clicking to tool button
     * (defaults to true)). If this panel is a child item of a border layout also see the
     * {@link Ext.layout.BorderLayout.Region BorderLayout.Region}
     * {@link Ext.layout.BorderLayout.Region#floatable floatable} config option.
     */
    titleCollapse : true,
    /**
     * @cfg {String} title
     * The title text to be used as innerHTML (html tags are accepted) to display in the panel
     * {@link #header} (defaults to 'Map'). When a title is specified the
     * {@link #header} element will automatically be created and displayed unless
     * {@link #header} is explicitly set to false.  If you do not want to specify a
     * title at config time, but you may want one later, you must either specify a non-empty
     * title (a blank space ' ' will do) or header:true so that the container
     * element will get created.
     */
    title : 'Map',
    /**
     * @cfg {Boolean} header
     * true to create the Panel's header element explicitly, false to skip creating
     * it.  If a {@link #title} is set the header will be created automatically, otherwise it will not.
     * If a {@link #title} is set but header is explicitly set to false, the header
     * will not be rendered.
     */
    header: false,
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'border'.
     */
    layout : 'border',
    /**
     * @cfg {Boolean} isDrawingMap
     * true to display the drawing tools on the toolbar. (Default to false)
     */
    isDrawingMap : false,
    /**
     * @cfg {String} featureWKT
     * A wkt feature to draw on the map. (Default to null)
     */
    featureWKT : null,
    /**
     * @cfg {String} tabTip
     * A string to be used as innerHTML (html tags are accepted) to show in a tooltip when mousing over
     * the tab of a Ext.Panel which is an item of a {@link Ext.TabPanel}. {@link Ext.QuickTips}.init()
     * must be called in order for the tips to render.
     * Default to 'The map with the request's results's location'
     */
    tabTip: 'The map with the request\'s results\'s location',
    /**
     * @cfg {Boolean} hideLayersAndLegendVerticalLabel
     * if true hide the layers and legends vertical label (defaults to false).
     */
    hideLayersAndLegendVerticalLabel: false,
    /**
     * @cfg {Boolean} rightPanelCollapsed
     * True to start with the right panel collapsed (defaults to false)
     */
    rightPanelCollapsed : false,
    /**
     * @cfg {Number} rightPanelWidth
     * The rigth panel default width (defaults to 170)
     */
    rightPanelWidth : 170,
    /**
     * @cfg {String} layerPanelTitle
     * The layer Panel Title (defaults to <tt>'Layers'</tt>)
     */
    layerPanelTitle:"Layers",
    /**
     * @cfg {String} layerPanelTabTip
     * The layer Panel Tab Tip (defaults to <tt>'The layers's tree'</tt>)
     */
    layerPanelTabTip:"The layers's tree",
    /**
     * @cfg {String} legendPanelTitle
     * The legend Panel Title (defaults to <tt>'Legends'</tt>)
     */
    legendPanelTitle:"Legends",
    /**
     * @cfg {String} legendPanelTabTip
     * The legend Panel Tab Tip (defaults to <tt>'The layers's legends'</tt>)
     */
    legendPanelTabTip:"The layers's legends",
    /**
     * @cfg {String} panZoomBarControlTitle
     * The panZoomBar Control Title (defaults to <tt>'Zoom'</tt>)
     */
    panZoomBarControlTitle:"Zoom",
    /**
     * @cfg {String} navigationControlTitle
     * The navigation Control Title (defaults to <tt>'Drag the map'</tt>)
     */
    navigationControlTitle: "Drag the map",
    /**
     * @cfg {String} selectFeatureControlTitle
     * The selectFeature Control Title (defaults to <tt>'Select Feature'</tt>)
     */
    selectFeatureControlTitle: "Select Feature",
    /**
     * @cfg {String} invalidWKTMsg
     * The invalid WKT Msg (defaults to <tt>'The feature cannot be displayed'</tt>)
     */
    invalidWKTMsg:"The feature cannot be displayed",
    /**
     * @cfg {String} zoomToFeaturesControlTitle
     * The zoomToFeatures Control Title (defaults to <tt>'Zoom to the features'</tt>)
     */
    zoomToFeaturesControlTitle:"Zoom to the features",
    /**
     * @cfg {String} drawFeatureControlTitle
     * The drawFeature Control Title (defaults to <tt>'Draw a polygon'</tt>)
     */
    drawFeatureControlTitle: "Draw a polygon",
    /**
     * @cfg {String} modifyFeatureControlTitle
     * The modifyFeature Control Title (defaults to <tt>'Update the feature'</tt>)
     */
    modifyFeatureControlTitle: "Update the feature",
    /**
     * @cfg {String} tbarDeleteFeatureButtonTooltip
     * The tbar Delete Feature Button Tooltip (defaults to <tt>'Delete the feature'</tt>)
     */
    tbarDeleteFeatureButtonTooltip:"Delete the feature",
    /**
     * @cfg {String} tbarPreviousButtonTooltip
     * The tbar Previous Button Tooltip (defaults to <tt>'Previous Position'</tt>)
     */
    tbarPreviousButtonTooltip:"Previous Position",
    /**
     * @cfg {String} tbarNextButtonTooltip
     * The tbar Next Button Tooltip (defaults to <tt>'Next Position'</tt>)
     */
    tbarNextButtonTooltip:"Next Position",
    /**
     * @cfg {String} zoomBoxInControlTitle
     * The zoomBox In Control Title (defaults to <tt>'Zoom in'</tt>)
     */
    zoomBoxInControlTitle:"Zoom in",
    /**
     * @cfg {String} zoomBoxOutControlTitle
     * The zoomBox Out Control Title (defaults to <tt>'Zoom out'</tt>)
     */
    zoomBoxOutControlTitle:"Zoom out",
    /**
     * @cfg {String} zoomToMaxExtentControlTitle
     * The zoomToMax Extent Control Title (defaults to <tt>'Zoom to max extend'</tt>)
     */
    zoomToMaxExtentControlTitle: "Zoom to max extend",
    /**
     * @cfg {String} featureInfoControlTitle
     * The feature Info Control Title (defaults to <tt>'Get the plot location information'</tt>)
     */
    featureInfoControlTitle: "Get the plot location information",
    /**
     * @cfg {Boolean} hideLegalMentions
     * if true hide the legal mentions link.
     */
    hideLegalMentions : true,
    /**
     * @cfg {String} legalMentionsLinkHref
     * The user Manual Link Href (defaults to <tt>'Genapp.base_url + 'map/show-legal-mentions''</tt>)
     */
    legalMentionsLinkHref : Genapp.base_url + 'map/show-legal-mentions',
    /**
     * @cfg {String} legalMentionsLinkText
     * The legal mentions LinkText (defaults to <tt>'User Manual'</tt>)
     */
    legalMentionsLinkText : 'Legal Mentions',
    /**
     * @cfg {Integer} minZoomLevel
     * The min zoom level for the map (defaults to <tt>0</tt>)
     */
    minZoomLevel: 0,
    /**
     * @cfg {String} resultsBBox
     * The results bounding box (defaults to <tt>null</tt>)
     */
    resultsBBox: null,
    /**
     * @cfg {Object} layersActivation
     * A object containing few arrays of layers ordered by activation type (defaults to <tt>{}</tt>)
     * {
     *     'request':[resultLayer, resultLayer0, resultLayer1],
     *     'aggregation':[aggregatedLayer0, aggregatedLayer1, aggregatedLayer2],
     *     'interpolation':[interpolatedLayer]
     * }
     */
    layersActivation: {},

    // private
    initComponent : function() {

        this.addEvents(
            /**
             * @event afterinit
             * Fires after the map panel is rendered and after all the initializations (map, tree, toolbar).
             * @param {Genapp.MapPanel} this
             */
            'afterinit'
        );

        /**
         * The map top toolbar.
         * @type {mapfish.widgets.toolbar.Toolbar}
         * @property toolbar
         */
        this.toolbar = new mapfish.widgets.toolbar.Toolbar({
            configurable: false
        });

        /**
         * The container of the layers and the legends panels.
         * @property layersAndLegendsPanel
         * @type Ext.TabPanel
         */
        this.layersAndLegendsPanel = new Ext.TabPanel({
            region : 'east',
            width : this.rightPanelWidth,
            collapsed : this.rightPanelCollapsed,
            collapsible : true,
            titleCollapse : false,
            cls : 'genapp-query-map-right-panel',
            activeItem: 0,
            split:true,
            items:[
                /**
                 * The layers panel.
                 * @property layerPanel
                 * @type Ext.Panel
                 */
                this.layerPanel = new Ext.Panel({
                    layout: 'fit',
                    cls : 'genapp-query-layer-tree-panel',
                    title : this.layerPanelTitle,
                    tabTip : this.layerPanelTabTip,
                    frame : true,
                    layoutConfig : {
                        animate: true
                    }
                }),
                /**
                 * The legends panel.
                 * @property legendPanel
                 * @type Ext.Panel
                 */
                this.legendPanel = new Ext.Panel({
                    cls : 'genapp-query-legend-panel',
                    title:this.legendPanelTitle,
                    tabTip : this.legendPanelTabTip,
                    frame : true,
                    layoutConfig : {
                        animate : true
                    }
                })
            ]
        });

        // Add the layers and legends vertical label
        if(!this.hideLayersAndLegendVerticalLabel){
            this.layersAndLegendsPanel.on(
                'collapse',
                function(panel){
                    Ext.get(panel.id + '-xcollapsed').createChild({
                        tag: "div", 
                        cls: 'genapp-query-map-right-panel-xcollapsed-vertical-label-div'
                    });
                },
                this,
                {
                    single : true
                }
            );
        }

        this.items = [
            /**
             * The map panel.
             * @property mapPanel
             * @type Ext.Panel
             */
            this.mapPanel = new Ext.Panel({
                region : 'center',
                cls : 'genapp_query_mappanel',
                frame : true,
                layout : 'fit',
                tbar : this.toolbar,
                xtype : 'panel',
                listeners : {
                    'render' : function(cmp) {
                        // Set the map container height and width to avoid css bug in standard mode.
                        // See https://trac.mapfish.org/trac/mapfish/ticket/85
                        cmp.body.setStyle('width', '100%');
                        cmp.body.setStyle('height', '100%');

                        // Gets the layers
                        Ext.Ajax.request({
                            url: Genapp.base_url + 'map/getLayers',
                            success :function(response, options){
                                var layersObject = Ext.decode(response.responseText);
                                this.layersList = [];
                                this.layersActivation = {}; // Avoid a conflict between the geometryField mapPanel and the consultation mapPanel
                                for ( var i = 0; i < layersObject.layers.length; i++) {
                                    var newLayer;
                                    if(layersObject.layers[i].untiled){
                                        newLayer = new OpenLayers.Layer.WMS.Untiled(
                                            layersObject.layers[i].name,
                                            layersObject[layersObject.layers[i].url],
                                            layersObject.layers[i].params,
                                            layersObject.layers[i].options
                                        );
                                    }else{
                                        newLayer = new OpenLayers.Layer.WMS(
                                            layersObject.layers[i].name,
                                            layersObject[layersObject.layers[i].url],
                                            layersObject.layers[i].params,
                                            layersObject.layers[i].options
                                        );
                                    }
                                    this.layersList.push(newLayer);
                                    var activateType = layersObject.layers[i].params.activateType.toLowerCase();
                                    if (Ext.isEmpty(this.layersActivation[activateType])) {
                                        this.layersActivation[activateType] = [layersObject.layers[i].name];
                                    }else{
                                        this.layersActivation[activateType].push(layersObject.layers[i].name);
                                    }

                                    // Create the legends
                                    if(layersObject.layers[i].hasLegend){
                                        var legend = cmp.ownerCt.items.get(1).items.get(1).add(
                                            new Ext.BoxComponent({
                                                id:this.id + layersObject.layers[i].name,
                                                autoEl: {
                                                    tag :'div',
                                                    children:[{
                                                        tag:'span',
                                                        html:layersObject.layers[i].options.label,
                                                        cls:'x-form-item x-form-item-label'
                                                    },{
                                                        tag: 'img',
                                                        src: Genapp.base_url + 'proxy/getlegendimage?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&Format=image/png&WIDTH=160&LAYER='+layersObject.layers[i].params.layers + '&HASSLD=' + (layersObject.layers[i].params.hasSLD ? 'true' : 'false')
                                                    }]
                                                }
                                            })
                                        );
                                        if (layersObject.layers[i].params.isDisabled 
                                                || layersObject.layers[i].params.isHidden
                                                || !layersObject.layers[i].params.isChecked){
                                            legend.on('render',function(cmp){cmp.hide();});
                                            legend.on('show',(function(cmp, params){
                                                if(cmp.rendered){
                                                    cmp.getEl().child('img').dom.src = Genapp.base_url + 'proxy/getlegendimage?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&Format=image/png&WIDTH=160&LAYER='+params.layers +'&HASSLD=' + (params.hasSLD ? 'true' : 'false') + '&dc='+(new Date()).getTime();
                                                }
                                            }).createCallback(legend, layersObject.layers[i].params));
                                        }
                                    }
                                }

                                // Updates the legends panel
                                cmp.ownerCt.items.get(1).items.get(1).doLayout();

                                // Creates the map
                                this.initMap(cmp.body.id);
                                cmp.on("bodyresize", this.map.updateSize, this.map);
                                /*this.ownerCt.on("move", this.map.updateSize, this.map);
                                this.map.events.register('changelayer', this.map, this.map.updateSize);*/

                                if(!this.hideLegalMentions){
                                    // Create the link and 
                                    // stop the event propagation to avoid conflicts with the underlying map
                                    cmp.el.createChild({
                                        tag: 'div',
                                        cls: 'genapp-map-panel-legal-mentions',
                                        children: [{
                                            tag: 'a',
                                            target: '_blank',
                                            href: this.legalMentionsLinkHref,
                                            html: this.legalMentionsLinkText
                                        }]
                                    }, cmp.el.child('.olMapViewport',true)).on('click',Ext.emptyFn,null,{
                                            stopPropagation:true
                                        }
                                    );
                                }

                                // Gets the layer tree model
                                Ext.Ajax.request({
                                    url: Genapp.base_url + 'map/get-tree-layers',
                                    success :function(response, options){
                                        this.layerTreeModel = Ext.decode(response.responseText);

                                        // Creates the layer tree
                                        this.initLayerTree();
                                        cmp.ownerCt.items.get(1).items.get(0).add(this.layertree);
                                        cmp.ownerCt.items.get(1).items.get(0).doLayout();

                                        // Creates the map toolbar
                                        this.initToolbar();
                                        cmp.ownerCt.items.get(0).getTopToolbar().doLayout();

                                        // Fire the afterinit event
                                        this.fireEvent('afterinit',this);
                                    },
                                    scope :this
                                });
                            },
                            scope :this
                        });
                    },
                scope : this
                }
            }),
            this.layersAndLegendsPanel
        ];
        Genapp.MapPanel.superclass.initComponent.call(this);
    },

    /**
     * Initialize the map
     * @param {String} consultationMapDivId The consultation map div id
     * @hide
     */
    initMap : function(consultationMapDivId) {

        // Create the map config resolution array
        var resolutions = [];
        for (var i = this.minZoomLevel; i < Genapp.map.resolutions.length; i++) {
            resolutions.push(Genapp.map.resolutions[i]);
        }

        /**
         * The map.
         * @type {OpenLayers.Map}
         * @property map
         */
        this.map = new OpenLayers.Map(consultationMapDivId, {
            'controls' : [],
            'resolutions' : resolutions,
            'projection' : Genapp.map.projection,
            'units' : 'm',
            'tileSize' : new OpenLayers.Size(Genapp.map.tilesize, Genapp.map.tilesize),
            'maxExtent' : new OpenLayers.Bounds(Genapp.map.x_min, Genapp.map.y_min, Genapp.map.x_max, Genapp.map.y_max),
            'eventListeners' : {// Hide the legend if needed
                changelayer: function(o){
                    if(o.property == 'visibility'){
                        this.toggleLayersAndLegendsForZoom(o.layer);
                    }
                },
                scope:this
            }
        });
        /**
         * The wkt format.
         * @type {OpenLayers.Format.WKT}
         * @property wktFormat
         */
        this.wktFormat = new OpenLayers.Format.WKT();
        /**
         * The vector layer.
         * @type {OpenLayers.Layer.Vector}
         * @property vectorLayer
         */
        this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
        	printable : false // This layers is never printed
        });

        //
        // Initialize the layers
        // 
        // Always add the base layers first

        // Add a base layer
        var baseLayer = new OpenLayers.Layer("Empty baselayer", {
            isBaseLayer : true,
            printable : false // This layers is never printed
        });
        this.map.addLayer(baseLayer);

        // Add the available layers
        for ( var i = 0; i < this.layersList.length; i++) {
            this.map.addLayer(this.layersList[i]);
        }

        // Add the vector layer
        this.map.addLayer(this.vectorLayer);

        //
        // Add the controls
        //

        // Zoom bar
        this.map.addControl(new OpenLayers.Control.PanZoomBar( {
            title : this.panZoomBarControlTitle
        }));

        // Mouse position
        this.map.addControl(new OpenLayers.Control.MousePosition({ 
            prefix: 'X: ', 
            separator: ' - Y: ', 
            suffix: ' m (L2e)', 
            numDigits: 0,
            title: 'MousePosition'
        }));

        // Scale
        this.map.addControl(new OpenLayers.Control.Scale());
        this.map.addControl(new OpenLayers.Control.ScaleLine({
                title: 'ScaleLine',
                bottomOutUnits:'',
                bottomInUnits:''
            })
        );

        // Zoom the map to the user country level
        this.map.setCenter(new OpenLayers.LonLat(Genapp.map.x_center, Genapp.map.y_center), Genapp.map.defaultzoom);

        if (this.isDrawingMap){
            this.vectorLayer.preFeatureInsert = function(feature) {
                if (this.features.length > 1){
                    // remove first drawn feature:
                    this.removeFeatures([this.features[0]]);
                }
            };

            var sfDraw = new OpenLayers.Control.SelectFeature(
                    this.vectorLayer, {
                    multiple: false,
                    clickout: true,
                    toggle: true,
                    title: this.selectFeatureControlTitle
                }
            ); 
            this.map.addControl(sfDraw);
            sfDraw.activate();

            if (this.featureWKT) {
                // display it with WKT format reader.
                var feature = this.wktFormat.read(this.featureWKT);
                if (feature) {
                    this.vectorLayer.addFeatures([feature]);
                } else {
                    alert(this.invalidWKTMsg); //'Invalid WKT string: the feature cannot be displayed.'
                }
            }
        }else{
            // Add a control that display a tooltip on the features
            var selectControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {hover: true});
            this.map.addControl(selectControl);
            selectControl.activate();
        }
    },

    /**
     * Initialize the layer tree
     * @hide
     */
    initLayerTree : function() {
        /**
         * The layer tree.
         * @type {mapfish.widgets.LayerTree}
         * @property layertree
         */
        this.layertree = new mapfish.widgets.LayerTree( {
            title : '',
            border : false,
            map : this.map,
            model : this.layerTreeModel,
            enableDD : true,
            listeners:{
                'afterrender':function(){
                    for (var i = 0; i < this.map.layers.length; i++){
                        this.toggleLayersAndLegendsForZoom(this.map.layers[i]);
                    }
                },
                scope:this
            },
            plugins : [
               {
                	init: function(layerTree) {
                		layerTree.getRootNode().cascade(
	                    function(child) {
	                        if(child.attributes.disabled == true){
	                            child.forceDisable = true;
	                        }else{
	                            child.forceDisable = false;
	                        }
	                    }
                		);
                	}
                },
                mapfish.widgets.LayerTree.createContextualMenuPlugin(['opacitySlide'])                
                ],
            ascending : false
        });
        // Move the vector layer above all others
        this.map.setLayerIndex(this.vectorLayer, 100);
    },

    /**
     * Initialize the map toolbar
     * @hide
     */
    initToolbar : function() {

        this.toolbar.map = this.map;

        if (this.isDrawingMap){
            // Zoom to features button
            this.toolbar.addControl(
                    new OpenLayers.Control.ZoomToFeatures(this.vectorLayer, {
                        title:this.zoomToFeaturesControlTitle,
                        maxZoomLevel: 9,
                        ratio: 1.05,
                        autoActivate: true
                    }), {
                    iconCls: 'zoomstations'
                }
            );

            // Draw feature button
            this.toolbar.addControl(
                new OpenLayers.Control.DrawFeature(
                    this.vectorLayer, 
                    OpenLayers.Handler.Polygon/*, 
                    drawControlOptions*/), 
                {
                    iconCls: 'drawpolygon', 
                    tooltip: this.drawFeatureControlTitle
                }
            );

            // Modify feature button
            this.toolbar.addControl(
                    new OpenLayers.Control.ModifyFeature(
                        this.vectorLayer, {
                            displayClass: 'olControlModifyFeature',
                            deleteCodes: [46, 100], // delete vertices on 'delete' and 'd' keypressed
                            type: OpenLayers.Control.TYPE_TOOL,
                            title: this.modifyFeatureControlTitle
                        }
                    ),{
                    iconCls: 'modifyfeature',
                    disabled: false
                }
            );

            // Delete feature button
            var deleteFeatureButton = new Ext.Toolbar.Button({
                iconCls: 'deletefeature',
                tooltip: this.tbarDeleteFeatureButtonTooltip,
                disabled: false,//((this.featureWKT) ? (this.featureWKT.length == 0) : true),
                handler: OpenLayers.Function.bind(function (){
                    if (this.vectorLayer.features.length){
                            var sfDraw = this.map.getControlsBy('title', this.selectFeatureControlTitle);
                            if (this.vectorLayer.selectedFeatures.length){
                                sfDraw[0].unselect(this.vectorLayer.selectedFeatures[0]);
                            }
                            this.vectorLayer.removeFeatures(this.vectorLayer.features);
                    }
                    else {
                        //Ext.Msg.alert('Info', 'No geometry found.');
                    }
                }, this)
            });
            this.toolbar.add(deleteFeatureButton);
        }//endif isDrawingMap

        this.toolbar.addFill();

        if(!this.hideMapDetails){
            // Get info on the feature
            this.toolbar.addControl(
                new OpenLayers.Control.FeatureInfoControl(),
                {
                    iconCls: 'feature-info',
                    tooltip: this.featureInfoControlTitle
                }
            );
        }

        // Navigation history : back and next.
        var nav = new OpenLayers.Control.NavigationHistory({});
        this.map.addControl(nav);
        nav.activate();

        var buttonPrevious = new Ext.Toolbar.Button({
            iconCls: 'back',
            tooltip: this.tbarPreviousButtonTooltip,
            disabled: true,
            handler: nav.previous.trigger
        });

        var buttonNext = new Ext.Toolbar.Button({
            iconCls: 'next',
            tooltip: this.tbarNextButtonTooltip,
            disabled: true, 
            handler: nav.next.trigger
        });

        this.toolbar.add(buttonPrevious);
        this.toolbar.add(buttonNext);

        nav.previous.events.register(
            "activate", 
            buttonPrevious,
            function() { 
                this.setDisabled(false); 
            }
        );

        nav.previous.events.register(
            "deactivate", 
            buttonPrevious,
            function() { 
                this.setDisabled(true); 
            }
        );

        nav.next.events.register(
            "activate", 
            buttonNext, 
            function(){ 
                this.setDisabled(false); 
            }
        );

        nav.next.events.register(
            "deactivate", 
            buttonNext,
            function() { 
                this.setDisabled(true); 
            }
        );

        this.toolbar.addSeparator();

        this.toolbar.addControl(
            new OpenLayers.Control.ZoomBox({
                title:this.zoomBoxInControlTitle
            }), {
                iconCls: 'zoomin'
            }
        );

        this.toolbar.addControl(
            new OpenLayers.Control.ZoomBox({
                out: true,
                title: this.zoomBoxOutControlTitle
            }), {
                iconCls: 'zoomout'
            }
        );

        this.toolbar.addControl(
            new OpenLayers.Control.Navigation({
                isDefault: true,
                title: this.navigationControlTitle,
                mouseWheelOptions: {interval: 100}
            }), {
                iconCls: 'pan'
            }
        );

        this.toolbar.addSeparator();

        this.toolbar.addButton({
            handler : this.zoomOnResultsBBox,
            scope: this,
            iconCls: 'zoomstations',
            tooltip: this.zoomToFeaturesControlTitle
        });

        this.toolbar.addControl(
            new OpenLayers.Control.ZoomToMaxExtent({
                map: this.map,
                active:true,
                title: this.zoomToMaxExtentControlTitle
            }), {
                iconCls: 'zoomfull'
            }
        );
      
        this.toolbar.activate();
    },
    
    /**
     * Clean the map panel
     */
    clean: function() {
        // Remove previous features
        this.vectorLayer.destroyFeatures(this.vectorLayer.features);
        
        // Zoom the map to the user country level
        //this.map.setCenter(new OpenLayers.LonLat(Genapp.map.x_center, Genapp.map.y_center), Genapp.map.defaultzoom);
        
    },

    /**
     * Zoom to the passed feature on the map
     * @param {String} id The plot id
     * @param {String} wkt The wkt feature
     */
    zoomToFeature: function(id, wkt){
        
        // Parse the feature location and create a Feature Object
        var feature = this.wktFormat.read(wkt);
        
        // Add the plot id as an attribute of the object
        feature.attributes.id = id.substring(id.lastIndexOf('__')+2);
        
        // Remove previous features
        this.vectorLayer.destroyFeatures(this.vectorLayer.features);
        
        // Move the vector layer above all others
        this.map.setLayerIndex(this.vectorLayer, 100);
        if (feature) {
             // Add the feature
            this.vectorLayer.addFeatures([feature]);
        } else {
            alert(this.invalidWKTMsg); //'Invalid WKT string: the feature cannot be displayed.'
        }

        // Center on the feature
        this.map.setCenter(
            new OpenLayers.LonLat(
                feature.geometry.x, 
                feature.geometry.y
            ), 7
        );
    },

    /**
     * Zoom on the provided bounding box
     * 
     * {String} wkt The wkt of the bounding box
     */
    zoomOnBBox: function(wkt){
        if(!Ext.isEmpty(wkt)){
            var map = this.map;
            /**
             * The ratio by which features' bounding box should be scaled
             */
            var ratio = 1;
            /**
             * The maximum zoom level to zoom to
             */
            var maxZoomLevel = map.numZoomLevels-1;

            // Parse the feature location and create a Feature Object
            var feature = this.wktFormat.read(wkt);

            var bounds = feature.geometry.getBounds();

            bounds = bounds.scale(ratio);
            
            if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)){
                var zoom = maxZoomLevel;
            } else {
                var desiredZoom = map.getZoomForExtent(bounds);
                var zoom = (desiredZoom > maxZoomLevel) ? maxZoomLevel : desiredZoom;
            }
            map.setCenter(bounds.getCenterLonLat(), zoom);
        }
    },

    /**
     * Zoom on the results bounding box
     */
    zoomOnResultsBBox: function(){
        this.zoomOnBBox(this.resultsBBox);
    },

    /**
     * Toggle the layer(s) and legend(s)
     * 
     * @param {Object} layerNames An object like :
     * {
     *     'layerName1' : 'checked',
     *     'layerName2' : 'unchecked',
     *     'layerName3' : 'disable',
     *     'layerName4' : 'hide',
     *     ...
     * }
     * Four values are possible for each layer:
     * checked: enable and show the layer, check the tree node, display the legend 
     * unchecked: enable but hide the layer, uncheck the tree node, display the legend
     * disable: disable the layer, uncheck the tree node, disable the legend
     * hide: disable and hide the layer, uncheck the tree node, hide the legend
     * 
     */
    toggleLayersAndLegends: function(layerNames){

        var layersAndLegendsToEnableChecked = [];
        var layersAndLegendsToEnableUnchecked = [];
        var layersAndLegendsToDisable = [];
        var layersAndLegendsToHide = [];
        for(layerName in layerNames){
            if (layerNames.hasOwnProperty(layerName)) {
                switch (layerNames[layerName])
                {
                    case 'checked':
                        layersAndLegendsToEnableChecked.push(layerName);
                    break;
                    case 'unchecked':
                        layersAndLegendsToEnableUnchecked.push(layerName);
                    break;
                    case 'disable':
                        layersAndLegendsToDisable.push(layerName);
                    break;
                    case 'hide':
                        layersAndLegendsToHide.push(layerName);
                    break;
                    default:
                    break;
                }
            }
        }
        this.enableLayersAndLegends(layersAndLegendsToEnableChecked, true, true);
        this.enableLayersAndLegends(layersAndLegendsToEnableUnchecked, false, true);
        this.disableLayersAndLegends(layersAndLegendsToDisable, true, false, true);
        this.disableLayersAndLegends(layersAndLegendsToHide, true, true, true);
    },

    /**
     * Enable and show the layer(s) node and show the legend(s)
     * 
     * @param {Array} layerNames The layer names
     * @param {Boolean} check True to check the layerTree node checkbox (default to false)
     * @param {Boolean} setForceDisable Set the layerTree node forceDisable parameter (default to true)
     * The forceDisable is used by the 'toggleLayersAndLegendsForZoom' function to avoid to enable, 
     * a node disable for another cause that the zoom range.
     */
    enableLayersAndLegends: function(layerNames, check, setForceDisable){

        //The tabPanels must be activated before to show a child component
        var isLayerPanelVisible = this.layerPanel.isVisible();

        this.layersAndLegendsPanel.activate(this.layerPanel);
        for(var i = 0; i<layerNames.length ;i++){
            var nodeId = this.layertree.layerToNodeIds[layerNames[i]];
            if(!Ext.isEmpty(nodeId)){
                if (setForceDisable != false){
                    this.layertree.getNodeById(nodeId).forceDisable = false;
                }
                if(this.layertree.getNodeById(nodeId).zoomDisable != true){
                    this.layertree.getNodeById(nodeId).enable();
                }
                this.layertree.getNodeById(nodeId).getUI().show();
                /*var layers = this.layertree.nodeIdToLayers[nodeId];
                layers[0].display(true);*/
                if (check == true) {
                    // Note: the redraw must be done before to check the node
                    // to avoid to redisplay the old layer images before the new one
                    var layers = this.map.getLayersByName(layerNames[i]);
                    layers[0].redraw(true);
                    this.layertree.setNodeChecked(nodeId,true);
                }
            }
        }

        this.layersAndLegendsPanel.activate(this.legendPanel);
        this.setLegendsVisible(layerNames,true);

        //Keep the current activated panel activated
        if(isLayerPanelVisible){
            this.layersAndLegendsPanel.activate(this.layerPanel);
        }
    },

    /**
     * Disable (and hide if asked) the layer(s)
     * And hide the legend(s)
     * 
     * @param {Array} layerNames The layer names
     * @param {Boolean} uncheck True to uncheck the layerTree node checkbox (default to false)
     * @param {Boolean} hide True to hide the layer(s) and legend(s) (default to false)
     * @param {Boolean} setForceDisable Set the layerTree node forceDisable parameter (default to true)
     * The forceDisable is used by the 'toggleLayersAndLegendsForZoom' function to avoid to enable, 
     * a node disable for another cause that the zoom range.
     */
    disableLayersAndLegends: function(layerNames, uncheck, hide, setForceDisable){

        if(!Ext.isEmpty(layerNames)){
            for(var i = 0; i<layerNames.length ;i++){
                var nodeId = this.layertree.layerToNodeIds[layerNames[i]];
                if(!Ext.isEmpty(nodeId)){
                    if (uncheck == true) {
                        this.layertree.setNodeChecked(nodeId,false);
                    }
                    var node = this.layertree.getNodeById(nodeId);
                    if (hide == true) {
                        node.getUI().hide();
                    }
                    node.disable();
                    if (setForceDisable != false) {
                        node.forceDisable = true;
                    }
                    /*var layers = this.layertree.nodeIdToLayers[nodeId];
                    layers[0].display(false);*/
                }
                this.setLegendsVisible([layerNames[i]],false);
            }
        }
    },

    /**
     * Toggle the layer node and legend in function of the zoom range
     * 
     * @param {OpenLayers.Layer} layer The layer to check
     */
    toggleLayersAndLegendsForZoom : function(layer){
        if (!Ext.isEmpty(this.layertree)) {
            var nodeId = this.layertree.layerToNodeIds[layer.name];
            if(!Ext.isEmpty(nodeId)){
                var node = this.layertree.getNodeById(nodeId);
                if (!Ext.isEmpty(node) && !node.hidden){
                    if (!layer.calculateInRange()) {
                        node.zoomDisable = true;
                        this.disableLayersAndLegends([layer.name], false, false, false);
                    } else {
                        node.zoomDisable = false;
                        if (node.forceDisable != true) {
                            this.enableLayersAndLegends([layer.name], false, false);
                        }
                    }
                }
            }
        }
    },

    /**
     * Convenience function to hide or show a legend by boolean.
     * 
     * @param {Array} layerNames The layers name
     * @param {Boolean} visible True to show, false to hide
     */
    setLegendsVisible: function(layerNames, visible){
        for(i = 0; i<layerNames.length ;i++){
            var legendCmp = this.legendPanel.findById(this.id + layerNames[i]);
            if(!Ext.isEmpty(legendCmp)){
                if (visible == true) {
                    var layers = this.map.getLayersByName(layerNames[i]);
                    if(layers[0].calculateInRange() && layers[0].getVisibility()){
                        legendCmp.show();
                    } else {
                        legendCmp.hide();
                    }
                } else {
                    legendCmp.hide();
                }
            }
        }
    },

    // private
    beforeDestroy : function(){
        if(this.map){
            this.map.destroy();
        }
        Genapp.MapPanel.superclass.beforeDestroy.call(this);
    }
});/**
 * Simple number range picker class.
 * 
 * @class Genapp.NumberRangePicker
 * @extends Ext.Panel
 * @constructor Create a new NumberRangePicker
 * @param {Object} config The config object
 * @xtype numberrangepicker
 */
Genapp.NumberRangePicker = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'form'.
     */
    layout: 'form',
    /**
     * @cfg {Number} height
     * The height of this component in pixels (defaults to 59).
     */
    height:59,
    /**
     * @cfg {Number} width
     * The width of this component in pixels (defaults to 176).
     */
    width:176,
    /**
     * @cfg {Number} labelWidth The width of labels in pixels. This property cascades to child containers
     * and can be overridden on any child container (e.g., a fieldset can specify a different labelWidth
     * for its fields) (defaults to 30).
     * See {@link Ext.form.FormPanel#labelWidth} also.
     */
    labelWidth: 30,
    /**
     * @cfg {String} buttonAlign
     * The alignment of any {@link #buttons} added to this panel.  Valid values are 'right',
     * 'left' and 'center' (defaults to 'center').
     */
    buttonAlign: 'center',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-menu-number-range-item').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-menu-number-range-item',
    /**
     * @cfg {String} minFieldLabel
     * The min Field Label (defaults to <tt>'Min'</tt>)
     */
    minFieldLabel:"Min",
    /**
     * @cfg {String} maxFieldLabel
     * The max Field Label (defaults to <tt>'Max'</tt>)
     */
    maxFieldLabel:"Max",
    /**
     * @cfg {String} okButtonText
     * The ok Button Text (defaults to <tt>'ok'</tt>)
     */
    okButtonText:"ok",
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to true).
     */
    hideValidationButton : true,

    // private
    initComponent : function(){
        Ext.apply(this, {
                items: [
                /**
                 * The min field.
                 * @property minField
                 * @type Genapp.form.TwinNumberField
                 */
                this.minField = new Genapp.form.TwinNumberField({
                    fieldLabel:this.minFieldLabel
                }),
                /**
                 * The max field.
                 * @property maxField
                 * @type Genapp.form.TwinNumberField
                 */
                this.maxField = new Genapp.form.TwinNumberField({
                    fieldLabel:this.maxFieldLabel
                })
            ]
        });
        if(!this.hideValidationButton){
            this.buttons = [{
                xtype:'button',
                text:this.okButtonText,
                width:'auto',
                handler:this.onOkButtonPress.createDelegate(this)
            }];
            this.height = this.height + 28;
        }

        Genapp.NumberRangePicker.superclass.initComponent.call(this);
    },

    // private
    onOkButtonPress: function (button, state){
        if(state){
            this.fireEvent('select', this, {
                minValue: this.minField.getValue(),
                maxValue: this.maxField.getValue()
            });
        }
    }
});
Ext.reg('numberrangepicker', Genapp.NumberRangePicker);/**
 * A PredefinedRequestPanel correspond to the complete page for selecting the predefined request.
 * 
 * @class Genapp.PredefinedRequestPanel
 * @extends Ext.Panel
 * @constructor Create a new Predefined Request Panel
 * @param {Object} config The config object
 * @xtype predefinedrequestpanel
 */
Genapp.PredefinedRequestPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} itemId
     * <p>An <tt>itemId</tt> can be used as an alternative way to get a reference to a component
     * when no object reference is available.  Instead of using an <code>{@link #id}</code> with
     * {@link Ext}.{@link Ext#getCmp getCmp}, use <code>itemId</code> with
     * {@link Ext.Container}.{@link Ext.Container#getComponent getComponent} which will retrieve
     * <code>itemId</code>'s or <tt>{@link #id}</tt>'s. Since <code>itemId</code>'s are an index to the
     * container's internal MixedCollection, the <code>itemId</code> is scoped locally to the container --
     * avoiding potential conflicts with {@link Ext.ComponentMgr} which requires a <b>unique</b>
     * <code>{@link #id}</code>.</p>
     * <p>Also see <tt>{@link #id}</tt> and <code>{@link #ref}</code>.</p>
     * <p><b>Note</b>: to access the container of an item see <tt>{@link #ownerCt}</tt>.</p>
     * @hide
     */
    itemId:'predefined_request',
    /**
     * @cfg {Boolean} frame
     * <code>false</code> by default to render with plain 1px square borders. <code>true</code> to render with
     * 9 elements, complete with custom rounded corners (also see {@link Ext.Element#boxWrap}).
     * @hide
     */
    frame: true,
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
    title: 'Predefined Request',
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.
     * For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * @hide
     */
    layout: 'border',
    /**
     * @cfg {String} consultationButtonText
     * The consultation Button Text (defaults to <tt>'Consultation'</tt>)
     */
    consultationButtonText: "Consultation",
    /**
     * @cfg {String} consultationButtonTooltip
     * The consultation Button Tooltip (defaults to <tt>'Go to the consultation page'</tt>)
     */
    consultationButtonTooltip:"Go to the consultation page",
    /**
     * @cfg {String} descriptionTitle
     * The description Title (defaults to <tt>''</tt>)
     */
    descriptionTitle:"",
    /**
     * @cfg {String} nameColumnHeader
     * The name Column Header (defaults to <tt>'Name'</tt>)
     */
    nameColumnHeader: "Name",
    /**
     * @cfg {String} labelColumnHeader
     * The label Column Header (defaults to <tt>'Label'</tt>)
     */
    labelColumnHeader: "Label",
    /**
     * @cfg {String} descriptionColumnHeader
     * The description Column Header (defaults to <tt>'Description'</tt>)
     */
    descriptionColumnHeader: "Description",
    /**
     * @cfg {String} dateColumnHeader
     * The date Column Header (defaults to <tt>'Date'</tt>)
     */
    dateColumnHeader: "Date",
    /**
     * @cfg {String} clickColumnHeader
     * The click Column Header (defaults to <tt>'Click(s)'</tt>)
     */
    clickColumnHeader: "Click(s)",
    /**
     * @cfg {String} positionColumnHeader
     * The position Column Header (defaults to <tt>'Rank'</tt>)
     */
    positionColumnHeader: "Rank",
    /**
     * @cfg {String} groupNameColumnHeader
     * The group Name Column Header (defaults to <tt>'Group name'</tt>)
     */
    groupNameColumnHeader: "Group name",
    /**
     * @cfg {String} groupLabelColumnHeader
     * The group Label Column Header (defaults to <tt>'Group label'</tt>)
     */
    groupLabelColumnHeader: "Group label",
    /**
     * @cfg {String} groupPositionColumnHeader
     * The group Position Column Header (defaults to <tt>'Group Rank'</tt>)
     */
    groupPositionColumnHeader: "Group Rank",
    /**
     * @cfg {String} groupTextTpl
     * The group Text Tpl (defaults to <tt>'{group} ({[values.rs.length]})'</tt>)
     */
    groupTextTpl:"{group} ({[values.rs.length]})",
    /**
     * @cfg {String} resetButtonText
     * The reset Button Text (defaults to <tt>'Reset'</tt>)
     */
    resetButtonText:"Reset",
    /**
     * @cfg {String} resetButtonTooltip
     * The reset Button Tooltip (defaults to <tt>'Reset the form with the default values'</tt>)
     */
    resetButtonTooltip:"Reset the form with the default values",
    /**
     * @cfg {String} launchRequestButtonText
     * The launch Request Button Text (defaults to <tt>'Launch the request'</tt>)
     */
    launchRequestButtonText:"Launch the request",
    /**
     * @cfg {String} launchRequestButtonTooltip
     * The launch Request Button Tooltip (defaults to <tt>'Launch the request in the consultation page'</tt>)
     */
    launchRequestButtonTooltip:"Launch the request in the consultation page",
    /**
     * @cfg {String} loadingText
     * The loading Text (defaults to <tt>'Loading...'</tt>)
     */
    loadingText:"Loading...",
    /**
     * @cfg {String} defaultCardPanelText
     * The default Card Panel Text (defaults to <tt>'Please select a request...'</tt>)
     */
    defaultCardPanelText:"Please select a request...",
    /**
     * @cfg {String} defaultErrorCardPanelText
     * The default Error Card Panel Text (defaults to <tt>'Sorry, the loading failed...'</tt>)
     */
    defaultErrorCardPanelText:"Sorry, the loading failed...",
    /**
     * @cfg {String} criteriaPanelTitle
     * The criteria Panel Title (defaults to <tt>'Request criteria'</tt>)
     */
    criteriaPanelTitle:"Request criteria",

    // private
    initComponent : function() {

        /**
         * The grid reader
         */
        var gridReader = new Ext.data.ArrayReader({
            root:'rows',
            totalProperty:'total'
            }, [
           {name: 'request_name', type: 'string'},
           {name: 'label', type: 'string'},
           {name: 'definition', type: 'string'},
           {name: 'click', type: 'int'},
           {name: 'date', type: 'date', dateFormat: 'Y-m-d'},
           {name: 'criteria_hint', type: 'string'},
           {name: 'position', type: 'int'},
           {name: 'group_name', type: 'string'},
           {name: 'group_label', type: 'string'},
           {name: 'group_position', type: 'int'},
           {name: 'dataset_id', type: 'string'}
        ]);

        /**
         * The grid store
         */
        var gridStore = new Ext.data.GroupingStore({
            reader: gridReader,
            autoDestroy: true,
            url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestlist',
            remoteSort: false,
            sortInfo:{field: 'position', direction: "ASC"},
            groupField:'group_position' // Note: This field is used to group the rows and to sort the groups too
        });

        /**
         * Setup the grid row expander template
         */
        var gridRowExpanderTemplate = [];
        if(!Ext.isEmpty(this.descriptionTitle)){
            gridRowExpanderTemplate.push('<h4 class="genapp-predefined-request-grid-panel-description-title">' + this.descriptionTitle + ':</h4>');
        }
        gridRowExpanderTemplate.push('<p class="genapp-predefined-request-grid-panel-description-text">{definition}</p>');

        /**
         * The grid row expander
         */
        var gridRowExpander = new Ext.ux.grid.RowExpander({
            tpl : new Ext.Template(gridRowExpanderTemplate)
        });

        /**
         * Function used to format the grouping field value for display in the group
         * 
         * @param {Object} v The new value of the group field.
         * @param {undefined} unused Unused parameter.
         * @param {Ext.data.Record} r The Record providing the data for the row which caused group change.
         * @param {Number} rowIndex The row index of the Record which caused group change.
         * @param {Number} colIndex The column index of the group field.
         * @param {Ext.data.Store} ds The Store which is providing the data Model.
         * @param {String} dataName The dataName to display
         * @returns {String} A string to display.
         */
        var groupRendererFct = function(v, unused, r, rowIndex, colIndex, ds, dataName) {
            return r.data[dataName];
        }

        /**
         * The grid column model
         */
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true
            },
            columns:[
                //gridRowExpander, // Show a expand/collapse tools for each row
                {id: 'request_name', header: this.nameColumnHeader, dataIndex: 'request_name', width:30, groupable :false, hidden: true},
                {header: this.labelColumnHeader, dataIndex: 'label', groupable :false},
                {header: this.descriptionColumnHeader, dataIndex: 'definition', groupable :false, hidden: true},
                {header: this.dateColumnHeader, dataIndex: 'date', format: 'Y/m/d', xtype:'datecolumn', width:20, groupable :false, hidden: true},
                {header: this.clickColumnHeader, dataIndex: 'click', width:10, groupable :false, hidden: true},
                {header: this.positionColumnHeader, dataIndex: 'position', width:10, groupable :false, hidden: true},
                {header: this.groupNameColumnHeader, dataIndex: 'group_name', hidden: true, 
                    groupRenderer: groupRendererFct.createDelegate(this, ['group_label'], true)
                },
                {header: this.groupLabelColumnHeader, dataIndex: 'group_label', hidden: true},
                {header: this.groupPositionColumnHeader, dataIndex: 'group_position', width:10, hidden: true,
                    groupRenderer: groupRendererFct.createDelegate(this, ['group_label'], true)
                }
            ]
        });

        /**
         * @cfg {Ext.grid.GridPanel} grid
         * The grid
         */
        this.grid = new Ext.grid.GridPanel({
            region:'center',
            margins:{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            },
            autoExpandColumn: 1,
            border: true,
            plugins: gridRowExpander,
            ds: gridStore,
            cm: colModel,
            view: new Ext.grid.GroupingView({
                forceFit:true,
                groupTextTpl: this.groupTextTpl
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect: true,
                listeners: {
                    'rowselect': this.onGridRowSelect,
                    scope:this
                }
            })
        });

        /**
         * @cfg {Ext.form.FieldSet} requestCriteriaCardPanel
         * The request Criteria Card Panel
         */
        this.requestCriteriaCardPanel = new Ext.form.FieldSet({
            cls: 'genapp-predefined-request-criteria-card-panel',
            layout: 'card',
            autoScroll: true,
            activeItem: 2,
            labelWidth: 90,
            title:' ', // Without space the title div is not rendered, so it's not possible to change it later
            defaults: {width: 140, border:false},
            width: 350, // Bug ext: The size must be specified to have a good render when the panel is not activated
            border: true,
            fbar: this.requestCriteriaCardPanelFooterTBar = new Ext.Toolbar({
                hidden: true,
                cls: 'genapp-predefined-request-criteria-panel-footerTBar',
                items: [
                    this.resetButton = new Ext.Button({
                        text:this.resetButtonText,
                        listeners:{
                            'render':function(cmp){
                                new Ext.ToolTip({
                                    anchor: 'left',
                                    target: cmp.getEl(),
                                    html:this.resetButtonTooltip,
                                    showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                    dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                                });
                            },
                            scope:this
                        },
                        handler:function(b,e){
                            var selectedRequest = this.grid.getSelectionModel().getSelected();
                            this.requestCriteriaCardPanel.getComponent(selectedRequest.data.request_name).getForm().reset();
                        },
                        scope:this
                    }),
                    this.launchRequestButton = new Ext.Button({
                        text: this.launchRequestButtonText,
                        listeners:{
                            'render':function(cmp){
                                new Ext.ToolTip({
                                    anchor: 'left',
                                    target: cmp.getEl(),
                                    html:this.launchRequestButtonTooltip,
                                    showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                    dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                                });
                            },
                            scope:this
                        },
                        handler:function(b,e){
                            // Get the selected request and the new criteria values
                            var selectedRequestData = this.grid.getSelectionModel().getSelected().data;
                            var fieldValues = this.requestCriteriaCardPanel.getComponent(selectedRequestData.request_name).getForm().getValues(); // getFieldValues() doesn't work like expected with the checkbox
                            // Load and launch the request
                            var consultationPanel = Ext.getCmp('consultation_panel');
                            consultationPanel.loadRequest({
                                datasetId:selectedRequestData.dataset_id,
                                name:selectedRequestData.request_name,
                                fieldValues:fieldValues
                            });
                            Genapp.cardPanel.getLayout().setActiveItem('consultation_panel');
                        },
                        scope:this
                    })
                ]
            }),
            items: [{// We can't use the default loading indicator for IE7
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'loading-indicator',
                    html: this.loadingText
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-error-msg',
                    html: this.defaultErrorCardPanelText
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-intro',
                    html: this.defaultCardPanelText
                }
            }]
        });

        /**
         * @cfg {Ext.Panel} eastPanel
         * The east Panel containing the requestCriteriaCardPanel
         */
        this.eastPanel = new Ext.Panel({
            region: 'east',
            width: '350px',
            cls:'genapp-predefined-request-east-panel',
            margins:{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            },
            bbar: {
                items:[{
                    xtype: 'tbfill'
                },{
                    xtype: 'button',
                    text: this.consultationButtonText,
                    listeners:{
                        'render':function(cmp){
                            new Ext.ToolTip({
                                anchor: 'left',
                                target: cmp.getEl(),
                                html:this.consultationButtonTooltip,
                                showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                            });
                        },
                        scope:this
                    },
                    scope: this,
                    handler: function(b,e){
                        Genapp.cardPanel.getLayout().setActiveItem('consultation_panel');
                    }
                }]
            },
            items: this.requestCriteriaCardPanel
        });

        this.items = [this.grid,this.eastPanel];
        this.listeners = {
            'activate': function(){
                var selectedRecord = this.grid.getSelectionModel().getSelected();
                this.grid.getStore().reload({
                    callback: function(records, options, success) {
                        if (success) {
                            if (!Ext.isEmpty(selectedRecord)) {
                                var indexToSelect = this.grid.getStore().findExact('request_name',selectedRecord.data.request_name);
                                this.grid.getSelectionModel().selectRow(indexToSelect);
                                this.grid.plugins.expandRow(indexToSelect);
                            }
                        } else {
                            console.log('Request failure: ');
                            console.log('records:', records, 'options:', options);
                            this.requestCriteriaCardPanel.getLayout().setActiveItem(1);
                        }
                    },
                    scope: this
                });
            },
            scope: this
        }

        Genapp.PredefinedRequestPanel.superclass.initComponent.call(this);
    },

    /**
     * Show a criteria panel when a row is selected.
     * 
     * @param {SelectionModel} sm the grid selection model
     * @param {Number} row The selected index
     * @param {Ext.data.Record} rec The selected record
     */
    onGridRowSelect : function(sm, row, rec) {
        this.requestCriteriaCardPanel.setTitle('');
        this.requestCriteriaCardPanelFooterTBar.hide();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(0);
        if(Ext.isEmpty(this.requestCriteriaCardPanel.getComponent(rec.data.request_name))){
            Ext.Ajax.request({
                url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestcriteria',
                success: function(response, opts) {
                    var myReader = new Ext.data.ArrayReader({
                        root:'criteria',
                        fields:[
                            'name',
                            'format',
                            'data',
                            'default_value', // value
                            'fixed',
                            'inputType',
                            'type',
                            'label',
                            'definition',
                            'params'
                        ]
                    });
                    var result = myReader.readRecords(Ext.decode(response.responseText));
                    var requestCriteriaPanel = new Ext.form.FormPanel({
                        itemId: rec.data.request_name,
                        labelWidth: 130,
                        autoHeight: true, // Necessary for IE7
                        defaults: {
                            labelStyle: 'padding: 0; margin-top:3px', 
                            width: 180
                        },
                        items: {
                            xtype: 'box',
                            autoEl: {
                                tag: 'div',
                                cls: 'genapp-predefined-request-criteria-panel-criteria-hint',
                                style: 'width:200px;',
                                html: rec.data.criteria_hint
                            }
                        }
                    });
                    for(var i = 0; i < result.records.length; i++){
                        // Add the field
                        requestCriteriaPanel.add(Genapp.FieldForm.prototype.getCriteriaConfig(result.records[i].data, true));
                    }
                    this.requestCriteriaCardPanel.add(requestCriteriaPanel);
                    this.showCriteriaPanel(rec.data.request_name);
                    this.requestCriteriaCardPanel.doLayout();
                },
                failure: function(response, opts) {
                    console.log('Request failure: ' + response.statusText);
                    console.log('Response:', response, 'Options:', opts);
                    this.requestCriteriaCardPanel.getLayout().setActiveItem(1);
                },
                params: { request_name: rec.data.request_name },
                scope:this
             });
        }else{
            this.showCriteriaPanel(rec.data.request_name);
        }
    },

    /**
     * Show a criteria panel
     * 
     * @param {String} requestName The request name
     */
    showCriteriaPanel : function(requestName){
        this.requestCriteriaCardPanel.setTitle(this.criteriaPanelTitle);
        this.requestCriteriaCardPanelFooterTBar.show();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(requestName);
    }
});/**
 * Provides a date range input field with a {@link Genapp.DateRangePicker} dropdown and automatic date validation.
 *  
 * @class Genapp.form.DateRangeField
 * @extends Ext.form.DateField
 * @constructor Create a new DateRangeField
 * @param {Object} config
 * @xtype daterangefield
 */

Ext.namespace('Genapp.form');

Genapp.form.DateRangeField = Ext.extend(Ext.form.DateField, {
    /**
     * @cfg {String} minText
     * The error text to display when the date in the cell is before <tt>{@link #minValue}</tt> (defaults to
     * <tt>'The date in this field must be after {minValue}'</tt>).
     */
    minText: "The dates in this field must be equal to or after {0}",
    /**
     * @cfg {String} maxText
     * The error text to display when the date in the cell is after <tt>{@link #maxValue}</tt> (defaults to
     * <tt>'The date in this field must be before {maxValue}'</tt>).
     */
    maxText: "The dates in this field must be equal to or before {0}",
    /**
     * @cfg {String} reverseText
     * The error text to display when the dates are reversed (defaults to
     * <tt>'The end date must be posterior to the start date'</tt>).
     */
    reverseText: "The end date must be posterior to the start date",
    /**
     * @cfg {String} notEqualText
     * The error text to display when the dates are equal (defaults to
     * <tt>'The end date can't be equal to the start date'</tt>).
     */
    notEqualText: "The end date can't be equal to the start date",
    /**
     * @cfg {String} dateSeparator
     * The separator text to display between the dates (defaults to <tt>' - '</tt>)
     */
    dateSeparator: ' - ',
    /**
     * @cfg {String} endDatePrefix
     * The prefix for the end date (defaults to <tt>'<= '</tt>)
     */
    endDatePrefix: '<= ',
    /**
     * @cfg {String} startDatePrefix
     * The prefix for the start date (defaults to <tt>'>= '</tt>)
     */
    startDatePrefix: '>= ',
    /**
     * @cfg {Boolean} usePrefix if true, endDatePrefix and startDatePrefix are used (defaults to true).
     * Otherwise minValue and maxValue are used.
     */
    usePrefix: true,
    /**
     * @cfg {Boolean} hideValidationButton if true, hide the menu validation button (defaults to false).
     */
    hideValidationButton : false,
    /**
     * @cfg {Boolean} authorizeEqualValues if true, a unique value 
     * can be entered for the min and the max values.
     * If false, the min and max values can't be equal (defaults to true).
     */
    authorizeEqualValues : true,
    /**
     * @cfg {Boolean} mergeEqualValues if true and if the max and min values
     * are equal, an unique value will be displayed instead of the min and max values.
     * (authorizeEqualValues must be set to true)
     * If false, the min and max values are displayed normally even if they are equals (defaults to true).
     */
    mergeEqualValues : true,
    /**
     * @cfg {Boolean} autoReverse if true, reverse the min and max values if max < min (defaults to true).
     */
    autoReverse : true,
    /**
     * @cfg {Date/String} minValue
     * The minimum allowed date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date(0)').
     */
    minValue : new Date(0),
    /**
     * @cfg {Date/String} maxValue
     * The maximum allowed date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date(2999,11,31)').
     */
    maxValue : new Date(2999,11,31),
    /**
     * @cfg {Date/String} minDefaultValue
     * The minimum default date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date()').
     */
    minDefaultValue : new Date(),
    /**
     * @cfg {Date/String} maxDefaultValue
     * The maximum default date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date()').
     */
    maxDefaultValue : new Date(),

    /**
     * Replaces any existing disabled dates with new values and refreshes the DateRangePicker.
     * @param {Array} disabledDates An array of date strings (see the <tt>{@link #disabledDates}</tt> config
     * for details on supported values) used to disable a pattern of dates.
     */
    setDisabledDates : function(dd){
        this.disabledDates = dd;
        this.initDisabledDays();
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setDisabledDates(this.disabledDatesRE);
            this.menu.rangePicker.endDatePicker.setDisabledDates(this.disabledDatesRE);
        }
    },

    /**
     * Replaces any existing disabled days (by index, 0-6) with new values and refreshes the DateRangePicker.
     * @param {Array} disabledDays An array of disabled day indexes. See the <tt>{@link #disabledDays}</tt>
     * config for details on supported values.
     */
    setDisabledDays : function(dd){
        this.disabledDays = dd;
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setDisabledDays(dd);
            this.menu.rangePicker.endDatePicker.setDisabledDays(dd);
        }
    },

    /**
     * Replaces any existing <tt>{@link #minValue}</tt> with the new value and refreshes the DateRangePicker.
     * @param {Date} value The minimum date that can be selected
     */
    setMinValue : function(dt){
        this.minValue = (typeof dt == "string" ? this.parseDate(dt) : dt);
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setMinDate(this.minValue);
            this.menu.rangePicker.endDatePicker.setMinDate(this.minValue);
        }
    },

    /**
     * Replaces any existing <tt>{@link #maxValue}</tt> with the new value and refreshes the DateRangePicker.
     * @param {Date} value The maximum date that can be selected
     */
    setMaxValue : function(dt){
        this.maxValue = (typeof dt == "string" ? this.parseDate(dt) : dt);
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setMaxDate(this.maxValue);
            this.menu.rangePicker.endDatePicker.setMaxDate(this.maxValue);
        }
    },

    /**
     * Runs all of NumberFields validations and returns an array of any errors. Note that this first
     * runs TextField's validations, so the returned array is an amalgamation of all field errors.
     * The additional validation checks are testing that the date format is valid, that the chosen
     * date is within the min and max date constraints set, that the date chosen is not in the disabledDates
     * regex and that the day chosed is not one of the disabledDays.
     * @param {Mixed} value The value to get errors for (defaults to the current field value)
     * @return {Array} All validation errors for this field
     */
    getErrors: function(value) {
        var errors = Ext.form.DateField.superclass.getErrors.apply(this, arguments);
        
        value = this.formatDate(value || this.processValue(this.getRawValue()));
        
        if (value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }
        var values = value.split(this.dateSeparator);
        if (values.length != 1 && values.length != 2){
            errors.push(String.format(this.invalidText, value, this.format+this.dateSeparator+this.format));
            return errors;
        }
        var rangeDate = this.parseRangeDate(value);
        if(values.length == 1){
            if (!rangeDate){
                errors.push(String.format(this.invalidText, value, this.format));
                return errors;
            }
            var scErrors = Ext.form.DateField.superclass.getErrors.call(this, value);
            if (!Ext.isEmpty(scErrors)){
                errors.push(String.format(this.invalidText, value, this.format));
                return errors;
            }
        }else if(values.length == 2){
            if (!rangeDate){
                errors.push(String.format(this.invalidText, value, this.format+this.dateSeparator+this.format));
                return errors;
            }
            var scErrors = Ext.form.DateField.superclass.getErrors.call(this, value);
            if (!Ext.isEmpty(scErrors)){
                errors.push(String.format(this.invalidText, value, this.format+this.dateSeparator+this.format));
                return errors;
            }
            if (rangeDate.endDate.getTime() - rangeDate.startDate.getTime() < 0){
                errors.push(this.reverseText);
                return errors;
            }
            if (!this.authorizeEqualValues && rangeDate.endDate.getElapsed(rangeDate.startDate) == 0){
                errors.push(this.notEqualText);
                return errors;
            }
        }
        //Checks if the start date is in the interval [minDate,maxDate]
        if (rangeDate.startDate != null){
            if (rangeDate.startDate.getTime() - this.minValue.getTime() < 0){
                errors.push(String.format(this.minText, this.formatDate(this.minValue)));
                return errors;
            }
            if (this.maxValue.getTime() - rangeDate.startDate.getTime() < 0){
                errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
                return errors;
            }
        }
        //Checks if the end date is in the interval [minDate,maxDate]
        if (rangeDate.endDate != null){
            if (rangeDate.endDate.getTime() - this.minValue.getTime() < 0){
                errors.push(String.format(this.minText, this.formatDate(this.minValue)));
                return errors;
            }
            if (this.maxValue.getTime() - rangeDate.endDate.getTime() < 0){
                errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
                return errors;
            }
        }
        return errors;
    },

    // private
    // return a range date object or null for failed parse operations
    parseRangeDate : function(value){
        if(!value){
            return null;
        }
        if(this.isRangeDate(value)){
            return value;
        }
        if(Ext.isDate(value)){
            return {startDate:value, endDate:value};
        }
        var values = value.split(this.dateSeparator);
        if(values.length == 1){
            var sdpIndex = value.indexOf(this.startDatePrefix,0);
            var edpIndex = value.indexOf(this.endDatePrefix,0);
            if(sdpIndex != -1){
            // Case ">= YYYY/MM/DD"
                var startDate = this.parseDate.call(this, value.substring(sdpIndex + this.startDatePrefix.length));
                if(startDate){
                    return {startDate:startDate, endDate:null};
                }else{
                    return null;
                }
            }else if(edpIndex != -1){
            // Case "<= YYYY/MM/DD"
                var endDate = this.parseDate.call(this, value.substring(edpIndex + this.endDatePrefix.length));
                if(endDate){
                    return {startDate:null, endDate:endDate};
                }else{
                    return null;
                }
            }else{
            // Case "YYYY/MM/DD"
                var date = this.parseDate.call(this, value);
                if(date){
                    return {startDate:date, endDate:date};
                }else{
                    return null;
                }
            }
        }else if(values.length == 2){
            // Case "YYYY/MM/DD - YYYY/MM/DD"
            var sv = Date.parseDate(values[0], this.format);
            var ev = Date.parseDate(values[1], this.format);
            if((!sv || !ev) && this.altFormats){
                if(!this.altFormatsArray){
                    this.altFormatsArray = this.altFormats.split("|");
                }
                var i,len;
                if(!sv){
                    for(i = 0, len = this.altFormatsArray.length; i < len && !sv; i++){
                        sv = Date.parseDate(values[0], this.altFormatsArray[i]);
                    }
                }
                if(!ev){
                    for(i = 0, len = this.altFormatsArray.length; i < len && !ev; i++){
                        ev = Date.parseDate(values[1], this.altFormatsArray[i]);
                    }
                }
            }
            if(!sv || !ev){
                return null;
            }else{
                return {startDate:sv, endDate:ev};
            }
        }else{
            return null;
        }
    },

    // private
    formatDate : function(date){
        if(Ext.isDate(date)){
            return Genapp.form.DateRangeField.superclass.formatDate.call(this, date);
        }
        if(this.isRangeDate(date)){
            if(date.startDate == null && date.endDate != null){
                if(this.usePrefix){
                    return this.endDatePrefix + date.endDate.format(this.format);
                }else{
                    return this.minValue.format(this.format) + this.dateSeparator + date.endDate.format(this.format);
                }
            }else if(date.startDate != null && date.endDate == null){
                if(this.usePrefix){
                    return this.startDatePrefix + date.startDate.format(this.format);
                }else{
                    return date.startDate.format(this.format) + this.dateSeparator + this.maxValue.format(this.format);
                }
            }else if(date.startDate != null && date.endDate != null){
                if(this.mergeEqualValues && date.endDate.getElapsed(date.startDate) == 0){
                    return date.startDate.format(this.format);
                }else if(this.autoReverse && date.endDate.getTime() - date.startDate.getTime() < 0){
                    return date.endDate.format(this.format) + this.dateSeparator + date.startDate.format(this.format);
                }else{
                    return date.startDate.format(this.format) + this.dateSeparator + date.endDate.format(this.format);
                }
            }else{
                return '';
            }
        }else{
            return date;
        }
    },

    /**
     * The function that handle the trigger's click event.
     * Implements the default empty TriggerField.onTriggerClick function to display the DateRangePicker
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        if(!this.menu){
            /**
             * The field menu (displayed on a trigger click).
             * @property menu
             * @type Genapp.menu.DateRangeMenu
             */
            this.menu = new Genapp.menu.DateRangeMenu({
                hideOnClick: false,
                hideValidationButton: this.hideValidationButton,
                showToday: this.showToday
            });
        }
        this.onFocus();
        if(typeof this.minDefaultValue === 'string'){
            this.minDefaultValue = new Date(this.minDefaultValue);
        }
        if(typeof this.maxDefaultValue === 'string'){
            this.maxDefaultValue = new Date(this.maxDefaultValue);
        }
        Ext.apply(this.menu.rangePicker.startDatePicker,  {
            minDate : this.minValue,
            maxDate : this.maxValue,
            defaultValue : this.minDefaultValue,
            disabledDatesRE : this.disabledDatesRE,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });
        Ext.apply(this.menu.rangePicker.endDatePicker,  {
            minDate : this.minValue,
            maxDate : this.maxValue,
            defaultValue : this.maxDefaultValue,
            disabledDatesRE : this.disabledDatesRE,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });

        var values = this.getValue();
        var minv = this.minDefaultValue;
        var maxv = this.maxDefaultValue;
        if(Ext.isDate(values)){
            minv = values;
            maxv = values;
        }else if(this.isRangeDate(values)){
            if(values.startDate != null){
                minv = values.startDate;
            }
            if(values.endDate != null){
                maxv = values.endDate;
            }
        }

        this.menu.rangePicker.startDatePicker.setValue(minv);
        this.menu.rangePicker.endDatePicker.setValue(maxv);

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

    /**
     * Checks if the object is a correct range date
     * @param {Object} rangeDate The rangeDate to check. <br/>
     * An object containing the following properties:<br/>
     *      <ul><li><b>startDate</b> : Date <br/>the start date</li>
     *      <li><b>endDate</b> : Date <br/>the end date</li></ul>
     * @return {Boolean} true if the object is a range date
     */
    isRangeDate : function(rangeDate){
        return (Ext.isObject(rangeDate) && (Ext.isDate(rangeDate.startDate) || rangeDate.startDate == null) && (Ext.isDate(rangeDate.endDate) || rangeDate.endDate == null));
    },
    
    /**
     * Returns the current date value of the date field.
     * @return {Date} The date value
     */
    getValue : function(){
        return this.parseRangeDate(Ext.form.DateField.superclass.getValue.call(this)) || "";
    },
    
    /**
     * Sets the value of the date field.  You can pass a date object or any string that can be
     * parsed into a valid date, using <tt>{@link #format}</tt> as the date format, according
     * to the same rules as {@link Date#parseDate} (the default format used is <tt>"m/d/Y"</tt>).
     * <br />Usage:
     * <pre><code>
//All of these calls set the same date value (May 4, 2006)

//Pass a date object:
var dt = new Date('5/4/2006');
dateField.setValue(dt);

//Pass a date string (default format):
dateField.setValue('05/04/2006');

//Pass a date string (custom format):
dateField.format = 'Y-m-d';
dateField.setValue('2006-05-04');
</code></pre>
     * @param {String/Date} date The date or valid date string
     * @return {Ext.form.Field} this
     */
    setValue : function(date){
        return Ext.form.DateField.superclass.setValue.call(this, this.formatDate(this.parseRangeDate(date)));
    },
    
    // private
    beforeBlur : function(){
        var v = this.parseRangeDate(this.getRawValue());
        if(v){
            this.setValue(v);
        }
    }
});
Ext.reg('daterangefield', Genapp.form.DateRangeField);/**
 * Provides a Geometry input field.
 *
 * @class Genapp.form.GeometryField
 * @extends Ext.form.TriggerField
 * @constructor Create a new GeometryField
 * @param {Object} config
 * @xtype geometryfield
 */

Ext.namespace('Genapp.form');

Genapp.form.GeometryField = Ext.extend(Ext.form.TriggerField, {

    /**
     * @cfg {String} listUrl The url to get the Geometry's list (defaults to undefined)
     */
    /**
     * @cfg {String} fieldLabel The label text to display next to this field (defaults to 'Geometry * ')
     */
    fieldLabel: 'Location',
    /**
     * @cfg {String} mapWindowTitle The map window title (defaults to 'Draw the search zone on the map :')
     */
    mapWindowTitle: 'Draw the search zone on the map :',
    /**
     * @cfg {String} mapWindowValidateButtonText The map windows validate button text (defaults to 'Validate')
     */
    mapWindowValidateButtonText: 'Validate',
    /**
     * @cfg {String} mapWindowValidateAndSearchButtonText The map windows validate and search button text (defaults to 'Validate and search')
     */
    mapWindowValidateAndSearchButtonText: 'Validate and search',
    /**
     * @cfg {String} mapWindowCancelButtonText The map windows cancel button text (defaults to 'Cancel')
     */
    mapWindowCancelButtonText: 'Cancel',
    /**
     * @cfg {String} triggerClass
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-trigger' by default and triggerClass will be appended if specified.
     * (Default to 'x-form-map-trigger')
     */
    triggerClass: 'x-form-map-trigger',
    /**
     * @cfg {Boolean} editable false to prevent the user from typing text directly into the field,
     * the field will only respond to a click on the trigger to set the value. (defaults to false).
     */
    editable: false,
    /**
     * @cfg {Boolean} hideMapDetails
     * if true hide the details button in map toolbar (defaults to false).
     */
    hideMapDetails : true,
    /**
     * @cfg {Boolean} maximizable
     * True to display the 'maximize' tool button and allow the user to maximize the window, false to hide the button
     * and disallow maximizing the window (defaults to true).  Note that when a window is maximized, the tool button
     * will automatically change to a 'restore' button with the appropriate behavior already built-in that will
     * restore the window to its previous size.
     */
    mapWindowMaximizable : true,
    /**
     * @cfg {Boolean} maximized
     * True to initially display the window in a maximized state. (Defaults to false).
     */
    mapWindowMaximized: false,
    /**
     * @cfg {Number} height
     * The height of the map window in pixels (defaults to 500).
     * Note to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
     */
    mapWindowHeight: 500,
    /**
     * @cfg {Number} width
     * The width of the map window in pixels (defaults to 850).
     * Note to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
     */
    mapWindowWidth: 850,
    /**
     * @cfg {Integer} mapWindowMinZoomLevel
     * The min zoom level for the map (defaults to <tt>0</tt>)
     */
    mapWindowMinZoomLevel: 0,

    // private
    initComponent : function(){
        Genapp.form.GeometryField.superclass.initComponent.call(this);

        if(!this.hideTrigger){
            this.onTriggerClick = function(){
                if(this.disabled){
                    return;
                }
                if(!(this.mapWindow instanceof Ext.Window)){
                    this.openMap(this);
                }else{
                    this.mapWindow.show();
                }
            };
        }
    },

    /**
     * Open the map
     */
    openMap : function(){
        if (!this.mapWindow){
            /**
             * The map window.
             * @property mapWindow
             * @type Ext.Window
             */
            this.mapWindow = new Ext.Window({
                layout: 'fit',
                maximizable: this.mapWindowMaximizable,
                maximized: this.mapWindowMaximized,
                title: this.mapWindowTitle,
                width: this.mapWindowWidth,
                height: this.mapWindowHeight,
                closeAction: 'destroy',
                // please do not overwrite !!!
                draggable: false, // both of these lines
                resizable: false, // are useful for mapfish, cf https://trac.mapfish.org/trac/mapfish/ticket/84
                // please do not overwrite !!!
                modal: true,
                scope: true,
                /**
                 * The map panel.
                 * @property mapPanel
                 * @type Genapp.MapPanel
                 */
                items:this.mapPanel = new Genapp.MapPanel({
                    title:'',
                    isDrawingMap:true,
                    featureWKT: this.getRawValue(),
                    hideMapDetails: this.hideMapDetails,
                    minZoomLevel: this.mapWindowMinZoomLevel,
                    resultsBBox: Ext.getCmp('consultation_panel').mapPanel.resultsBBox
                }),
                buttons: [{
                    text: this.mapWindowCancelButtonText,
                    handler: function(){
                        this.mapWindow.destroy();
                    },
                    scope:this
                },{
                    text: this.mapWindowValidateButtonText,
                    handler: this.onWindowValidate,
                    scope:this
                },{
                    text: this.mapWindowValidateAndSearchButtonText,
                    handler: this.onWindowValidate.createDelegate(this, [true])
                }]
            });
            // because Ext does not clean everything (mapWindow still instanceof Ext.Window):
            this.mapWindow.on('destroy', function(){
                delete this.mapWindow;
                if(this.submitRequest == true){
                    Ext.getCmp('consultation_panel').submitRequest();
                    this.submitRequest = false;
                }
            }, this);
            this.mapPanel.on('afterinit', function(mapPanel){
                var consultationPanel = Ext.getCmp('consultation_panel');
                mapPanel.map.setCenter(consultationPanel.mapPanel.map.getCenter());
                mapPanel.map.zoomTo(consultationPanel.mapPanel.map.getZoom() - this.mapWindowMinZoomLevel);
                mapPanel.enableLayersAndLegends(this.mapPanel.layersActivation['request'],true, true);
            }, this);
        }
        this.mapWindow.show();
    },

    /**
     * Function called when the window validate button is pressed
     * 
     * @param {Boolean} search True to submit the request
     */
    onWindowValidate: function (search){
        var value = this.mapPanel.vectorLayer.features.length ? this.mapPanel.wktFormat.write(this.mapPanel.vectorLayer.features[0]) : '';
        this.setValue(value);
        if (search == true) {
            this.submitRequest = true;
        }
        this.mapWindow.destroy();
        this.el.highlight();
    }
});
Ext.reg('geometryfield', Genapp.form.GeometryField);/**
 * Provides a number range input field with a {@link Genapp.NumberRangePicker} dropdown and automatic number validation.
 *
 * @class Genapp.form.NumberRangeField
 * @extends Ext.form.NumberField
 * @constructor Create a new NumberRangeField
 * @param {Object} config
 * @xtype numberrangefield
 */

Ext.namespace('Genapp.form');

Genapp.form.NumberRangeField = Ext.extend(Ext.form.TriggerField,  {
    /**
     * @cfg {String} numberSeparator
     * The separator text to display between the numbers (defaults to <tt>' - '</tt>)
     */
    numberSeparator: ' - ',
    /**
     * @cfg {String} minText Error text to display if the minimum value validation fails (defaults to "The minimum value for this field is {minValue}")
     */
    minText : "The minimum value for this field is {0}",
    /**
     * @cfg {String} maxText Error text to display if the maximum value validation fails (defaults to "The maximum value for this field is {maxValue}")
     */
    maxText : "The maximum value for this field is {0}",
    /**
     * @cfg {String} reverseText
     * The error text to display when the numbers are reversed (defaults to
     * <tt>'The end number must be posterior to the start number'</tt>).
     */
    reverseText : "The max number must be superior to the min number",
    /**
     * @cfg {String} formatText
     * The error text to display when the format isn't respected (defaults to
     * <tt>'The correct format is 0.00 - 0.00'</tt>).
     */
    formatText : "The correct format is '{0}'",
    /**
     * @cfg {Boolean} allowDecimals False to disallow decimal values (defaults to true)
     */
    allowDecimals : true,
    /**
     * @cfg {String} decimalSeparator Character(s) to allow as the decimal separator (defaults to '.')
     */
    decimalSeparator : ".",
    /**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator (defaults to 2)
     */
    decimalPrecision : 2,
    /**
     * @cfg {Boolean} allowNegative False to prevent entering a negative sign (defaults to true)
     */
    allowNegative : true,
    /**
     * @cfg {Number} minValue The minimum allowed value (defaults to -Number.MAX_VALUE)
     */
    minValue : -Number.MAX_VALUE,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue : Number.MAX_VALUE,
    /**
     * @cfg {String} nanText Error text to display if the value is not a valid number.  For example, this can happen
     * if a valid character like '.' or '-' is left in the field with no number (defaults to "{value} is not a valid number")
     */
    nanText : "'{0}' is not a valid number",
    /**
     * @cfg {String} baseChars The base set of characters to evaluate as valid numbers (defaults to '0123456789').
     */
    baseChars : "0123456789 ",
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to true).
     */
    hideValidationButton : false,
    /**
     * @cfg {Boolean} setEmptyText if true set emptyText of the fields with the min and the max values (defaults to false).
     */
    setEmptyText : false,

    // private
    initEvents : function(){
        var allowed = this.baseChars + '';
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        this.maskRe = new RegExp('[' + Ext.escapeRe(allowed) + ']');
        Genapp.form.NumberRangeField.superclass.initEvents.call(this);
    },

    // private
    initComponent : function(){
        Genapp.form.NumberRangeField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event select
             * Fires when a date is selected via the date picker.
             * @param {Ext.form.DateField} this
             * @param {Date} date The date that was selected
             */
            'select'
        );
        if(this.setEmptyText){
            this.emptyText = this.minValue + this.numberSeparator + this.maxValue;
        }
        // Formating of the formatText string
        var format = 0;
        if (this.decimalPrecision > 0) {
            format = format+ this.decimalSeparator;
            for (i = 0; i < this.decimalPrecision; i++) {
                format = format + "0";
            }
        }
        format = format + this.numberSeparator + format;
        this.formatText = String.format(this.formatText, format);
    },

    // private
    validateValue : function(value){
        if(!Genapp.form.NumberRangeField.superclass.validateValue.call(this, value)){
            return false;
        }
        if(value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return true;
        }

        var values = value.split(this.numberSeparator);
        // The value can be one number if min = max
        if(values.length == 1){
            var v = this.parseValue(values[0]);
            if(isNaN(v)){
                this.markInvalid(String.format(this.nanText, v));
                return false;
            }else{
                return true;
            }
        }else if(values.length == 2){
            var minv = this.parseValue(values[0]);
            var maxv = this.parseValue(values[1]);
            if(maxv === '' || minv === ''){
                this.markInvalid(this.formatText);
                return false;
            }
            if(isNaN(minv)){
                this.markInvalid(String.format(this.nanText, minv));
                return false;
            }
            if(isNaN(maxv)){
                this.markInvalid(String.format(this.nanText, maxv));
                return false;
            }
            if(minv < this.minValue){
                this.markInvalid(String.format(this.minText, this.minValue));
                return false;
            }
            if(maxv > this.maxValue){
                this.markInvalid(String.format(this.maxText, this.maxValue));
                return false;
            }
            if((maxv - minv) < 0){
                this.markInvalid(this.reverseText);
                return false;
            }
            return true;
        }else{
            this.markInvalid(this.formatText);
            return false;
        }
    },

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').
     * To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        var value = Genapp.form.NumberRangeField.superclass.getValue.call(this);
        var values = value.split(this.numberSeparator);
        if(values.length == 1){
            return String(this.fixPrecision(this.parseValue(values[0]))).replace(".", this.decimalSeparator);
        }else if(values.length == 2){
            return String(this.fixPrecision(this.parseValue(values[0]))).replace(".", this.decimalSeparator) 
            + this.numberSeparator 
            + String(this.fixPrecision(this.parseValue(values[1]))).replace(".", this.decimalSeparator);
        }else{
            return '';
        }
    },

    /**
     * Sets a data value into the field and validates it.
     * To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        var minv = null;
        var maxv = null;
        if(Ext.isObject(v)){
            if(typeof v.minValue !== 'undefined' && typeof v.maxValue !== 'undefined'){
                minv = v.minValue;
                maxv = v.maxValue;
            }else{
                return '';
            }
        }else{
            if(typeof v === 'string'){
                var values = v.split(this.numberSeparator);
                if(values.length == 1){
                    minv = maxv = this.parseValue(values[0]);
                }else if(values.length == 2){
                    minv = this.parseValue(values[0]);
                    maxv = this.parseValue(values[1]);
                }else{
                    return '';
                }
            }else{
                return '';
            }
        }
        min = typeof minv == 'number' ? minv : parseFloat(String(minv).replace(this.decimalSeparator, "."));
        max = typeof maxv == 'number' ? maxv : parseFloat(String(maxv).replace(this.decimalSeparator, "."));
        mins = isNaN(min) ? '' : String(this.fixPrecision(min)).replace(".", this.decimalSeparator);
        maxs = isNaN(max) ? '' : String(this.fixPrecision(max)).replace(".", this.decimalSeparator);

        if(min == max){
            v = mins;
        }else if(min < max){
            v = mins + this.numberSeparator + maxs;
        }else{
            v = maxs + this.numberSeparator + mins;
        }

        return Genapp.form.NumberRangeField.superclass.setValue.call(this, v);
    },

    // private
    parseValue : function(value){
        value = parseFloat(String(value).replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },

    // private
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowDecimals || this.decimalPrecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    },

    /**
     * The function that handle the trigger's click event.
     * Implements the default empty TriggerField.onTriggerClick function to display the NumberRangePicker
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        if(!this.menu){
            /**
             * The field menu (displayed on a trigger click).
             * @property menu
             * @type Genapp.menu.NumberRangeMenu
             */
            this.menu = new Genapp.menu.NumberRangeMenu({
                hideOnClick: false,
                hideValidationButton: this.hideValidationButton
            });
        }
        this.onFocus();
        Ext.apply(this.menu.rangePicker.minField,  {
            emptyText: this.setEmptyText ? this.minValue : null,
            allowDecimals : this.allowDecimals,
            decimalSeparator : this.decimalSeparator,
            decimalPrecision : this.decimalPrecision,
            allowNegative : this.allowNegative,
            minValue : this.minValue,
            maxValue : this.maxValue,
            baseChars : this.baseChars
        });
        Ext.apply(this.menu.rangePicker.maxField,  {
            emptyText : this.setEmptyText ? this.maxValue : null,
            allowDecimals : this.allowDecimals,
            decimalSeparator : this.decimalSeparator,
            decimalPrecision : this.decimalPrecision,
            allowNegative : this.allowNegative,
            minValue : this.minValue,
            maxValue : this.maxValue,
            baseChars : this.baseChars
        });

        var values = this.getValue().split(this.numberSeparator);
        if(values.length == 1){
            var minv = this.parseValue(values[0]);
            var maxv = minv;
        }else if(values.length == 2){
            var minv = this.parseValue(values[0]);
            var maxv = this.parseValue(values[1]);
        }else{
            return;
        }

        this.menu.rangePicker.minField.setValue(minv);
        this.menu.rangePicker.maxField.setValue(maxv);

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

    //private
    menuEvents: function(method){
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },

    //private
    onSelect: function(m, d){
        this.fireEvent('select', this, d);
        this.menu.hide();
    },

    //private
    onMenuHide: function(){
        this.focus(false, 60);
        this.menuEvents('un');
        this.setValue({
            minValue: this.menu.rangePicker.minField.getValue(),
            maxValue: this.menu.rangePicker.maxField.getValue()
        });
    },

    // private
    // Provides logic to override the default TriggerField.validateBlur which just returns true
    validateBlur : function(){
        return !this.menu || !this.menu.isVisible();
    },

    // private
    onDestroy : function(){
        Ext.destroy(this.menu, this.wrap);
        Genapp.form.NumberRangeField.superclass.onDestroy.call(this);
    },

    // private
    beforeBlur : function(){
        var v = this.getRawValue();
        if(v){
            this.setValue(v);
        }
    }
});
Ext.reg('numberrangefield', Genapp.form.NumberRangeField);/**
 * 
 * A twin number field.
 * 
 * @class Genapp.form.TwinNumberField
 * @extends Ext.form.TwinTriggerField
 * @constructor Create a new TwinNumberField
 * @param {Object} config
 * @xtype twinnumberfield
 */

Ext.namespace('Genapp.form');

Genapp.form.TwinNumberField = Ext.extend(Ext.form.TwinTriggerField, {
    
    /**
     * @cfg {RegExp} stripCharsRe @hide
     */
    /**
     * @cfg {RegExp} maskRe @hide
     */
    /**
     * @cfg {String} fieldClass The default CSS class for the field (defaults to "x-form-field x-form-num-field")
     */
    fieldClass: "x-form-field x-form-num-field",
    /**
     * @cfg {Boolean} allowDecimals False to disallow decimal values (defaults to true)
     */
    allowDecimals : true,
    /**
     * @cfg {String} decimalSeparator Character(s) to allow as the decimal separator (defaults to '.')
     */
    decimalSeparator : ".",
    /**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator (defaults to 2)
     */
    decimalPrecision : 2,
    /**
     * @cfg {Boolean} allowNegative False to prevent entering a negative sign (defaults to true)
     */
    allowNegative : true,
    /**
     * @cfg {Number} minValue The minimum allowed value (defaults to Number.NEGATIVE_INFINITY)
     */
    minValue : -Number.MAX_VALUE,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue : Number.MAX_VALUE,
    /**
     * @cfg {String} minText Error text to display if the minimum value validation fails (defaults to "The minimum value for this field is {minValue}")
     */
    minText : "The minimum value for this field is {0}",
    /**
     * @cfg {String} maxText Error text to display if the maximum value validation fails (defaults to "The maximum value for this field is {maxValue}")
     */
    maxText : "The maximum value for this field is {0}",
    /**
     * @cfg {String} nanText Error text to display if the value is not a valid number.  For example, this can happen
     * if a valid character like '.' or '-' is left in the field with no number (defaults to "{value} is not a valid number")
     */
    nanText : "{0} is not a valid number",
    /**
     * @cfg {String} baseChars The base set of characters to evaluate as valid numbers (defaults to '0123456789').
     */
    baseChars : "0123456789",
    /**
     * @cfg {String} trigger1Class
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-clear-trigger' by default and triggerClass will be appended if specified.
     */
    trigger1Class:'x-form-clear-trigger',
    /**
     * @cfg {Boolean} hideTrigger1
     * true to hide the first trigger. (Default to true)
     * See Ext.form.TwinTriggerField#initTrigger also.
     */
    hideTrigger1:true,
    /**
     * @cfg {Boolean} hideTrigger2
     * true to hide the second trigger. (Default to true)
     * See Ext.form.TwinTriggerField#initTrigger also.
     */
    hideTrigger2:true,

    // private
    initComponent : function(){
        this.on('change', this.onChange, this);
        Genapp.form.TwinNumberField.superclass.initComponent.call(this);
    },

    /**
     * The function that handle the trigger's click event.
     * See {@link Ext.form.TriggerField#onTriggerClick} for additional information.
     * @method
     * @param {EventObject} e
     * @hide
     */
    onTrigger1Click : function(){
        this.reset();
        this.triggers[0].hide();
    },

    // private
    onChange : function(field){
        var v = this.getValue();
        if(v !== '' && v != null){
            this.triggers[0].show();
        }else{
            this.triggers[0].hide();
        }
    },

    // private
    initEvents : function(){
        var allowed = this.baseChars + '';
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        this.maskRe = new RegExp('[' + Ext.escapeRe(allowed) + ']');
        Ext.form.NumberField.superclass.initEvents.call(this);
    },

    // private
    validateValue : function(value){
        if(!Ext.form.NumberField.superclass.validateValue.call(this, value)){
            return false;
        }
        if(value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return true;
        }
        value = String(value).replace(this.decimalSeparator, ".");
        if(isNaN(value)){
            this.markInvalid(String.format(this.nanText, value));
            return false;
        }
        var num = this.parseValue(value);
        if(num < this.minValue){
            this.markInvalid(String.format(this.minText, this.minValue));
            return false;
        }
        if(num > this.maxValue){
            this.markInvalid(String.format(this.maxText, this.maxValue));
            return false;
        }
        return true;
    },

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').
     * To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        return this.fixPrecision(this.parseValue(Ext.form.NumberField.superclass.getValue.call(this)));
    },

    /**
     * Sets a data value into the field and validates it.
     * To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        v = typeof v == 'number' ? v : parseFloat(String(v).replace(this.decimalSeparator, "."));
        v = isNaN(v) ? '' : String(v).replace(".", this.decimalSeparator);
        if(this.triggers){
            if(v !== '' && v != null && v != this.minValue && v != this.maxValue){
                this.triggers[0].show();
            }else{
                this.triggers[0].hide();
            }
        }
        return Ext.form.NumberField.superclass.setValue.call(this, v);
    },

    // private
    parseValue : function(value){
        value = parseFloat(String(value).replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },

    // private
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowDecimals || this.decimalPrecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    },

    // private
    beforeBlur : function(){
        var v = this.parseValue(this.getRawValue());
        if(v !== '' && v != null){
            this.setValue(this.fixPrecision(v));
        }
    }
});
Ext.reg('twinnumberfield', Genapp.form.TwinNumberField);/**
 * 
 * A menu containing a {@link Genapp.DateRangePicker} Component.
 * 
 * @class Genapp.menu.DateRangeMenu
 * @extends Ext.menu.DateMenu
 * @constructor Create a new DateRangeMenu
 * @param {Object} config
 * @xtype daterangemenu
 */

Ext.namespace('Genapp.menu');

Genapp.menu.DateRangeMenu = Ext.extend( Ext.menu.DateMenu, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'table'.
     * Note: The layout 'menu' doesn't work on FF3.5,
     * the rangePicker items are not rendered 
     * because the rangePicker is hidden... 
     * But it's working on IE ???
     */
    layout:'table', 
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-date-range-menu').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-date-range-menu',

    // private
    initComponent: function(){
        this.on('beforeshow', this.onBeforeShow, this);
        /**
         * The {@link Genapp.DateRangePicker} instance for this DateRangeMenu
         * @property rangePicker
         * @type Genapp.DateRangePicker
         */
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: [this.rangePicker = new Genapp.DateRangePicker(this.initialConfig)]
        });
        this.rangePicker.purgeListeners();
        Ext.menu.DateMenu.superclass.initComponent.call(this);
        this.relayEvents(this.rangePicker, ["select"]);
    },

    // private
    onBeforeShow: function(){
        if (this.rangePicker){
            this.rangePicker.startDatePicker.hideMonthPicker(true);
            this.rangePicker.endDatePicker.hideMonthPicker(true);
        }
    },

    /**
     * Displays this menu at a specific xy position
     * @param {Array} xyPosition Contains X & Y [x, y] values for the position at which to show the menu (coordinates are page-based)
     * @param {Ext.menu.Menu} parentMenu (optional) This menu's parent menu, if applicable (defaults to undefined)
     */
    showAt : function(xy, parentMenu, /* private: */_e){
        this.parentMenu = parentMenu;
        if(!this.el){
            this.render();
        }
        if(_e !== false){
            this.fireEvent("beforeshow", this);
            xy = this.el.adjustForConstraints(xy);
        }
        this.el.setXY(xy);
        if(this.enableScrolling){
            this.constrainScroll(xy[1]);     
        }
        this.el.show();
        Ext.menu.Menu.superclass.onShow.call(this);
        this.hidden = false;
        this.focus();
        this.fireEvent("show", this);
    }
});
Ext.reg('daterangemenu', Genapp.menu.DateRangeMenu);/**
 * A menu containing a {@link Genapp.NumberRangePicker} Component.
 *
 * @class Genapp.menu.NumberRangeMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new NumberRangeMenu
 * @param {Object} config
 * @xtype numberrangemenu
 */

Ext.namespace('Genapp.menu');

Genapp.menu.NumberRangeMenu = Ext.extend( Ext.menu.Menu, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'auto'.
     * Note: The layout 'menu' doesn't work on FF3.5,
     * the rangePicker items are not rendered 
     * because the rangePicker is hidden... 
     * But it's working on IE ???
     */
    layout:'auto', 
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-number-range-menu').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-number-range-menu',

    // private
    initComponent: function(){
        /**
         * The {@link Genapp.NumberRangePicker} instance for this NumberRangeMenu
         * @property rangePicker
         * @type Genapp.NumberRangePicker
         */
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: [this.rangePicker = new Genapp.NumberRangePicker(this.initialConfig)]
        });
        this.rangePicker.purgeListeners();
        Genapp.menu.NumberRangeMenu.superclass.initComponent.call(this);
        this.relayEvents(this.rangePicker, ["select"]);
    },

    /**
     * Displays this menu at a specific xy position
     * @param {Array} xyPosition Contains X & Y [x, y] values for the position at which to show the menu (coordinates are page-based)
     * @param {Ext.menu.Menu} parentMenu (optional) This menu's parent menu, if applicable (defaults to undefined)
     */
    showAt : function(xy, parentMenu, /* private: */_e){
        this.parentMenu = parentMenu;
        if(!this.el){
            this.render();
        }
        if(_e !== false){
            xy = this.el.adjustForConstraints(xy);
        }
        this.el.setXY(xy);
        if(this.enableScrolling){
            this.constrainScroll(xy[1]);     
        }
        this.el.show();
        Ext.menu.Menu.superclass.onShow.call(this);
        this.hidden = false;
        this.focus();
        this.fireEvent("show", this);
    }
});
Ext.reg('numberrangemenu', Genapp.menu.NumberRangeMenu);