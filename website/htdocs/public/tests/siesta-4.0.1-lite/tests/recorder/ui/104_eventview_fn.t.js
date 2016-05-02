describe('Testing the function editor in the recorder UI', function (t) {
    t.expectGlobals('a', 'b', 'c')

    t.it('Function editor should not validate bad code', function (t) {
        var ed = new Siesta.Recorder.Editor.Code({
            renderTo : document.body,
            width    : 100
        });

        ed.setValue('var a = 1;');
        t.ok(ed.isValid())
        t.hasNotCls(ed.el, 'siesta-invalid-syntax')

        ed.setValue('var 1,;');

        t.notOk(ed.isValid())

        t.hasCls(ed.el, 'siesta-invalid-syntax')
    });

    t.it('Executing Function step should work', function (t) {

        var recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
            id       : 'rec1',
            width    : 600,
            renderTo : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            },

            root : {
                children : [
                    { action    : 'fn', value : "window.a = 1;\nb = true;\nwindow.c = 'bar';\nt.is(1,1);" },
                    { action    : 'fn', value : "Ext.emptyFn();\nif (false) {\n    Ext.emptyFn();\n}" },
                    { action    : 'waitForFn', value : "return true;" },
                    { action    : 'waitForSelector', value : 'body' }
                ]
            }
        });

        recorderPanel.setTest(t);

        var steps = recorderPanel.generateSteps();

        t.is(steps.length, 4);

        t.ok(steps[ 2 ].waitFor.toString().match('return true;'));

        t.isDeeply(steps[3], { waitForSelector : 'body' });

        t.chain(
            steps,

            function () {
                t.is(a, 1);
                t.is(b, true);
                t.is(c, 'bar');

                recorderPanel.destroy()
            }
        );
    });

    t.it('Editing Function step should work', function (t) {

        var recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
            id       : 'rec2',
            width    : 600,
            height   : 300,
            renderTo : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            }
        });

        recorderPanel.setTest(t);

        recorderPanel.store.getRootNode().appendChild(
            [
                { action    : 'fn', value : "foo=1;" },
            ]
        );
        var rec = recorderPanel.store.first();

        t.chain(
            { click : '.x-grid-cell:contains(foo=1)'},

            { waitForSelector : '#rec2 .CodeMirror-focused:contains(foo=1;)' },

            function(next) {
                var editor = recorderPanel.editing.getActiveEditor();

                t.is(editor.getValue(), 'foo=1;', 'Editor has correct value');

                next();
            },

            { type : ';' },
            { click : '#rec2 .cheatsheet' }, // Stops the editing

            function(next) {

                t.is(rec.get('value'), ';foo=1;', 'Editor has updated value');

                next();
            }
        );
    })
})