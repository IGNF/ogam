<?php

namespace OGAMBundle\Entity\Mapping;

use Doctrine\ORM\Mapping as ORM;

/**
 * LegendItem
 *
 * @ORM\Table(name="mapping.layer_tree")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Mapping\LegendItemRepository")
 */
class LegendItem
{


    /**
     * The identifier of the item.
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="item_id", type="integer", unique=true)
     */
    private $itemId;

    /**
     * The identifier of the parent of the item.
     * @var int
     *
     * @ORM\Column(name="parent_id", type="integer")
     */
    private $parentId;

    /**
     * Defines if the item is a layer (a leaf) or a node.
     * @var bool
     *
     * @ORM\Column(name="is_layer", type="boolean", nullable=true)
     */
    private $isLayer;

    /**
     * Defines if the item is checked by default.
     * @var bool
     *
     * @ORM\Column(name="is_checked", type="boolean", nullable=true)
     */
    private $isChecked;

    /**
     * Defines if the item is hidden by default.
     * @var bool
     *
     * @ORM\Column(name="is_hidden", type="boolean", nullable=true)
     */
    private $isHidden;

    /**
     * Defines if the item is disabled (grayed) by default.
     * @var bool
     *
     * @ORM\Column(name="is_disabled", type="boolean", nullable=true)
     */
    private $isDisabled;

    /**
     * Defines if the node is expended by default.
     * @var bool
     *
     * @ORM\Column(name="is_expended", type="boolean", nullable=true)
     */
    private $isExpended;

    /**
     * The logical name of the layer in OpenLayers.
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=50)
     */
    private $layerName;

    /**
     * @var int
     *
     * @ORM\Column(name="position", type="integer", nullable=true)
     */
    private $position;

    /**
     * Checked group.
     * @var string
     *
     * @ORM\Column(name="checked_group", type="string", length=36, nullable=true)
     */
    private $checkedGroup;



    /**
     * Set itemId
     *
     * @param integer $itemId
     *
     * @return LegendItem
     */
    public function setItemId($itemId)
    {
        $this->itemId = $itemId;

        return $this;
    }

    /**
     * Get itemId
     *
     * @return int
     */
    public function getItemId()
    {
        return $this->itemId;
    }

    /**
     * Set parentId
     *
     * @param integer $parentId
     *
     * @return LegendItem
     */
    public function setParentId($parentId)
    {
        $this->parentId = $parentId;

        return $this;
    }

    /**
     * Get parentId
     *
     * @return int
     */
    public function getParentId()
    {
        return $this->parentId;
    }

    /**
     * Set isLayer
     *
     * @param boolean $isLayer
     *
     * @return LegendItem
     */
    public function setIsLayer($isLayer)
    {
        $this->isLayer = $isLayer;

        return $this;
    }

    /**
     * Get isLayer
     *
     * @return bool
     */
    public function getIsLayer()
    {
        return $this->isLayer;
    }

    /**
     * Set isChecked
     *
     * @param boolean $isChecked
     *
     * @return LegendItem
     */
    public function setIsChecked($isChecked)
    {
        $this->isChecked = $isChecked;

        return $this;
    }

    /**
     * Get isChecked
     *
     * @return bool
     */
    public function getIsChecked()
    {
        return $this->isChecked;
    }

    /**
     * Set isHidden
     *
     * @param boolean $isHidden
     *
     * @return LegendItem
     */
    public function setIsHidden($isHidden)
    {
        $this->isHidden = $isHidden;

        return $this;
    }

    /**
     * Get isHidden
     *
     * @return bool
     */
    public function getIsHidden()
    {
        return $this->isHidden;
    }

    /**
     * Set isDisabled
     *
     * @param boolean $isDisabled
     *
     * @return LegendItem
     */
    public function setIsDisabled($isDisabled)
    {
        $this->isDisabled = $isDisabled;

        return $this;
    }

    /**
     * Get isDisabled
     *
     * @return bool
     */
    public function getIsDisabled()
    {
        return $this->isDisabled;
    }

    /**
     * Set isExpended
     *
     * @param boolean $isExpended
     *
     * @return LegendItem
     */
    public function setIsExpended($isExpended)
    {
        $this->isExpended = $isExpended;

        return $this;
    }

    /**
     * Get isExpended
     *
     * @return bool
     */
    public function getIsExpended()
    {
        return $this->isExpended;
    }

    /**
     * Set layerName
     *
     * @param string $layerName
     *
     * @return LegendItem
     */
    public function setLayerName($layerName)
    {
        $this->layerName = $layerName;

        return $this;
    }

    /**
     * Get layerName
     *
     * @return string
     */
    public function getLayerName()
    {
        return $this->layerName;
    }

    /**
     * Set position
     *
     * @param integer $position
     *
     * @return LegendItem
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get position
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Set checkedGroup
     *
     * @param string $checkedGroup
     *
     * @return LegendItem
     */
    public function setCheckedGroup($checkedGroup)
    {
        $this->checkedGroup = $checkedGroup;

        return $this;
    }

    /**
     * Get checkedGroup
     *
     * @return string
     */
    public function getCheckedGroup()
    {
        return $this->checkedGroup;
    }
}

