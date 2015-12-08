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

#gradle
service tomcat7 stop
cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM'
service tomcat7 start

#ant
#~ 
#~ sed -i.bak 's|deploy.dir = .*|deploy.dir = /var/lib/tomcat7/webapps/|g' /vagrant/ogam/services_configs/service_integration/build.ppts
#~ sed -i.bak 's|deploy.dir = .*|deploy.dir = /var/lib/tomcat7/webapps/|g' /vagrant/ogam/services_configs/service_harmonization/build.ppts

#~ #general build lib jar needed
#~ ant -f ${services_dir}../libs_java/build.xml
#~ #common lib dependent
#~ ant -f ${services_dir}service_common/build.xml

#~ service tomcat7 stop
#~ #ant -f ${services_dir}build.xml deployAllServices
#~ # must be like these
#~ ant -f ${services_dir}build.xml deployServiceIntegration
#~ #ant -f ${services_dir}build.xml deployReportGenerationService # require ServiceGenerationRapport
#~ #ant -f ${services_dir}build.xml deployServiceInterpolation
#~ ant -f ${services_dir}build.xml deployServiceHarmonization
#~ #ant -f ${services_dir}build.xml deployServiceCalculation # not in this ogam source ????

service tomcat7 start