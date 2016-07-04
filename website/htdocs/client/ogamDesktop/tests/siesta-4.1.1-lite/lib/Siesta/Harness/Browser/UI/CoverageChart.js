/*

Siesta 4.1.1
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.CoverageChart', {
    extend : 'Ext.chart.Chart',
    alias  : 'widget.coveragechart',
    
    requires : [
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Bar',
        // weirdly this class contains important override for "allowSchedule" method 
        // is not required by any class 
        'Ext.chart.overrides.AbstractChart'
    ],
    border   : false,
    margin   : '35% 35%',
    animate  : {
        easing   : 'bounceOut',
        duration : 600
    },

    store : {
        fields : ['name', 'value']
    },

    axes : [
        {
            type     : 'numeric',
            position : 'left',
            fields   : ['value'],
            minimum  : 0,
            maximum  : 100,
            label    : {
                renderer : Ext.util.Format.numberRenderer('0'),
                fill     : '#555'
            },
            grid     : {
                odd  : {
                    stroke : '#efefef'
                },
                even : {
                    stroke : '#efefef'
                }
            }
        },
        {
            type     : 'category',
            position : 'bottom',
            fields   : ['name'],
            label    : {
                fill : '#555'
            }
        }
    ],

    series : [{
        type     : 'bar',
        axis     : 'left',
        xField   : 'name',
        yField   : 'value',

        label    : {
            display       : 'outside',
            'text-anchor' : 'middle',
            field         : 'value',
            orientation   : 'horizontal',
            fill          : '#aaa',
            renderer      : function (value, label, storeItem, item, i, display, animate, index) {
                return value + '%';
            }
        },

        renderer : function (sprite, storeItem, barAttr, i, store) {
            barAttr.fill = 'rgb(89, 205, 82)';
            return barAttr;
        }
    }]
});