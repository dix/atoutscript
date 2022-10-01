// ==UserScript==
// @name         Parcel : BackInLight
// @description  Breaks parcelapp.net dark theme's media queries to stay on light theme even with a dark configured browser
// @version      2022.10.01.1
// @namespace    https://github.com/dix/atoutscript/
// @downloadURL  https://github.com/dix/atoutscript/raw/main/userscripts/ParcelBackInLight.user.js
// @updateURL    https://github.com/dix/atoutscript/raw/main/userscripts/ParcelBackInLight.user.js
// @author       https://github.com/dix
// @match        https://web.parcelapp.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    [...document.styleSheets[0].cssRules].forEach((c) => {
        if(c.media && c.media.mediaText.endsWith('dark)')){
            c.media = c.media.mediaText.replace('dark)', 'nope)');
        }
    });
})();