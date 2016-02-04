var harness, testClass;
var isNode        = typeof process != 'undefined' && process.pid;

if (isNode) {
    harness         = require('../../siesta-nodejs-all')
    testClass       = require('./lib/YourTestClass')
} else {
    harness         = new Siesta.harness.Browser()
    testClass       = YourTestClass
}
        

harness.configure({
    title       : 'Cross-platform Test Suite',
    
    testClass   : testClass,
    
    preload     : [
        'preload/preload.js'
    ]
})


harness.start(
    '010_sanity.t.js',
    '020_basic.t.js'
)

