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


/**
 * Ext.form.field.ComboBox crashes unexpectedly when more than one combo with paging presented on the
 * same physical page in the browser:
 * Ext.ComponentManager.register(): Registering duplicate component id "undefined-paging-toolbar"
 *
 * Solution: just comment nonexistent pickerId when component boundlist creates. Since this pickerId is
 * nowhere used this should be okay and Ext.Component will make sure about unique identifier by itself.
 *
 * Discussion: https://www.sencha.com/forum/showthread.php?303101
 */
Ext.define('Jarvus.hotfixes.form.field.ComboBoxPickerId', {
    override: 'Ext.form.field.ComboBox',
    compatibility: ['6.0.0.640', '6.0.1.250'],
    createPicker: function() {
        var me = this,
            picker,
            pickerCfg = Ext.apply({
                xtype: 'boundlist',
                pickerField: me,
                selectionModel: me.pickerSelectionModel,
                floating: true,
                hidden: true,
                store: me.getPickerStore(),
                displayField: me.displayField,
                preserveScrollOnRefresh: true,
                pageSize: me.pageSize,
                tpl: me.tpl
            }, me.listConfig, me.defaultListConfig);

        picker = me.picker = Ext.widget(pickerCfg);
        if (me.pageSize) {
            picker.pagingToolbar.on('beforechange', me.onPageChange, me);
        }

        // We limit the height of the picker to fit in the space above
        // or below this field unless the picker has its own ideas about that.
        if (!picker.initialConfig.maxHeight) {
            picker.on({
                beforeshow: me.onBeforePickerShow,
                scope: me
            });
        }
        picker.getSelectionModel().on({
            beforeselect: me.onBeforeSelect,
            beforedeselect: me.onBeforeDeselect,
            focuschange: me.onFocusChange,
            scope: me
        });

        picker.getNavigationModel().navigateOnSpace = false;

        return picker;
    }
});