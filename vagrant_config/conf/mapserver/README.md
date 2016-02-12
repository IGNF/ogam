// For mapserver template
See :
http://mapserver.org/fr/mapfile/template.html
http://geojson.org/geojson-spec.html#feature-objects

To format the geom in WKT : 
"coordinates": "POLYGON([shpxy cs=","  xf=" "])"

Note :
If you have want to expose an attribute with a name that is equal to a reserved word, you can not use the shorthand [attribute_name], but will have to use construct [item name=attribute_name] instead.