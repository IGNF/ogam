package fr.ifn.ogam.common.database.metadata;

import java.math.BigDecimal;

/**
 * A Range.
 */
public class RangeData {

	private BigDecimal minValue;

	private BigDecimal maxValue;

	/**
	 * @return the minValue
	 */
	public BigDecimal getMinValue() {
		return minValue;
	}

	/**
	 * @param minValue
	 *            the minValue to set
	 */
	public void setMinValue(BigDecimal minValue) {
		this.minValue = minValue;
	}

	/**
	 * @return the maxValue
	 */
	public BigDecimal getMaxValue() {
		return maxValue;
	}

	/**
	 * @param maxValue
	 *            the maxValue to set
	 */
	public void setMaxValue(BigDecimal maxValue) {
		this.maxValue = maxValue;
	}

}
