if (!GM_BROWSER) {
    GM_xmlhttpRequest = function (options) {
        // headers: {
        //     Authorization: authorization_token,
        //     /* drkchange show all channels*/ 'X-Periscope-User-Agent': 'Periscope/2699 (iPhone; iOS 8.1.2; Scale/2.00)',
        //     locale: langDt.find('.lang').val()
        // }

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", options.onload);
        oReq.addEventListener("error", function (e) {
            console.error(e);
        });
        oReq.open(options.method, "https://cors-anywhere.herokuapp.com/" + options.url, /*async=*/true);
        oReq.setRequestHeader("Origin", "");
        oReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        oReq.setRequestHeader('X-PINGOTHER', 'pingpong');
        oReq.setRequestHeader('Content-Type', 'application/javascript');

        for (header in options.headers) {
            oReq.setRequestHeader(header, options.headers[header]);
        }

        var data_param = JSON.parse(options.data);
        var data = new FormData();
        for (data_item in data_param) {
            data.append(data_item, data_param[data_item]);
        }

        oReq.send(data);
    };
}


/* LEVEL 0 */
var XHR = [];
function clearXHR() {   // abort all running XHR requests
    for (var i in XHR) {
        Progress.stop();
        XHR[i].abort();
    }
    XHR=[];
}
function Api(method, params, callback, callback_fail) {
    if (!params)
        params = {};
    if (loginTwitter && loginTwitter.cookie)
        params.cookie = loginTwitter.cookie;
    Progress.start();
    var xhrIndex = XHR.length;
    var req = GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.periscope.tv/api/v2/' + method,
        headers: {
            'User-Agent': 'Periscope/2699 (iPhone; iOS 8.1.2; Scale/2.00)'
        },
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
