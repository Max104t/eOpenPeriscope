var Inits= {
    Map: function () { },
    ApiTest: function () {
        ApiTestController.init($('#right'));
    },
    Groups: function (){
        GroupsController.init($('#right'), function() {});
    },
    Top: function () {
        TopController.init($('#right'));
    },
    Search: function () {},
    Following: function () {
        FollowingController.init($('#right'));
    },
    Create: function () {},
    Chat: function () {},
    User: function () {
        UserController.init($('#right'));
    },
    People: function () {
        PeopleController.init($('#right'));
    },
    Edit: function () {},
    Dmanager: function () {},
    Console: function () {}
};

var IMG_PATH = '';
var oauth_token = localStorage.getItem('oauth_token'),
oauth_verifier = localStorage.getItem('oauth_verifier'),
session_key = localStorage.getItem('session_key'),
session_secret = localStorage.getItem('session_secret'),
loginTwitter = localStorage.getItem('loginTwitter');

var PeriscopeWebClient = {
    CreateMainWindow: function () {
        if (location.href == 'https://api.twitter.com/oauth/authorize') {
            location.href = $('meta[http-equiv="refresh"]').attr('content').substr(6).replace('twittersdk://openperiscope/index.html', 'http://example.net/');
        } else {
            $('style').remove();
            $(document.head).append('<meta name="referrer" content="no-referrer" />');
            if (!GM_BROWSER) {
                $(document.head).append('<link rel="stylesheet" href="./css/style.css" />')
            } else {
                var resourceText = GM_getResourceText("CSS").replace(/url\("/g, 'url("' + IMG_PATH);
                GM_addStyle(resourceText);
            }

            document.title = 'My-OpenPeriscope';

            if (loginTwitter) {
                loginTwitter = JSON.parse(loginTwitter);
            }
            if (loginTwitter.user) {
                PeriscopeWebClient.Ready(loginTwitter);
                PeriscopeWebClient.RefreshProfile(loginTwitter);
            } else if (session_key && session_secret) {
                SignIn3(session_key, session_secret);
            } else if (oauth_token && oauth_verifier) {
                SignIn2(oauth_token, oauth_verifier);
            } else if ((oauth_token = getParameterByName('oauth_token')) && (oauth_verifier = getParameterByName('oauth_verifier'))) {
                localStorage.setItem('oauth_token', oauth_token);
                localStorage.setItem('oauth_verifier', oauth_verifier);
                SignIn2(oauth_token, oauth_verifier);
            } else {
                var signInButton = $('<a class="button">Sign in with twitter</a>').click(SignIn1);
                var signInSMSButton = $('<a class="button">Sign in with SMS</a>').click(SignInSMS);
                var signInSidButton = $('<a class="button">Sign in with SID</a>').click(SignInSessionID);
                $(document.body).html('<input type="text" id="secret" size="60" placeholder="Enter periscope consumer secret here... or SID" value="' +
                    (settings.consumer_secret || '') + '"/><br/>').append(signInButton, signInSMSButton, signInSidButton);
            }
            $(document.body).append(Progress.elem);
        }
    },
    Ready: function (loginInfo) {
        console.log('ready! ', loginInfo);
        var signOutButton = $('<a class="button">Sign out</a>');
        signOutButton.click(SignOut);

        var userLink = $('<a class="username">@' + (loginInfo.user.username || loginInfo.user.twitter_screen_name) + '</a>').click(PeriscopeWebClient.SwitchSection.bind(null, 'User', loginInfo.user.id));
        var userEdit = $('<span class="right icon edit" title="Profile & settings">&nbsp;</span>').click(PeriscopeWebClient.SwitchSection.bind(null, 'Edit'));
        loginInfo.user.profile_image_urls.sort(function (a, b) {
            return a.width * a.height - b.width * b.height;
        });
        selfAvatar = $('<img src="' + loginInfo.user.profile_image_urls[0].url + '" width="140"/>');
        var left = $('<div id="left"/>').append(signOutButton,
            selfAvatar, userEdit,
            '<div>' + emoji.replace_unified(loginInfo.user.display_name) + '</div>', userLink);
        $(document.body).html(left).append('<div id="right"/>', Progress.elem);
        var menu = [
            {text: 'API test', id: 'ApiTest'},
            {text: 'Map', id: 'Map'},
            {text: 'Top', id: 'Top'},
            {text: 'Following', id: 'Following'},
            {text: 'Search broadcasts', id: 'Search'},
            {text: 'New broadcast', id: 'Create'},
            {text: 'Chat', id: 'Chat'},
            {text: 'Suggested people', id: 'People'},
            {text: 'User', id: 'User'},
            {text: 'Groups', id: 'Groups'}
        ];
        if (!GM_BROWSER) {
            menu.push({ text: 'Download manager', id: 'Dmanager' });
            menu.push({ text: 'Downloading', id: 'Console' });
        }
        for (var i in menu) {
            var link = $('<div class="menu" id="menu' + menu[i].id + '">' + menu[i].text + '</div>');
            link.click(PeriscopeWebClient.SwitchSection.bind(null, menu[i].id));
            left.append(link);
        }
        $('.menu').first().click();
        $('#menuCreate').hide(); // Create broadcasts only for developers
        left.append($('<label title="All API requests will be logged to console"/>').append($('<input type="checkbox" id="debug"/>').click(function () {
            $('#menuCreate').toggle();
        }), 'Debug mode'));
        emoji.img_sets[emoji.img_set].path = 'http://unicodey.com/emoji-data/img-apple-64/';
        emoji.supports_css = true;
        emoji.replace_mode = 'css';
        lazyLoad(window);
        $(window).on('popstate', function (event) {
            event = event.originalEvent;
            if (event.state && event.state.section)
            PeriscopeWebClient.SwitchSection(event.state.section, event.state.param, true);
        });
        Notifications.start();
    },
    RefreshProfile: function(loginTwitter) {
        PeriscopeWrapper.V2_POST_Api('user', {
            user_id: loginTwitter.user.id
        }, function (userResponse) {
            loginTwitter.user = userResponse.user;
            localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
            loginTwitter.user.profile_image_urls.sort(function (a, b) {
                return a.width * a.height - b.width * b.height;
            });
            if (selfAvatar.attr('src') != loginTwitter.user.profile_image_urls[0].url)
                selfAvatar.attr('src', loginTwitter.user.profile_image_urls[0].url);
        })
    },
    scrollPositions: {},
    SwitchSection: function (section, param, popstate) {
        PeriscopeWebClient.scrollPositions[document.URL.split('/')[3]] = window.pageYOffset;
        // Switch menu
        $('.menu.active').removeClass('active');
        $('#menu' + section).addClass('active');
        // Switch content
        $('#right > div:visible').hide();
        if (param && param.target) {  // jQuery event
            param = null;
        }
        if (popstate != true) {
            history.pushState({
                section: section,
                param: param
            },
                section,
                '/' + section + (param ? '/' + (param.url ? param.url : (param.rurl ? param.rurl : param)) : ''));
        }
        var sectionContainer = $('#' + section);
        if (!sectionContainer.length)
            Inits[section]();
        else {
            var refreshSettingKey = "refresh" + section + "OnLoad";
            if (settings[refreshSettingKey]) {
                var refreshBtn = $('#refresh' + section);
                if (refreshBtn.length > 0) {
                    PeriscopeWebClient.scrollPositions[section] = 0;
                    refreshBtn.click();
                }
            }
            sectionContainer.show();
        }
        if (param)
            switch (section) {
                case 'User':
                    if ($('#user_id').val() != param) {
                        $('#user_id').val(param);
                        $('#user_name').val('');
                        $('#showuser').click();
                    }
                    break;
                case 'Chat':
                    if ($('#broadcast_id').val() != param) {
                        $('#broadcast_id').val(param);
                        $('#startchat').click();
                    }
                    break;
                case 'Map':
                    var latlng = param.split(',');
                    var mapcenter = map.getCenter();
                    if (latlng[0] != mapcenter.lat || latlng[1] != mapcenter.lng)
                        map.setView([latlng[0], latlng[1]], 17);
                    break;
                case 'Console':
                    param = $.extend({
                        url: '',
                        rurl: '',
                        cookies: '',
                        name: '',
                        user_id: '',
                        user_name: '',
                        broadcast_info: ''
                    }, param);
                    if (($('#download_url').val() != param.url) || ($('#download_replay_url').val() != param.rurl)) {    // if it other video
                        $('#download_url').val(param.url);
                        $('#download_replay_url').val(param.rurl);
                        $('#download_cookies').val(param.cookies);
                        $('#download_name').val(param.name);
                        $('#download_userid').val(param.user_id);
                        $('#download_username').val(param.user_name);
                        $('#download_response').val(JSON.stringify(param.broadcast_info));
                        $('#download').click();
                    }
                    break;
            }
        if (section == 'Dmanager') {
            $('#' + section).remove(), Inits[section]();
        }

        document.title = section + ' - ' + 'My-OpenPeriscope';

        if (PeriscopeWebClient.scrollPositions.hasOwnProperty(section)) {
            window.scrollTo(0, PeriscopeWebClient.scrollPositions[section]);
        }
    }
}
