const IS_CORDOVA_APP = !!window.cordova;
const NODEJS = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

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

function getTimeStamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day =`${date.getDate()}`.padStart(2, '0');
    const h = `${date.getHours()}`.padStart(2, '0');
    const m = `${date.getMinutes()}`.padStart(2, '0');
    const s = `${date.getSeconds()}`.padStart(2, '0');
    return `${year}${month}${day}${h}${m}${s}`;
}

function download_settings() {
    const ts = getTimeStamp();
    const loginTwitter = JSON.parse(localStorage.getItem('loginTwitter')) || {};
    const user_name = loginTwitter["user"]["username"] || "settings";
    var filename = `${user_name}_${ts}.json`;
    var data = [];
    for(var i=0;i<localStorage.length; i++) {
        var key = localStorage.key( i );

        var item = localStorage.getItem( key );
        try {
            item = JSON.stringify(JSON.parse(item));
        } catch(err) {
            item = `"${item}"`;
        }

        data.push(`"${key}":${item}`);
    }
    let text = `{${data}}`;

    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
