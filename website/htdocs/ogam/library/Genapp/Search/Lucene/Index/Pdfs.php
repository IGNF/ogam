<?php
class Genapp_Search_Lucene_Index_Pdfs
{
    /**
     * Extract data from a PDF document and add this to the Lucene index.
     *
     * @param string $pdfPath                       The path to the PDF document.
     * @param Zend_Search_Lucene_Proxy $luceneIndex The Lucene index object.
     * @return Zend_Search_Lucene_Proxy
     */
    public static function index($pdfPath, $luceneIndex, $filesMetadata)
    {
        // Load the PDF document.
        $pdf = Zend_Pdf::load($pdfPath);
        $key = md5($pdfPath);
  
        /**
         * Set up array to contain the document index data.
         * The Filename will be used to retrive the document if it is found in
         * the search resutls.
         * The Key will be used to uniquely identify the document so we can
         * delete it from the search index when adding it.
         */
        $indexValues = array(
            'Filename'     => $pdfPath,
            'Key'          => $key
        );

        // Short File name
		$splitedFilename = preg_split("/[\\/\\\\]+/",$pdfPath);
		$shortFileName = $splitedFilename[count($splitedFilename)- 1];

		// Small file name and Extension
		$smallFilename	= preg_split("/[\\.]+/",$shortFileName);
		$extension = array_pop($smallFilename);
		$smallFilename = implode(".", $smallFilename);

		// Set the 'FileName', 'ShortFileName', 'Extension'
        if(in_array('ShortFileName', $filesMetadata)){
            $indexValues['ShortFileName'] = $shortFileName;
        }
        if(in_array('SmallFileName', $filesMetadata)){
            $indexValues['SmallFileName'] = $smallFilename;
        }
        if(in_array('Extension', $filesMetadata)){
            $indexValues['Extension'] = $extension;
        }

        // Go through each meta data item and add to index array.
        foreach ($pdf->properties as $meta => $metaValue) {
            switch ($meta) {
                /* case 'CreationDate':
                    $dateCreated = $pdf->properties['CreationDate'];
  
                    $distance = substr($dateCreated, 16, 2);
                    if (!is_long($distance)) {
                        $distance = null;
                    }
                    // Convert date from the PDF format of D:20090731160351+01'00'
                    $dateCreated = mktime(substr($dateCreated, 10, 2), //hour
                        substr($dateCreated, 12, 2), //minute
                        substr($dateCreated, 14, 2), //second
                        substr($dateCreated,  6, 2), //month
                        substr($dateCreated,  8, 2), //day
                        substr($dateCreated,  2, 4), //year
                        $distance); //distance
                    $indexValues['CreationDate'] = $dateCreated;
                    break;*/
                default:
                    if(in_array($meta, $filesMetadata)){
                    	$config = Zend_Registry::get('configuration');
                    	//$filesCharset = $config->indices->$indexKey->filesCharset;
			            //$value = iconv('ISO-8859-1', "UTF-8", $pdf->properties[$meta]);
                        //$indexValues[$meta] = $value;
                        $indexValues[$meta] = $pdf->properties[$meta];
                    }
                    break;
            }
        }
  
        /**
         * Parse the contents of the PDF document and pass the text to the
         * contents item in the $indexValues array.
         */
        $pdfParse                = new Genapp_Search_Helper_PdfParser();
        $indexValues['Contents'] = $pdfParse->pdf2txt($pdf->render());

        // Create the document using the values
        $doc = new Genapp_Search_Lucene_Document($indexValues);
        if ($doc !== false) {
            // If the document creation was sucessful then add it to our index.
            $luceneIndex->addDocument($doc);
        }
  
        // Return the Lucene index object.
        return $luceneIndex;
    }
}