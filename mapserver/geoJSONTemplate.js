// mapserver template
{
"type": "FeatureCollection",
"crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::3857"}},

"features": [[resultset layer=nuts_0][feature trimlast=","]
{"type": "Feature", "properties": {"gid": "[gid]","cell_id": "[cell_id]"}, "geometry": {"type":"Polygon", "coordinates": [[shpxy ph="[" pf="]" ps=", " cs=", " xf=", " xh="[" yf="]" precision=9 proj=epsg:3857]]}},[/feature][/resultset][resultset layer=all_locations][feature trimlast=","]
{"type": "Feature", "properties": {"oid": "[oid]"}, "geometry": {"type": "Point", "coordinates": [shpxy xf=", " xh="[" yf="]" precision=0 proj=epsg:3857]}},[/feature][/resultset]
  ]
}