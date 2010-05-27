#!/bin/sh
echo "PHP Documentor script"
php -C -d output_buffering=1 "/usr/local/hudson/jobs/libs_php/workspace/PhpDocumentor/phpDocumentor/phpdoc.inc" -c hudson/phpdoc.ini


