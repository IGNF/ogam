echo "PHP Checkstyle script"
php -c C:\ms4w\Apache\cgi-bin\php.ini %1 --src ./htdocs/application,./htdocs/library/Genapp --outdir ./hudson/checkstyle_result --config ifn.cfg.xml --format html,xml --exclude library --linecount
