package fr.ifn.ogam.common.util;

public class StringUtils {

	/**
	 * Formate un nombre en ajoutant des zéros à gauche.
	 */
	public static String formateNombre(int number, int size) {
		StringBuffer result = new StringBuffer();
		int numberOfZeros = size - Integer.toString(number).length();
		for (int i = 0; i < numberOfZeros; i++) {
			result.append("0");
		}

		return result.append(number).toString();
	}

	/**
	 * Remove the quotes from a String.
	 */
	public static String trimQuotes(String aString) {
		String subString = aString.trim();

		while (subString.startsWith("\"")) {
			subString = subString.substring(1);
		}
		while (subString.endsWith("\"")) {
			subString = subString.substring(0, subString.length() - 1);
		}
		return subString;

	}

	/**
	 * Formate un nombre en ajoutant des zéros à gauche. <br>
	 * Cette version est utilisée pour les départements, que l'on ne peut pas caster en nombre à cause de la Corse ("2A" et "2B").
	 */
	public static String formateNombre(String number, int size) {
		StringBuffer result = new StringBuffer();
		int numberOfZeros = size - number.length();
		for (int i = 0; i < numberOfZeros; i++) {
			result.append("0");
		}

		return result.append(number).toString();
	}

	/**
	 * Normalize numbers and delete all non-significative "0" in the String.
	 */
	public static String normalizeNumber(String aString) {
		if (aString == null) { // cas d'une chaine vide.
			return null;
		}
		if (aString.charAt(0) != '0') { // cas normal, la chaine ne commence pas
			// par 0.
			return aString;
		} else {
			if (aString.length() > 1) { // cas à traiter, on supprime le zéro de
				// début.
				return normalizeNumber(aString.substring(1));
			} else {
				return aString; // cas particulier où la chaîne ne contient que
				// des zéros.
			}
		}
	}

	/**
	 * Vérifie qu'une chaine n'est ni vide ni nulle.
	 */
	public static boolean isNotNull(String str) {
		return (str != null && !str.trim().equalsIgnoreCase(""));
	}

}
