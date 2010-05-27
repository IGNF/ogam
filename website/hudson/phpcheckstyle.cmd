echo "PHP Checkstyle script"
php -c C:\ms4w\Apache\cgi-bin\php.ini %1 --src ./htdocs/application --outdir ./hudson/checkstyle_result --config ifn.cfg.xml --exclude library --linecount
