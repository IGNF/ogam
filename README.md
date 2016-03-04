# OGAM

OGAM is a generic system based on metadata allowing to build a web site to collect data, display them on a map, request the data, ... 
 
OGAM is under GPL license.


# Documentation

The documentation, installation and configuration procedures, etc is in the "documentation" folder.

# Git

Git is used to get the project from [Gitlab](http://gitlab.dockerforge.ign.fr/ogam/ogam).

To use git :
* install [Git](https://git-scm.com/)
* you need an account on the gitlab website to access the project.
* generate a SSH key to connect with the website : see http://gitlab.dockerforge.ign.fr/help/ssh/ssh.
* launch `git clone ssh://git@gitlab.dockerforge.ign.fr:10022/ogam/ogam.git` in the project root directory to clone it.


# Gradle

Gradle is used to launch the build of the components of the project.

To use gradle :
* install [Gradle](https://gradle.org/)
* launch `gradle tasks`  in the project root directory to get the list of available tasks


# Vagrant

Vagrant is used to instanciate a virtual machine with the project components (Apache, Tomcat, Mapserver, ...).

**To use vagrant :**
* install [VirtualBox](https://www.virtualbox.org/)
* install [Vagrant](https://www.vagrantup.com/)
* launch `vagrant up`  in the project root directory to start the VM

* In case of problem with the "guest additions", launch :
 
>vagrant plugin install vagrant-vbguest

* If have to pass through a proxy :

uncomment followed block in /vagrant_config/Scripts/bootstrap.sh :

>cp /vagrant/ogam/vagrant_config/conf/sources.list /etc/apt/sources.list

>cp /vagrant/ogam/vagrant_config/conf/apt-proxy.conf /etc/apt/apt.conf.d/proxy

>

>echo "

>http_proxy=http://proxy.ign.fr:3128

>https_proxy=http://proxy.ign.fr:3128

>HTTP_PROXY=http://proxy.ign.fr:3128

>HTTPS_PROXY=http://proxy.ign.fr:3128

>no_proxy=localhost,127.0.0.0/8,ogam.fr

>" >> /etc/environment

>source /etc/environment

add proxy options in /vagrant_config/Scripts/install_ogam_services.sh :
 
replace :

>cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM'

with :

>cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew -Dhttps.proxyHost=proxy.ign.fr -Dhttps.proxyPort=3128 && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM' -Dhttps.proxyHost=proxy.ign.fr -Dhttps.proxyPort=3128

**To connect the VM :**
* use VirtualBox interface
* (or) connect with SSH on localhost on port 2222 with the login vagrant/vagrant  
* PostgreSQL is on port 5433, user ogam / ogam
* Web site is on localhost:8000, user admin / admin
