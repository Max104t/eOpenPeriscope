function save_settings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function load_settings() {
    return JSON.parse(localStorage.getItem('settings')) || {};
}
