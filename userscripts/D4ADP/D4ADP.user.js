// ==UserScript==
// @name         D4-ADP
// @namespace    https://github.com/dix/
// @version      2022.06.06
// @description  ADP but better
// @author       https://github.com/dix/
// @match        https://hr-services.fr.adp.com/*
// @icon         https://www.google.com/s2/favicons?domain=adp.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @downloadURL   https://github.com/dix/atoutscript/raw/main/userscripts/D4ADP/D4ADP.user.js
// @updateURL     https://github.com/dix/atoutscript/raw/main/userscripts/D4ADP/D4ADP.user.js
// ==/UserScript==

var statusRow;
var paramC;
var startDate;
var endDate;

(function () {
    'use strict';

    console.log('Welcome to D4-ADP!');

    if (document.getElementById('poi_content_ajax')) {

        // More height to the table to see the new rows
        const cont = document.getElementById('poi_content_ajax');
        cont.classList.remove('conteneur');
        cont.style = 'heigh : 500px;';

        // Observer on week pagination to render after changing week
        if (document.getElementById('dat_deb_fin')) {
            const observer = new MutationObserver(() => {
                setTimeout(function () {
                    renderRows();
                }, 500);
            });
            observer.observe(document.getElementById('dat_deb_fin'), {
                attributes: true,
                childList: true,
                subtree: true
            });
        }

        // First render on page load
        renderRows();

    }
})();

/**
 * Rendering the new rows
 */
function renderRows() {
    // Retrieving the week's dates from the paginator
    const weekDates = document.getElementById('dat_deb_fin').innerHTML.split(' ');
    startDate = moment(weekDates[1], 'DD/MM/YYYY');
    endDate = moment(weekDates[3], 'DD/MM/YYYY');

    // Retrieving global input hidden #curC
    paramC = new URLSearchParams(window.location.search).get('c');

    // Retrieving row displaying current status for each day of the week
    statusRow = document.getElementById('poi_content_ajax').getElementsByTagName('tbody')[0].querySelectorAll(':scope > tr')[2];

    // Adding listener on status row to manage delete action
    addDeleteListener();

    // Rows parameters
    const rowsParams = [];
    // TT
    rowsParams.push({
        content: '🏠',
        title: 'Ajouter 1/2 Télétravail Régulier',
        bgColor: '#E5A298',
        type: 'HO',
        adpClass: 'BC_D'
    });

    // TTO
    rowsParams.push({
        content: '⛺',
        title: 'Ajouter 1/2 Télétravail Occasionnel',
        bgColor: '#408080',
        type: 'TW',
        adpClass: 'BC_L'
    });

    // RTT
    rowsParams.push({
        content: '🚲',
        title: 'Ajouter 1/2 RTT',
        bgColor: '#CC6600',
        type: 'JS',
        adpClass: 'BC_H'
    });

    // CP
    rowsParams.push({
        content: '🚄',
        title: 'Ajouter 1/2 CP',
        bgColor: '#800080',
        type: 'CP',
        adpClass: 'BC_J'
    });

    // Building and adding the new rows
    rowsParams.forEach(r => document.getElementById('poi_content_ajax').getElementsByTagName('tbody')[0].appendChild(generateRow(r)));
}

/**
 * Generating a new row based on the given settings
 * @param {*} settings Global settings for the raw
 * @returns HTMLTableRowElement
 */
function generateRow(settings) {
    const trResult = document.createElement('tr');
    trResult.classList.add(...['c', 'height_23']);

    // Building the 14 columns (7 days divided in 2 columns each)
    for (let ij = 0; ij < 7; ij++) {
        // Incrementing date from first day of the week
        const day = startDate.clone();
        day.add(ij, 'd');
        // Building the two columns for each day
        // Morning
        trResult.appendChild(generateCol(settings, { date: day, half: 'M', dayIndex: ij }));
        // Afternoon
        trResult.appendChild(generateCol(settings, { date: day, half: 'A', dayIndex: ij }));
    }

    return trResult;
}

