const IS_CORDOVA_APP = !!window.cordova;
const NODEJS = typeof require === 'function';

function save_settings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

var settings = load_settings();

function load_settings() {
    return JSON.parse(localStorage.getItem('settings')) || {};
}

// my-periscope
function setSet(key, value) {
    var settings = load_settings();
    settings[key] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
}

function getSet(key, defaultValue) {
    var value = localStorage.getItem(key);
    if (typeof value === 'undefined')
    {
        value = defaultValue;
        setSet(key, value);
    }
    return value;
}
