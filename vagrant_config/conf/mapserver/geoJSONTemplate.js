// mapserver template
{
  "type": "FeatureCollection",
  "crs": { 
	"type": "name", 
	"properties": { 
		"name": "urn:ogc:def:crs:EPSG::3857" 
	} 
  },
  "features": [
	[resultset layer=nuts_0]
    [feature trimlast=","]
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[shpxy ph="[" pf="]" ps=", " cs=", "  xf=", "  xh="[" yf="]" precision=9 proj=epsg:3857]]
      },
      "properties": {
		"gid": "[gid]",
        "cell_id": "[cell_id]"
      }
    },
    [/feature]
	[/resultset]
  ]
}