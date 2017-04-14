<?php
namespace Ign\Bundle\OGAMBundle\Repository\Website;

use Ign\Bundle\OGAMBundle\Entity\Website\PredefinedRequestCriterion;
use Ign\Bundle\OGAMBundle\Entity\Website\PredefinedRequestColumn;
use Ign\Bundle\OGAMBundle\Entity\Website\User;

/**
 * PredefinedRequestRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class PredefinedRequestRepository extends \Doctrine\ORM\EntityRepository {

	/**
	 * Get the list of predefined request (only the description, not the detailed fields and criteria).
	 *
	 * @param String $schema
	 *        	the database schema
	 * @param String $dir
	 *        	the direction of sorting (ASC or DESC)
	 * @param String $sort
	 *        	the sort column
	 * @param String $locale
	 *        	the locale
	 * @param User $user
	 *        	the user
	 * @return Array[PredefinedRequest] the list of requests
	 */
	public function getPredefinedRequestList($schema = 'RAW_DATA', $dir, $sort, $locale, $user) {
		
		// Translate the columns names
		$columnNames = array(
			'request_id' => 'pr.requestId',
			'label' => 'pr.label',
			'definition' => 'pr.definition',
			'date' => 'pr.date',
			'position' => 'prga.position',
			'is_public' => 'pr.isPublic',
			'group_id' => 'prg.groupId',
			'group_label' => 'prg.label',
			'group_position' => 'prg.position',
			'dataset_id' => 'ds.datasetId',
			'dataset_label' => 'ds.label'
		);
		if (in_array($sort, $columnNames, true)) {
			$sort = $columnNames[$sort];
		} else {
			$sort = $columnNames['label'];
		}
		$dirs = array(
			'ASC',
			'DESC'
		);
		if (!in_array($dir, $dirs, true)) {
			$dir = $dirs[0];
		}
		
		$qb = $this->_em->createQueryBuilder();
		$qb->select('pr, ds, prga, prg')
			->from('OGAMBundle:Website\PredefinedRequest', 'pr')
			->join('pr.datasetId', 'ds')
			->leftJoin('pr.groups', 'prga')
			->leftJoin('prga.groupId', 'prg')
			->where('pr.schemaCode = :schema')
			->orderBy($sort, $dir)
			->setParameters([
			    'schema' => $schema,
			    'userLogin' => $user->getLogin()
		]);

		$or = $qb->expr()->orx();
		$or->add("pr.isPublic = TRUE");
		if($user->isAllowed('MANAGE_OWNED_PRIVATE_REQUEST')){
		    $or->add("pr.userLogin = :userLogin AND pr.isPublic = FALSE");
		}
		$qb->andWhere($or);

		return $qb->getQuery()->getResult();
	}

	/**
	 * Get a predefined request.
	 *
	 * @param String $requestId
	 *        	the id of the request
	 * @param String $locale
	 *        	the locale
	 * @return PredefinedRequest the request
	 */
	public function getPredefinedRequest($requestId, $locale) {
		$qb = $this->_em->createQueryBuilder();
		$qb->select('pr, ds, prga, prg')
			->from('OGAMBundle:Website\PredefinedRequest', 'pr')
			->join('pr.datasetId', 'ds')
			->join('pr.groups', 'prga')
			->join('prga.groupId', 'prg')
			->where('pr.requestId = :requestId')
			->setParameters([
			'requestId' => $requestId
		]);
		
		$request = $qb->getQuery()->getSingleResult();
		
		// Get the request columns
		$pRColumnRepository = $this->_em->getRepository(PredefinedRequestColumn::class);
		$request->setColumns($pRColumnRepository->getPredefinedRequestColumns($requestId, $locale));
		
		// Get the request criteria
		$pRCriterionRepository = $this->_em->getRepository(PredefinedRequestCriterion::class);
		$request->setCriteria($pRCriterionRepository->getPredefinedRequestCriteria($requestId, $locale));
		
		return $request;
	}
}