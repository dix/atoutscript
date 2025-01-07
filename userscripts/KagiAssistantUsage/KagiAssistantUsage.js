// ==UserScript==
// @name        KagiAssistantUsage
// @description Display Kagi Assistant Usage Widget
// @match       https://kagi.com/assistant*
// @version     2025.01.07.0
// @author      https://github.com/dix
// @namespace   https://github.com/dix
// @icon        https://www.google.com/s2/favicons?sz=64&domain=kagi.com
// @downloadURL  https://github.com/dix/atoutscript/raw/refs/heads/main/userscripts/KagiAssistantUsage/KagiAssistantUsage.js
// @updateURL    https://github.com/dix/atoutscript/raw/refs/heads/main/userscripts/KagiAssistantUsage/KagiAssistantUsage.js
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function () {
    'use strict';

    function parseUsageData(responseText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseText, 'text/html');

        const table = doc.querySelector('.cons_table_box table');
        if (!table) return null;

        const data = [];
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 3) {
                data.push({
                    aiTokens: parseInt(cells[1].textContent.replace(/,/g, ''))
                });
            }
        });

        return data;
    }

    function fetchAndDisplayUsage() {
        GM.xmlHttpRequest({
            method: 'GET',
            url: 'https://kagi.com/settings?p=consumption&range=1',
            onload: function (response) {
                const usageData = parseUsageData(response.responseText);

                const displayBox = document.createElement('div');
                displayBox.style.cssText = `
                    position: fixed;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #262837;
                    padding: 7px;
                    border-radius: 4px;
                    z-index: 9999;
                    color: white;
                    font-size: 12px;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                    min-width: 100px;
                    text-align: center;
                `;

                if (usageData) {
                    const totalTokens = usageData.reduce((sum, month) => sum + month.aiTokens, 0);
                    displayBox.innerHTML = `
                        <p style="margin: 5px 0">Monthly Tokens Usage: ${totalTokens.toLocaleString()}</p>
                    `;
                } else {
                    displayBox.innerHTML = '<p>No usage data found</p>';
                }

                document.body.appendChild(displayBox);
            },
            onerror: function (error) {
                console.error('Error fetching usage data:', error);
            }
        });
    }

    fetchAndDisplayUsage();
})();