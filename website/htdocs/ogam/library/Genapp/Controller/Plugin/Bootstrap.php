<?php
/**
 * Setup the translation
 */
class Genapp_Controller_Plugin_Bootstrap extends Zend_Controller_Plugin_Abstract
{
	/**
	 * Accepted languages
	 * @var array
	 */
	private $_langs = array('fr', 'en');

	/**
	 * Local name space
	 * @var
	 */
	protected $_localeNamespace;

	/**
	 * Objet Zend_View
	 * @var Zend_View
	 */
	protected $_view;

	/**
	 * Contructor
	 *
	 * @param Zend_View $view
	 * @return void
	 */
	public function __construct($view)
	{
	    $this->_view = $view;
	    $this->_localeNamespace = new Zend_Session_Namespace(__CLASS__);
	}

    /**
     * Setup the translation
     * 
     * @param Zend_Controller_Request_Abstract $Request
     * @return void
     */
    public function routeShutdown(Zend_Controller_Request_Abstract $Request)
    {
        $front = Zend_Controller_Front::getInstance();

        // Définie la langue de l'application suivant l'url ou la valeur en session.
        $this->_setLang($Request);
    }

    /**
     * Setup the translation
     *
     * @param Zend_Controller_Request_Abstract $Request
     * @return void
     */
    private function _setLang(Zend_Controller_Request_Abstract $Request)
    {
        $locale = Zend_Registry::get('Zend_Locale');

        // The language parameter
        $lang = $Request->getParam('lang', null);

        if (null === $lang) {
            // Language set in the session ?
            if (empty($this->_localeNamespace->lang)) {
                // Get the client language
                $lang = $this->_getLangBrowser();
            } else {
                $lang = $this->_localeNamespace->lang;
            }
        }

        if (null === $lang) {
            // Default language
            $default = Zend_Locale::getDefault();
            $lang = key($default);
        }

        if (!$lang) {
            throw new Exception(__METHOD__ . ' : aucune langue définie.');
        }

        // Set the application locale
        $locale->setLocale($lang);

        Zend_Locale_Format::setOptions(array('locale' => $locale->toString()));

        // Set the translation language
        $translate = Zend_Registry::get('Zend_Translate');
        $translate->getAdapter()->setLocale($locale);

        // Save the language in session and in the view
        $this->_view->local = $this->_localeNamespace->lang = $lang;

        // Addition of a META balise in the view for the language
        $this->_view->headMeta()->appendHttpEquiv('Content-Language', $lang);
    }

    /**
     * Return the client language
     *
     * @return string|null
     */
    private function _getLangBrowser()
    {
    	$langs = Zend_Locale::getBrowser();

    	foreach ($langs as $lang => $quality) {
    		if (in_array($lang, $this->_langs)) {
    			return $lang;
    		}
    	}

    	return null;
    }
}