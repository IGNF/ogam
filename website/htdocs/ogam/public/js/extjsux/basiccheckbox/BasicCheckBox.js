Ext.namespace('Ext.ux.form');

Ext.ux.form.BasicCheckbox = Ext.extend(Ext.form.Field, {
	/**
	 * @cfg {String} focusClass The CSS class to use when the checkbox receives
	 * focus (defaults to undefined).
	 */
	focusClass : undefined,
	/**
	 * @cfg {String} fieldClass The default CSS class for the checkbox (defaults
	 * to "x-form-field").
	 */
	fieldClass: "x-form-field",
	/**
	 * @cfg {Boolean} checked True if the the checkbox should render already
	 * checked (defaults to false). When checked is false, first value will
	 * associated to {@link #inputValue} in all {@link #mode}.
	 */
	checked: false,
	/**
	 * @cfg {String} mode Determinates that how the checkbox will be work. You
	 * can choose from three working mode:
	 * <ul>
	 * <li><b>compat</b>: This is how the normal checkbox works - ONLY if checked,
	 * {@link #inputValue} being send to the remote server.</li>
	 * <li><b>switch</b>: In this mode a checkbox must be have a value based on
	 * its state checked/unchecked.</li>
	 * <li><b>cycled</b>: This mode evolves <i>switch</i>-mode, values and looks
	 * cycled on evry clicks, a value must have.</li>
	 * Default is: compat
	 */
	mode: 'compat',
	/**
	 * @cfg {Boolean} themedCompat True if use themes in compat mode (defaults
	 * to false).
	 */
	themedCompat: false,
	/**
	 * @cfg {String/Object} autoCreate A DomHelper element spec, or true for a
	 * default element spec (defaults to {tag: "input", type: "checkbox",
	 * autocomplete: "off"})
	 */
	defaultAutoCreate : { tag: "input", type: 'checkbox', autocomplete: "off"},
	/**
	 * @cfg {String} boxLabel The text that appears beside the checkbox.
	 */
	boxLabel: undefined,
	/**
	 * @cfg {String} inputValue The value that should go into the generated
	 * input element's value attribute.
	 */
	inputValue: undefined,
	/**
	 * @cfg {String} markEl Defines that what element used to marking invalid.
	 */
	markEl: 'wrap',
	/**
	 * @cfg {Boolean} mustCheck True if want to mark as invalid if checkbox
	 * unchecked (defaults to false). Only works in <i>compat</i>-{@link #mode}.
	 */
	mustCheck: false,
	/**
	 * @cfg {String} mustCheckText Specifies what message will be appear if
	 * checkbox marked as invalid.
	 */
	mustCheckText: 'This field is required',
	/**
	 * @cfg {Object} compatConfig This is a mode config describes what class
	 * to be use if <i>compat</i> checkbox enabled/disabled and checked/unchecked.
	 * <pre><code>compatConfig: {
	enabled: {
		'no': 'checkbox_off',
		'on': 'checkbox_on'
	},
	disabled: {
		'no': 'checkbox_off_dled',
		'on': 'checkbox_on_dled'
	},
	width: 23,
	height: 23
	}</code></pre>
	 * The keys <i>on</i> and <i>no</i> are fixed and must not changed - their
	 * value pairs are changeable and must be valid CSS class names with a
	 * visible background image.
	 * <p><b>Important:</b> If you want to redefine a setting, you MUST redefine
	 * all settings in this section!</p>
	 * <p><b>DO NOT USE boolean true/false for keys or values!</b></p>
	 */
	compatConfig: {
		enabled: {
			'no': 'checkbox_off',
			'on': 'checkbox_on'
		},
		disabled: {
			'no': 'checkbox_off_dled',
			'on': 'checkbox_on_dled'
		},
		width: 14,
		height: 16
	},
	/**
	 * @cfg {Object} switchConfig This is a mode config describes what class
	 * to be use if <i>switch</i> checkbox enabled/disabled and checked/unchecked.
	 * <pre><code>switchConfig: {
	enabled: {
		'0': 'checkbox_off',
		'1': 'checkbox_on'
	},
	disabled: {
		'0': 'checkbox_off_dled',
		'1': 'checkbox_on_dled'
	},
	width: 23,
	height: 23
	}</code></pre>
	 * The keys - defaults to <i>0</i> and <i>1</i> - and their value pairs are
	 * changeable. Keys used to set checkbox value when checkbox checked/unchecked,
	 * values are valid CSS class names with a visible background image.
	 * <p><b>Important:</b> If you want to redefine a setting, you MUST redefine
	 * all settings in this section!</p>
	 * <p><b>DO NOT USE boolean true/false for keys or values!</b></p>
	 */
	switchConfig: {
		enabled: {
			'0': 'checkbox_off',
			'1': 'checkbox_on'
		},
		disabled: {
			'0': 'checkbox_off_dled',
			'1': 'checkbox_on_dled'
		},
		width: 14,
		height: 16
	},
	/**
	 * @cfg {Object} cycledConfig This is a mode config describes what class
	 * to be use if <i>cycled</i> checkbox enabled/disabled in any state.
	 * <pre><code>cycledConfig: {
	enabled: {
		'0': 'flag_blue',
		'1': 'flag_green',
		'2': 'flag_orange',
		'3': 'flag_pink',
		'4': 'flag_purple',
		'5': 'flag_red',
		'6': 'flag_yellow'
	},
	disabled: {
		'0': 'flag_grey',
		'1': 'flag_grey',
		'2': 'flag_grey',
		'3': 'flag_grey',
		'4': 'flag_grey',
		'5': 'flag_grey',
		'6': 'flag_grey'
	},
	width: 23,
	height: 16
	}</code></pre>
	 * The keys - defaults to <i>0</i> ... <i>6</i> - and their value pairs are
	 * changeable. Keys used to set checkbox value when checkbox is in a specific
	 * state of its cycle, values are valid CSS class names with a visible
	 * background image.
	 * <p><b>Important:</b> If you want to redefine a setting, you MUST redefine
	 * all settings in this section!</p>
	 * <p><b>DO NOT USE boolean true/false for keys or values!</b></p>
	 */
	cycledConfig: {
		enabled: {
			'0': 'flag_blue',
			'1': 'flag_green',
			'2': 'flag_orange',
			'3': 'flag_pink',
			'4': 'flag_purple',
			'5': 'flag_red',
			'6': 'flag_yellow'
		},
		disabled: {
			'0': 'flag_grey',
			'1': 'flag_grey',
			'2': 'flag_grey',
			'3': 'flag_grey',
			'4': 'flag_grey',
			'5': 'flag_grey',
			'6': 'flag_grey'
		},
		width: 16,
		height: 16
	},
	// private - stores the first value of this checkbox
	originalValue: undefined,
	// private - stores active value all the time
	protectedValue: undefined,

	// private
	initComponent : function(){
		Ext.ux.form.BasicCheckbox.superclass.initComponent.call(this);
		this.addEvents(
			/**
			 * @event check
			 * Fires when the checkbox is checked or unchecked.
			 * @param {Ext.form.Checkbox} this This checkbox
			 * @param {Boolean} checked The new checked value
			 * @param {Mixed} value The new {@link #inputValue} value
			 */
			'check',
			/**
			 * @event click
			 * Fires when clicking on the checkbox.
			 * @param {Ext.form.Checkbox} this This checkbox
			 * @param {Boolean} checked The new checked value
			 * @param {Mixed} value The new {@link #inputValue} value
			 */
			'click'
		);
	},

	// private
	onResize : function()
	{
		Ext.ux.form.BasicCheckbox.superclass.onResize.apply(this, arguments);
		if (!this.boxLabel)
		{
			this.el.alignTo(this.wrap, 'c-c');
		}
	},

	// private
	initEvents : function()
	{
		Ext.ux.form.BasicCheckbox.superclass.initEvents.call(this);
		if (this.mode !== 'compat' || this.themedCompat)
		{
			this.mon(this.el, {
				click: this.onClick,
				change: this.onChange,
				mouseenter: this.onMouseEnter,
				mouseleave: this.onMouseLeave,
				mousedown: this.onMouseDown,
				mouseup: this.onMouseUp,
				scope: this
			});
		}
		else
		{
			this.mon(this.el, {
				click: this.onClick,
				change: this.onChange,
				scope: this
			});
		}
	},

	// private
	getResizeEl : function()
	{
		return this.wrap;
	},

	// private
	getPositionEl: function()
	{
		return this.wrap;
	},

	// private
	alignErrorIcon: function()
	{
		this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
	},

	/**
	 * Mark this field as invalid, using {@link #msgTarget} to determine how to
	 * display the error and applying {@link #invalidClass} to the field's
	 * element.
	 * @param {String} msg (optional) The validation message (defaults to
	 * {@link #invalidText})
	 */
	markInvalid: function(msg)
	{
		Ext.ux.form.BasicCheckbox.superclass.markInvalid.call(this, msg);
	},

	/**
	 * Clear any invalid styles/messages for this field.
	 */
	clearInvalid: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.clearInvalid.call(this);
	},

	// private
	validateValue: function(value)
	{
		var v = (this.rendered? this.el.dom.value : this.inputValue);
		var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
		if (this.mode === 'compat' && this.mustCheck && !value)
		{
			this.markInvalid(this.mustCheckText);
			return false;
		}
		if (this.mode !== 'compat')
		{
			if (v !== undefined && v !== null && this[this.mode+'Config'][d][v] === undefined)
			{
				this.markInvalid();
				return false;
			}
		}
		if (this.vtype)
		{
			var vt = Ext.form.VTypes;
			if (!vt[this.vtype](value, this))
			{
				this.markInvalid(this.vtypeText || vt[this.vtype +'Text']);
				return false;
			}
		}
		if (typeof this.validator === "function")
		{
			var msg = this.validator(value);
			if (msg !== true)
			{
				this.markInvalid(msg);
				return false;
			}
		}
		if (this.regex && !this.regex.test(value))
		{
			this.markInvalid(this.regexText);
			return false;
		}
		return true;
	},

	// private
	onRender : function(ct, position)
	{
		Ext.ux.form.BasicCheckbox.superclass.onRender.call(this, ct, position);
		var vw = this[this.mode+'Config'].width;
		var vh = this[this.mode+'Config'].height;

		this.protectedValue = this.inputValue;
		if (this.protectedValue !== undefined)
		{
			this.el.dom.value = this.protectedValue;
		}
		else
		{
			this.setNextValue(); // initialize first value set
		}

		if (this.mode !== 'compat' || this.themedCompat) {this.el.setOpacity(0);}
		this.innerWrap = this.el.wrap({cls: "x-sm-form-check-innerwrap"});
		this.innerWrap.setStyle({
			'position': 'relative',
			'display': 'inline'
		});
		this.wrap = this.innerWrap.wrap({cls: "x-form-check-wrap"});
		this.vel = this.innerWrap.createChild({tag: 'div', cls: 'x-sm-form-check'}, this.el.dom);
		if (this.mode !== 'compat' || this.themedCompat)
		{
			this.vel.setSize(vw, vh);
			this.el.setStyle({
				'position': 'absolute'
			});
			this.el.setTop(Math.round((vh-16)/2));
			this.el.setLeft(Math.round((vw-14)/2));
		}

		if (this.boxLabel)
		{
			this.wrap.createChild({tag: 'label', htmlFor: this.el.id, cls: 'x-form-cb-label', html: this.boxLabel});
		}

		if (this.mode === 'compat')
		{
			this.checked = (this.checked? true : (this.el.dom.checked? true : false));
			this.setValue(this.checked);
		}
		else
		{
			this.el.dom.checked = true;
			this.el.dom.defaultChecked = true;
			this.setValue(this.protectedValue);
		}
	},

	// private
	manageActiveClass: function()
	{
		if (this.rendered && (this.mode !== 'compat' || this.themedCompat))
		{
			var v = (this.mode === 'compat'? this.protectedValue : (this.rendered? this.el.dom.value : this.protectedValue));
			var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
			var c = this[this.mode+'Config'][d][v];
			var fval;
			var i;

			for (i in this[this.mode+'Config'][d])
			{
				fval = i;
				break;
			}

			if (c === undefined)
			{
				c = this[this.mode+'Config'][d][fval];
			}

			if (this.previousClass !== undefined)
			{
				this.vel.removeClass(this.previousClass);
			}
			this.previousClass = c; // store previously set classname.
			this.vel.addClass(c);
		}
	},

	// private
	setNextValue: function()
	{
		var v = (this.mode === 'compat'? this.protectedValue : (this.rendered? this.el.dom.value : this.protectedValue));
		var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
		var setNewValue = false;
		var fval = null;
		var i;

		this.protectedValue = null;
		for (i in this[this.mode+'Config'][d])
		{
			if (fval === null)  {fval = i;}
			if (v === undefined) {break;} // undefined sets first value
			if (setNewValue && this.protectedValue === null)
			{
				this.protectedValue = i;
			}
			if (i === v)
			{
				setNewValue = true;
			}
		}
		if (this.protectedValue === null) {this.protectedValue = fval;}

		if (this.mode !== 'compat')
		{
			this.inputValue = this.protectedValue;
		}
		if (this.rendered && this.inputValue !== undefined)
		{
			this.el.dom.value = this.inputValue;
		}
	},

	// private
	onDestroy : function(){
		if (this.wrap) {this.wrap.remove();}
		Ext.ux.form.BasicCheckbox.superclass.onDestroy.call(this);
	},

	// private
	initValue : function()
	{
		// reference to original value for reset
		this.originalValue = this.inputValue;
		if (this.mode === 'compat')
		{
			this.originalValue = this.checked;
		}
	},

	/**
	 * Returns the raw data value which may or may not be a valid, defined
	 * value. To return a normalized value see {@link #getValue}.
	 * @return {Mixed} value The field value
	 */
	getRawValue : function()
	{
		if (this.mode === 'compat')
		{
			if (this.rendered) {return this.el.dom.checked;}
			else {return this.checked;}
		}
		var v = this.rendered ? this.el.getValue() : Ext.value(this.value, '');
		return v;
	},

	/**
	 * In <i>compat</i>-{@link #mode} returns the checked state of the checkbox.
	 * In other modes returns the state`s value.
	 * @return {Boolean/Mixed} True if checked, else false, Mixed on non-compat
	 * modes.
	 */
	getValue : function()
	{
		var result = false;

		if (this.mode === 'compat') {if (this.rendered) {result = this.el.dom.checked;}}
		else {result = this.protectedValue;}

		return result;
	},

	// private
	onClick : function()
	{
		if (this.mode === 'compat')
		{
			if (this.el.dom.checked !== this.checked)
			{
				this.setNextValue();
				this.checked = this.el.dom.checked;
			}
		}
		else
		{
			this.setNextValue();
			this.el.dom.checked = true;
			this.el.dom.defaultChecked = true;
		}
		this.manageActiveClass();
		this.validate();
		this.fireEvent('check', this, this.checked, this.inputValue);
		this.fireEvent('click', this, this.checked, this.inputValue);
	},

	// private
	onChange : function()
	{
		if (this.mode === 'compat')
		{
			if (this.el.dom.checked !== this.checked)
			{
				this.setNextValue();
				this.checked = this.el.dom.checked;
			}
		}
		else
		{
			this.inputValue = this.el.dom.value;
			this.protectedValue = this.inputValue;
			this.el.dom.checked = true;
			this.el.dom.defaultChecked = true;
		}
		this.manageActiveClass();
		this.validate();
		this.fireEvent('check', this, this.checked, this.inputValue);
		this.fireEvent('change', this, this.checked, this.inputValue);
	},

	/**
	 * Sets the checked state of the checkbox.
	 * @param {Boolean/Mixed} value In <i>compat</i>-{@link #mode}, boolean
	 * true, 'true', '1', or 'on' to check the checkbox, any other value will
	 * uncheck it. In other modes, boolean values ignored, valid modevalues
	 * sets checkbox input value and changing state, invalid values sets to
	 * first valid value.
	 * @return {Ext.form.Field} this
	 */
	setValue : function(value)
	{
		var i;
		if (this.mode === 'compat')
		{
			this.checked = (value === true || value === 'true' || value === '1' || String(value).toLowerCase() === 'on');
			if (this.rendered)
			{
				this.el.dom.checked = this.checked;
				this.el.dom.defaultChecked = this.checked;
			}
			this.protectedValue = (this.checked? 'on' : 'no');
		}
		else
		{
			var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
			this.checked = true;
			if (this[this.mode+'Config'][d][value] !== undefined)
			{
				this.protectedValue = value;
			}
			else
			{
				for (i in this[this.mode+'Config'][d])
				{
					this.protectedValue = i;
					break;
				}
			}
			this.inputValue = this.protectedValue;
			if (this.rendered && this.inputValue !== undefined)
			{
				this.el.dom.value = this.inputValue;
			}
		}
		this.manageActiveClass();
		this.validate();
		this.fireEvent("check", this, this.checked);
		return this;
	},

	disable: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.disable.call(this);
		this.manageActiveClass();
	},

	enable: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.enable.call(this);
		this.manageActiveClass();
	},

	onMouseEnter: function()
	{
		this.wrap.addClass('x-sm-form-check-over');
	},

	onMouseLeave: function()
	{
		this.wrap.removeClass('x-sm-form-check-over');
	},

	onMouseDown: function()
	{
		this.wrap.addClass('x-sm-form-check-down');
	},

	onMouseUp: function()
	{
		this.wrap.removeClass('x-sm-form-check-down');
	},

	onFocus: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.onFocus.call(this);
		this.wrap.addClass('x-sm-form-check-focus');
	},

	onBlur: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.onBlur.call(this);
		this.wrap.removeClass('x-sm-form-check-focus');
	}
});

