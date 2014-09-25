/**
 * @deprecated
 */
Ext.define('OgamDesktop.model.request.fieldset.Column', {
	extend: 'Ext.data.Model',
	idProperty: 'name',
    fields: [
        { name: 'name', type: 'auto' },
        { name: 'label', type: 'string' },
        { name: 'definition', type: 'string' },
        { name: 'is_default', type: 'boolean', defaultValue: false },
        { name: 'decimals', type: 'integer' }
    ]
});