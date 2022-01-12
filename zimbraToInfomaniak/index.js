const fs = require('fs');
const csvParser = require('csv-parse');
const csvWriter = require('csv-writer');
// Global variable 
const rows = [];

// ------------ ------------ ------------ ------------ ------------ //
// ------------ ------ Parameters variables ------ ------------ //
// ------------ Can be modified for user preferences ------------ //
// ------------ ------------ ------------ ------------ ------------ //
const inputFile = './in/Contacts.csv';
const outputFile = './out/zimbraToInfoResult.csv';


// ------------ Main Process ------------ //

console.info('Starting process for ', inputFile);
readAndCleanInput();

// ------------ Functions ------------ //

/**
 * Read the input CSV file and put cleaned items in the _rows_ global variable
 * Once done, call the method to write the result in the output file
 */
function readAndCleanInput() {

    // Create a dummy row to ease the matching process on Infomaniak's tool
    rows.push({
        prenom: 'prenom',
        nom: 'nom',
        societe: 'societe',
        proRue: 'proRue',
        proCP: 'proCP',
        proVille: 'proVille',
        proPays: 'proPays',
        persoRue: 'persoRue',
        persoCP: 'persoCP',
        persoVille: 'persoVille',
        persoPays: 'persoPays',
        mobile: 'mobile',
        proTel: 'proTel',
        persoTel: 'persoTel',
        portable: 'portable',
        dateNaissance: 'dateNaissance',
        email: 'email',
        emailPro: 'emailPro',
        emailAutre: 'emailAutre',
        note: 'note'
    })

    // Read the file and fills rows with cleaned data
    fs.createReadStream(inputFile)
        .pipe(csvParser.parse({ from: 2, delimiter: ';' })) // from 2 : skip headers (index 1)
        .on('data', function (data) {
            try {
                //console.info(data);

                // Building an item from a CSV data row
                let item = {};

                // 1 : Prénom => Prénom
                if (data[1]) {
                    //console.log('DATA :', data[1], data[1].trim());
                    item.prenom = data[1].trim();
                }
                // 3 : Nom de famille => Nom
                if (data[3]) {
                    // console.log('DATA :', data[3], data[3].trim());
                    item.nom = data[3].trim();
                }
                // 6 : Société => Société
                if (data[6]) {
                    // console.log('DATA :', data[6], data[6].trim());
                    item.societe = data[6].trim();
                }
                // 8 : Titre (useless)
                // if(data[8]){
                //     console.log('DATA :', data[8], data[8].trim());
                // }
                // 9 : Adresse pro => Adresse: rue/pro
                if (data[9]) {
                    // console.log('DATA :', data[9], data[9].trim());
                    item.proRue = data[9].trim();
                }
                // 10 : Rue pro (same as 9) => SKIP
                // if (data[10]) {
                //     console.log('DATA :', data[10], data[10].trim());
                // }
                // 11 : Ville pro => Adresse: ville/pro
                if (data[11]) {
                    // console.log('DATA :', data[11], data[11].trim());
                    item.proVille = data[11].trim();
                }
                // 13 : Code Postal pro => Adresse: code postal/pro
                if (data[13]) {
                    // console.log('DATA :', data[13], data[13].trim().replace(/\s/g, ''));
                    item.proCP = data[13].trim().replace(/\s/g, '');
                }
                // 14 : Pays pro => Adresse: pays/pro
                if (data[14]) {
                    // console.log('DATA :', data[14], data[14].trim());
                    item.proPays = data[14].trim();
                }
                // 15 : Adresse perso => Adresse: rue/perso
                if (data[15]) {
                    // console.log('DATA :', data[15], data[15].trim().replace(/\n/g, ' '));
                    item.persoRue = data[15].trim().replace(/\n/g, ' ');
                }
                // 16 : Rue perso (same as 15) => SKIP
                // if (data[16]) {
                //     console.log('DATA :', data[16], data[16].trim().replace(/\n/g, ' '));
                // }
                // 17 : Ville perso => Adresse: ville/perso
                if (data[17]) {
                    // console.log('DATA :', data[17], data[17].trim());
                    item.persoVille = data[17].trim();
                }
                // 19 : Code Postal perso => Adresse: code postal/perso
                if (data[19]) {
                    // console.log('DATA :', data[19], data[19].trim().replace(/\s/g, ''));
                    item.persoCP = data[19].trim().replace(/\s/g, '');
                }
                // 20 : Pays perso => Adresse: pays/perso
                if (data[20]) {
                    // console.log('DATA :', data[20], data[20].trim());
                    item.persoPays = data[20].trim();
                }
                // 28 : Téléphone pro => Téléphone/pro
                if (data[28]) {
                    // console.log('DATA :', data[28], cleanPhoneNumber(data[28]));
                    // Without mobile number, pro number becomes mobile number
                    if (!data[37]) {
                        item.mobile = cleanPhoneNumber(data[28]);
                    } else {
                        item.proTel = cleanPhoneNumber(data[28]);
                    }
                }
                // 33 : Télécopie perso (?) => Note
                if (data[33]) {
                    // console.log('DATA :', data[33], data[33]);
                    item.note = data[33].replace(/\n/g, '/');
                }
                // 34 : Téléphone perso => Téléphone perso
                if (data[34]) {
                    // console.log('DATA :', data[34], cleanPhoneNumber(data[34]));
                    // Without mobile & pro number, perso number becomes mobile number
                    if (!data[37] && !data[28]) {
                        item.mobile = cleanPhoneNumber(data[34]);
                    } else {
                        item.persoTel = cleanPhoneNumber(data[34]);
                    }
                }
                // 35 : Téléphone perso (bis) => Téléphone portable
                if (data[35]) {
                    // console.log('DATA :', data[35], cleanPhoneNumber(data[35]));
                    // Without perso number, perso bis becomes perso; portable otherwise
                    if (!item.persoTel) {
                        item.persoTel = cleanPhoneNumber(data[34]);
                    } else {
                        item.portable = cleanPhoneNumber(data[34]);
                    }
                }
                // 37 : Mobile => Téléphone principal
                if (data[37]) {
                    // console.log('DATA :', data[37], cleanPhoneNumber(data[37]));
                    item.mobile = cleanPhoneNumber(data[37]);
                }
                // 49 : Date de naissance => Date de naissance
                if (data[49]) {
                    // console.log('DATA :', data[49], data[49]);
                    item.dateNaissance = data[49];
                }
                // 54 : Adresse email => Email/perso
                if (data[54]) {
                    // console.log('DATA :', data[54], data[54].trim());
                    item.email = data[54].trim();
                }
                // 57 : Adresse email (bis) => Email/pro (if perso already taken)
                if (data[57]) {
                    // console.log('DATA :', data[57], data[57].trim());
                    // Without perso email, email bis becomes email
                    if (!data[54]) {
                        item.email = data[57].trim();
                    } else {
                        item.emailPro = data[57].trim();
                    }
                }
                // 60 : Adresse email (ter) => Email/autre (if pro already taken)
                if (data[60]) {
                    // console.log('DATA :', data[60], data[60].trim());
                    // Without perso & pro email, email ter becomes email; autre otherwise
                    if (!data[54] && !data[57]) {
                        item.email = data[60].trim();
                    } else {
                        item.emailAutre = data[60].trim();
                    }
                }
                // 74 : Notes => Note
                if (data[74]) {
                    // console.log('DATA :', data[74], data[74]);
                    item.note = item.note ? item.note.concat(' ', data[74].replace(/\n/g, '/')) : data[74].replace(/\n/g, '/');
                }

                // Add current item to the list of results
                rows.push(item);

            }
            catch (err) {
                console.error('Something wrong happened', err);
            }
        })
        .on('end', function () {
            // File treated, calling the method to produce the resulting file
            writeResult();
        });
}

