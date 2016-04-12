For mapserver GEOJSON template see :
http://mapserver.org/fr/mapfile/template.html
http://mapserver.org/fr/output/template_output.html
http://mapserver.org/fr/output/ogr_output.html
http://geojson.org/geojson-spec.html#feature-objects
http://www.gdal.org/drv_geojson.html

To use a metadata parameter of the WEB part :
[web_WFS_SRS]

To use a metadata parameter of the LAYER part :
[all_locations_WFS_TITLE]

To format the geom in WKT : 
"coordinates": "POLYGON([shpxy cs=","  xf=" "])"

To return a formated json when there are no data :
[resultset layer=... nodata="{""type"": ""FeatureCollection"", ""features"": """"}"]

Note :
If you have want to expose an attribute with a name that is equal to a reserved word, you can not use the shorthand [attribute_name], but will have to use construct [item name=attribute_name] instead.