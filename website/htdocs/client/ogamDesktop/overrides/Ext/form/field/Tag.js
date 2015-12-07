/** 
 * Fixes return values of Ext.form.field.Tag.findRecord
 * 
 * In 5.0.1 findRecord returns an empty array or an array containing `undefined` when it
 * is expected to return an Ext.data.Model instance or a falsey value.
 * @source https://github.com/JarvusInnovations/sencha-hotfixes/blob/ext/5/0/1/1255/overrides/form/field/Tag/FindRecord.js
 * 
 * Discussion: http://www.sencha.com/forum/showthread.php?290400-tagfield-bind-value
 */
Ext.define('Jarvus.hotfixes.ext.form.field.Tag.FindRecord', {
    override: 'Ext.form.field.Tag',
    compatibility: '5.0.1.1255',

    findRecord: function(field, value) {
        return this.getStore().findRecord(field, value);
    }
});
/**
 * Supresses JS exception thrown from Ext.form.field.Tag
 * 
 * The setLastFocused method was removed in 5.0.1 but tagfield still makes
 * lots of calls to it. It is safe to replace it with an empty function since
 * it doesn't really need to be called anymore.
 * 
 * Discussion: http://www.sencha.com/forum/showthread.php?290400-tagfield-bind-value
 */
/**
 * @source https://github.com/JarvusInnovations/sencha-hotfixes/blob/ext/5/0/1/1255/overrides/selection/Model/DeprecateSetLastFocused.js
 */
Ext.define('Jarvus.hotfixes.ext.selection.Model.DeprecateSetLastFocused', {
    override: 'Ext.selection.Model',
    compatibility: '5.0.1.1255',
    setLastFocused: Ext.emptyFn
});