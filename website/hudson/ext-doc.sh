#!/bin/sh
echo "Javascript Documentor script"
java -jar $1  -v -p ./hudson/ext-doc.xml -o ./hudson/docs/genapp/jsdoc -t $2/lib/ext-doc/template/ext/template.xml
