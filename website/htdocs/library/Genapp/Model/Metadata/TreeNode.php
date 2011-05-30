<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a node in a tree with his children.
 *
 * @package classes
 */
class Genapp_Model_Metadata_TreeNode {

	/**
	 * The code.
	 */
	var $code;

	/**
	 * The label.
	 */
	var $label;

	/**
	 * Is a leaf node.
	 */
	var $isLeaf;

	/**
	 * The childs.
	 * @var Array[TreeNodes]
	 */
	var $children = array();

	/**
	 * Add a child.
	 *
	 * @param Genapp_Model_Metadata_TreeNode $child a node to add
	 */
	public function addChild($child) {
		$this->children[] = $child;
	}

	/**
	 * Return true if a node is prensent in the tree structure.
	 *
	 * @param String $code a node code
	 * @return TreeNode the TreeNode found, null if not found
	 */
	public function getNode($aCode) {

		if ($this->code == $aCode) {
			return $this;
		} else {
			foreach ($this->children as $child) {
				if ($child->getNode($aCode)) {
					return $child;
				}
			}
		}

		return null;
	}

	/**
	 * Serialize the object as a JSON.
	 *
	 * @return JSON the descriptor
	 */
	public function toJSON() {

		if (empty($this->code) && empty($this->label)) {
			// Case when the root is just a placeholder, we return only the children
			foreach ($this->children as $child) {
				$return .= $child->toJSON().',';
			}
			$return = substr($return, 0, -1); // remove the last comma
		} else {
			// We return the root itself plus the children
			$return = '{';
			$return .= 'text:'.json_encode($this->label);
			$return .= ',id:'.json_encode($this->code);
			if ($this->isLeaf) {
				$return .= ',leaf:true';
			}
			if (!empty($this->children)) {
				$return .= ',children: [';
				foreach ($this->children as $child) {
					$return .= $child->toJSON().',';
				}
				$return = substr($return, 0, -1); // remove the last comma
				$return .= ']';
			}
			$return .= '}';
		}

		return $return;
	}

}
