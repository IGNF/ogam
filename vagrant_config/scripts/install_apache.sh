#!/usr/bin/env bash

website_dir='/vagrant/ogam/website/htdocs'

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

chown -R www-data  $website_dir && chgrp -R www-data $website_dir && chmod g+s $website_dir
chown www-data $website_dir && chgrp www-data $website_dir
chmod -R 0777 $website_dir/logs $website_dir/sessions $website_dir/upload $website_dir/tmp
#uploadDir Populate_website
mkdir $website_dir/upload/images 
chmod 0777 $website_dir/upload/images
chown www-data $website_dir/upload/images && chgrp www-data $website_dir/upload/images #image_upload_dir file:Populate_website

#----------------------------------------------------------------

ln -fs /vagrant/ogam/vagrant_config/conf/apache/httpd_ogam.conf /etc/apache2/sites-available/httpd_ogam.conf

/usr/sbin/a2ensite httpd_ogam.conf
/usr/sbin/a2dissite 000-default

#----------------------------------------------------------------

service apache2 restart

#----------------------------------------------------------------