/**
 * Write the result in an output CSV file
 */
function writeResult() {

    // Get writer on output file with given headers
    const csvWriterz = csvWriter.createObjectCsvWriter({
        path: outputFile,
        header: [
            { id: 'prenom', title: 'prenom' },
            { id: 'nom', title: 'nom' },
            { id: 'societe', title: 'societe' },
            { id: 'proRue', title: 'proRue' },
            { id: 'proCP', title: 'proCP' },
            { id: 'proVille', title: 'proVille' },
            { id: 'proPays', title: 'proPays' },
            { id: 'persoRue', title: 'persoRue' },
            { id: 'persoCP', title: 'persoCP' },
            { id: 'persoVille', title: 'persoVille' },
            { id: 'persoPays', title: 'persoPays' },
            { id: 'mobile', title: 'mobile' },
            { id: 'proTel', title: 'proTel' },
            { id: 'persoTel', title: 'persoTel' },
            { id: 'portable', title: 'portable' },
            { id: 'dateNaissance', title: 'dateNaissance' },
            { id: 'email', title: 'email' },
            { id: 'emailPro', title: 'emailPro' },
            { id: 'emailAutre', title: 'emailAutre' },
            { id: 'note', title: 'note' },
        ]
    });

    // Write items in the file
    csvWriterz.writeRecords(rows)
        .then(() => {
            console.log('Done.\nSee : ', outputFile);
        });
}

/**
 * Clean phone number by removing spaces and dots (12 34 -> 1234; 12.34 => 1234) and convert Fr numbers (start with 0 and length 10) to International (012 => +3312)
 * @param {*} num 
 * @returns 
 */
function cleanPhoneNumber(num) {
    return num.replace(/(\.|\s)/g, '').replace('0', (n, offset, str) => str.length === 10 && str.charAt(0) == 0 ? '+33' : n);
}