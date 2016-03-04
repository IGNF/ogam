/*

Siesta 4.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.ComponentInspector', {
    extend                  : 'Ext.util.Observable',
    
    inspectedComponent      : null,
    inspectedComponentXType : null,
    boxIndicatorEl          : null,
    active                  : false,
    window                  : null,
    
    bufferTime              : 30,

    resolveTarget : function(target) {
        throw 'resolveTarget API method must be provided by owner';
    },

    
    getIndicatorEl : function() {
        return this.boxIndicatorEl;
    },

    
    getExt : function() {
        return this.window.Ext;
    },

    
    start : function (window, containerEl) {
        window = window || this.window;

        if (!window) throw 'Must provide a window context for the inspector';

        this.window     = window;

        var _Ext        = this.getExt();
        var me          = this;
        var wrap        = containerEl || window.document.body;

        me.boxIndicatorEl = me.boxIndicatorEl || Ext.fly(wrap).createChild({
            cls      : 'target-inspector-box',
            children : {
                tag    : 'a',
                cls    : 'target-inspector-label',
                target : '_blank'
            }
        });

        if (_Ext && _Ext.getBody) {
            this.toggleMouseMoveListener(true);

            _Ext.getBody().on('click', this.onInspectionClick, { me : this });
        }

        this.fireEvent('start', this);

        this.active     = true;
    },


    stop : function (suppressEvent) {
        if (!this.active) return;

        this.active = false;

        var _Ext = this.getExt();

        Ext.destroy(this.boxIndicatorEl);
        this.boxIndicatorEl = null;

        if (!suppressEvent) {
            this.fireEvent('stop', this);
        }

        if (_Ext && _Ext.getBody) {
            this.toggleMouseMoveListener(false);
            _Ext.getBody().un('click', this.onInspectionClick, { me : this });
        }

        this.inspectedComponent = this.inspectedComponentXType = null;
    },


    // Listen for mousemove in the frame and any direct iframe children too
    toggleMouseMoveListener : function (enabled) {
        var _Ext    = this.getExt();

        if (!_Ext) return;

        var frames  = _Ext.getBody().select('iframe');
        var fn      = enabled ? 'on' : 'un';

        //                                                  Avoid using "this" directly due to Touch incompatibilities with Ext
        _Ext.getBody()[fn]('mousemove', this.onMouseMove, { me : this }, { buffer : this.bufferTime });

        for (var i = 0; i < frames.getCount(); i++) {
            var innerExt = frames.item(i).dom.contentWindow.Ext;

            //                                                                                     Avoid using "this" directly due to Touch incompatibilities with Ext
            innerExt && innerExt.getBody && innerExt.getBody()[fn]('mousemove', this.onMouseMove, { me : this }, { buffer : this.bufferTime });
        }
    },

    onInspectionClick : function (e, t) {
        if (!this.boxIndicatorEl) return;

        // Avoid using "this" directly due to Touch incompatibilities with Ext
        var me = this.me;

        me.toggleMouseMoveListener(false);

        // If user clicks on a non-component, or clicking outside currently selected component - we abort
        if (!me.inspectedComponent || me.findComponentByTarget(t) !== me.inspectedComponent) {
            me.stop();
        } else {
            me.fireEvent('targetselected', me, me.inspectedComponent, me.inspectedComponentXType);
        }
    },


    onMouseMove : function (e, t) {
        //Have to avoid using "this" directly due to Touch incompatibilities with Ext
        var me = this.me;

        if (!me.boxIndicatorEl) return;
        
        var cmp = me.findComponentByTarget(t);

        if (cmp) {
            if (cmp === me.inspectedComponent) return;

            var xtype = me.resolveComponentXtype(cmp);

            me.inspectedComponent = cmp;
            me.inspectedComponentXType = xtype;

            me.highlightTarget(cmp.el);
            me.updateHighlightContent(cmp, xtype);

            me.fireEvent('targethover', me, me.inspectedComponent, me.inspectedComponentXType);
        }
    },


    resolveComponentXtype : function (cmp) {
        var xtype = (cmp.getXType && cmp.getXType()) || cmp.xtype;

        // If the found component doesn't have an own xtype, look up the superclass chain to find one
        if (!xtype) {
            var cls = cmp;
            for (var i = 0; i < 10 && !xtype; i++) {
                cls = cmp.superclass;
                xtype = cls.xtype;
            }
        }

        return xtype;
    },


    updateHighlightContent : function (cmp, xtype) {
        var html;

        var link = {
            tag  : 'a',
            cls  : 'target-inspector-label',
            href : '#'
        };

        if (typeof cmp === 'string') {
            html = cmp;
        } else if (Ext.ClassManager) {

            // If recorder is visible, let's add some targeting suggestions
            var recorderPanel = Ext.ComponentQuery.query('recorderpanel')[0];
            var targetWindow = cmp.el.dom.ownerDocument.defaultView;
            var pageExtHasCQ = targetWindow && targetWindow.Ext && targetWindow.Ext.ComponentQuery;

            if (recorderPanel && recorderPanel.isVisible()) {
                var cq;

                if (pageExtHasCQ) {
                    cq = recorderPanel.recorder.extractor.findComponentQueryFor(cmp);
                    cq = (cq && cq.query) || xtype;
                }
                html = '>>' + (cq || xtype);
            } else {
                var clsName = this.findExtAncestorClassName(cmp);

                if (clsName) {
                    var docsPath = Siesta.Resource('Siesta.Harness.Browser.UI.DomContainer', 'docsUrlText');
                    var framework;

                    if (Ext.versions.touch) {
                        framework = 'touch';
                    } else {
                        framework = 'extjs';
                    }

                    link.target = '_blank';
                    link.href = Ext.String.format(docsPath, framework, clsName);
                    link.title = Siesta.Resource('Siesta.Harness.Browser.UI.DomContainer', 'viewDocsText') + clsName;
                }

                html = xtype;
            }
        }

        if (html) {
            link.html = html;
            this.boxIndicatorEl.update(Ext.DomHelper.createHtml(link));
        }
    },


    highlightTarget : function (target, content) {
        if (!this.active) {
            this.start();
        }

        var node = this.resolveTarget(target);
        var boxStyle = this.boxIndicatorEl.dom.style;
        var offsets = this.getOffsets(node);

        // Regular getWidth/getHeight doesn't work if another iframe is on the page
        boxStyle.left = (Ext.fly(node).getX() - 1 + offsets[0]) + 'px';
        boxStyle.top = (Ext.fly(node).getY() - 1 + offsets[1]) + 'px';
        boxStyle.width = ((Ext.fly(node).getWidth() || (parseInt(node.style.width.substring(0, node.style.width.length - 2), 10))) + 2) + 'px';
        boxStyle.height = ((Ext.fly(node).getHeight() || (parseInt(node.style.height.substring(0, node.style.height.length - 2), 10))) + 2) + 'px';

        if (content) {
            this.updateHighlightContent(content);
        }
    },


    findComponentByTarget : function (target) {
        var Ext         = this.getExt();
        var testDoc     = this.window.document;

        // Handle potentially having another Ext copy loaded in another frame
        if (target.ownerDocument !== testDoc) {
            var innerFrame  = (target.ownerDocument.parentWindow || target.ownerDocument.defaultView).frameElement;
            Ext             = innerFrame.contentWindow.Ext;
        }

        var cmp
        
        while (!cmp && target && target.nodeName !== 'BODY') {
            cmp             = Ext.getCmp(target.id);
            target          = target.parentNode;
        }

        return cmp;
    },


    getOffsets : function (node) {
        var targetDoc   = this.window.document;
        var offsets     = [ 0, 0 ]

        if (node.ownerDocument !== targetDoc) {
            var innerFrame = (node.ownerDocument.parentWindow || node.ownerDocument.defaultView).frameElement;

            offsets = Ext.fly(innerFrame).getXY();
            offsets[0] -= node.ownerDocument.body.scrollLeft;
            offsets[1] -= node.ownerDocument.body.scrollTop;
        }

        return offsets;
    },


    findExtAncestorClassName : function (cmp) {
        while (cmp) {
            var name = Ext.ClassManager.getName(cmp);

            if (name.match(/^Ext./)) return name;

            cmp = cmp.superclass;
        }

        return '';
    }
});