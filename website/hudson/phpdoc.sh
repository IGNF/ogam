#!/bin/sh
echo "PHP Documentor script"
php -C -d output_buffering=1 "/var/lib/jenkins/workspace/OGAM_Website/libraries/libs_php/PhpDocumentor/phpDocumentor/phpdoc.inc" -c hudson/phpdoc.ini


