Class('CustomRecorder', {

    isa     : Siesta.Recorder.ExtJS,

    has     : {
    },


    methods: {
        getPossibleTargets : function(event) {
            var domNode = event.target;

            var targets = this.SUPERARG(arguments);

            if (domNode.getAttribute('someAttr')) {
                targets.unshift({
                    // "xy", "css", "cq" or "csq"
                    type   : "css",

                    target : '[someAttr="' + domNode.getAttribute('someAttr') + '"]'
                })
            }
            
            return targets;
        }
    }
});