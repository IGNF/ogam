#!/usr/bin/env bash

#website_dir='/var/www/ogamextjs5'
website_dir='/vagrant/ogam/website/htdocs'
tmp_dir='/vagrant/ogam'
ogam_path='/vagrant/ogam/'

#----------------------------------------------------------------

apt-get install -y apache2 php5-common libapache2-mod-php5 php5-cli php5-pgsql 

sudo usermod -G www-data -a vagrant

echo " 
ServerName localhost
" >> /etc/apache2/apache2.conf

sudo a2enmod rewrite

sudo a2enmod expires

sudo a2enmod cgi

sudo a2enmod cgid

#/usr/sbin/phpenmod pdo

sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ Europe\/Paris/g' /etc/php5/cli/php.ini
sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ Europe\/Paris/g' /etc/php5/apache2/php.ini
sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ Europe\/Paris/g' /etc/php5/apache2/php.ini

adduser vagrant www-data

#----------------------------------------------------------------

apt-get install -y cgi-mapserver mapserver-bin mapserver-doc php5-mapscript libapache2-mod-fcgid

#----------------------------------------------------------------
sudo a2enmod fcgid
#ant -f ${ogam_path}build.xml deployWebSite

#mv $tmp_dir $website_dir
chown -R www-data  $website_dir && chgrp -R www-data $website_dir && chmod g+s $website_dir
chown www-data $website_dir && chgrp www-data $website_dir
chmod -R 0777 $website_dir/logs $website_dir/server/ogamServer/sessions $website_dir/server/ogamServer/upload $website_dir/server/ogamServer/tmp
#uploadDir Populate_website
mkdir $website_dir/server/ogamServer/upload/images 
chmod 0777 $website_dir/server/ogamServer/upload/images
chown www-data $website_dir/server/ogamServer/upload/images && chgrp www-data $website_dir/server/ogamServer/upload/images #image_upload_dir file:Populate_website

#----------------------------------------------------------------

ln -fs /vagrant/ogam/vagrant_config/conf/apache/httpd_ogam.conf /etc/apache2/sites-available/httpd_ogam.conf

/usr/sbin/a2ensite httpd_ogam.conf
/usr/sbin/a2dissite 000-default

#----------------------------------------------------------------

service apache2 restart

#----------------------------------------------------------------