/**
 * 
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Ext.ux.form.BasicCheckbox
 * @extends Ext.form.Field
 * @constructor Create a new BasicCheckbox
 * @param {Object} config The config object
 * @xtype checkbox
 */
Ext.form.Checkbox = Ext.ux.form.BasicCheckbox;
Ext.reg('checkbox', Ext.form.Checkbox);

/**
 * 
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Ext.ux.form.Checkbox
 * @extends Ext.ux.form.BasicCheckbox
 * @constructor Create a new Checkbox
 * @param {Object} config The config object
 * @xtype switch_checkbox
 */
Ext.ux.form.Checkbox = Ext.extend(Ext.ux.form.BasicCheckbox, {
	mode: 'switch'
});
Ext.reg('switch_checkbox', Ext.ux.form.Checkbox);

/**
 * 
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Ext.ux.form.CycleCheckbox
 * @extends Ext.ux.form.BasicCheckbox
 * @constructor Create a new CycleCheckbox
 * @param {Object} config The config object
 * @xtype cycle_checkbox
 */
Ext.ux.form.CycleCheckbox = Ext.extend(Ext.ux.form.BasicCheckbox, {
	mode: 'cycled'
});
Ext.reg('cycle_checkbox', Ext.ux.form.CycleCheckbox);

// This is where I say, credit to Condor for implement his replacement!

