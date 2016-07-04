StartTest(function (t) {
    
    t.it('Interacting with the checkbox', function (t) {
        var cmp = Ext.create('Ext.field.Checkbox', {
            width       : 100,
            checked     : false,
            renderTo    : document.body
        });
    
        // https://app.assembla.com/spaces/bryntum/tickets/2821-sencha-modern-checkbox/details#
        t.chain(
            { click : cmp },
            function (next) {
                t.is(cmp.getChecked(), true, 'Checkbox should be checked after click');
                next()
            },
            { click : cmp },
            function (next) {
                t.is(cmp.getChecked(), false, 'Checkbox should be unchecked after 2nd click');
                next()
            }
        );
    })
    
    t.it('Form submit', function (t) {
        var form = Ext.create('Ext.form.Panel', {
            renderTo   : document.body,
            items      : [
                {
                    xtype : 'searchfield',
                    name  : 'name',
                    label : 'Name'
                },
                {
                    xtype : 'emailfield',
                    name  : 'email',
                    label : 'Email'
                },
                {
                    xtype : 'passwordfield',
                    name  : 'password',
                    label : 'Password'
                }
            ]
        });
    
        var form = t.$('form')[0];
    
        form.submit = function() { };
    
        t.isntCalled("submit", form, 'Expect a form NOT to be posted on ENTER press if event is prevented');
    
        t.chain(
            {
                type    : '[ENTER]',
                target  : '>>searchfield'
            }
        );        
    })
    
    t.it('Text field', function (t) {
        var text = Ext.create('Ext.field.Text', {
            renderTo : document.body
        });
    
        // https://www.assembla.com/spaces/bryntum/tickets/2491-typing-into-textfield-in-ie11+-doesn--39-t-set-value-properly/details#
        t.chain(
            { type : 'f', target : text },
            function () {
                t.is(text.getValue(), 'f');
            }
        );        
    })
})