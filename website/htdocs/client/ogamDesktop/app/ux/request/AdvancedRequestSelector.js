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
		'OgamDesktop.ux.request.AdvancedRequestFieldSet'
    ],
	     
    onBindStore: function(store, initial, propertyName, oldStore){
		var forms = store.getData(), i;
		this.removeAll();
		this.updateLayout();
		// Removes the loading message
		//this.formsPanel.body.update();

		store.getData().each(function(item, idex, length){
			var criteria = item.criteria();
			var columns =  item.columns();
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
		
		//this.updateLayout();
		
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