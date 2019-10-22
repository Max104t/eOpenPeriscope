const IS_CORDOVA_APP = !!window.cordova;
const NODEJS = typeof require === 'function';

function save_settings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

var DefaultFolderFileNames = {
    partialShort: 'P',
    replayShort: 'R_',
    privateShort: 'PV_',
    producerShort: 'PRO_',
    folderName: '#{user_id} (#{username})',
    fileName: '#{private}#{partial}#{replay}#{year}-#{month}-#{day}_#{hour}.#{minute}_#{user_display_name}_#{status}'
};

var settings = load_settings() || {
    classic_cards_order: false,
    followingInterval: 15,
    refreshFollowingOnLoad: true,
    refreshTopOnLoad: true,
    replayTimeLimit: 3600,
    selectedUsersList: true
};

function load_settings() {
    return JSON.parse(localStorage.getItem('settings')) || {};
}

// my-periscope
function setSet(key, value) {
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
