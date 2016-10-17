<?php

namespace OGAMBundle\Repository\Website;

use Doctrine\ORM\Query\ResultSetMappingBuilder;

/**
 * PredefinedRequestRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class PredefinedRequestRepository extends \Doctrine\ORM\EntityRepository
{
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
     * @return Array[PredefinedRequest] the list of requests
     */
    public function getPredefinedRequestList($schema = 'RAW_DATA', $dir, $sort, $locale) {

        // Translate the columns names
        $columnNames = array(
            'name' => 'pr.name',
            'label' => 'pr.label',
            'definition' => 'pr.definition',
            'date' => 'pr.date',
            'position' => 'prga.position',
            'group_name' => 'prg.name',
            'group_label' => 'prg.label',
            'group_position' => 'prg.position',
            'dataset_id' => 'ds.datasetId'
        );
        if (in_array($sort, $columnNames, true)) {
            $sort = $columnNames[$sort];
        } else {
            $sort = $columnNames['name'];
        }
        $dirs = array(
            'ASC',
            'DESC'
        );
        if (!in_array($dir, $dirs, true)) {
            $dir = $dirs[0];
        }

        $qb = $this->_em->createQueryBuilder();
        $qb->select('pr, ds, t, prga, prg')
            ->from('OGAMBundle:Website\PredefinedRequest', 'pr')
            ->join('pr.datasetId', 'ds')
            ->leftJoin('pr.translation', 't', 'WITH', "t.tableFormat = 'PREDEFINED_REQUEST' AND t.lang = upper(:lang)")
            ->join('pr.groups', 'prga')
            ->join('prga.groupName', 'prg')
            ->where('pr.schemaCode = :schema')
            ->orderBy($sort, $dir)
            ->setParameters([
                'schema' => $schema,
                'lang' => $locale
            ]);

        return $qb->getQuery()->getResult();
    }
}