#!/usr/bin/env bash

services_dir='/vagrant/ogam/'
services_config_dir='/vagrant/ogam/services_configs'

#mkdir -p ${services_dir}service_common/classes

echo "Deploying all OGAM services"

mkdir /var/lib/tomcat7/staging 
chmod 775 /var/lib/tomcat7/staging/
chown tomcat7:tomcat7 /var/lib/tomcat7/staging/

sudo -n mkdir /var/tmp/ogam_upload
sudo -n chmod 774 /var/tmp/ogam_upload
sudo -n chown tomcat7:tomcat7 /var/tmp/ogam_upload
#UploadDirectory populate_website

sudo -n usermod -G tomcat7 -a vagrant

service tomcat7 stop
cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM'
service tomcat7 start