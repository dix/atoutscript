// ==UserScript==
// @name         DataGalaxy ID Extractor
// @namespace    http://github.com/dix
// @version      2022.12.01.0
// @description  KISS Script to retrieve ID of DataGalaxy object from the UI
// @author       http://github.com/dix
// @match        https://*.datagalaxy.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=datagalaxy.com
// ==/UserScript==

(function() {
    'use strict';
    document.onclick = function(){
        const props = document.getElementsByClassName('ag-row');
        if(props && props.length > 0){
            Array.from(props).forEach((el) => {
                el.onclick = function(e){
                    if(e.shiftKey){
                        prompt(`ID du Usage [${el.getElementsByClassName('entity-name')[0].innerHTML}]`, el.getAttribute('row-id'));
                    }

                };
            });
        }
    };
})();