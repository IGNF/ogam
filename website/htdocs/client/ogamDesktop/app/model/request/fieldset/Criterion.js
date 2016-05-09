/**
 * This class defines the OgamDesktop request fieldset criterion model.
 * @deprecated
 */
Ext.define('OgamDesktop.model.request.fieldset.Criterion', {
	extend: 'Ext.data.Model',
	idProperty: 'name',
    fields: [
        { name: 'name', type: 'auto' },
        { name: 'label', type: 'string' },
        { name: 'definition', type: 'string' },
        { name: 'is_default', type: 'boolean', defaultValue: false },
        { name: 'decimals', type: 'integer' },
        { name: 'default_value', type: 'string' },
        { name: 'inputType', type: 'string' },
        { name: 'subtype', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'unit', type: 'string' }
    ],
    proxy:{
    	reader:{
    		type:'json',
    		rootProperty:'criteria'
    	}
    },

    /**
     * Return the criteria field config
     * @return {Object} The criteria field config
     */
    getCriteriaField: function() {
        return OgamDesktop.ux.request.RequestFieldSet.getCriteriaConfig(this.getData(), true);
    }
});