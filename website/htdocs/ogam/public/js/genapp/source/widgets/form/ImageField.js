Ext.namespace('Genapp.form');
Ext.namespace('Ext.ux.form');

/**
 * Provides a image upload field
 * 
 * @class Genapp.form.ImageField
 * @extends Ext.ux.form.FileUploadField
 * @constructor Create a new ImageField
 * @param {Object}
 *            config
 * @xtype imagefield
 */

Genapp.form.ImageField = Ext.extend(Ext.ux.form.FileUploadField, {

	/**
	 * Internationalization.
	 */
	emptyImageUploadFieldTest : 'Select an image',

	/**
	 * A hidden form used to submit the file
	 */
	imageForm : null,

	/**
	 * Window used to displaythe uplad form
	 */
	uploadWindow : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Default configuration
		var config = {
			emptyText : this.emptyImageUploadFieldTest,
			buttonText : '',
			buttonCfg : {
				iconCls : 'upload-icon'
			}
		}

		// apply config
		Ext.apply(this, Ext.apply(this.initialConfig, config));

		// call parent init component
		Genapp.form.ImageField.superclass.initComponent.apply(this, arguments);

		// Upload the file as soon as it is selected
		this.on('fileselected', this.selectFile, this);

	},

	/**
	 * Select the file
	 */
	selectFile : function() {

		// Lazy initialisation of a form used to submit the image
		if (this.imageForm == null) {

			// Create a hidden form for the image field
			this.imageForm = new Ext.FormPanel({
				method : 'POST',
				fileUpload : true,
				frame : true,
				encoding : 'multipart/data',
				layout : 'fit',
				defaults : {
					anchor : '95%',
					allowBlank : false,
					msgTarget : 'side'
				},
				items : [ {
					xtype : 'hidden',
					name : 'type',
					value : 'image'
				}, {
					xtype : 'hidden',
					name : 'id',
					value : this.id
				}, this // ugly but works OK
				// {
				// xtype : 'fileuploadfield',
				// name : 'file',
				// value : this.value
				// }
				]
			});

			// Automatically launch the upload after render
			this.imageForm.on('afterrender', this.uploadFile, this);

			// Display the form in a window
			this.uploadWindow = new Ext.Window({
				closeAction : 'hide',
				title : 'Upload',
				items : [ this.imageForm ]
			});
		}

		this.uploadWindow.show();

	},

	/**
	 * Upload the file
	 */
	uploadFile : function() {
		// Submit the image
		if (this.imageForm.getForm().isValid()) {
			this.imageForm.getForm().submit({
				url : Genapp.base_url + 'dataedition/ajaximageupload',
				method : 'POST',
				enctype : 'multipart/form-data',
				waitTitle : 'Connexion au serveur ...',
				waitMsg : 'Upload en cours ...',
				success : this.onUploadSuccess,
				failure : this.onUploadFailure,
				scope : this
			});
		}

		// Set the value as a hidden field ???
		// alert("value : " + this.value);

	},

	/**
	 * Upload success
	 */
	onUploadSuccess : function() {
		// this.uploadWindow.close();
		console.log('success');
	},

	/**
	 * Upload failure
	 */
	onUploadFailure : function() {
		// this.uploadWindow.close();
		console.log('failure');
	},

	/**
	 * Destroy the component
	 */
	onDestroy : function() {
		console.log('destroy');
		Ext.destroy(this.imageForm);
		Genapp.form.ImageField.superclass.onDestroy.call(this);
	}

});
Ext.reg('imagefield', Genapp.form.ImageField);