var oauth_token = localStorage.getItem('oauth_token'),
oauth_verifier = localStorage.getItem('oauth_verifier'),
session_key = localStorage.getItem('session_key'),
session_secret = localStorage.getItem('session_secret'),
loginTwitter = localStorage.getItem('loginTwitter');

function SignIn3(session_key, session_secret) {
    Api('loginTwitter', {
        "session_key": session_key,
        "session_secret": session_secret
    }, function (response) {
        localStorage.setItem('loginTwitter', JSON.stringify(response));
        loginTwitter = response;
        Ready(loginTwitter);
        if (!loginTwitter.user.username)    // User registration
            Api('verifyUsername', {
                username: loginTwitter.suggested_username,
                display_name: loginTwitter.user.display_name
            }, function (verified) {
                if (verified.success) {
                    loginTwitter.user = verified.user;
                    localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                } else
                    console.log('User verification failed!', verified);
            });
    })
}
function SignIn2(oauth_token, oauth_verifier) {
    OAuthTwitter('access_token', function (oauth) {
        localStorage.setItem('session_key', oauth.oauth_token);
        localStorage.setItem('session_secret', oauth.oauth_token_secret);
        session_key = oauth.oauth_token;
        session_secret = oauth.oauth_token_secret;
        SignIn3(session_key, session_secret);
    }, {oauth_token: oauth_token, oauth_verifier: oauth_verifier});
}
function SignIn1() {
    setSet('consumer_secret', $('#secret').val());
    if (settings.consumer_secret) {
        $(this).text('Loading...');
        OAuthTwitter('request_token', function (oauth) {
            location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + oauth.oauth_token;
        }, {oauth_callback: 'twittersdk://openperiscope/index.html'});
    }
}
function SignOut() {
    localStorage.clear();
    setSet();
    location.pathname = 'openperiscope_index.html';
}
function OAuthTwitter(endpoint, callback, extra){
    OAuth('https://api.twitter.com/oauth/' + endpoint, 'POST', callback,extra);
}
function OAuth(endpoint, _method, callback, extra) {
    var method = _method || 'POST';
    var url = endpoint;
    var params = {
        oauth_consumer_key: '9I4iINIyd0R01qEPEwT9IC6RE',
        oauth_nonce: Date.now(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Date.now() / 1000 | 0,
        oauth_version: '1.0'
    };
    for (var i in extra)
        params[i] = extra[i];

    var signatureBase = [];
    var keys = Object.keys(params).sort();
    for (i in keys)
        signatureBase.push(keys[i] + '=' + params[keys[i]]);

    var signatureBaseString = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(signatureBase.join('&'));

    params.oauth_signature = encodeURIComponent(
        CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA1(signatureBaseString, settings.consumer_secret + '&' + (session_secret || ''))
        )
    );

    var params_prepared = [];
    for (i in params) {
        params_prepared.push(i + '="' + params[i] + '"');
    }
    GM_xmlhttpRequest({
        method: method,
        url: url,
        headers: {
            Authorization: 'OAuth ' + params_prepared.join(', ')
        },
        onload: function (r) {
            if (r.status == 200) {
                var oauth = {};
                var response = r.responseText.split('&');
                for (var i in response) {
                    var kv = response[i].split('=');
                    oauth[kv[0]] = kv[1];
                }
                callback(oauth);
            }
            else if (r.status == 401) {   // old tokens: reload page
                console.log('oauth error 401: ' + r.responseText);
                SignOut();
            }
            else
                console.log('oauth error: ' + r.status + ' ' + r.responseText);
        }
    });
}

function SignInSMS() {
    setSet('consumer_secret', $('#secret').val());
    if (settings.consumer_secret) {
        OAuthDigits('oauth2/token', {
            form: {
                grant_type: 'client_credentials'
            },
            token_type: 'Basic',
            access_token: btoa('9I4iINIyd0R01qEPEwT9IC6RE:' + settings.consumer_secret)
        }, function (response_token) {
            OAuthDigits('1.1/guest/activate.json', {
                token_type: response_token.token_type,
                access_token: response_token.access_token
            }, function (response_activate) {
                var phone = $('<input size="20" placeholder="+79001234567" type="text"/>');
                $(document.body).append('<br/>', phone, $('<a class="button">Send SMS</a>').click(function () {
                    OAuthDigits('1/sdk/login', {
                        form: {
                            x_auth_phone_number: phone.val(),
                            verification_type: 'sms'
                        },
                        guest: response_activate.guest_token,
                        token_type: response_token.token_type,
                        access_token: response_token.access_token
                    }, function (response_login) {
                        var code = $('<input size="12" placeholder="Code from SMS" type="text"/>');
                        $(document.body).append('<br/>', code, $('<a class="button">Check code</a>').click(function () {
                            OAuthDigits('auth/1/xauth_challenge.json', {
                                form: {
                                    login_verification_request_id: response_login.login_verification_request_id,
                                    login_verification_user_id: response_login.login_verification_user_id,
                                    login_verification_challenge_response: code.val()
                                },
                                guest: response_activate.guest_token,
                                token_type: response_token.token_type,
                                access_token: response_token.access_token
                            }, function (response_xauth) {
                                localStorage.setItem('session_key', response_xauth.oauth_token);
                                localStorage.setItem('session_secret', response_xauth.oauth_token_secret);
                                session_key = response_xauth.oauth_token;
                                session_secret = response_xauth.oauth_token_secret;
                                SignIn3(session_key, session_secret);
                            });
                        }));
                    });
                }));
            });
        });
    }
}

function OAuthDigits(endpoint, options, callback) {
    Progress.start();
    var args = {
        method: 'POST',
        url: 'https://api.digits.com/' + endpoint,
        headers: {
            'Authorization': options.token_type + ' ' + options.access_token
        },
        onload: function (r) {
            Progress.stop();
            if (r.status == 200)
                callback(JSON.parse(r.responseText.replace(/"login_verification_user_id":(\d+)/, '"login_verification_user_id":"$1"'))); // fix for integral precision in JS
            else if (r.status == 401 || r.status == 400)   // wrong sms code
                alert('Authorization error!');
        }
    };
    if (options.guest) {
        args.headers['x-guest-token'] = options.guest;
    }
    if (options.form) {
        args.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        args.data = '';
        for (var i in options.form)
            args.data += i + '=' + encodeURIComponent(options.form[i]) + '&';
        args.data = args.data.substr(0, args.data.length - 1);
    }
    GM_xmlhttpRequest(args);
}

function SignInSessionID()
{
    setSet('session_cookie', $('#secret').val());
    if (settings.session_cookie)
    {
        Api('user', { cookie: settings.session_cookie }, 
            function (userResponse) 
            {
                loginTwitter = localStorage.getItem('loginTwitter');
                if (!loginTwitter)
                    loginTwitter = {cookie: settings.session_cookie, user: userResponse.user, suggested_username: '', settings: {} };
                loginTwitter.user = userResponse.user;
                loginTwitter.cookie = settings.session_cookie;
                localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                loginTwitter.user.profile_image_urls.sort(function (a, b) {
                    return a.width * a.height - b.width * b.height;
                });
                Api('getSettings', {}, 
                    function (settingsResponse) 
                    {
                        loginTwitter.settings = settingsResponse;
                        localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                        Ready(loginTwitter);
                    }
                )
            }
        )
    }
}