<?php

//include_once('setup.php');

include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/Handler/NativeSessionHandler.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/Handler/NativeFileSessionHandler.php');

include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/SessionBagInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Flash/FlashBagInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Flash/FlashBag.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Attribute/AttributeBagInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Attribute/AttributeBag.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/Proxy/AbstractProxy.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/Proxy/SessionHandlerProxy.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/MetadataBag.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/SessionStorageInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Storage/NativeSessionStorage.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/SessionInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/HttpFoundation/Session/Session.php');

include_once('../vendor/symfony/symfony/src/Symfony/Component/Security/Core/Authentication/Token/TokenInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/Security/Core/Authentication/Token/AbstractToken.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/Security/Core/Authentication/Token/UsernamePasswordToken.php');

include_once('../vendor/symfony/symfony/src/Symfony/Component/Security/Core/Role/RoleInterface.php');
include_once('../vendor/symfony/symfony/src/Symfony/Component/Security/Core/User/UserInterface.php');
include_once('../src/OGAMBundle/Entity/Website/User.php');
include_once('../src/OGAMBundle/Entity/Website/Role.php');
include_once('../src/OGAMBundle/Entity/Website/Permission.php');

include_once('../vendor/doctrine/collections/lib/Doctrine/Common/Collections/Selectable.php');
include_once('../vendor/doctrine/collections/lib/Doctrine/Common/Collections/Collection.php');
include_once('../vendor/doctrine/collections/lib/Doctrine/Common/Collections/ArrayCollection.php');
include_once('../vendor/doctrine/collections/lib/Doctrine/Common/Collections/AbstractLazyCollection.php');
include_once('../vendor/doctrine/orm/lib/Doctrine/ORM/PersistentCollection.php');
include_once('../vendor/doctrine/orm/lib/Doctrine/ORM/PersistentCollection.php');

use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\NativeFileSessionHandler;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

$storage = new NativeSessionStorage(array(), new NativeFileSessionHandler("../var/sessions/"));
$session = new Session($storage);
$session->start();

$token = unserialize($session->get('_security_main'));

if(empty($token) || !$token->isAuthenticated() || empty($token->getUser())){
    error_log('User not connected on '.$_SERVER["HTTP_HOST"]);
    error_log('Request: '.$_SERVER["QUERY_STRING"]);
    header('Location: /');
}

/*
 * Notes: 
 * The user's "roles" field mustn't be serialized to avoid circular references issues.
 * Use instead the token's provided "getRoles" function.
 * The user, role and permission entities must be serializables
 */ 
$isAllowed = false;
foreach ($token->getRoles() as $role) {
    if ($role->isAllowed('DATA_QUERY')) {
        $isAllowed = true;
        break;
    }
}
if (!$isAllowed) {
    error_log('User not granted on '.$_SERVER["HTTP_HOST"]);
    error_log('Request: '.$_SERVER["QUERY_STRING"]);
    header('Location: /');
}

$sessionId = $session->getId();

session_write_close(); // Releases the session cookie