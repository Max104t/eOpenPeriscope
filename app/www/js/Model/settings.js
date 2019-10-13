const GM_BROWSER = typeof GM_xmlhttpRequest === 'function';

function save_settings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function load_settings() {
    return JSON.parse(localStorage.getItem('settings')) || {};
}

var settings = load_settings();

// my-periscope
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function setSet(key, value) {
    settings[key] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
}
