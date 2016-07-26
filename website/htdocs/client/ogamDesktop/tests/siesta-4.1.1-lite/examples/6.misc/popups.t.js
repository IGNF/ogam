StartTest({
    defaultTimeout      : 90000
}, function (t) {
    
    var popup   = window.open("html-page/popup-content.html", '_blank', "left=10,top=10,width=500,height=500")
    
    // in our experience, IE sometimes fails to open a popup. This happens sporadically even if popups are enabled
    // in the browser, need to take into account such possibility, in which we just skip the rest of the test
    if (!popup) return
    
    t.switchTo({ url : /popup/ }, function () {
        
        t.chain(
            { action : 'click', target : '>> [foo] tool[type=close]' },
    
            function() {
                t.notOk(t.global.win.el, 'The dom element of the window is gone');
            }
        );        
    })

});