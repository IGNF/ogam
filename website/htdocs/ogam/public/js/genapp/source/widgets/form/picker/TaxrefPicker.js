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
 * Simple taxref picker class.
 * 
 * @class Genapp.form.picker.TaxrefPicker
 * @extends Ext.tree.TreePanel
 * @constructor Create a new TaxrefPicker
 * @param {Object}
 *            config The config object
 * @xtype taxrefpicker
 */
Ext.namespace('Genapp.form.picker');

Genapp.form.picker.TaxrefPicker = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * Internationalization.
	 */
	okButtonText : "ok",

	/**
	 * @cfg {Number} height The height of this component in pixels (defaults to
	 *      300).
	 */
	height : 300,
	/**
	 * @cfg {Number} width The width of this component in pixels (defaults to
	 *      300).
	 */
	width : 500,
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-number-range-item'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
	cls : 'x-menu-tree-item',

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : true,

	/**
	 * Validation button
	 * 
	 * @type Ext.Button
	 */
	validationButton : null,

	padding : 5,
	enableDD : false,
	animate : true,
	border : false,
	rootVisible : false,
	useArrows : true,
	autoScroll : true,
	containerScroll : true,
	frame : false,
	
	baseAttr : {
		singleClickExpand : true
	},
	listeners : {
		'dblclick' : {// Select the node on double click
			fn : function(node, event) {
				this.fireEvent('select', node);
			}
		}
	},

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		/*
		 * The root must be instancied here and not in the static part of the
		 * class to avoid a conflict between the instance of the class
		 */
		this.root = new Ext.tree.AsyncTreeNode({
			draggable : false,
			id : '*'
		}); // root is always '*'

		this.validationButton = {
			xtype : 'button',
			text : this.okButtonText,
			width : 'auto',
			handler : this.onOkButtonPress.createDelegate(this)
		};
		
		// Custom treeloader
		this.loader = new Genapp.form.picker.TaxrefNodeLoader({url: this.dataUrl});

		// Add the validation button
		if (!this.hideValidationButton) {
			this.buttons = [ this.validationButton ];
			this.height = this.height + 28;
		}

		Genapp.form.picker.TaxrefPicker.superclass.initComponent.call(this);
	},

	/**
	 * Launched when the OK button is pressed.
	 */
	onOkButtonPress : function(button, state) {
		if (state) {
			var selectedNode = this.getSelectionModel().getSelectedNode();
			this.fireEvent('select', selectedNode === null ? null : selectedNode);
		}
	}
});
Ext.reg('taxrefpicker', Genapp.form.picker.TaxrefPicker);