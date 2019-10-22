var GM_xmlhttpRequest_proxy = function (options) {
    var corsProxyUrl = localStorage.getItem('cors_proxy_url');
    if (!corsProxyUrl)
    {
        corsProxyUrl = 'http://localhost:3000/api/?url=';
        localStorage.setItem('cors_proxy_url', corsProxyUrl)
    }

    var onload = options.onload;
    var oReq = new XMLHttpRequest();

    var chunks = '';
    var chunks2 = [];// needed for binary decryption key
    // res.setEncoding('utf8');

    oReq.addEventListener("load", function(e) {
        var resTarget = e.target;
        onload({
            status: resTarget.status,
            responseText: resTarget.responseText,
            finalUrl: resTarget.responseURL,
            responseArray: resTarget.responseArray
        });
    });

    oReq.addEventListener("error", function (e) {
        console.error(e);
    });
    oReq.open(options.method, corsProxyUrl + encodeURIComponent(options.url), /*async=*/true);
    oReq.setRequestHeader('Content-Type', 'application/json');
    for (header in options.headers) {
        oReq.setRequestHeader(header, options.headers[header]);
    }
    var data_param = JSON.parse(options.data);

    if (options.method == "POST") {
        // A little trick for POST requests. We use body request to send headers 
        // in order to bypass CORS restrictions.
        // That way the body json look like :
        // { data:YOUR_DATA_OBJECT_OR_STRING, headers:YOUR_HEADERS_OBJECT }
        data_param = {
            data: data_param,
            headers: options.headers
        };
    }

    oReq.send(JSON.stringify(data_param));
};

var GM_xmlhttpRequest_node_js = function(options) {
    // re-implementation of GM_xmlhttpRequest for Node.js
    // platforms like NW.js
    var onload = options.onload;
    options.onload = null;
    var u = url.parse(options.url);
    options.host = u.host;
    options.hostname = u.hostname;
    options.path = u.path;
    options.protocol = u.protocol;
    var chunks = '';
    var chunks2 = [];// needed for binary decryption key
    var req = https.request(options, function (res) {
        // res.setEncoding('utf8');
        res.on('data', function (chunk) {
            chunks += chunk;
            chunks2.push(chunk);
        });
        res.on('end', function() {
            onload({
                status: res.statusCode,
                responseText: chunks,
                finalUrl: res.headers['location'],
                responseArray: chunks2
            });
        });
    });
    req.on('error', function (e) {
        console.error(e);
    });
    if (options.data)
        req.write(options.data);
    req.end();
    return req;
};

const GM_BROWSER = typeof GM_xmlhttpRequest === 'function';

document.addEventListener("deviceready", function(){
    if (!GM_BROWSER) {
        if (IS_CORDOVA_APP && device.platform === "browser") {
            GM_xmlhttpRequest = GM_xmlhttpRequest_proxy;
        }
    }    
}, false);

