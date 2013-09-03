Ext.namespace("Genapp.form.picker");

/** 
 * Surcharge le loader pour customiser l'apparence des nodes.
 * 
 * Inspiré de GeoExt.LayerParamLoader.
 */
Genapp.form.picker.TaxrefNodeLoader = function(config) {
    Ext.apply(this, config);
    this.addEvents(
        "beforeload",
        "load"
    );

    Genapp.form.picker.TaxrefNodeLoader.superclass.constructor.call(this);
};

Ext.extend(Genapp.form.picker.TaxrefNodeLoader, Ext.tree.TreeLoader, {
    
    /** 
     * Surcharge la création d'un Node.
     */
    createNode: function(attr) {
    	
    	 if (this.baseAttrs) {
             Ext.applyIf(attr, this.baseAttrs);
         }
    	 
         if (this.applyLoader !== false && !attr.loader) {
             attr.loader = this;
         }
         
         // Si un UIprovider est spécifié dans le JSON on l'applique
         if (Ext.isString(attr.uiProvider)) {
            attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
         }
         
         if (attr.nodeType) {
        	 // Si le nodeType est présent dans le JSON on l'applique
             return new Ext.tree.TreePanel.nodeTypes[attr.nodeType](attr);
         } else {
        	 
             var node;
             
             if (attr.leaf) {
            	 // Une feuille
            	 attr.iconCls = "x-tree-node-icon-feuille";
            	 node = new Ext.tree.TreeNode(attr);
            	 
            	 if (attr.isReference == '1') {
            		 node.text = "<b>" + node.text +" </b>";
            	 } else {
            		 node.text = "<i>" + node.text +" </i>";
            	 }
            	 
            	 if (attr.vernacularName != null) {
             	 	node.text = node.text + " ("+attr.vernacularName+")";
              	 }
            	 
            	 return node;
             } else {
            	 // Une branche 
            	 attr.iconCls = "x-tree-node-icon-branche";
            	 node = new Ext.tree.AsyncTreeNode(attr);
            	 
            	 if (attr.vernacularName != null) {
            	 	node.text = node.text + " ("+attr.vernacularName+")";
             	 }
            	 
            	 return node;
             }           
            
         }         
                 
    }
});
