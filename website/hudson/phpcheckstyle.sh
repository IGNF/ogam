#!/bin/sh
echo "PHP CheckStyle script"
php $1 --src ./htdocs/ogam/application,./htdocs/ogam/library/Genapp --outdir ./hudson/checkstyle_result --config ifn.cfg.xml --exclude library --format xml,html --linecount
