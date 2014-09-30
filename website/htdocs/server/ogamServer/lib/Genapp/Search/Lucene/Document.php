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


class Genapp_Search_Lucene_Document extends Zend_Search_Lucene_Document
{

	/**
	 * Constructor.
	 *
	 * @param array $values An associative array of values to be used
	 *                      in the document.
	 */
	public function __construct($values, $charset)
	{
		// If the Filename or the Key values are not set then reject the document.
		if (!isset($values['Filename']) && !isset($values['key'])) {
			return false;
		}

		Zend_Search_Lucene_Analysis_Analyzer::setDefault(
				new Zend_Search_Lucene_Analysis_Analyzer_Common_Utf8Num_CaseInsensitive());

		// Add the Filename field to the document as a Keyword field.
		$this->addField(Zend_Search_Lucene_Field::Keyword('Filename', $values['Filename']));
		// Add the Key field to the document as a Keyword.
		$this->addField(Zend_Search_Lucene_Field::Keyword('Key', $values['Key']));

		foreach($values as $meta => $value){
			if($value != '' && $meta != 'Contents'){
				// Add the field like a keyword (not tokenized) for an enum search
				// Note : The encoding option is important for some particular case
				$this->addField(Zend_Search_Lucene_Field::Keyword($meta, $value, $charset));
				// Add the field like a text (tokenized) for an free text search
				$this->addField(Zend_Search_Lucene_Field::Text($meta.'_asText', $value, $charset));
			}
		}

		if (isset($values['Contents']) && $values['Contents'] != '') {
			// Add the Contents field to the document as an UnStored field.
			// The content must be already in UTF-8 to avoid the out
			// of memory error during the iconv process of big file
			$this->addField(Zend_Search_Lucene_Field::UnStored('Contents', $values['Contents'], 'UTF-8'));
		}
	}
}