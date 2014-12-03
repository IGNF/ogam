Ext.define('OgamDesktop.ux.request.AdvancedRequestSelector', {
	extend: 'Ext.form.FieldSet',
	xtype: 'advanced-request-selector',
	mixins: {
		storeholder: 'Ext.util.StoreHolder'
	},
	
    destroy: function () {
        this.mixins.storeholder.destroy.call(this);
        this.callParent();
    },
	
	requires: [
    ],
	     
    onBindStore: function(store, initial, propertyName, oldStore){
    	console.log('setStore');
    	console.log(this.store);
    	console.log(this.store.data.items[2].id);
    	
		var forms = store.getData(), i;
		console.log('forms',forms);
		this.removeAll();
		this.doLayout();
		// Removes the loading message
		//this.formsPanel.body.update();

		store.getData().each(function(item, idex, length){
			console.log('item',item);
			var criteria = item.criteria();
			var columns =  item.columns();
			console.log('criteria',criteria);
			console.log('columns',columns);
			if (!(Ext.isEmpty(criteria) && Ext.isEmpty(columns))) {
				var formId = item.get('id');
				this.add({
					xtype:'advanced-request-fieldset',
					title : item.get('label'),
					id : formId,
					criteriaDS : criteria,
					//criteriaValues : criteriaValues, //FIXME
					columnsDS : columns
				});
                // Find the geom criteria and fill the geomCriteriaInfo param
                /*for (j = 0; j < criteria.length; j++) {
                    if(criteria[j].type === 'GEOM'){
                        this.geomCriteriaInfo = {
                            'formId' : formId,
                            'id' : criteria[j].name //FIXME
                        }
                    }
                }*/ 
			}
		},this);
		
		this.doLayout();
		
		/*if (!Ext.isEmpty(apiParams)) {
			if (apiParams.collapseQueryPanel === true) {
				this.queryPanel.collapse();
			}
			if (apiParams.launchRequest === true) {
				this.submitRequest();
			}
		}*/ //FIXME
    	
    }

	/*keys : { //FIXME
		key : Ext.EventObject.ENTER,
		fn : this.submitRequest,
		scope : this
	}*/
});