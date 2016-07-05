describe('ogam field RadioButton Test', function(t){
	
	var group;

    function makeGroup(items, cfg) {
        group = new OgamDesktop.ux.form.field.RadioButton(Ext.apply({
            renderTo: Ext.getBody(),
            items: items
        }, cfg));
    }

    t.afterEach(function() {
        Ext.destroy(group);
        group = null;
    });
    t.describe("contructor", function(t){
    	t.it("should make group with item name", function(t) {
            makeGroup([{
                name: 'foo',
                inputValue: 'a'
            }, {
                name: 'foo',
                inputValue: 'b'
            }, {
                name: 'foo',
                inputValue: 'c'
            }]);
            t.expect(group.items.length).toBe(3);
            t.expect(group.query('[name=foo]').length).toBe(3);
    	});
		t.it("should make group with name build items with same name)", function(t) {
            makeGroup([{
                inputValue: 'a'
            }, {
                inputValue: 'b'
            }, {
                inputValue: 'c'
            }],
            {name:'foo'}
            );
            t.expect(group.items.length).toBe(3);
            t.expect(group.query('[name=foo]').length).toBe(3);
		});

    });
    

    t.describe("setValue", function(t) {
        t.it("should check the matching item (herited RadioGroupo style)", function(t) {
            makeGroup([{
                name: 'foo',
                inputValue: 'a'
            }, {
                name: 'foo',
                inputValue: 'b'
            }, {
                name: 'foo',
                inputValue: 'c'
            }]);

            group.setValue({
                foo: 'b'
            });

            t.expect(group.getValue()).toEqual({
                foo: 'b'
            });
        });
        t.it("should check the matching item (simple value)", function(t) {
        	makeGroup([{

                inputValue: 'a'
            }, {
                inputValue: 'b'
            }, {
                inputValue: 'c'
            }],
            {name:'foo'}
        	);

            group.setValue('b');

            t.expect(group.getValue()).toEqual({
                foo: 'b'
            });
        });
    });
});
