// ==UserScript==
// @name         D4-ADP
// @namespace    https://github.com/dix/
// @version      2022.04.05
// @description  ADP but better
// @author       https://github.com/dix/
// @match        https://hr-services.fr.adp.com/*
// @icon         https://www.google.com/s2/favicons?domain=adp.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @downloadURL   https://github.com/dix/atoutscript/tree/main/userscripts/D4ADP/D4ADP.user.js
// @updateURL     https://github.com/dix/atoutscript/tree/main/userscripts/D4ADP/D4ADP.user.js
// ==/UserScript==

var statusRow;

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
                setTimeout(function () { renderRows(); }, 500);
            });
            observer.observe(document.getElementById('dat_deb_fin'), { attributes: true, childList: true, subtree: true });
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
    const startDate = moment(weekDates[1], 'DD/MM/YYYY');
    const endDate = moment(weekDates[3], 'DD/MM/YYYY');

    // Row displaying current status of choices
    statusRow = document.getElementById('poi_content_ajax').getElementsByTagName('tbody')[0].querySelectorAll(':scope > tr')[2];

    // Rows parameters
    // Start by reseting the
    const rowsParams = [];
    // TT
    rowsParams.push({
        content: '🏠',
        title: 'Ajouter 1/2 Télétravail Régulier',
        bgColor: '#E5A298',
        type: 'HO',
        adpClass : 'BC_D',
        startDate: startDate,
        endDate: endDate
    });

    // TTO
    rowsParams.push({
        content: '⛺',
        title: 'Ajouter 1/2 Télétravail Occasionnel',
        bgColor: '#408080',
        type: 'TW',
        adpClass : 'BC_L',
        startDate: startDate,
        endDate: endDate
    });

    // RTT
    rowsParams.push({
        content: '🚲',
        title: 'Ajouter 1/2 RTT',
        bgColor: '#CC6600',
        type: 'JS',
        adpClass : 'BC_H',
        startDate: startDate,
        endDate: endDate
    });

    // CP
    rowsParams.push({
        content: '🚄',
        title: 'Ajouter 1/2 CP',
        bgColor: '#800080',
        type: 'CP',
        adpClass : 'BC_J',
        startDate: startDate,
        endDate: endDate
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
        const day = settings.startDate.clone();
        day.add(ij, 'd');
        // Building the two columns for each day
        // Morning
        trResult.appendChild(generateCol(settings, { date: day, half: 'M', dayIndex: ij}));
        // Afternoon
        trResult.appendChild(generateCol(settings, { date: day, half: 'A', dayIndex: ij}));
    }

    return trResult;
}

/**
 * Generating a new row based on the given settings
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

    const formatedDate = settingsCol.date.format('DD/MM/YYYY');

    // Click on column : Submit request for the half-day period matching the column's date
    halfDayCol.onclick = () => {
        // Make request for half-day
        submitPeriod({
            row: settingsRow,
            half: settingsCol.half,
            date: formatedDate,
            dayIndex: settingsCol.dayIndex
        });
    };

    // CTRL+Right-click on column : Submit request for the whole day period matching the column's date
    halfDayCol.oncontextmenu = (event) => {
        if (window.event.ctrlKey) {
            // Block contextmenu
            event.preventDefault;

            // Make request for the whole day
            submitPeriod({
                row: settingsRow,
                half: 'J',
                date: formatedDate,
                dayIndex: settingsCol.dayIndex
            });

            // Block contextmenu
            return false;
        }
    };
    return halfDayCol;
}

/**
 * Submitting event request based on the given settings
 * @param {*} settings
 */
function submitPeriod(settings) {
    // Also input hidden #curC apparently
    const paramC = new URLSearchParams(window.location.search).get('c');

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

    //console.debug('Payload :', payload);

    if (typeof dojo !== 'undefined') {

        // Making the actual request to the backend
        // Using dojo (provided by ADP) to handle the request and some safety stuff
        dojo.xhrPost({
            url: `index.ajax.php?c=${paramC}&module_ajax=evenements&action_ajax=SAISIR`,
            content: payload,
            preventCache: true,
            load: () => { addToStatusRow(settings); },
            error: (er) => { console.error('It failed!', er); }
        });
    }
}

/**
 * Add the newly created event in the status row to show the user the success of their actions
 * @param {*} settings
 */
function addToStatusRow(settings){
    switch (settings.half){
        case 'M' :
            // Morning
            statusRow.querySelectorAll('td')[settings.dayIndex * 2].classList.add(...[settings.row.adpClass]);
            break;
        case 'A' :
            // Afternoon
            statusRow.querySelectorAll('td')[(settings.dayIndex * 2) +1 ].classList.add(...[settings.row.adpClass]);
            break;
        default :
            // Whole day
            statusRow.querySelectorAll('td')[settings.dayIndex * 2 ].classList.add(...[settings.row.adpClass]);
            statusRow.querySelectorAll('td')[(settings.dayIndex * 2) +1 ].classList.add(...[settings.row.adpClass]);
    }
}