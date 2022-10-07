// ==UserScript==
// @name         fAWSicon
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD6ElEQVRYR82XW2yUVRDHf193WyqElgKJrIiUSwWXBwxGKxgNIeCDPhieIASiRsObBh/kYqKSVKE0hsuDD0QUYkIghESjIWqivEG4KSiNRS1ouQgtFMqlLbtbevzPnm23XYvs1mVhky/7fefMmfmf/8w5MxOQ5c+toJwKXpT4HByPEzBe7yNSy9s01qTnmMZ/IMaeYDXXslEd3EnIreFRilgpuYV6HriTfGq+U2B2EKI2WM4f/7XmtgDcehmL84EWv6GnOEvDmWIJDWyimfeCDXQOpGNAAK6OKrr5QgumDdJw5rLjYnG+2DiZOfEvAO5DZoi67yQ4Ok/GvRrHRcXHvGAlP/fV2w9Aauf78248bbGFBLOCd9NM9AJwqxnKEA4LZTSvO89U5vhFp6Rap+SmTaUB1LJB38vuqvG08jq5YkUvALeOKQq6esEJFwhAXK6ImiuSDLi1bJPxlwtkvMfMJ2JhaSDjFRr5WwBKCwygXTYjgW66JTqjnxfYeI+5BYGrZau+XrlHADabCyyBTE8CGDYGOloUFN2FweM4aADaBKCcMiW3cc/Br9th5BR4cAY07ITKefDnt/D0O3BgDTwyG7piUFEF3brqb17WcwWunYH287kBdzSbC2y7AVMXeAaOfgzRJRrScL1CI7oYTn4tAEqIP2nOAMSvQ/NRiLVBSLFbNg4u/w4TnpemkAfRtBeqXhLYDmg9Id0RKBnun8YvxfRFk4oZgC69hBjzpN+NTVQv16IG6GxVHhwKYWXhxq9gshS6W3BiF4x9RsqGQekorbkgQMfE1lzPWlDkmTt/yLPzmGVynfiGHTCkHB6a6VmFW+aCS5ob1Qsg8hSc3efpnfQC/LYbnlVW/l5ZeXYdHNkkBdVwtUnL4xAR8OunPQBj8bR2bu5sb4bhYzV3Tu6aDEVixsCVlMHDAn/qG0tQrcbAESF5grCo7NbubLfxVDFjdBndtsjGDH3sqqd45FSv1KgPlYhqpfuw2BoxUfEgQOae8kqvz1yQ1GV6xUSxmEvcMAA/GoAtGn0tt+jJk7RjiwFYJHUK/XvwcywyAOIVOz/Z1nv5QtqhhBzxyaiWz/T3ar40Z6nnUyWj1z0AX/nW63WwxWeWNnvFEgrAaLCKxnRBspb1CtC3ctU0SPmPtPu3bW3/kqwU3Rx5q4QHxuY4TotKslSZ3r8orVE5XszdLUqLVJT2Kc/vr7K8h7O8NyZGe5cakz7leI+t27dmVqaXUqNoffN/FKsW7Rvl8/dzas36Ro+rUcUcVnMaoEyT9WWlHKzmNME67XpwzWlmCKduTN+eo/bcUZksZFzyLCnz8FeyPYe9ubTn/wDYdTvQEomaUwAAAABJRU5ErkJggg==
// @namespace    https://github.com/dix/atoutscript
// @version      2022.10.07.1
// @description  Matching the favicon with the service currently opened in the AWS Management Console; hugely inspired by https://github.com/b0o/aws-favicons-webextension
// @author       https://github.com/dix/
// @match        https://*.console.aws.amazon.com/*
// @connect      github.com
// @connect      githubusercontent.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest

// ==/UserScript==

const servicesStorageKey = "services";
const cacheTimestampStorageKey = "cacheTimestamp";

(async () => {
    let services = await GM_getValue(servicesStorageKey, {});
    const cacheTimestamp = await GM_getValue(cacheTimestampStorageKey, Date.now());

    // Managing cache for services list
    if(Object.keys(services).length < 1 || isCacheExpired(cacheTimestamp)){
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://github.com/b0o/aws-favicons-webextension/raw/main/services.json",
            responseType: "json",
            onload: function(response) {
                services = JSON.parse(response.responseText);
                GM_setValue(servicesStorageKey, services);
                GM_setValue(cacheTimestampStorageKey, Date.now());
            }});
    }

    // Main code
    const service = getAwsServiceForURL(services, window.location)
    if (service) {
        await setFavicon(getFaviconURL(service))
    }

})();

function isCacheExpired(cacheTimestamp){
    return addDays(new Date(cacheTimestamp), 7).getTime() <= Date.now();
}

function addDays(date, days){
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function awsBaseURL(u) {
    if (typeof u === "string" && !u.match(/^http(s)?:\/\//)) {
        const _u = new URL("https://console.aws.amazon.com")
        _u.pathname = u
        u = _u
    }
    const url = u instanceof URL ? u : new URL(u)
    url.search = ""
    url.hash = ""
    url.pathname = url.pathname.split("/").at(1) ?? ""
    url.hostname = url.hostname.replace(
        /[^.]+\.(console\.aws\.amazon\.com)$/,
        "$1"
    )
    return `${url.hostname}${url.pathname.replace(/\/+/, "/").replace(/\/$/, "")}`
}

function getAwsServiceForURL(services, url) {
    const bu = awsBaseURL(url)
    return services[bu]
}

function getFaviconURL(service) {
    return `https://github.com/b0o/aws-favicons-webextension/raw/main/icons/${service.id}.svg`
}

async function setFavicon(href) {
    let link = document.querySelector("link[rel=icon]")
    if (link) {
        if (link.href === href) {
            return
        }
    } else {
        link = document.createElement("link")
        document.head.appendChild(link)
    }
    link.type = "image/svg+xml"
    link.rel = "icon"
    link.href = href
}