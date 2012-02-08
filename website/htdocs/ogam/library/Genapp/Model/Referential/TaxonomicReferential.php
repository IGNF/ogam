<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is the model used to access a Taxonomic referential.
 *
 * This model is based on the structure of the French Taxonomic Referential : http://inpn.mnhn.fr/programme/referentiel-taxonomique-taxref
 *
 * @package models
 */
class Genapp_Model_Referential_TaxonomicReferential extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$configuration = Zend_Registry::get("configuration");
		$this->useCache = $configuration->useCache;

		$this->cache = $this->getDefaultMetadataCache();
	}



	/**
	 * Get the taxons.
	 *
	 * Return a hierarchy of taxons
	 *
	 * @param String $parentcode The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels The number of levels of depth (if 0 then no limitation), relative to the root node
	 * @return Genapp_Object_Metadata_TreeNode
	 */
	public function getTaxrefChildren($parentcode = '*', $levels = 1) {

		$key = 'getTaxrefChildren_'.$parentcode.'_'.$levels;
		$key = str_replace('*', '_', $key); // Zend cache doesn't like the * character
		$key = str_replace(' ', '_', $key);

		$this->logger->debug($key);

		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			$db = $this->getAdapter();

			$req = "WITH RECURSIVE node_list( cd_nom, cd_taxsup, lb_nom, nom_vern, is_leaf, is_reference, level) AS (  ";
			$req .= "	    SELECT cd_nom, cd_taxsup, lb_nom, nom_vern, is_leaf, ";
			$req .= "		       CASE WHEN cd_nom = cd_ref THEN 1 ELSE 0 END, ";
			$req .= "		       1";
			$req .= "		FROM taxref ";
			$req .= "		WHERE cd_taxsup = ? ";
			$req .= "	UNION ALL ";
			$req .= "		SELECT child.cd_nom, child.cd_taxsup, child.lb_nom, child.nom_vern, child.is_leaf, ";
			$req .= "		       CASE WHEN child.cd_nom = child.cd_ref THEN 1 ELSE 0 END, ";
			$req .= "		       level + 1 ";
			$req .= "		FROM taxref child ";
			$req .= "		INNER JOIN node_list on child.cd_taxsup = node_list.cd_nom ";
			if ($levels != 0) {
				$req .= "		WHERE level < ".$levels." ";
			}
			$req .= "	) ";
			$req .= "	SELECT * ";
			$req .= "	FROM node_list ";
			$req .= "	ORDER BY level, cd_taxsup, cd_nom, is_reference desc, lb_nom "; // level is used to ensure correct construction of the structure

			$this->logger->info('getTaxrefChildren : '.$parentcode);
			$this->logger->info('getTaxrefChildren : '.$req);

			$select = $db->prepare($req);

			$select->execute(array($parentcode));

			$resultTree = new Genapp_Object_Metadata_TreeNode(); // The root is empty
			foreach ($select->fetchAll() as $row) {

				$parentCode = $row['cd_taxsup'];

				//Build the new node
				$tree = new Genapp_Object_Referential_TaxrefNode();
				$tree->code = $row['cd_nom'];
				$tree->label = $row['lb_nom'];
				$tree->isLeaf = $row['is_leaf'];
				$tree->isReference = $row['is_reference'];
				$tree->vernacularName = $row['nom_vern'];

				// Check if a parent can be found in the structure
				$parentNode = $resultTree->getNode($parentCode);
				if ($parentNode == null) {
					// Add the new node to the result root
					$resultTree->addChild($tree);

				} else {
					// Add it to the found parent
					$parentNode->addChild($tree);

				}

			}

			if ($this->useCache) {
				$this->cache->save($resultTree, $key);
			}
			return $resultTree;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the taxons labels.
	 *
	 * @param String $unit the unit of the referential
	 * @param String $value the value searched (optional)
	 * @return Array[String, String]
	 */
	public function getTaxrefLabels($unit, $value = null) {

		$key = 'getTaxrefLabels_'.$unit.'_'.$value;
		$key = str_replace('*', '_', $key); // Zend cache doesn't like the * character
		$key = str_replace(' ', '_', $key);

		$this->logger->debug($key);


		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			$db = $this->getAdapter();

			$req = "	SELECT cd_nom, lb_nom ";
			$req .= "	FROM taxref ";
			if ($value != null) {
				if (is_array($value)) {
					$req .= " WHERE cd_nom IN ('".implode("','", $value)."')";
				} else {
					$req .= " WHERE cd_nom = '".$value."'";
				}
			}
			$req .= "	ORDER BY lb_nom ";

			$this->logger->info('getTaxrefLabels '.$req);

			$select = $db->prepare($req);
			$select->execute(array());

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$result[$row['cd_nom']] = $row['lb_nom'];
			}

			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}


	/**
	 * Get all the children codes from the reference taxon of a taxon.
	 *
	 * Return an array of codes.
	 *
	 * @param String $code The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels The number of levels of depth (if 0 then no limitation)
	 * @return Array[String]
	 */
	public function getTaxrefChildrenCodes($code = '*', $levels = 1) {


		$key = 'getTaxrefChildrenCodes_'.$code.'_'.$levels;
		$key = str_replace('*', '_', $key); // Zend cache doesn't like the * character

		$this->logger->debug($key);

		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			$this->logger->info('getTaxrefChildrenCodes : '.$code.'_'.$levels);
			$db = $this->getAdapter();
			$req = "WITH RECURSIVE node_list( cd_nom, level) AS ( ";
			$req .= "	    SELECT cd_ref, 1 "; // we get the reference taxon as a base for the search
			$req .= "		FROM taxref ";
			$req .= "		WHERE cd_nom = ? ";
			$req .= "	UNION ALL ";
			$req .= "		SELECT child.cd_nom, level + 1 ";
			$req .= "		FROM taxref child ";
			$req .= "		INNER JOIN node_list on child.cd_taxsup = node_list.cd_nom ";
			if ($levels != 0) {
				$req .= "		WHERE level < ".$levels." ";
			}
			$req .= "	) ";
			$req .= "	SELECT * ";
			$req .= "	FROM node_list ";
			$req .= "	ORDER BY level, cd_nom "; // level is used to ensure correct construction of the structure

			$this->logger->info('getTaxrefChildrenCodes : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($code));

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$result[] = $row['cd_nom'];
			}

			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}




}