/**
 * Generating a new column based on the given settings
 * @param {*} settingsRow Global settings for the raw
 * @param {*} settingsCol Specific settings for the column (date...)
 * @returns HTMLTableCellElement
 */
function generateCol(settingsRow, settingsCol) {
    const halfDayCol = document.createElement('td');
    halfDayCol.classList.add(...['detailJournalier', 'td_hre_cont']);
    halfDayCol.style = `font-size : 1.5em; background-color : ${settingsRow.bgColor};`;
    halfDayCol.innerHTML = settingsRow.content;
    halfDayCol.title = settingsRow.title;

    const formattedDate = settingsCol.date.format('DD/MM/YYYY');

    // Click on column : Submit request for the half-day period matching the column's date
    halfDayCol.onclick = () => {
        // Make request for half-day
        submitPeriod({
            row: settingsRow,
            half: settingsCol.half,
            date: formattedDate,
            dayIndex: settingsCol.dayIndex
        });
    };

    // CTRL+Right-click on column : Submit request for the whole day period matching the column's date
    halfDayCol.oncontextmenu = (event) => {
        if (event.ctrlKey) {
            // Block contextmenu
            event.preventDefault();

            // Make request for the whole day
            submitPeriod({
                row: settingsRow,
                half: 'J',
                date: formattedDate,
                dayIndex: settingsCol.dayIndex
            });

            // Block contextmenu
            return false;
        }
    };
    return halfDayCol;
}

/**
 * Delete an event for the given data and update the status row
 *
 * WARNING !
 * The removal of an event is done in two steps :
 * - first we retrieve events associated with djinfo criterias (call done in the current method)
 * - then we request the backend to delete events using their IDs found in the response to the first request (done in treatDailyEventListToDelete)
 *
 * The main page/status row from which the request is made by the user doesn't carries enough data (the event IDs) to execute the request with one call to the backend.
 * That's why deleteDailyEvent is making a first call but the actual removal is done in its callback treatDailyEventListToDelete
 *
 *
 * @param {} Data about the event
 */
function deleteDailyEvent(djInfos) {

    // Building payload from settings and fields within the page
    const payload = {
        mat: document.getElementById('mat')?.value,
        soc: document.getElementById('soc')?.value,
        nom: djInfos.nom,
        dat_jou: djInfos.dat_jou,
        typ_ptg: djInfos.typ_ptg,
        sin: djInfos.sin,
        COLONNE_TRI: '',
        FLAG_TRI: '',
        TRI: ''
    };

    // Call the backend to retrieve list of events associated to the data and treat them
    apiCall('detail_journalier', 'EVENEMENTS', payload, treatDailyEventListToDelete);
}

/**
 * Delete active events found in the list provided
 * @param {} List of events retrieved from the backend
 */
function treatDailyEventListToDelete(data) {
    // The response is an HTML page, we parse it and retrieve content within
    let htmlDoc = stringToHtml(data);
    let listTr = htmlDoc.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // Filter the results to keep only active events (we don't want to delete events that have already been deleted)
    let infosIdsToDelete = [...listTr].filter(tr => tr.getAttribute('infosId')).map(tr => JSON.parse(tr.getAttribute('infosId'))).filter(infosId => infosId.STATUT !== '101');

    if (infosIdsToDelete.length > 0) {

        const payload = {
            EVTS: JSON.stringify(infosIdsToDelete)
        }

        // Call the backend to delete the events and refresh the status row on success
        apiCall('EVENEMENTS', 'CONSULTATION_SUPPRIMER', payload, refreshStatusRow);
    }
}

/**
 * Submitting event request based on the given settings
 * @param {*} settings
 */
