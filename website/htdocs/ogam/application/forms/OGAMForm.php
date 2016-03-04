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
 *
 * @see Zend_Form
 */
require_once 'Zend/Form.php';

/**
 * Application_Form_OGAMForm
 *
 * @package Application_Form_OGAMForm
 */
class Application_Form_OGAMForm extends Zend_Form {

	protected $_decorators = array(
		array(
			'decorator' => 'FormElements',
			'options' => array()
		),
		array(
			'decorator' => 'HtmlTag',
			'options' => array(
				'class' => 'zend_form'
			)
		),
		array(
			'decorator' => 'Form',
			'options' => array()
		),
		array(
			'decorator' => 'HtmlTag',
			'options' => array(
				'class' => 'form-ct'
			)
		),
		array(
			'decorator' => 'HtmlTag',
			'options' => array(
				'class' => 'form-super-ct'
			)
		)
	);

	/**
	 * Initialise the Form.
	 *
	 * @see Zend_Form::init()
	 */
	function init() {
		$this->addDecorator('HtmlTag', array(
			'class' => $this->getName()
		));
		$this->setMethod('post');
	}

	/**
	 * Create an element
	 *
	 * Acts as a factory for creating elements. Elements created with this
	 * method will not be attached to the form, but will contain element
	 * settings as specified in the form object (including plugin loader
	 * prefix paths, default decorators, etc.).
	 *
	 * @param string $type
	 * @param string $name
	 * @param array|Zend_Config $options
	 * @return Zend_Form_Element
	 */
	public function createElement($type, $name, $options = null) {
		$element = parent::createElement($type, $name, $options);
		$element->clearDecorators();
		switch (strtolower($type)) {
			CASE 'hidden':
				$element->addDecorator('ViewHelper');
				break;
			CASE 'submit':
				$element->addDecorator('ViewHelper')->addDecorator('HtmlTag', array(
					'tag' => 'div',
					'class' => 'button'
				));
				break;
			CASE 'file':
				$element->addDecorator('File')
					->addDecorator('Errors')
					->addDecorator('Description', array(
					'tag' => 'p',
					'class' => 'description'
				))
					->addDecorator('Label')
					->addDecorator('HtmlTag', array(
					'tag' => 'div',
					'class' => $type . ' element',
					'id' => array(
						'callback' => array(
							get_class($element),
							'resolveElementId'
						)
					)
				));
				break;
			CASE 'multicheckbox':
				$element->addDecorator('ViewHelper')
					->addDecorator('Errors')
					->addDecorator('Description', array(
					'tag' => 'p',
					'class' => 'description'
				))
					->addDecorator('Label', array(
					'class' => 'title'
				))
					->addDecorator('HtmlTag', array(
					'tag' => 'div',
					'class' => $type . ' element',
					'id' => array(
						'callback' => array(
							get_class($element),
							'resolveElementId'
						)
					)
				));
				break;
			DEFAULT:
				$element->addDecorator('ViewHelper')
					->addDecorator('Errors')
					->addDecorator('Description', array(
					'tag' => 'p',
					'class' => 'description'
				))
					->addDecorator('Label')
					->addDecorator('HtmlTag', array(
					'tag' => 'div',
					'class' => $type . ' element',
					'id' => array(
						'callback' => array(
							get_class($element),
							'resolveElementId'
						)
					)
				));
				break;
		}
		return $element;
	}
}