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
 * Represent a node in a tree with his children.
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Metadata_TreeNode {

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
	 *
	 * @var Array[TreeNodes]
	 */
	var $children = array();

	/**
	 * Add a child.
	 *
	 * @param Application_Object_Metadata_TreeNode $child
	 *        	a node to add
	 */
	public function addChild($child) {
		$this->children[] = $child;
	}

	/**
	 * Return a node in the tree structure.
	 *
	 * @param String $code
	 *        	a node code
	 * @return TreeNode the TreeNode found, null if not found
	 */
	public function getNode($aCode) {
		if ($this->code == $aCode) {
			return $this;
		} else {
			foreach ($this->children as $child) {
				$node = $child->getNode($aCode);
				if ($node !== null) {
					return $node;
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
		$return = '';
		if (empty($this->code) && empty($this->label)) {
			// Case when the root is just a placeholder, we return only the children
			foreach ($this->children as $child) {
				$return .= $child->toJSON() . ',';
			}
			$return = substr($return, 0, -1); // remove the last comma
		} else {
			// We return the root itself plus the children
			$return .= '{"text":' . json_encode($this->label);
			$return .= ',"id":' . json_encode($this->code);
			if ($this->isLeaf) {
				$return .= ',"leaf":true';
			}
			if (!empty($this->children)) {
				$return .= ',"children": [';
				foreach ($this->children as $child) {
					$return .= $child->toJSON() . ',';
				}
				$return = substr($return, 0, -1); // remove the last comma
				$return .= ']';
			}
			$return .= '}';
		}

		return $return;
	}
}
