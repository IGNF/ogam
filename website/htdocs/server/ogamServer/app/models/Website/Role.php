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
 * This is the Role model.
 *
 * @package Application_Model
 * @subpackage Website
 */
class Application_Model_Website_Role extends Zend_Db_Table_Abstract {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * Initialisation.
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());

		$this->metadataModel = new Application_Model_Metadata_Metadata();
	}

	/**
	 * Get a user Role.
	 *
	 * @param String $roleCode
	 *        	The role code
	 * @return a Role
	 */
	public function getRole($roleCode) {
		$db = $this->getAdapter();

		$req = " SELECT role_code, COALESCE(t.label, role_label) as role_label, COALESCE(t.definition, role_definition) as role_definition ";
		$req .= " FROM role ";
		$req .= " LEFT JOIN translation t ON (lang = ? AND table_format = 'ROLE' AND row_pk = role_code) ";
		$req .= " WHERE role_code = ? ";
		$this->logger->info('getRole : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$this->lang,
			$roleCode
		));

		$result = $query->fetch();

		if (!empty($result)) {

			// Create the role object
			$role = new Application_Object_Website_Role();
			$role->code = $result['role_code'];
			$role->label = $result['role_label'];
			$role->definition = $result['role_definition'];

			// Get its permissions
			$role->permissionsList = $this->_getRolePermissions($role->code);

			// Get the list of schemas it can access
			$role->schemasList = $this->_getRoleSchemas($role->code);

			return $role;
		} else {
			return null;
		}
	}

	/**
	 * Get the list of different roles.
	 *
	 * @return Array[String => Role]
	 */
	public function getRolesList() {
		$db = $this->getAdapter();

		$req = " SELECT role_code, COALESCE(t.label, role_label) as role_label, COALESCE(t.definition, role_definition) as role_definition ";
		$req .= " FROM role ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'ROLE' AND row_pk = role_code) ";
		$req .= " ORDER BY role_code";
		$this->logger->info('getRolesList : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array());

		$results = $query->fetchAll();
		$roles = array();

		foreach ($results as $result) {
			$role = new Application_Object_Website_Role();
			$role->code = $result['role_code'];
			$role->label = $result['role_label'];
			$role->definition = $result['role_definition'];
			$roles[$role->code] = $role;
		}

		return $roles;
	}

	/**
	 * Get the permissions of the role.
	 *
	 * @param String $roleCode
	 *        	the role code
	 * @return Array[permissionCode => permission_label]
	 */
	private function _getRolePermissions($roleCode) {
		$db = $this->getAdapter();

		$req = " SELECT permission_code, COALESCE(t.label, permission_label) as permission_label ";
		$req .= " FROM permission_per_role ";
		$req .= " LEFT JOIN permission using (permission_code) ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'PERMISSION' AND row_pk = permission_code) ";
		$req .= " WHERE role_code = ?";
		$this->logger->info('getRolePermissions : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode
		));

		$results = $query->fetchAll();
		$permissions = array();
		foreach ($results as $result) {
			$permissions[] = $result['permission_code'];
		}

		return $permissions;
	}

	/**
	 * Get the schemas accessible by the role.
	 *
	 * @param String $roleCode
	 *        	the role code
	 * @return Array[String] The schemas list
	 */
	private function _getRoleSchemas($roleCode) {
		$db = $this->getAdapter();

		$req = " SELECT schema_code ";
		$req .= " FROM role_to_schema ";
		$req .= " WHERE role_code = ?";
		$this->logger->info('getRoleSchemas : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode
		));

		$results = $query->fetchAll();
		$schemas = array();
		foreach ($results as $result) {
			$schemas[] = $result['schema_code'];
		}

		return $schemas;
	}

	/**
	 * Get the all the available permissions.
	 *
	 * @return Array[permissionCode => permissionLabel]
	 */
	public function getAllPermissions() {
		$db = $this->getAdapter();

		$req = " SELECT permission_code, COALESCE(t.label, permission_label) as permission_label ";
		$req .= " FROM permission ";
		$req .= " LEFT JOIN translation t ON lang = '" . $this->lang . "' AND table_format = 'PERMISSION' AND row_pk = permission_code";

		$this->logger->info('getAllPermissions : ' . $req);

		$query = $db->prepare($req);
		$query->execute();

		$results = $query->fetchAll();
		$permissions = array();
		foreach ($results as $result) {
			$permissions[$result['permission_code']] = $result['permission_label'];
		}

		return $permissions;
	}

	/**
	 * Update role information.
	 *
	 * @param Role $role
	 */
	public function updateRole($role) {
		$db = $this->getAdapter();

		$req = "UPDATE role SET role_label=?, role_definition=? WHERE role_code = ?";

		$this->logger->info('updateRole : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$role->label,
			$role->definition,
			$role->code
		));

		// Update the permissions
		$this->_updateRolePermissions($role);

		// Update the schemas
		$this->_updateRoleSchemas($role);
	}

	/**
	 * Update the role permissions.
	 *
	 * @param Role $role
	 */
	private function _updateRolePermissions($role) {
		$db = $this->getAdapter();

		// Clean the previous permissions
		$req = "DELETE FROM permission_per_role";
		$req .= " WHERE role_code = ?";

		$this->logger->info('updateRolePermissions : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$role->code
		));

		// Insert the new ones
		if (!empty($role->permissionsList)) {
			foreach ($role->permissionsList as $permission) {

				$req = "INSERT INTO permission_per_role(role_code, permission_code) VALUES (?, ?)";

				$this->logger->info('updateRolePermissions : ' . $req);

				$query = $db->prepare($req);
				$query->execute(array(
					$role->code,
					$permission
				));
			}
		}
	}

	/**
	 * Update the role schemas.
	 *
	 * @param Role $role
	 */
	private function _updateRoleSchemas($role) {
		$db = $this->getAdapter();

		// Clean the previous schemas
		$req = "DELETE FROM role_to_schema";
		$req .= " WHERE role_code = ?";

		$this->logger->info('deleteRoleSchemas : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$role->code
		));

		// Insert the new schemas
		if (!empty($role->schemasList)) {
			foreach ($role->schemasList as $schema) {
				$req = "INSERT INTO role_to_schema(role_code, schema_code) VALUES (?, ?)";

				$this->logger->info('updateRoleSchemas : ' . $req);

				$query = $db->prepare($req);
				$query->execute(array(
					$role->code,
					$schema
				));
			}
		}
	}

	/**
	 * Create a new role.
	 *
	 * @param Role $role
	 */
	public function createRole($role) {
		$db = $this->getAdapter();

		$req = " INSERT INTO role (role_code, role_label, role_definition )";
		$req .= " VALUES (?, ?, ?)";

		$this->logger->info('createRole : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$role->code,
			$role->label,
			$role->definition
		));

		// Update the permissions
		$this->_updateRolePermissions($role);

		// Update the schemas
		$this->_updateRoleSchemas($role);
	}

	/**
	 * Delete the role.
	 *
	 * @param String $roleCode
	 *        	the role code
	 */
	public function deleteRole($roleCode) {
		$db = $this->getAdapter();

		// Delete the schemas linked to the role
		$req = " DELETE FROM role_to_schema WHERE role_code = ?";
		$this->logger->info('deleteRoleSchemas : ' . $req);
		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode
		));

		// Delete the permissions linked to the role
		$req = " DELETE FROM permission_per_role WHERE role_code = ?";
		$this->logger->info('deleteRolePermissions : ' . $req);
		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode
		));

		// Delete the role
		$req = " DELETE FROM role WHERE role_code = ?";
		$this->logger->info('deleteRole : ' . $req);
		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode
		));
	}

	/**
	 * Returns true if you can safely delete a role.
	 *
	 * @param String $roleCode
	 *        	the role code
	 * @return bool
	 */
	public function isRoleDeletable($roleCode) {

		// Check is there is a user using this role
		$db = $this->getAdapter();
		$req = " SELECT count(*) as nbusers";
		$req .= " FROM role_to_user ";
		$req .= " WHERE role_code = ? ";

		$this->logger->info('isRoleDeletable : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode
		));

		$result = $query->fetch();
		$count = $result['nbusers'];

		return ($count === 0);
	}
}