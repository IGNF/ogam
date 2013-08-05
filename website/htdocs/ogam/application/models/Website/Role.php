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
 * @package models
 */
class Application_Model_Website_Role extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
        $this->lang = strtoupper($translate->getAdapter()->getLocale());

        $this->metadataModel = new Genapp_Model_Metadata_Metadata();
	}

	/**
	 * Get a user Role.
	 *
	 * @param string roleCode The role code
	 * @return a Role
	 */
	public function getRole($roleCode) {
		$tableFormat = $this->metadataModel->getTableFormatFromTableName('WEBSITE', 'ROLE');
		$db = $this->getAdapter();

		$req = " SELECT role_code, COALESCE(t.label, role_label) as role_label, COALESCE(t.definition, role_definition) as role_definition ";
		$req .= " FROM role ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = role_code";
		$req .= " WHERE role_code = ? ";
		$this->logger->info('getRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		$result = $query->fetch();

		if (!empty($result)) {
			$role = new Application_Object_Website_Role();
			$role->roleCode = $result['role_code'];
			$role->roleLabel = $result['role_label'];
			$role->roleDefinition = $result['role_definition'];
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
		$tableFormat = $this->metadataModel->getTableFormatFromTableName('WEBSITE', 'ROLE');
		$db = $this->getAdapter();

		$req = " SELECT role_code, COALESCE(t.label, role_label) as role_label, COALESCE(t.definition, role_definition) as role_definition ";
		$req .= " FROM role ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = role_code";
		$req .= " ORDER BY role_code";
		$this->logger->info('getRoles : '.$req);

		$query = $db->prepare($req);
		$query->execute(array());

		$results = $query->fetchAll();
		$roles = array();

		foreach ($results as $result) {
			$role = new Application_Object_Website_Role();
			$role->roleCode = $result['role_code'];
			$role->roleLabel = $result['role_label'];
			$role->roleDefinition = $result['role_definition'];
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
		$tableFormat = $this->metadataModel->getTableFormatFromTableName('WEBSITE', 'PERMISSION');
		$db = $this->getAdapter();

		$req = " SELECT permission_code, COALESCE(t.label, permission_label) as permission_label ";
		$req .= " FROM permission_per_role ";
		$req .= " LEFT JOIN permission using (permission_code) ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = permission_code";
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
	 * Get the schemas accessible by the role.
	 *
	 * @param String the role code
	 * @return Array[schemaCode]
	 */
	public function getRoleSchemas($roleCode) {

		$db = $this->getAdapter();

		$req = " SELECT schema_code ";
		$req .= " FROM role_to_schema ";
		$req .= " WHERE role_code = ?";
		$this->logger->info('getRoleSchemas : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		$results = $query->fetchAll();
		$schemas = array();
		foreach ($results as $result) {
			$schemas[] = $result['schema_code'];
		}

		return $schemas;
	}

	/**
	 * Get the schemas accessible by the role.
	 *
	 * @param String the role code
	 * @return Array[String] list of forbidden datasets
	 */
	public function getDatasetRoleRestrictions($roleCode) {

		$db = $this->getAdapter();

		$req = " SELECT dataset_id ";
		$req .= " FROM dataset_role_restriction ";
		$req .= " WHERE role_code = ? ";
		$this->logger->info('getDatasetRoleRestrictions : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		$rows = $query->fetchAll();
		$result = array();
		foreach ($rows as $row) {
			$result[] = $row['dataset_id'];
		}

		return $result;
	}

	/**
	 * Get the schemas accessible by the role.
	 *
	 * @param String the role code
	 * @return Array[String] list of forbidden datasets
	 */
	public function getLayerRoleRestrictions($roleCode) {

		$db = $this->getAdapter();

		$req = " SELECT layer_name ";
		$req .= " FROM layer_role_restriction ";
		$req .= " WHERE role_code = ? ";
		$this->logger->info('getLayerRoleRestrictions : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		$rows = $query->fetchAll();
		$result = array();
		foreach ($rows as $row) {
			$result[] = $row['layer_name'];
		}

		return $result;
	}



	/**
	 * Get the all the available permissions.
	 *
	 * @return Array[permissionCode=>permissionLabel]
	 */
	public function getAllPermissions() {
		$tableFormat = $this->metadataModel->getTableFormatFromTableName('WEBSITE', 'PERMISSION');
		$db = $this->getAdapter();

		$req = " SELECT permission_code, COALESCE(t.label, permission_label) as permission_label ";
		$req .= " FROM permission ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = permission_code";

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

		$req = "UPDATE role SET role_label=?, role_definition=? WHERE role_code = ?";

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
	 * Update the role schemas.
	 *
	 * @param Role role
	 * @param Array[String] schemas
	 */
	public function updateRoleSchemas($role, $schemas) {
		$db = $this->getAdapter();

		// Clean the previous permissions
		$req = "DELETE FROM role_to_schema";
		$req .= " WHERE role_code = ?";

		$this->logger->info('deleteRoleSchemas : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($role->roleCode));

		// Insert the new ones
		if (!empty($schemas)) {
			foreach ($schemas as $schema) {
				$req = "INSERT INTO role_to_schema(role_code, schema_code) VALUES (?, ?)";

				$this->logger->info('updateRoleSchemas : '.$req);

				$query = $db->prepare($req);
				$query->execute(array($role->roleCode, $schema));
			}
		}

	}

	/**
	 * Update the role layer restrictions.
	 *
	 * @param Role role
	 * @param Array[String] layerRestrictions
	 */
	public function updateLayerRestrictions($role, $layerRestrictions) {
		$db = $this->getAdapter();

		// Clean the previous permissions
		$req = "DELETE FROM layer_role_restriction";
		$req .= " WHERE role_code = ?";

		$this->logger->info('updateLayerRestrictions : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($role->roleCode));

		// Insert the new ones
		if (!empty($layerRestrictions)) {
			foreach ($layerRestrictions as $layerRestriction) {
				$req = "INSERT INTO layer_role_restriction (role_code, layer_name) VALUES (?, ?)";

				$this->logger->info('updateLayerRestrictions : '.$req);

				$query = $db->prepare($req);
				$query->execute(array($role->roleCode, $layerRestriction));
			}
		}

	}

	/**
	 * Update the role dataset restrictions.
	 *
	 * @param Role role
	 * @param Array[String] datasetRestrictions
	 */
	public function updateDatasetRestrictions($role, $datasetRestrictions) {
		$db = $this->getAdapter();

		// Clean the previous permissions
		$req = "DELETE FROM dataset_role_restriction";
		$req .= " WHERE role_code = ?";

		$this->logger->info('updateDatasetRestrictions : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($role->roleCode));

		// Insert the new ones
		if (!empty($datasetRestrictions)) {
			foreach ($datasetRestrictions as $datasetRestriction) {
				$req = "INSERT INTO dataset_role_restriction (role_code, dataset_id) VALUES (?, ?)";

				$this->logger->info('updateDatasetRestrictions : '.$req);

				$query = $db->prepare($req);
				$query->execute(array($role->roleCode, $datasetRestriction));
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

		$req = " INSERT INTO role (role_code, role_label, role_definition )";
		$req .= " VALUES (?, ?, ?)";

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
		
		// Delete the schemas linked to the role
		$req = " DELETE FROM layer_role_restriction WHERE role_code = ?";
		$this->logger->info('deleteLayerRoleRestriction : '.$req);
		$query = $db->prepare($req);
		$query->execute(array($roleCode));
		
		// Delete the schemas linked to the role
		$req = " DELETE FROM dataset_role_restriction WHERE role_code = ?";
		$this->logger->info('deleteDatasetRoleRestriction : '.$req);
		$query = $db->prepare($req);
		$query->execute(array($roleCode));

		// Delete the schemas linked to the role
		$req = " DELETE FROM role_to_schema WHERE role_code = ?";
		$this->logger->info('deleteRoleSchemas : '.$req);
		$query = $db->prepare($req);
		$query->execute(array($roleCode));

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
