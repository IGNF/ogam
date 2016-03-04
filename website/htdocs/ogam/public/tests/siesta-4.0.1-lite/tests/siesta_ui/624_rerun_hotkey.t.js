StartTest(function (t) {
    t.getHarness(
        {
            viewDOM : false,
        },
        [
            'testfiles/601_siesta_ui_passing.t.js'
        ]
    );

    var vp          = Siesta.Harness.Browser.UI.Viewport.prototype;
    var rerunHotKey = Harness.rerunHotKey;

    t.it('Should rerun test on special hotkey', function (t) {
        var spy = t.spyOn(vp, 'rerunTest');

        t.chain(
            { waitForCQ : 'viewport' },

            { type : rerunHotKey, target : 'body', options : { ctrlKey : true } },

            function (next) {
                t.expect(vp.rerunTest).toHaveBeenCalled(1);
                next()
            },

            { type : rerunHotKey, target : 'body', options : { ctrlKey : true } },

            function (next) {
                t.expect(vp.rerunTest).toHaveBeenCalled(2);
            }
        );
    });

    t.it('Should not rerun test without CTRL', function (t) {
        var spy = t.spyOn(vp, 'rerunTest');

        t.chain(
            { waitForCQ : 'viewport' },

            { type : rerunHotKey, target : 'body'},

            function (next) {
                t.expect(vp.rerunTest).not.toHaveBeenCalled();
            }
        );
    });
})
