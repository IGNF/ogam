OpenLayers.Handler.FeatureInfo = OpenLayers.Class.create();
OpenLayers.Handler.FeatureInfo.prototype = 
  OpenLayers.Class.inherit( OpenLayers.Handler, {
    
      /**
       * @cfg {String} alertErrorTitle
       * The alert Error Title (defaults to <tt>'Error :'</tt>)
       */
      alertErrorTitle:'Error :',
      /**
       * @cfg {String} alertRequestFailedMsg
       * The alert Request Failed Msg (defaults to <tt>'Sorry, the request failed...'</tt>)
       */
      alertRequestFailedMsg:'Sorry, the feature info request failed...',

      click: function(evt) {
        // Calcul de la coordonnée correspondant au point cliqué par l'utilisateur
        var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
        var ll = this.map.getLonLatFromPixel(px);
        
        // Construction d'une URL pour faire une requête WFS sur le point
        var url = Genapp.base_url+"proxy/getInfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=result_locations&MAXFEATURES=1&BBOX="+(ll.lon-Genapp.map.featureinfo_margin)+","+(ll.lat+Genapp.map.featureinfo_margin)+","+(ll.lon+Genapp.map.featureinfo_margin)+","+(ll.lat-Genapp.map.featureinfo_margin);

        OpenLayers.loadURL(
            url,
            '',
            this,
            function(response) {
                try {
                    var result = Ext.decode(response.responseText);
                    Genapp.cardPanel.consultationPage.openDetails(result.id, 'getdetails');
                } catch (e) {
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
                }
            },
            function(response){
                Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
            }
        );

        Event.stop(evt);
    }
  }
);


OpenLayers.Control.FeatureInfoControl = OpenLayers.Class.create();
OpenLayers.Control.FeatureInfoControl.prototype = 
  OpenLayers.Class.inherit( OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_TOOL,
    
    /**
     * Constructor: OpenLayers.Control.FeatureInfoControl
     * 
     * Parameters:
     * options - {Object} 
     */
    initialize: function(map, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },
    
    draw: function() {
        this.handler = new OpenLayers.Handler.FeatureInfo( this, {'click':this.click});   
        this.activate();
    },
     
     /** @final @type String */
    CLASS_NAME: "OpenLayers.Control.FeatureInfoControl"
        
  }
);
