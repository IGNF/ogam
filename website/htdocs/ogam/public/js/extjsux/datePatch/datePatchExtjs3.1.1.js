//************************************************************************************
// Date class
//************************************************************************************
(function() {

 // create private copy of Ext's String.format() method
 // - to remove unnecessary dependency
 // - to resolve namespace conflict with M$-Ajax's implementation
 function xf(format) {
     var args = Array.prototype.slice.call(arguments, 1);
     return format.replace(/\{(\d+)\}/g, function(m, i) {
         return args[i];
     });
 }

var $f = Date.formatCodeToRegex;

// private
Date.createParser = function() {
    var code = [
        "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
            "def = Date.defaults,",
            "results = String(input).match(Date.parseRegexes[{0}]);", // either null, or an array of matched strings

        "if(results){",
            "{1}",

            "if(u != null){", // i.e. unix time is defined
                "v = new Date(u * 1000);", // give top priority to UNIX time
            "}else{",
                // create Date object representing midnight of the current day;
                // this will provide us with our date defaults
                // (note: clearTime() handles Daylight Saving Time automatically)
                "dt = (new Date()).clearTime();",

                // date calculations (note: these calculations create a dependency on Ext.num())
                "y = y >= 0? y : Ext.num(def.y, dt.getFullYear());",
                "m = m >= 0? m : Ext.num(def.m - 1, dt.getMonth());",
                "d = d || Ext.num(def.d, dt.getDate());",

                // time calculations (note: these calculations create a dependency on Ext.num())
                "h  = h || Ext.num(def.h, dt.getHours());",
                "i  = i || Ext.num(def.i, dt.getMinutes());",
                "s  = s || Ext.num(def.s, dt.getSeconds());",
                "ms = ms || Ext.num(def.ms, dt.getMilliseconds());",

                "if(z >= 0 && y >= 0){",
                    // both the year and zero-based day of year are defined and >= 0.
                    // these 2 values alone provide sufficient info to create a full date object

                    // create Date object representing January 1st for the given year
                    "v = new Date(y, 0, 1, h, i, s, ms);",
                    

                    // then add day of year, checking for Date "rollover" if necessary
                    "v = !strict? v : (strict === true && (z <= 364 || (v.isLeapYear() && z <= 365))? v.add(Date.DAY, z) : null);",
                "}else if(strict === true && !Date.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                    "v = null;", // invalid date, so return null
                "}else{",
                    // plain old Date object
                    "v = new Date(y, m, d, h, i, s, ms);",
                "}",
            "}",
        "}",
        
        "if(v){",
        //**************************************************
        //The only one line added to have the possibility to set the year under 100.
            "v.setFullYear(y);",
        //**************************************************
        // favour UTC offset over GMT offset
            "if(zz != null){",
                // reset to UTC, then add offset
                "v = v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
                // reset to GMT, then add offset
                "v = v.add(Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
        "}",

        "return v;"
    ].join('\n');

    return function(format) {
        var regexNum = Date.parseRegexes.length,
            currentGroup = 1,
            calc = [],
            regex = [],
            special = false,
            ch = "",
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch === "\\") {
                special = true;
            } else if (special) {
                special = false;
                regex.push(String.escape(ch));
            } else {
                var obj = $f(ch, currentGroup);
                currentGroup += obj.g;
                regex.push(obj.s);
                if (obj.g && obj.c) {
                    calc.push(obj.c);
                }
            }
        }

        Date.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", "i");
        Date.parseFunctions[format] = new Function("input", "strict", xf(code, regexNum, calc.join('')));
    };
}();
//**************************************************
//Format for example the year 2 to 0002
Date.formatCodes['f'] = "String.leftPad(this.getFullYear(), 4, '0')";
Date.parseCodes['f'] = Date.parseCodes['Y'];
//**************************************************
}());

//************************************************************************************
// DatePicker class
//************************************************************************************
//private
Ext.DatePicker.prototype.onMonthClick = function(e, t){
    e.stopEvent();
    var el = new Ext.Element(t), pn;
    if(el.is('button.x-date-mp-cancel')){
        this.hideMonthPicker();
    }
    else if(el.is('button.x-date-mp-ok')){
        var d = new Date(this.mpSelYear, this.mpSelMonth, (this.activeDate || this.value).getDate());
        if(d.getMonth() !== this.mpSelMonth){
            // "fix" the JS rolling date conversion if needed
            d = new Date(this.mpSelYear, this.mpSelMonth, 1).getLastDateOfMonth();
        }
        //*****************************************************
        d.setFullYear(this.mpSelYear);
        //*****************************************************
        this.update(d);
        this.hideMonthPicker();
    }
    else if(pn = el.up('td.x-date-mp-month', 2)){
        this.mpMonths.removeClass('x-date-mp-sel');
        pn.addClass('x-date-mp-sel');
        this.mpSelMonth = pn.dom.xmonth;
    }
    else if(pn = el.up('td.x-date-mp-year', 2)){
        this.mpYears.removeClass('x-date-mp-sel');
        pn.addClass('x-date-mp-sel');
        this.mpSelYear = pn.dom.xyear;
    }
    else if(el.is('a.x-date-mp-prev')){
        this.updateMPYear(this.mpyear-10);
    }
    else if(el.is('a.x-date-mp-next')){
        this.updateMPYear(this.mpyear+10);
    }
};

