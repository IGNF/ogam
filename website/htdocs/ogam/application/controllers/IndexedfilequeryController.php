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
require_once 'AbstractOGAMController.php';

class IndexedfilequeryController extends AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();
		
		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "indexedfilequery";
		$websiteSession->moduleLabel = "Indexed File Query";
		$websiteSession->moduleURL = "indexedfilequery";
	}

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {
		parent::preDispatch();
		
		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;
		if (empty($user) || !in_array('INDEXED_FILE_QUERY', $user->role->permissionsList)) {
			throw new Zend_Auth_Exception('Permission denied for right : INDEXED_FILE_QUERY');
		}
	}

	protected function _getIndexKey() {
		$indexKey = $this->_getParam("INDEX_KEY");
		
		// Check the index key
		$config = Zend_Registry::get('configuration');
		$validIndexKeys = array_keys($config->indices->toArray());
		if (!in_array($indexKey, $validIndexKeys)) {
			throw new Exception('Invalid INDEX_KEY');
		}
		return $indexKey;
	}

	public function _getPdfsMetadataValues($indexKey) {
		$config = Zend_Registry::get('configuration');
		ini_set('max_execution_time', $config->max_execution_time);
		
		// Get the cache
		$cacheKey = 'getmetadatafields' . $indexKey;
		$manager = $this->getFrontController()
			->getParam('bootstrap')
			->getPluginResource('cachemanager')
			->getCacheManager();
		$fileindexCache = $manager->getCache('fileindex');
		$useCache = $config->useCache;
		
		if ($useCache) {
			$cachedResult = $fileindexCache->load($cacheKey);
		}
		if (empty($cachedResult)) {
			$filesList = AbstractOGAMController::getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');
			if (count($filesList) > 0) { // make sure the glob array has something in it
				$indexValues = array();
				foreach ($filesList as $filename) {
					try {
						$pdf = Zend_Pdf::load($filename);
					} catch (Exception $e) {
						$this->logger->err('Unable to load the file: ' . $filename);
						$this->logger->err($e->getMessage());
					}
					
					$filesMetadata = $config->indices->$indexKey->filesMetadata->toArray();
					
					// Go through each meta data item and add to index array.
					foreach ($pdf->properties as $meta => $metaValue) {
						if (in_array($meta, $filesMetadata)) {
							$value = $pdf->properties[$meta];
							$filesCharset = $config->indices->$indexKey->filesCharset;
							$value = iconv($filesCharset, "UTF-8//TRANSLIT", $value);
							$trimmedValue = trim($value); // To remove the " " string
							if (!empty($trimmedValue) && (empty($indexValues[$meta]) || !in_array($value, $indexValues[$meta]))) {
								$indexValues[$meta][] = $value;
							}
						}
					}
					
					// Short File name
					$splitedFilename = preg_split("/[\\/\\\\]+/", $filename);
					$shortFileName = $splitedFilename[count($splitedFilename) - 1];
					
					// Small file name and Extension
					$smallFilename = preg_split("/[\\.]+/", $shortFileName);
					$extension = array_pop($smallFilename);
					$smallFilename = implode(".", $smallFilename);
					
					// Set the 'FileName', 'ShortFileName', 'Extension'
					if (in_array('ShortFileName', $filesMetadata) && (empty($indexValues['ShortFileName']) || !in_array($filename, $indexValues['ShortFileName']))) {
						$indexValues['ShortFileName'][] = $shortFileName;
					}
					if (in_array('SmallFileName', $filesMetadata) && (empty($indexValues['SmallFileName']) || !in_array($filename, $indexValues['SmallFileName']))) {
						$indexValues['SmallFileName'][] = $smallFilename;
					}
					if (in_array('Extension', $filesMetadata) && (empty($indexValues['Extension']) || !in_array($filename, $indexValues['Extension']))) {
						$indexValues['Extension'][] = $extension;
					}
				}
			}
			foreach ($indexValues as $meta => $metaValues) {
				sort($indexValues[$meta]);
			}
			
			if ($useCache) {
				$fileindexCache->save($indexValues, $cacheKey);
			}
			return $indexValues;
		} else {
			return $cachedResult;
		}
	}

	protected function _getSearchFilterInput($indexKey) {
		$metaValues = $this->_getPdfsMetadataValues($indexKey);
		$filters = array();
		$validators = array();
		foreach ($metaValues as $meta => $metaValue) {
			// $filters[$meta] = array('StringTrim', 'StripTags');
			$validators[$meta] = array(
				new Zend_Validate_InArray($metaValue),
				'allowEmpty' => true
			);
		}
		// TEXT
		$filters['TEXT'] = array(
			'StringTrim',
			'StripTags'
		);
		$validators['TEXT'] = array(
			'allowEmpty' => true
		); // The validator declaration is mandatory
		$input = new Zend_Filter_Input($filters, $validators, $_POST);
		return $input;
	}

	public function searchAction() {
		$indexKey = $this->_getIndexKey();
		$input = $this->_getSearchFilterInput($indexKey);
		if ($input->isValid()) {
			$config = Zend_Registry::get('configuration');
			$index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);
			
			$query = new Zend_Search_Lucene_Search_Query_Boolean();
			
			$filesMetadata = $config->indices->$indexKey->filesMetadata->toArray();
			$filesCharset = $config->indices->$indexKey->filesCharset;
			foreach ($filesMetadata as $meta) {
				$value = $input->getUnescaped($meta);
				
				if (is_string($value) && $value != '') {
					$pathTerm = new Zend_Search_Lucene_Index_Term($value, $meta);
					$pathQuery = new Zend_Search_Lucene_Search_Query_Term($pathTerm);
					$query->addSubquery($pathQuery, true);
				}
			}
			
			$text = $input->getUnescaped('TEXT');
			if (is_string($text) && $text != '') {
				// The text must be lowered in the case of the use of Utf8Num_CaseInsensitive analyzer
				// Don't use strtolower ('alphabetic' is determined by the current locale)
				// because the accentued characters will not be converted.
				// Use mb_strtolower instead.
				$pathQuery = new Zend_Search_Lucene_Search_Query_Phrase(explode(' ', mb_strtolower($text, 'UTF-8')));
				$query->addSubquery($pathQuery, true);
			}
			
			try {
				$hits = $index->find($query);
			} catch (Zend_Search_Lucene_Exception $ex) {
				$hits = array();
			}
			
			$results = array();
			foreach ($hits as $hit) {
				$result = array();
				$result['id'] = $hit->id;
				$result['score'] = $hit->score;
				$result['url'] = $hit->url;
				
				foreach ($filesMetadata as $meta) {
					$value = '-';
					try {
						$value = $hit->getDocument()->getFieldValue($meta);
					} catch (Exception $e) {
						// No value for this metadata
					}
					$result[$meta] = $value;
				}
				$results[] = $result;
			}
			
			$response = array(
				'success' => true,
				'hits' => $results
			);
			echo json_encode($response);
		} else {
			// Setup the response
			$msgs = $input->getMessages();
			$errors = array();
			foreach ($msgs as $meta => $errormsgs) {
				$errors[$meta] = implode('. ', $errormsgs);
			}
			$response = array(
				'success' => false,
				'errors' => $errors
			);
			echo json_encode($response);
		}
		
		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json; charset=UTF-8');
	}

	public function getmetadatafieldsAction() {
		// Release the session to unblock the other requests
		Zend_Session::writeClose();
		
		// Get the params
		$indexKey = $this->_getIndexKey();
		
		$config = Zend_Registry::get('configuration');
		$filesMetadata = $config->indices->$indexKey->filesMetadata->toArray();
		
		$metaValues = $this->_getPdfsMetadataValues($indexKey);
		$fields = array();
		// Loop on the conf metadata array to keep the good metadata order
		foreach ($filesMetadata as $meta) {
			$values = $metaValues[$meta];
			if (!empty($values)) {
				$fields[] = array(
					'name' => $meta,
					'label' => $this->view->translate($meta),
					'data' => $values
				);
			}
		}
		
		echo json_encode($fields);
		
		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json; charset=UTF-8');
	}
}
