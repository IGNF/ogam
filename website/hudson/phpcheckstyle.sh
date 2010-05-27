#!/bin/sh
echo "PHP CheckStyle script"
php $1 --src ./htdocs/application --outdir ./hudson/checkstyle_result --config ifn.cfg.xml --exclude library --linecount
