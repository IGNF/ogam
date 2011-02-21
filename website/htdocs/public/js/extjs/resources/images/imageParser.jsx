// written for Adobe Photoshop CS3 Extended 10.0 - may not work with your version
// ExtJs Theme Modifier

#target photoshop
app.bringToFront(); // bring top
$.localize = true; // Enable ZString localization

//
// Change the hue/saturation/light values
//
// These values are easily determined by opening a file in photoshop
// altering the h/s/l and recording the values.
// -- colorize was turned on for me
//
// h = 0, s = 25, l = 0 is a nice bronzish color
// h = 113, s = 38, l = -1 is a greenish color
//

var process = [];

process.push({ //first turn to copy all
		includeFiles:false,
		files:{
			form:{
				'date-trigger.gif':true, //open date-trigger.psd and apply on the background h75s43l-13 and on the icons h99s25l0
				'search-trigger.gif':true, //open search-trigger.psd and apply on the background h75s43l-13 and on the icons h99s25l0
				'trigger.gif':true, //open trigger.psd and apply on the background h75s43l-13 and on the icons h99s25l0
				'clear-trigger.gif':true //open clear-trigger.psd and apply on the background h75s43l-13 and on the icons h99s25l0
			}
		}
	},{
		h:75, // hue
		s:43, // saturation
		l:-13, // light
		includeFiles:true,
		files:{
			form:{
				'checkbox.gif':true,
				'radio.gif':true,
				'trigger-tpl.gif':true
			}
		}
	},{
		h:75, // hue
		s:62, // saturation
		l:-46, // light
		includeFiles:true,
		files:{
			box:{
				'tb-blue.gif':true
			},
			toolbar:{
				'bg.gif':true
			},
			tabs:{
				'tab-strip-bg.gif':true,
				'tabs-sprite-lighter.gif':true // copy of tabs-sprite.gif
			},
			grid:{
				'grid3-hrow.gif':true
			},
			menu:{
				'item-over.gif':true
			},
			shared:{
				'glass-bg.gif':true
			}
		}
	},{
		h:100, // hue
		s:38, // saturation
		l:-42, // light
		includeFiles:true,
		files:{
			panel:{
				'top-bottom.gif':true,
				'top-bottom-collapsed.gif':true, // copy of top-bottom.gif
				'corners-sprite.gif':true,
				'left-right.gif':true
			},
			tabs:{
				'tabs-sprite.gif':true,
				'scroll-left.gif':true,
				'scroll-right.gif':true
			},
			button:{
				'btn.gif':true,
                's-arrow.gif':true,
                's-arrow-b.gif':true,
                's-arrow-bo.gif':true,
                's-arrow-o.gif':true
			},
			grid:{
				'grid-blue-split.gif':true,
				'grid3-hrow-over.gif':true,
				'grid3-hd-btn.gif':true
			},
			window:{
				'left-corners.png':true,
				'right-corners.png':true,
				'top-bottom.png':true,
				'left-right.png':true
			}
		}
	},{
		h:100, // hue
		s:40, // saturation
		l:15, // light
		includeFiles:true,
		files:{
			shared:{
				'hd-sprite.gif':true,
				'left-btn.gif':true,
				'right-btn.gif':true
			}
		}
	},{
		h:73,// hue
		s:60,// saturation
		l:-11,// light
		includeFiles:true,
		files:{
			panel:{
				'top-bottom-bwrap.gif':true, // copy of top-bottom.gif
				'corners-sprite-bwrap.gif':true, // copy of corners-sprite.gif
				'left-right-bwrap.gif':true // copy of left-right.gif
			},
			qtip:{
				'tip-sprite.gif':true
			},
			menu:{
				'menu.gif':true
			},
			form:{
				'error-tip-corners.gif':true
			}
		}
	},{
		h:73,// hue
		s:60,// saturation
		l:0,// light
		includeFiles:true,
		files:{
			form:{
				'text-bg.gif':true
			}
		}
	},{
		h:74, // hue
		s:49, // saturation
		l:-15, // light
		includeFiles:true,
		files:{
			panel:{
				'tool-sprites.gif':true,
				'tool-sprite-tpl.gif':true,
				'tools-sprites-trans.gif':true
			},
			tabs:{
				'tab-close.gif':true
			}
		}
	}
);

// debug settings
var debug = true;
var debugFile = '~/Bureau/image-parser.log';
var debugFh, linefeed; // don't modify these. debug file handle and linefeed char

