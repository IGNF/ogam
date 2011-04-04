// We first extend some base MF classes ...
mapfish.widgets.toolbar.Toolbar.prototype.addMySeparator = function(){
    this.add(new Ext.Toolbar.Spacer());
    this.add(new Ext.Toolbar.Separator());
    this.add(new Ext.Toolbar.Spacer());
};

mapfish.widgets.toolbar.Toolbar.prototype.addControl = function (control, options) {
        
        control.visible = true;
        this.controls.push(control);
        this.map.addControl(control);
        var button = new Ext.Toolbar.Button(options);
        if (!button.tooltip) {
            button.tooltip = control.title;
        }
        
        button.enableToggle = (control.type == OpenLayers.Control.TYPE_TOGGLE);
        if (control.isDefault) {
            button.pressed = true;
            this.defaultControl = control;
        }
                
        button.scope = this;
        button.handler = function() { 
            this.activateControl(control); 
        };
        
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            button.setDisabled(!control.active);
            // listen to activate/deactivate controls on underlying controls to activate/deactivate buttons :
            control.events.register(
                "activate", 
                button,
                function() { 
                    this.setDisabled(false); 
                }
            );
            
            control.events.register(
                "deactivate", 
                button,
                function() { 
                    this.setDisabled(true); 
                }
            );
        }
        
        if ((control.type == OpenLayers.Control.TYPE_TOGGLE) || (control.type == OpenLayers.Control.TYPE_TOOL)) {
            // listen to enable/disable events on controls to activate/deactivate buttons :
            control.events.register(
                "enable", 
                button,
                function() { 
                    this.setDisabled(false); 
                }
            );
            
            control.events.register(
                "disable", 
                button,
                function() { 
                    this.setDisabled(true); 
                }
            );
        }
        
        this.add(button);
        this._buttons.push(button);
        
        return button;
};

mapfish.widgets.toolbar.Toolbar.prototype.activateControl = function (control) {
    var button = this.getButtonForControl(control);
    
    if (!button) {
        //OpenLayers.Console.warn("Toolbar.activateControl : button was not found");
        return;
    }
    if (control.type == OpenLayers.Control.TYPE_BUTTON) {
        control.trigger();
        return;
    }
    if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
        if (control.active) {
            control.deactivate();
            button.toggle(false); 
        } else {
            control.activate();
            button.toggle(true); 
        }
        return;
    }
    for (var i = 0; i < this.controls.length; i++) {
        if (this.controls[i] == control && control.visible) {
            control.activate();
            button.toggle(true); 
        } else {
            if ((this.controls[i].type != OpenLayers.Control.TYPE_TOGGLE) && (this.controls[i].type != OpenLayers.Control.TYPE_BUTTON)) {
                this.controls[i].deactivate();
                this._buttons[i].toggle(false); 
            }
        }
    }
};



