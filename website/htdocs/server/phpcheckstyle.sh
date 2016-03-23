#!/bin/sh
echo "PHP CheckStyle script"
php $1 --src ./htdocs/ogam/application --outdir ./hudson/checkstyle_result/ --config ifn.cfg.xml --format xml,html --linecount
