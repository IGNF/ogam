/**
 * Simple tree picker class.
 * 
 * @class Genapp.form.picker.TreePicker
 * @extends Ext.TreePanel
 * @constructor Create a new TreePicker
 * @param {Object} config The config object
 * @xtype treepicker
 */
Ext.namespace('Genapp.form.picker');

Genapp.form.picker.TreePicker = Ext.extend(Ext.tree.TreePanel, {
    /**
     * @cfg {Number} height
     * The height of this component in pixels (defaults to 300).
     */
    height:300,
    /**
     * @cfg {Number} width
     * The width of this component in pixels (defaults to 300).
     */
    width:300,
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
    cls: 'x-menu-tree-item',
    /**
     * @cfg {String} okButtonText
     * The ok Button Text (defaults to <tt>'ok'</tt>)
     */
    okButtonText:"ok",
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to true).
     */
    hideValidationButton : true,
    padding:5,
    enableDD : false,
    animate : true, 
    border : false,
    rootVisible : false,
    useArrows : true,
    autoScroll : true,
    containerScroll : true,
    frame : false,
    root : {nodeType: 'async', text:'Tree Root', id:'*', draggable : false}, // root is always '*'
    listeners:{
        'load':{// Expand by default the root children
            fn:function(node){
                if(node.getDepth() == 0){
                    node.expandChildNodes();
                }
            },
            single:true
        },
        'dblclick':{// Select the node on double click
            fn:function(node, event){
                this.fireEvent('select', node.attributes);
            }
        }
    },

    // private
    initComponent : function(){
        if(!this.hideValidationButton){
            this.buttons = [{
                xtype:'button',
                text:this.okButtonText,
                width:'auto',
                handler:this.onOkButtonPress.createDelegate(this)
            }];
            this.height = this.height + 28;
        }

        Genapp.form.picker.TreePicker.superclass.initComponent.call(this);
    },

    // private
    onOkButtonPress: function (button, state){
        if(state){
            var selectedNode = this.getSelectionModel().getSelectedNode();
            this.fireEvent('select', selectedNode == null ? null : selectedNode.attributes);
        }
    }
});
Ext.reg('treepicker', Genapp.form.picker.TreePicker);