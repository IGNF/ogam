/**
 * A PDFComponent is a tag object of type 'application/pdf'
 * 
 * @class Genapp.PDFComponent
 * @extends Ext.BoxComponent
 * @constructor Create a new PDF component
 * @param {Object} config The config object
 * @xtype pdf
 */
Genapp.PDFComponent = Ext.extend(Ext.BoxComponent, {

    /**
     * @cfg {String} mimeType
     * The mimeType of the object. Defaults to 'application/pdf'.
     * @hide
     */
    mimeType: 'application/pdf',
    /**
     * @cfg {String} url
     * The pdf url. Defaults to null.
     */
    url: null,

    // This two methods don't work on IE (the object tag can't be move?)
    /*onRender : function(ct, position){
        this.autoEl = {
            tag:'object',
            data:this.url,
            type:this.mimeType,
            width:'100%',
            height:'100%',
            html:'alt : <a href="'+this.url+'">'+this.url+'</a>'
        }
        Ext.ux.PDFComponent.superclass.onRender.call(this, ct, position);
    }
    onRender : function(ct, position){
        var obj = document.createElement("object");
        obj.setAttribute("data", this.url);
        obj.setAttribute("type", this.mimeType);
        obj.setAttribute("width", '100%');
        obj.setAttribute("height", '100%');
        obj.appendChild(document.createTextNode('alt : <a href="'+this.url+'">'+this.url+'</a>'));
        this.el = Ext.get(obj);
    }*/

    //private
    initComponent : function(){
        Ext.Panel.superclass.initComponent.call(this);

        this.on('render',function(cmp){
            if(Ext.isEmpty(this.url)){
                this.updateElement();
            } else{
                this.el = Ext.get(Ext.DomHelper.overwrite(this.ownerCt.body.dom, {
                    tag:'span',
                    html:'Veuillez selectionner un document...'
                }));
            }
        },this);
    },
    
    /**
     * Update the pdf url.
     * @param {String} url The pdf url
     */
    updateUrl : function(url){
        this.url = url;
        this.updateElement();
    },

    /**
     * Update the component element
     * 
     * @hide
     * @private
     */
    updateElement : function(){
        // This methods does't work on IE (the object can't be updated?)
        //this.el.set({"data": url}); 
        this.el = Ext.get(Ext.DomHelper.overwrite(this.ownerCt.body.dom, {
            tag:'object',
            data:this.url,
            type:this.mimeType,
            width:'100%',
            height:'100%',
            html:'<h4>Content on this page requires Adobe Acrobat Reader.</h4> \
                <p>You must have the free Adobe Reader program installed on your computer \
                to view the documents marked &quot;(PDF).&quot; \
                <p>Download the <a href="http://www.adobe.com/products/acrobat/readstep2.html"> \
                free Adobe Reader program</a>.</p> \
                <p><a href="http://www.adobe.com/products/acrobat/readstep2.html">\
                <img src="http://www.adobe.com/images/shared/download_buttons/get_adobe_reader.gif" \
                width="88" height="31" border="0" alt="Get Adobe Reader." />\
                </a></p></p>Direct link to the document: <a href="'+this.url+'">'+this.url+'</a>'
        }));
    },

    /**
     * Reset the component body
     */
    reset : function(){
        if(this.url !== null){
            this.el = Ext.get(Ext.DomHelper.overwrite(this.ownerCt.body.dom, {
                tag:'span',
                html:'Veuillez selectionner un document...'
            }));
            this.url = null;
        }
    }
});
Ext.reg('pdf', Genapp.PDFComponent);