Ext.define('OgamDesktop.ux.request.AdvancedRequestSelector', {
	extend: 'Ext.form.FieldSet',
	xtype: 'advanced-request-selector',
	mixins: {
		storeholder: 'Ext.util.StoreHolder'
	},

	criteriaValues:[],

    destroy: function () {
        this.mixins.storeholder.destroy.call(this);
        this.callParent();
    },
	
	requires: [
		'OgamDesktop.ux.request.AdvancedRequestFieldSet'
    ],
    
    onBindStore: function(store, initial, propertyName, oldStore){
    	this.reloadForm();
    },
    setCriteriaValues:function(value){
    	this.criteriaValues = (Ext.isIterable(value) || Ext.isObject(value)) ? value : [];
    },
	
    reloadForm: function(){
		this.removeAll();
		this.store.getData().each(function(item, idex, length){

			var criteria = item.criteria();
			var columns =  item.columns();

			if (!(Ext.isEmpty(criteria) && Ext.isEmpty(columns))) {
				var formId = item.get('id');
				this.add({
					xtype:'advanced-request-fieldset',
					title : item.get('label'),
					id : formId,
					criteriaDS : criteria,
					criteriaValues : this.criteriaValues,
					columnsDS : columns
				});
			}
		},this);
		this.updateLayout();
    }
});