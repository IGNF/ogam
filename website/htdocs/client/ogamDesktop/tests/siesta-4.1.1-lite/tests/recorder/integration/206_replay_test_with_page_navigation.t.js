describe('Play test that navigates between pages', function (t) {
    t.expectGlobal("0", "1")
    
    t.getHarness([

    ]);

    t.it('Open Siesta recorder pointing to a custom HTML page', function(t) {
        t.chain(
            { click : "button[action=toggle-recorder] => .x-btn-icon-el" },

            function(next) {
                Ext.first('testgrid').setWidth(1);
                next()
            },

            { click : "recorderpanel #pageUrl => .x-form-text" },

            { type : "../html-pages/withlinks1.html[RETURN]" },

            { waitForTarget : 'iframe -> a.linkTo2' }
        )
    });

    t.it('Start recording and click link on the page and on the linked page', function(t) {
        t.global.Siesta.Recorder.Recorder.prototype.ignoreSynthetic = false;

        t.chain(
            { click : ">>recorderpanel button[action=recorder-start]" },

            { click : 'iframe -> a.linkTo2' },
            { click : 'iframe -> a.linkTo1' },

            { click : "#SiestaSelf-resultpanel recorderpanel button[action=recorder-play] => .fa" }
        );
    });

    t.it('Should be able to replay a test navigating between pages', function(t) {
        t.chain(
            { click : ">>recorderpanel button[action=recorder-play]" },

            { waitForEvent : [Harness, 'testsuiteend']},

            function(next) {
                t.ok(t.global.Harness.allPassed(), 'Test should have passed');
                next()
            },

            // Should be back where we started from
            { waitForTarget : 'iframe -> a.linkTo2' }
        );
    });

    t.it('Should add `enablePageRedirect` flag to test options when generating code', function(t) {

        // This is what should be produced
        /**
         describe({
                name : "New recording..."
                enablePageRedirect : true
            }, function(t) {
            });
         */

        t.chain(
            { click : ">>recorderpanel splitbutton[action=recorder-generate-code]" },

            { waitForSelector : ".CodeMirror:contains(enablePageRedirect)" }
        );

    });
})