# OGAM

OGAM est un système d’information générique permettant de collecter les données
d'inventaires, les valider, les harmoniser puis les diffuser. 
 
OGAM est sous licence GPL.


# Documentation

La documentation notamment pour l'installation et la configuration se trouve 
dans le répertoire documentation


# Git

Git est utilisé pour récupérer le projet qui est hébergé sur [Gitlab](http://gitlab.dockerforge.ign.fr/ogam/ogam).

Pour l'utiliser :
* installer [Git](https://git-scm.com/)
* pour accéder au projet il faut avoir un compte sur le gitlab.
* générer une clé SSH pour pouvoir se connecter au projet : cf http://gitlab.dockerforge.ign.fr/help/ssh/ssh.
* lancer `git clone ssh://git@gitlab.dockerforge.ign.fr:10022/ogam/ogam.git` à la racine du projet pour faire un clone du projet sur son poste

# Vagrant

Vagrant est utilisé pour instancier une machine virtuelle contenant les services du projet (Apache, Tomcat, Mapserver, ...).

**Pour l'utiliser :**
* installer [VirtualBox](https://www.virtualbox.org/)
* installer [Vagrant](https://www.vagrantup.com/)
* lancer `vagrant up` à la racine du projet pour démarrer la VM

* En cas de souci lors du mapping des répertoires pour cause de "guest additions" manquant, lancer
 
>vagrant plugin install vagrant-vbguest

* Si la connexion de la VM au réseau doit se faire via un proxy :

décommenter le bloc suivant contenu dans le script /vagrant_config/Scripts/bootstrap.sh :

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

ajouter les options de proxy dans la commande du script /vagrant_config/Scripts/install_ogam_services.sh :

remplacer :

>cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM'

par :

>cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew -Dhttps.proxyHost=proxy.ign.fr -Dhttps.proxyPort=3128 && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM' -Dhttps.proxyHost=proxy.ign.fr -Dhttps.proxyPort=3128


**Pour se connecter à la VM :**
* utiliser la commande "vagrant ssh"
* utiliser l'interface de VirtualBox
* (ou) se connecter en SSH sur localhost sur le port 2222 avec le compte vagrant/vagrant  
* PostgreSQL est accessible via le port 5433, user ogam / ogam
* Le site Web est sur localhost:8000, user admin / admin




# Gradle

Gradle est utilisé pour lancer la compilation des composants du projet.

Gradle est installé par défaut dans la VM et les tâches ont été testées dans la VM.

Il est possible aussi de l'utiliser directement depuis la machine hôte (Windows par exemple), il faut pour cela l'installer ([Gradle](https://gradle.org/)).

* lancer `gradle tasks` à la racine du projet pour obtenir la liste des tâches disponibles