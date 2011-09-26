<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is the Role model.
 * @package models
 */
class Application_Model_DbTable_Website_Role extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get a user Role.
	 *
	 * @param string roleCode The role code
	 * @return a Role
	 */
	public function getRole($roleCode) {
		$db = $this->getAdapter();

		$req = " SELECT role_code, role_label, role_def ";
		$req .= " FROM role ";
		$req .= " WHERE role_code = ? ";
		$this->logger->info('getRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		$result = $query->fetch();

		if (!empty($result)) {
			$role = new Application_Model_Website_Role();
			$role->roleCode = $result['role_code'];
			$role->roleLabel = $result['role_label'];
			$role->roleDefinition = $result['role_def'];
			return $role;
		} else {
			return null;
		}
	}

	/**
	 * Get the list of different roles.
	 *
	 * @return Array[Role]
	 */
	public function getRoles() {
		$db = $this->getAdapter();

		$req = " SELECT role_code, role_label, role_def ";
		$req .= " FROM role ";
		$req .= " ORDER BY role_code";
		$this->logger->info('getRoles : '.$req);

		$query = $db->prepare($req);
		$query->execute(array());

		$results = $query->fetchAll();
		$roles = array();

		foreach ($results as $result) {
			$role = new Application_Model_Website_Role();
			$role->roleCode = $result['role_code'];
			$role->roleLabel = $result['role_label'];
			$role->roleDefinition = $result['role_def'];
			$roles[] = $role;
		}

		return $roles;
	}

	/**
	 * Get the permissions of the role.
	 *
	 * @param String the role code
	 * @return Array[permissionCode=>permission_label]
	 */
	public function getRolePermissions($roleCode) {
		$db = $this->getAdapter();

		$req = " SELECT permission_code, permission_label ";
		$req .= " FROM permission_per_role ";
		$req .= " LEFT JOIN permission using (permission_code) ";
		$req .= " WHERE role_code = ?";
		$this->logger->info('getRolePermissions : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		$results = $query->fetchAll();
		$permissions = array();
		foreach ($results as $result) {
			$permissions[$result['permission_code']] = $result['permission_label'];
		}

		return $permissions;
	}

	/**
	 * Get the all the available permissions.
	 *
	 * @return Array[permissionCode=>permissionLabel]
	 */
	public function getAllPermissions() {
		$db = $this->getAdapter();

		$req = " SELECT permission_code, permission_label ";
		$req .= " FROM permission ";

		$this->logger->info('getAllPermissions : '.$req);

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
	 * @param Role role
	 */
	public function updateRole($role) {
		$db = $this->getAdapter();

		$req = "UPDATE role SET role_label=?, role_def=? WHERE role_code = ?";

		$this->logger->info('updateRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array(
			$role->roleLabel,
			$role->roleDefinition,
			$role->roleCode));
	}

	/**
	 * Update the role permissions.
	 *
	 * @param Role role
	 * @param Array[] permissions
	 */
	public function updateRolePermissions($role, $rolepermissions) {
		$db = $this->getAdapter();

		// Clean the previous permissions
		$req = "DELETE FROM permission_per_role";
		$req .= " WHERE role_code = ?";

		$this->logger->info('updateRolePermissions : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($role->roleCode));

		// Insert the new ones
		if (!empty($rolepermissions)) {
			foreach ($rolepermissions as $permission) {

				$req = "INSERT INTO permission_per_role(role_code, permission_code) VALUES (?, ?)";

				$this->logger->info('updateRolePermissions : '.$req);

				$query = $db->prepare($req);
				$query->execute(array($role->roleCode, $permission));
			}
		}

	}

	/**
	 * Create a new role.
	 *
	 * @param Role role
	 */
	public function createRole($role) {
		$db = $this->getAdapter();

		$req = " INSERT INTO role (role_code, role_label, role_def )";
		$req .= " VALUES (?, ?, ?, ?)";

		$this->logger->info('createRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array(
			$role->roleCode,
			$role->roleLabel,
			$role->roleDefinition));
	}

	/**
	 * Delete the role.
	 *
	 * @param String the role code
	 */
	public function deleteRole($roleCode) {
		$db = $this->getAdapter();

		// Delete the permissions linked to the role
		$req = " DELETE FROM permission_per_role WHERE role_code = ?";
		$this->logger->info('deleteRolePermissions : '.$req);
		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		// Delete the role
		$req = " DELETE FROM role WHERE role_code = ?";
		$this->logger->info('deleteRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));
	}
}
