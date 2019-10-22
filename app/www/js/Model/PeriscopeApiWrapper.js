var XHR = [];
function clearXHR() {   // abort all running XHR requests
    for (var i in XHR) {
        Progress.stop();
        XHR[i].abort();
    }
    XHR=[];
}

function ApiWorker(
    http_method, ///< the HTTP method like `POST` `GET`
    api_root,    ///< The host-name+directory like 'https://api.periscope.tv/api/v2/'
    method,      ///< The method called. This will get appended to the api_root
    headers,     ///< HTTP headers
    params,      ///< form data to be used with HTTP method like `POST` 
    callback,    ///< Call back for success
    callback_fail ///< Call back for failed
    ) {
    if (!params)
        params = {};
    if (loginTwitter && loginTwitter.cookie)
        params.cookie = loginTwitter.cookie;
    Progress.start();
    var xhrIndex = XHR.length;
    var req = GM_xmlhttpRequest({
        method: http_method,
        url: api_root + method,
        headers: headers,
        timeout: 10000,
        data: JSON.stringify(params),
        onload: function (r) {
            Progress.stop();
            XHR.splice(xhrIndex, 1);
            var response, debug = $('#debug').length && $('#debug')[0].checked;
            switch (r.status) {
                case 200:
                    try {
                        response = JSON.parse(r.responseText);
                    } catch (e) {
                        if (debug)
                            console.warn('JSON parse error:', e);
                    }
                    if (!!response && callback)
                        callback(response);
                    $(window).trigger('scroll');    // for lazy load
                    break;
                case 406:
                    alert(JSON.parse(r.responseText).errors[0].error);
                    break;
                case 401:
                    SignOut();
                    break;
                default:
                    response = 'API error: ' + r.status + ' ' + r.responseText;
                    if (callback_fail && Object.prototype.toString.call(callback_fail) === '[object Function]')
                        callback_fail(response);
            }
            if (debug)
                console.log('Method:', method, 'params:', params, 'response:', response);
        }
    });
    XHR.push(req);
}
var authorization_token;
var PeriscopeWrapper = {
    default_api_root: 'https://api.periscope.tv/api/v2/',
    default_headers: {
        'User-Agent': 'Periscope/2699 (iPhone; iOS 8.1.2; Scale/2.00)'
    },
    V1_GET_ApiChannels: function(callback, url, langDt) {
        return PeriscopeWrapper.V1_ApiChannels(callback, url, langDt, "", "GET");
    },
    V1_ApiChannels: function(callback, url, langDt, params, http_method) {
        if (http_method == null) {
            http_method = 'GET'
        }
        Progress.start();
        PeriscopeWrapper.V2_POST_Api('authorizeToken', {
            service: 'channels'
        }, function (authorizeToken) {
            this.authorization_token = authorizeToken.authorization_token;
            GM_xmlhttpRequest({
                method: http_method,
                url: url,
                headers: {
                    Authorization: this.authorization_token,
                    'X-Periscope-User-Agent': 'Periscope/2699 (iPhone; iOS 8.1.2; Scale/2.00)',
                    locale: (langDt ? langDt.find('.lang').val() : "")
                },
                data: (params? JSON.stringify(params) : null),
                onload: function (r) {
                    Progress.stop();
                    if (r.status == 200) {
                        var response = JSON.parse(r.responseText);
                        if ($('#debug')[0].checked){
                            console.log('channels ' + http_method + ' '  + url + ' : ', response);
                            params ? console.log('params', params) : '';
                        }
                        callback(response);
                    }
                    else
                        console.log('channels error: ' + http_method + ' ' + url + ' : ' + r.status + ' ' + r.responseText);
                }
            });
        });
    },
    V2_POST_Api: function(method, params, callback, callback_fail) {
        ApiWorker('POST', PeriscopeWrapper.default_api_root, method, PeriscopeWrapper.default_headers, params, callback, callback_fail);
    }
}
