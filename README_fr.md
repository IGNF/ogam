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


# Gradle

Gradle est utilisé pour lancer la compilation des composants du projet.

Pour l'utiliser :
* installer [Gradle](https://gradle.org/)
* lancer `gradle tasks` à la racine du projet pour obtenir la liste des tâches disponibles


# Vagrant

Vagrant est utilisé pour instancier une machine virtuelle contenant les services du projet (Apache, Tomcat, Mapserver, ...).

Pour l'utiliser : 
* installer [VirtualBox](https://www.virtualbox.org/)
* installer [Vagrant](https://www.vagrantup.com/)
* lancer `vagrant up` à la racine du projet pour démarrer la VM

* En cas de souci lors du mapping des répertoires pour cause de "guest additions" manquant, lancer
 
>vagrant plugin install vagrant-vbguest


Pour se connecter à la VM :
* utiliser l'interface de VirtualBox
* (ou) se connecter en SSH sur localhost sur le port 2222 avec le compte vagrant/vagrant  
* PostgreSQL est accessible via le port 5433, user ogam / ogam
* Le site Web est sur localhost:8000, user admin / admin