Ext.override(Ext.form.Field, {
	markEl: 'el',
	markInvalid: function(msg){
		if(!this.rendered || this.preventMark){
			return;
		}
		msg = msg || this.invalidText;
		var mt = this.getMessageHandler();
		if(mt){
			mt.mark(this, msg);
		}else if(this.msgTarget){
			this[this.markEl].addClass(this.invalidClass);
			var t = Ext.getDom(this.msgTarget);
			if(t){
				t.innerHTML = msg;
				t.style.display = this.msgDisplay;
			}
		}
		this.fireEvent('invalid', this, msg);
	},
	clearInvalid : function(){
		if(!this.rendered || this.preventMark){
			return;
		}
		var mt = this.getMessageHandler();
		if(mt){
			mt.clear(this);
		}else if(this.msgTarget){
			this[this.markEl].removeClass(this.invalidClass);
			var t = Ext.getDom(this.msgTarget);
			if(t){
				t.innerHTML = '';
				t.style.display = 'none';
			}
		}
		this.fireEvent('valid', this);
	}
});
Ext.apply(Ext.form.MessageTargets, {
	'qtip': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')];
			markEl.addClass(field.invalidClass);
			markEl.dom.qtip = msg;
			markEl.dom.qclass = 'x-form-invalid-tip';
			if(Ext.QuickTips){
				Ext.QuickTips.enable();
			}
		},
		clear: function(field){
			var markEl = field[(field.markEl? field.markEl : 'el')];
			markEl.removeClass(field.invalidClass);
			markEl.dom.qtip = '';
		}
	},
	'title': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')];
			markEl.addClass(field.invalidClass);
			markEl.dom.title = msg;
		},
		clear: function(field){
			field[field.markEl].dom.title = '';
		}
	},
	'under': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorEl = field.errorEl;
			markEl.addClass(field.invalidClass);
			if(!errorEl){
				var elp = field.getErrorCt();
				if(!elp){
					markEl.dom.title = msg;
					return;
				}
				errorEl = field.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
				errorEl.setWidth(elp.getWidth(true) - 20);
			}
			errorEl.update(msg);
			Ext.form.Field.msgFx[field.msgFx].show(errorEl, field);
		},
		clear: function(field){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorEl = field.errorEl;
			markEl.removeClass(field.invalidClass);
			if(errorEl){
				Ext.form.Field.msgFx[field.msgFx].hide(errorEl, field);
			}else{
				markEl.dom.title = '';
			}
		}
	},
	'side': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorIcon = field.errorIcon;
			markEl.addClass(field.invalidClass);
			if(!errorIcon){
				var elp = field.getErrorCt();
				if(!elp){
					markEl.dom.title = msg;
					return;
				}
				errorIcon = field.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
			}
			field.alignErrorIcon();
			errorIcon.dom.qtip = msg;
			errorIcon.dom.qclass = 'x-form-invalid-tip';
			errorIcon.show();
			field.on('resize', field.alignErrorIcon, field);
		},
		clear: function(field){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorIcon = field.errorIcon;
			markEl.removeClass(field.invalidClass);
			if(errorIcon){
				errorIcon.dom.qtip = '';
				errorIcon.hide();
				field.un('resize', field.alignErrorIcon, field);
			}else{
				markEl.dom.title = '';
			}
		}
	}
});