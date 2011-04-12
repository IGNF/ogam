<?php
/**
 * 
 * The bootstrap class
 * @author IFN
 *
 */
class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

    // Do not call this function _initLog() ! 
    /**
     * 
     * Register the logger into Zend_Registry
     * @throws Zend_Exception
     */
    protected function _initRegisterLogger() {
        $this->bootstrap('Log');
        if (!$this->hasPluginResource('Log')) {
            throw new Zend_Exception('Log not enabled in config.ini');
        }
        $logger = $this->getResource('Log');
        if (empty($logger)) {
            throw new Zend_Exception('Logger object is empty.');
        }
        Zend_Registry::set('logger', $logger);
    }

    /**
     * 
     * Initialise the layout
     * @return Zend_View The layout view
     */
    protected function _initView() {
        $this->bootstrap('frontController');
        $baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();

        // Initialisons la vue
        $view = new Zend_View();
        $view->doctype('XHTML1_STRICT');
        $view->headTitle()->setSeparator(' - ')->append('OGAM Application');
        $view->headMeta()->appendHttpEquiv('Content-Type', 'text/html; charset=utf-8')
                         //->appendHttpEquiv('Content-Language', 'fr-FR')
                         ->appendName('robots', 'index, follow')
                         ->appendName('keywords', 'eforest, efdac, jrc, forest')
                         ->appendName('description', 'European Forest Data Center');
        $view->headLink()->appendStylesheet($baseUrl . 'css/global.css');
        $view->headScript()->appendFile($baseUrl . 'js/extjs/adapter/ext/ext-base.js', 'text/javascript')
                           ->appendFile($baseUrl . 'js/genapp/source/genapp.js', 'text/javascript');

        // Ajoutons là au ViewRenderer
        $viewRenderer = Zend_Controller_Action_HelperBroker::getStaticHelper('ViewRenderer');
        $viewRenderer->setView($view);

        // Retourner la vue pour qu'elle puisse être stockée par le bootstrap
        return $view;
    }

    // Do not call this function _initTranslate() !
    /**
     * 
     * Register the locale and the translation
     * @throws Zend_Exception
     */
    protected function _initRegisterTranslate() {
        $this->bootstrap('Locale');
        $this->bootstrap('Translate');
        if (!$this->hasPluginResource('Translate')) {
            throw new Zend_Exception('Translate not enabled in config.ini');
        }
        $translate = $this->getResource('Translate');
        if (empty($translate)) {
            throw new Zend_Exception('Translate object is empty.');
        }
        if (!$this->hasPluginResource('Locale')) {
            throw new Zend_Exception('Locale not enabled in config.ini');
        }
        $locale = $this->getResource('Locale');
        if (empty($locale)) {
            throw new Zend_Exception('Locale object is empty.');
        }

        // Set the locale
        $browserLocales = Zend_Locale::getBrowser();
        $locales = array_intersect(array_keys($browserLocales), array_keys($translate->getOptions('translation')));
        if (!empty($locales)) {
            $locale = new Zend_Locale(current($locales));
        }
        Zend_Registry::set('Zend_Locale', $locale);

        // Setup the translation
        foreach ($translate->getOptions('translation') as $tstnLocale => $translation) {
            $translate->addTranslation($translation, $tstnLocale);
        }
        $translate->setLocale($locale);
        Zend_Registry::set('Zend_Translate', $translate); // store in the registry for the view helper
        Zend_Validate_Abstract::setDefaultTranslator($translate); // use the translator for validation
    }

    /**
     * 
     * Define few constants
     */
    protected function _initConstants() {
        define('DPI', '72'); // Default number of dots per inch in mapserv
        define('FACTOR', '39370.1'); // Inch to meter conversion factor
    }

    /**
     * 
     * Register the *.ini files
     */
    protected function _initConfFiles() {
        $configuration = new Zend_Config_Ini(APPLICATION_PATH.'/configs/app.ini', APPLICATION_ENV);
        Zend_Registry::set('configuration', $configuration);
    }

    /**
     * 
     * Set the metadata cache
     * @throws Zend_Exception
     */
    protected function _initSetCache() {
        $this->bootstrap('Cachemanager');
        if (!$this->hasPluginResource('Cachemanager')) {
            throw new Zend_Exception('Cachemanager not enabled in config.ini');
        }
        $cachemanager = $this->getResource('Cachemanager');
        if (empty($cachemanager)) {
            throw new Zend_Exception('Cachemanager object is empty.');
        }
        $dbCache = $cachemanager->getCache('database');

        Zend_Db_Table_Abstract::setDefaultMetadataCache($dbCache);
    }

    /**
     * 
     * Manage the AutoLogin
     */
    protected function _initAutoLogin() {
        $this->bootstrap('Db');
        $this->bootstrap('ConfFiles');
        $configuration = Zend_Registry::get('configuration');
        // USER - autologin for public access
        if ($configuration->autoLogin) {

            $userSession = new Zend_Session_Namespace('user');
            $user = $userSession->user;

            if (empty($user)) {
                $userModel = new Application_Model_DbTable_Website_User();
                $roleModel = new Application_Model_DbTable_Website_Role();
                // Get the user informations
                $user = $userModel->getUser($configuration->defaultUser);

                if (!is_null($user)) {
                    // Store the user in session
                    $userSession = new Zend_Session_Namespace('user');
                    $userSession->connected = true;
                    $userSession->user = $user;

                    // Get the user role
                    $role = $roleModel->getRole($user->roleCode);

                    // Store the role in session
                    $userSession->role = $role;

                    // Get the User Permissions
                    $permissions = $roleModel->getRolePermissions($role->roleCode);
                    $userSession->permissions = $permissions;
                }
            }
        }
    }

    /*protected function _initAddRoutes(){
        // ROUTER - setup the routes
        $router = $frontController->getRouter();
        $router->addRoute('home',
            new Zend_Controller_Router_Route('',
                array('controller'=>$configuration->defaultController,
                    'action'=>$configuration->defaultAction)
            )
        );
    }*/
}