// modify nothing beneath this line
var imageParser = {
	// hue/saturation/light function gotten off of the internets
	hueSaturationLight : function(hue, saturation, light){
		imageParser.log('hue : '+hue+', saturation : '+saturation+', light : '+light);
		var aDesc = new ActionDescriptor();
		var userInput = new ActionDescriptor();
		var aList = new ActionList();

		with(userInput){
			putInteger(charIDToTypeID("H   "), hue);
			putInteger(charIDToTypeID("Strt"), saturation);
			putInteger(charIDToTypeID("Lght"), light);
		}

		aDesc.putBoolean(charIDToTypeID("Clrz"), true);
		aList.putObject(charIDToTypeID("Hst2"), userInput);
		aDesc.putList(charIDToTypeID("Adjs"), aList);
		executeAction(charIDToTypeID("HStr"), aDesc, DialogModes.NO);
	},

	log : function(string){
		if (!debug)return;
		if (!debugFile)return;
		if (!linefeed){
			if ($.os.search(/windows/i) != -1){
				linefeed = "windows";
			} else {
				linefeed = "macintosh";
			}
		}
		if (!debugFh) {
			// create a reference to the logfile
			debugFh = new File(debugFile);
			debugFh.lineFeed = linefeed;
			debugFh.open('w', "TEXT", "????");
			debugFh.write('Debug Report for imageParser.jsx: '+ new Date() + '\n');
		}

		if (debugFh){
			// write the string to the file
			var string = string || '';
			debugFh.write(string+'\n');
		}
	},

	processFiles : function(args){
		var folder = args.folder;
		var f = folder.getFiles();
		if (f && f.length > 0){
			for (var i = 0; i < f.length; i++){
				if (f[i] instanceof Folder) {
					// traverse into this folder
					imageParser.log(f[i].name+' is a Folder.. traverse');
					if ( -1 != f[i].fsName.indexOf('.svn'))continue;
					imageParser.processFiles({folder:f[i], process:args.process});
				} else {
					imageParser.log(f[i]+' ... checking');

					// exclude index files
					if ( -1 != f[i].fsName.indexOf('.svn'))continue;
					if ( -1 != f[i].fsName.indexOf('Thumbs.db'))continue;
					if ( -1 != f[i].fsName.indexOf('.DS_Store'))continue;
					if ( -1 != f[i].fsName.indexOf('.psd'))continue;
					if ( -1 != f[i].fsName.indexOf('.pspimage'))continue;

					// only process files that contain a .gif, .png, or .jpg
					if ( ! (f[i].fsName.indexOf('.gif') > -1 ||
						f[i].fsName.indexOf('.png') > -1 ||
						f[i].fsName.indexOf('jpg') > -1 ) ) {
						imageParser.log(' ... not a gif, png, or jpg');
						continue
					}

					// check to see if the current folder is the top-level one
					var pName = (f[i].parent.name == inputFolder.name) ? '' : f[i].parent.name;

					if(args.process.includeFiles){
						// don't process this file if it isn't in our 'include' list
						if (!(args.process.files[pName] && args.process.files[pName][f[i].name])){
							imageParser.log(' ... is not in the include list');
							continue;
						}
					}else{
						// don't process this file if it is in our 'exclude' list
						if (args.process.files[pName] && args.process.files[pName][f[i].name]){
							imageParser.log(' ... is in the exclude list');
							continue;
						}
					}

					var doc = app.open(File(f[i]));
					if (doc){
						if(args.process.h || args.process.s || args.process.l){
							imageParser.log(' ... performing hue/sat/light');
							imageParser.hueSaturationLight(args.process.h,args.process.s,args.process.l); // vars set at teh top of the file
						}

						// Determine which file save settings to use.
						// I couldn't find an image filetype parameter so i'm parsing the filename
						// This of course, is easily broken by funky filenames

						var saveOptions;
						if (f[i].fsName.indexOf('.gif') > -1){
							saveOptions = new GIFSaveOptions();
							saveOptions.transparency = true;
						} else if (f[i].fsName.indexOf('.png') > -1){
							saveOptions = new PNGSaveOptions();
						} else if (f[i].fsName.indexOf('.jpg') > -1){
							saveOptions = new JPEGSaveOptions();
						} else {
							// not one of the three types
						}
						imageParser.log(' ... setting save options');

						if (saveOptions){
							// save the file to the folder/subfolder requested by the user
							var sFile = outputFolder+'/';
							if (pName) {
								sFile += pName +'/';
							}
							sFile += f[i].name;

							if (pName){ // if not the top-level folder
								var tFolder = new Folder(outputFolder+'/'+pName);
								if (!tFolder.exists){
									tFolder.create();
								}
							}
							doc.saveAs(new File(sFile), saveOptions);
							imageParser.log(' ... saved: '+sFile);
						}

						// close orig file. do not save changes
						doc.close(SaveOptions.DONOTSAVECHANGES);
					}
				}
			}
		}
		imageParser.log(); // blank line for readability
	},

	cleanup : function(){
		// nullify var and close file handles
		if (debugFh){
			debugFh.close();
			alert('Log file saved to: '+debugFile);
		}

		// restore settings
		if (startDisplayDialogs){
			app.displayDialogs = startDisplayDialogs;
		}
	}
}

// save the current preferences
var startDisplayDialogs = app.displayDialogs;

// set no dialogs
app.displayDialogs = DialogModes.NO;

// ask the user for the input folder
//var inputFolder = Folder.selectDialog("Select a folder for the input files. Example: extjs/resources/images/default");
var inputFolder = new Folder('C:/SERVERS/ms4w/apps/RTM/website/htdocs/public/js/extjs/resources/images/default');
// ask the user for the output folder
//var outputFolder = Folder.selectDialog("Select a folder for the output files. Example: extjs/resources/images/bronze");
var outputFolder = new Folder('C:/SERVERS/ms4w/apps/RTM/website/htdocs/public/js/extjs/resources/images/green-ifn');

// work with the folders selected by the user
if (inputFolder != null && outputFolder != null){
    imageParser.log(); // blank line for readability
    imageParser.log('Input Folder: '+inputFolder);
    imageParser.log('Output Folder: '+outputFolder);
    imageParser.log(); // blank line for readability

    // if the input folder isn't the output folder
    // try to play nicely.. not overwrite the source file
    if (inputFolder != outputFolder){
        for(var i=0;i<process.length;i++){
			imageParser.log('\n\nStart of the process '+i+'\n');
			imageParser.processFiles({folder:inputFolder, process:process[i]});
			imageParser.log(); // blank line for readability
			imageParser.log('\nEnd of the process '+i+'\n\n');
		}
    } else {
        imageParser.log('Input and Output folders are the same');
        alert('Sorry. Input and output folders can not be the same folder.');
    }
}

imageParser.cleanup();