#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision should be executed as "vagrant"
# ---------------------------------------------------------------

echo "User : $USER"
echo "Path : $PATH"

# ---------------------------------------------------------------
# Create upload directory
# ---------------------------------------------------------------

sudo -n mkdir -p /var/tmp/ogam_upload
sudo -n chmod 774 /var/tmp/ogam_upload
sudo -n chown tomcat7:tomcat7 /var/tmp/ogam_upload


# ---------------------------------------------------------------
# Deploy Java Services via Gradle
# ---------------------------------------------------------------

echo "Deploying all OGAM services"

sudo /etc/init.d/tomcat7 stop

cd /vagrant/ogam/ 
gradle deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM'

sudo /etc/init.d/tomcat7 start
