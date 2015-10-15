# OGAM

OGAM est un système d’information générique permettant de collecter les données
d'inventaires, les valider, les harmoniser puis les diffuser. 
 
OGAM est sous licence GPL.


# Documentation
La documentation notamment pour l'installation et la configuration se trouve 
dans le répertoire documentation


# Gradle
Gradle est utilisé pour lancer la compilation des composants du projet.

Pour l'utiliser :
* installer [Gradle](https://gradle.org/)
* `gradle tasks` Pour obtenir la liste des tâches disponibles


# Vagrant
Vagrant est utilisé pour instancier une machine virtuelle contenant les services du projet (Apache, Tomcat, Mapserver, ...).

Pour l'utiliser : 
* installer [VirtualBox](https://www.virtualbox.org/)
* installer [Vagrant](https://www.vagrantup.com/)
* `vagrant up` Pour démarrer la VM

Pour se connecter à la VM :
* utiliser l'interface de VirtualBox
* (ou) se connecter en SSH sur localhost sur le port 2222 avec le compte vagrant/vagrant  
* PostgreSQL est accessible via le port 5433, user ogam / ogam
* Le site Web est sur localhost:8000, user admin / admin