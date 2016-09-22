/**
 * This class defines the OgamDesktop request fieldset criterion model.
 * @deprecated
 */
Ext.define('OgamDesktop.model.request.fieldset.Criterion', {
	extend: 'Ext.data.Model',
	idProperty: 'id',
    fields: [
        // Form Field
        { name: 'id', type: 'auto' },
        { name: 'name', mapping: 'id', type: 'string' },
        { name: 'data' },
        { name: 'format', type: 'string' },
        { name: 'is_default', mapping: 'is_default_criteria', type: 'boolean', defaultValue: false },
        { name: 'decimals', type: 'integer' },
        { name: 'default_value', type: 'string' },
        { name: 'inputType', mapping: 'input_type', type: 'string' },
        // Data
        { name: 'label', type: 'string', calculate: function (field) { return field.data.label; } },
        { name: 'definition', type: 'string', calculate: function (field) { return field.data.definition; } },
        // Unit
        { name: 'unit', type: 'string', calculate: function (field) { return field.data.unit.unit; } },
        { name: 'type', type: 'string', calculate: function (field) { return field.data.unit.type; } },
        { name: 'subtype', type: 'string', calculate: function (field) { return field.data.unit.subtype; } },
        // Range
        { name: 'min_value', type: 'auto', calculate: function (field) { return field.data.unit.range ? field.data.unit.range.min : null; } },
        { name: 'max_value', type: 'auto', calculate: function (field) { return field.data.unit.range ? field.data.unit.range.max : null; } },
        // Code
        { name: 'codes', calculate: function (field) { return field.data.unit.codes ? field.data.unit.codes : null; } }
    ],
    proxy: {
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