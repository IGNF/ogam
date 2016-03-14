/*

Siesta 4.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Util.Role.CanParseOs', {
    
    methods : { 
        
        parseOS : function (platform) {
            if (/Win/.test(platform)) return "Windows"
            
            if (/Mac/.test(platform)) return "MacOS"
            
            if (/Linux/.test(platform)) return "Linux"
            
            return "unknown"
        }
    }
});
