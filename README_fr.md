# OGAM

OGAM est un système d’information générique permettant de collecter les données
d'inventaires, les valider, les harmoniser puis les diffuser.<br/>
OGAM est sous licence GPL.


# Documentation

La documentation notamment pour l'installation et la configuration se trouve
dans le répertoire documentation


# Git

Git est utilisé pour récupérer le projet qui est hébergé sur [GitHub](https://github.com/IGNF/ogam).

Pour l'utiliser :
* Installer [Git](https://git-scm.com/)
* Lancer la commande `$ git clone https://github.com/IGNF/ogam.git` pour faire un clone du projet en local.

# Vagrant

Vagrant est utilisé pour instancier une machine virtuelle contenant les services du projet (Apache, Tomcat, Mapserver, ...).

**Pour l'utiliser :**
* Installer [VirtualBox](https://www.virtualbox.org/),
* Installer [Vagrant](https://www.vagrantup.com/),
* Lancer la machine virtuelle :
```shell
$ cd ogam
$ vagrant up
```
* Configurer (si nécessaire) le proxy pour la machine virtuelle :
  * Ajouter les variables d’environnement suivantes :
```shell
$ http_proxy = http://proxy.ign.fr:3128/
$ https_proxy = http://proxy.ign.fr:3128/
```
  * Installer le plugin vagrant-proxyconf :
```shell
$ vagrant plugin install vagrant-proxyconf
```
  * Ouvrir le Vagrantfile de votre profile :
```shell
$ nano  ~/.vagrant.d/Vagrantfile
```
  * Rajouter le code suivant :
```shell
Vagrant.configure("2") do |config|
  puts "Setting of the IGN proxy configuration."
  if Vagrant.has_plugin?("vagrant-proxyconf")
    config.proxy.http     = "http://proxy.ign.fr:3128/"
    config.proxy.https    = "http://proxy.ign.fr:3128/"
    config.proxy.no_proxy = "localhost,127.0.0.1,.example.com"
  end
end
```
  * Vérifier la configuration :
```shell
$ vagrant up
```
Vérifier la présence du message « Setting of the IGN proxy configuration. ».

**Pour se connecter à la VM :**
* Utiliser la commande "vagrant ssh"
* Utiliser l'interface de VirtualBox
* (ou) se connecter en SSH sur localhost sur le port 2222 avec le compte vagrant/vagrant  
* PostgreSQL est accessible via le port 5433, user ogam / ogam
* Le site Web est sur http://192.168.50.4/, user admin / admin


# Gradle

Gradle est utilisé pour lancer la compilation des composants du projet.<br/>
Gradle est installé par défaut dans la VM et les tâches ont été testées dans la VM.<br/>
Il est possible aussi de l'utiliser directement depuis la machine hôte (Windows par exemple), il faut pour cela l'installer ([Gradle](https://gradle.org/)).<br/>
Lancer la commande `$ gradle tasks` à la racine du projet pour obtenir la liste des tâches disponibles