// private
Ext.DatePicker.prototype.onMonthDblClick = function(e, t){
    e.stopEvent();
    var el = new Ext.Element(t), pn;
    //*****************************************************
    var date = null;
    //*****************************************************
    if(pn = el.up('td.x-date-mp-month', 2)){
        //*****************************************************
        date = new Date(this.mpSelYear, pn.dom.xmonth, (this.activeDate || this.value).getDate());
        date.setFullYear(this.mpSelYear);
        this.update(date);
        //*****************************************************
        this.hideMonthPicker();
    }
    else if(pn = el.up('td.x-date-mp-year', 2)){
        //*****************************************************
        date = new Date(pn.dom.xyear, this.mpSelMonth, (this.activeDate || this.value).getDate());
        date.setFullYear(pn.dom.xyear);
        this.update(date);
        //*****************************************************
        this.hideMonthPicker();
    }
};
// private
Ext.DatePicker.prototype.update = function(date, forceRefresh){
    if(this.rendered){
        var vd = this.activeDate, vis = this.isVisible();
        this.activeDate = date;
        if(!forceRefresh && vd && this.el){
            var t = date.getTime();
            if(vd.getMonth() === date.getMonth() && vd.getFullYear() === date.getFullYear()){
                this.cells.removeClass('x-date-selected');
                this.cells.each(function(c){
                   if(c.dom.firstChild.dateValue === t){
                       c.addClass('x-date-selected');
                       if(vis && !this.cancelFocus){
                           Ext.fly(c.dom.firstChild).focus(50);
                       }
                       return false;
                   }
                }, this);
                return;
            }
        }
        var days = date.getDaysInMonth(),
            firstOfMonth = date.getFirstDateOfMonth(),
            startingPos = firstOfMonth.getDay()-this.startDay;

        if(startingPos < 0){
            startingPos += 7;
        }
        days += startingPos;

        var pm = date.add('mo', -1),
            prevStart = pm.getDaysInMonth()-startingPos,
            cells = this.cells.elements,
            textEls = this.textNodes,
            // convert everything to numbers so it's fast
            day = 86400000,
            d = (new Date(pm.getFullYear(), pm.getMonth(), prevStart)).clearTime(),
            today = new Date().clearTime().getTime(),
            sel = date.clearTime(true).getTime(),
            min = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
            max = this.maxDate ? this.maxDate.clearTime(true) : Number.POSITIVE_INFINITY,
            ddMatch = this.disabledDatesRE,
            ddText = this.disabledDatesText,
            ddays = this.disabledDays ? this.disabledDays.join('') : false,
            ddaysText = this.disabledDaysText,
            format = this.format;

            //*****************************************************
            d.setFullYear(pm.getFullYear());
            //*****************************************************

        if(this.showToday){
            var td = new Date().clearTime(),
                disable = (td < min || td > max ||
                (ddMatch && format && ddMatch.test(td.dateFormat(format))) ||
                (ddays && ddays.indexOf(td.getDay()) !== -1));

            if(!this.disabled){
                this.todayBtn.setDisabled(disable);
                this.todayKeyListener[disable ? 'disable' : 'enable']();
            }
        }

        var setCellClass = function(cal, cell){
            cell.title = '';
            var t = d.getTime();
            cell.firstChild.dateValue = t;
            if(t === today){
                cell.className += ' x-date-today';
                cell.title = cal.todayText;
            }
            if(t === sel){
                cell.className += ' x-date-selected';
                if(vis){
                    Ext.fly(cell.firstChild).focus(50);
                }
            }
            // disabling
            if(t < min) {
                cell.className = ' x-date-disabled';
                cell.title = cal.minText;
                return;
            }
            if(t > max) {
                cell.className = ' x-date-disabled';
                cell.title = cal.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(d.getDay()) !== -1){
                    cell.title = ddaysText;
                    cell.className = ' x-date-disabled';
                }
            }
            if(ddMatch && format){
                var fvalue = d.dateFormat(format);
                if(ddMatch.test(fvalue)){
                    cell.title = ddText.replace('%0', fvalue);
                    cell.className = ' x-date-disabled';
                }
            }
        };

        var i = 0;
        for(; i < startingPos; i++) {
            textEls[i].innerHTML = (++prevStart);
            d.setDate(d.getDate()+1);
            cells[i].className = 'x-date-prevday';
            setCellClass(this, cells[i]);
        }
        for(; i < days; i++){
            var intDay = i - startingPos + 1;
            textEls[i].innerHTML = (intDay);
            d.setDate(d.getDate()+1);
            cells[i].className = 'x-date-active';
            setCellClass(this, cells[i]);
        }
        var extraDays = 0;
        for(; i < 42; i++) {
             textEls[i].innerHTML = (++extraDays);
             d.setDate(d.getDate()+1);
             cells[i].className = 'x-date-nextday';
             setCellClass(this, cells[i]);
        }

        this.mbtn.setText(this.monthNames[date.getMonth()] + ' ' + date.getFullYear());

        if(!this.internalRender){
            var main = this.el.dom.firstChild,
                w = main.offsetWidth;
            this.el.setWidth(w + this.el.getBorderWidth('lr'));
            Ext.fly(main).setWidth(w);
            this.internalRender = true;
            // opera does not respect the auto grow header center column
            // then, after it gets a width opera refuses to recalculate
            // without a second pass
            if(Ext.isOpera && !this.secondPass){
                main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + 'px';
                this.secondPass = true;
                this.update.defer(10, this, [date]);
            }
        }
    }
};