function submitPeriod(settings) {
    // Building payload from settings and fields within the page
    const payload = {
        contexte: 'E',
        selectedNature: settings.row.type,
        f1_val: 'D',
        mat: document.getElementById('mat')?.value,
        soc: document.getElementById('soc')?.value,
        date_deb: settings.date,
        date_fin: settings.date,
        hdeb: '',
        hrj_deb: 0,
        hfin: '',
        hrj_fin: 0,
        haff_deb: '00:00',
        haff_fin: '23:59',
        tps: '',
        codplg: settings.half,
        codplg1: 'A',
        codplg2: 'M',
        qte1: 0,
        qte2: 0,
        lieu: 0,
        poste: '',
        equipe: '',
        qualif: '',
        nivQualif: 0,
        comment: '',
        opt_envoi_mail: 0
    };

    // Call the backend and update status row on success
    apiCall('evenements', 'SAISIR', payload, refreshStatusRow);
}

/**
 * Refresh the status row to show the user the success of their actions
 */
function refreshStatusRow() {
    // Building payload
    const payload = {
        date_deb: startDate.format('DD/MM/YYYY'),
        date_fin: endDate.format('DD/MM/YYYY'),
        periodicite: '1'
    }

    // Call the backend and update status row on success
    apiCall('declaration', 'CONS_POI_DAY', payload, refreshStatusRowFromData);
}

/**
 * Rebuild the status row from the given data
 * @param {} Page content retrieved from the backend
 */
function refreshStatusRowFromData(data) {
    // The response is an HTML page, we parse it and retrieve content within
    let htmlDoc = stringToHtml(data);
    let extractedStatusRow = htmlDoc.getElementsByTagName('tbody')[0].querySelectorAll(':scope > tr')[2];

    // First we empty the current row
    while (statusRow.firstChild) {
        statusRow.removeChild(statusRow.firstChild);
    }

    // Then refill it with the fresh data
    while (extractedStatusRow.firstChild) {
        statusRow.appendChild(extractedStatusRow.firstChild.cloneNode(true));
        extractedStatusRow.removeChild(extractedStatusRow.firstChild);
    }

    // Finally add listeners on the new content to manage delete event
    addDeleteListener();
}

/**
 * Generic method to call ADP's backend
 * Uses dojo library included by ADP
 * @param moduleAjax module_ajax parameter value
 * @param actionAjax action_ajax parameter value
 * @param payload the payload
 * @param callbackSuccess the function to call in case of success
 */
function apiCall(moduleAjax, actionAjax, payload, callbackSuccess) {
    if (typeof dojo !== 'undefined') {
        // Making the actual request to the backend
        // Using dojo (provided by ADP) to handle the request and some safety stuff
        dojo.xhrPost({
            url: `index.ajax.php?c=${paramC}&module_ajax=${moduleAjax}&action_ajax=${actionAjax}`,
            content: payload,
            preventCache: true,
            load: (data) => {
                callbackSuccess(data)
            },
            error: (er) => {
                console.error('It failed!', er);
            }
        });
    }
}

/**
 * Parse string using vanilla DOMParser to get HTML Document
 * @param data the string data
 * @returns {Document}
 */
function stringToHtml(data) {
    return new DOMParser().parseFromString(data, 'text/html');
}

/**
 * Add CTRL+Right-click listener on status row to handle delete action of events
 */
function addDeleteListener() {
    statusRow.querySelectorAll('td').forEach(col => {
        col.oncontextmenu = (event) => {
            if (event.ctrlKey) {
                // Block contextmenu
                event.preventDefault();

                deleteDailyEvent(getDjInfos(col));

                // Block contextmenu
                return false;
            }
        }
    });
}


/**
 * Retrieve ADP's djinfos from a given column
 * @param {*} Column from which to retrieve the data
 * @returns {} Data
 */
function getDjInfos(col) {
    let djInfos = col.getAttribute('djinfos').split('*');
    return {
        nom: decodeURI(djInfos[2]),
        typ_ptg: djInfos[3],
        dat_jou: djInfos[4],
        sin: djInfos[6]
    };
}
