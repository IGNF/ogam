# How to add a full copy of the taxref to your database
## Donwload the taxref
- [Download](https://inpn.mnhn.fr/telechargement/referentielEspece/referentielTaxo) the referantial in text format,
- Copy the downloaded file into the "./Referentiels" directory.

## Load the good file
- Open the "2-Import_ModTaxRef-v8.0.sql" file,
- Uncomment the line and change the version number (if necessary):
```
--\COPY taxref FROM './Referentiels/TAXREFv80.txt' with null '';
```
- Comment the line:
```
\COPY taxref FROM './Referentiels/TAXREFv80_For_Small_Sample_Data.txt' with null '';
```