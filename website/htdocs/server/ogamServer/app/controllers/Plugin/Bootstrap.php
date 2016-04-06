<?php

/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * Setup the translation
 */
class Application_Controllers_Plugin_Bootstrap extends Zend_Controller_Plugin_Abstract {

	/**
	 * Accepted languages
	 *
	 * @var array
	 */
	private $_langs = array(
		'fr',
		'en'
	);

	/**
	 * Objet Zend_View
	 *
	 * @var Zend_View
	 */
	protected $_view;

	/**
	 * Contructor
	 *
	 * @param Zend_View $view
	 * @return void
	 */
	public function __construct($view) {
		$this->_view = $view;
	}

	/**
	 * Setup the translation.
	 *
	 * @param Zend_Controller_Request_Abstract $request
	 * @return void
	 */
	public function routeShutdown(Zend_Controller_Request_Abstract $request) {

		// Définie la langue de l'application suivant l'url ou la valeur en session.
		$this->_setLang($request);
	}

	/**
	 * Setup the translation
	 *
	 * @param Zend_Controller_Request_Abstract $request
	 * @return void
	 */
	private function _setLang(Zend_Controller_Request_Abstract $request) {
		$locale = Zend_Registry::get('Zend_Locale');

		// The language parameter
		$lang = $request->getParam('lang', null);
		$localeNamespace = new Zend_Session_Namespace(__CLASS__);

		if (null === $lang) {
			// Language set in the session ?
			if (empty($localeNamespace->lang)) {
				// Get the client language
				$lang = $this->_getLangBrowser();
			} else {
				$lang = $localeNamespace->lang;
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

		Zend_Locale_Format::setOptions(array(
			'locale' => $locale->toString()
		));

		// Set the translation language
		$translate = Zend_Registry::get('Zend_Translate');
		$translate->getAdapter()->setLocale($locale);

		// Get the logger
		$logger = Zend_Registry::get("logger");

		// Attach it to the translation instance
		$translate->setOptions(array(
			'log' => $logger,
			'logUntranslated' => true
		));

		// Save the language in session and in the view
		$this->_view->locale = $localeNamespace->lang = $lang;

		// Addition of a META balise in the view for the language
		$this->_view->headMeta()->appendHttpEquiv('Content-Language', $lang);
	}

	/**
	 * Return the client language
	 *
	 * @return string|null
	 */
	private function _getLangBrowser() {
		$langs = Zend_Locale::getBrowser();

		foreach ($langs as $lang => $quality) {
			if (in_array($lang, $this->_langs)) {
				return $lang;
			}
		}

		return null;
	}
}