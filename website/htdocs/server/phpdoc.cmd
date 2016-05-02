echo "PHP Documentor script"
php -C -q -d output_buffering=1 %1  -c hudson/phpdoc.ini