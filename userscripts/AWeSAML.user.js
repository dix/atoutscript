// ==UserScript==
// @name         AWeSAML
// @namespace    http://github.com/dix
// @version      2023.02.07.0
// @description  A nicer UI for AWS' SAML login form
// @author       http://github.com/dix
// @match        https://signin.aws.amazon.com/saml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aws.amazon.com
// @grant        GM_addElement
// ==/UserScript==

const envs_settings = [
    {prefix: 'sbx', id: 'SBX', img: '👩‍🔬', label: '- sandbox', background: '#f3e0d3', order: 0},
    {prefix: 'dev', id: 'DEV', img: '👩‍🔧', label: '- dev', background: '#ebf3d1', order: 1},
    {prefix: 'rec', id: 'REC', img: '👩‍🍳', label: '- re7', background: '#cff1e7', order: 2},
    {prefix: 'ppd', id: 'PREPROD', img: '👷‍♀️', label: '- preprod', background: '#d5d1f1', order: 3},
    {prefix: 'prd', id: 'PROD', img: '👩‍💼', label: '- prod', background: '#f0cede', order: 4},
    {prefix: 'OTHER', id: 'OTHER', img: '🧙‍♀️', label: '- autres', background: '#cedaf0', order: 5},
];


let roles = [];

(function () {
    'use strict';

    // Hidding old form DOM
    document.getElementById('saml_form').style.display = 'none';

    // Adding custom CSS
    generateCustomCSS();

    // Import Bootstrap
    GM_addElement('link', {
        href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
        rel: 'stylesheet'
    });

    // Adding main content DOM structure
    GM_addElement(document.getElementById('content'), 'div', {
        class: 'container text-center',
        id: 'wsml-main'
    });

    GM_addElement(document.getElementById('wsml-main'), 'div', {
        class: 'row align-items-start',
        id: 'wsml-row'
    });

    // Extracting the roles from the main DOM
    [...document.getElementsByClassName('saml-account')].filter(it => it.id === '').forEach(it => {
        roles = roles.concat(extractRoles(it));
    });

    // Sorting by order settings
    roles.sort((a, b) => envs_settings.find(x => x.id == a.env).order - envs_settings.find(y => y.id == b.env).order);

    // Creating column for each environment detected
    [...new Set(roles.map(x => x.env))].forEach(env => document.getElementById('wsml-row').appendChild(generateEnvColumn(env, roles.filter(x => x.env == env))));
})();


function convertRole(roleInput) {
    let name = roleInput.getElementsByClassName('saml-role-description')[0].innerText.match(/(?<=-)(.*)$/)[0];
    let radio = roleInput.getElementsByClassName('saml-radio')[0];
    return {name, radio};
}

function extractRoles(accountInput) {
    let rawName = accountInput.getElementsByClassName('saml-account-name')[0].innerText;
    let cleanedName = rawName.match(/(?<=\:\s)([^\s\(]+)(?=\s\()/)[0];
    let accountId = rawName.match(/(?<=\()\d+(?=\))/)[0];
    let env = extractEnv(cleanedName.toLowerCase());
    let roles = [...accountInput.getElementsByClassName('saml-role')].map(it => convertRole(it)).map((itt, index) => ({
        ...itt,
        env,
        id: accountId + index,
        full_name: getFullName(itt.name, cleanedName, env)
    }));
    return roles;
}

function getFullName(name, accountName, env) {
    // For OTHER env we need to specify both the role and account's names
    return env === 'OTHER' ? `${name} (${accountName})` : name;
}

function extractEnv(name) {
    let prefix = name.substring(0, 3);
    let env = envs_settings.find(x => x.prefix == prefix);
    return env ? env.id : 'OTHER';
}

function generateCustomCSS() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode('.wsml { display : none; }'));
    style.appendChild(document.createTextNode('.wsml-env-head { font-weight: bold; }'));
    style.appendChild(document.createTextNode('.wsml-account:hover { font-size : 1.1em; cursor: pointer; }'));
    style.appendChild(document.createTextNode('.wsml-env-head-img { font-size : 2em }'));

    // Generating class for each env
    envs_settings.forEach(x => {
        style.appendChild(document.createTextNode(`.wsml-${x.id.toLowerCase()} { background-color : ${x.background}; }`))
    });

    document.head.appendChild(style);
}

function generateEnvHeader(env) {
    let result = document.createElement('div');
    let img = document.createElement('span');
    img.appendChild(document.createTextNode(envs_settings.find(x => x.id == env).img));
    img.classList.add('wsml-env-head-img');
    result.appendChild(img);
    result.appendChild(document.createTextNode(envs_settings.find(x => x.id == env).label));
    result.classList.add('p-2');
    result.classList.add('m-2');
    result.classList.add('rounded');
    result.classList.add('wsml-' + env.toLowerCase());
    result.classList.add('wsml-env-head');
    return result;
}

function generateRoleItem(label, env, id, actOnClick) {
    let result = document.createElement('div');
    result.appendChild(document.createTextNode(label));
    result.classList.add('p-2');
    result.classList.add('m-2');
    result.classList.add('rounded-pill');
    result.classList.add('wsml-' + env.toLowerCase());
    result.classList.add('wsml-account');
    if (actOnClick) {
        result.onclick = function () {
            actOnClick(id);
        }
    }
    return result;
}

function generateEnvColumn(env, content) {
    let result = document.createElement('div');
    result.id = 'wsml-col-' + env;
    result.setAttribute('class', 'col');
    result.appendChild(generateEnvHeader(env));
    content.forEach(x => result.appendChild(generateRoleItem(x.full_name, env, x.id, handleClick)));
    return result;
}

function handleClick(id) {
    // Select the matching radio button
    roles.filter(x => x.id == id)[0].radio.click();
    // Submit form
    document.getElementById('signin_button').click();
}