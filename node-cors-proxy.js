#!/usr/bin/env node
/**

Original code from : https://gist.githubusercontent.com/jianwu/8e76eaec95d9b1300c59596fbfc21b10/raw/ad38b24419aa4c3aa8f922d3f40a59e0ea773027/static_server.js

Static http server implemented with NodeJS. 

Features:

1. No external dependencies
2. Support http/https, with custom port.
3. Support CORSProxy function
4. Zero configuration, convention over configuration
5. Support gzip compression

Usage:
1. Static file directory

It will always serve the static files under current directory where the process is started.

2. Start http server with default port: (http on 80), it will server the static file under current directory
node static_server.js

3. Start http on 8080 and https on 8443, to support https, you need to put the key.pem and cert.pem under current directory
node static_server.js 8080 8443

4. To access it as CORSProxy:

https://host/https://www.somewebsite.com

or 

http://host/http://www.somewebsite.com

*/


const http = require('http'),
    https = require('https'),
    url = require('url'),
    Path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),
    port = process.argv[2] || 8888,
    httpsPort = process.argv[3] || 0;

console.log("Command Line Format: node static_server.js [port] [httpsPort]");
http.createServer(serve).listen(parseInt(port, 10));
console.log(`Static file server running at\n  => http://localhost:${port}`);

if (httpsPort){
  var opt;
  try {
    opt = {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    };
  } catch(e) {
    console.log("Error start https: missing key.pem and cert.pem in current directory");
  }
  if (opt) {
    https.createServer(opt, serve).listen(parseInt(httpsPort, 10));
    console.log(`https at\n  => https://localhost:${httpsPort}`);
  }
}
console.log(`CTRL + C to shutdown`);

function serve(request, response) {
  const path = url.parse(request.url).pathname
  if (path.startsWith('/https://') || path.startsWith('/http://'))
    serveProxy(path, request, response);
  else
    serveLocalFile(path, request, response);
}

function serveProxy(path, request, response) {
  const uri = url.parse(path.substring(1));
  const isHttps = uri.protocol === 'https:';
  const opt = {
    host: uri.host,
    port: uri.port || isHttps ? 443 : 80,
    path: uri.path,
    method: request.method,
    headers: request.headers,
  };
  delete opt.headers.host;
  const ht =  isHttps ? https : http;
  const proxy = ht.request(opt, (res) => {
    const headers = Object.assign(res.headers, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Method': request.headers['access-control-request-method'] || '*',  // TODO: case insensitive
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'] || '*',
    });

    response.writeHead(res.statusCode, headers);
    res.on('data', (data) => {
      response.write(data);
    });
    res.on('end', () => {
      response.end()
    });
  });

  proxy.on('error', (error) => {
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.write(`Error connect to remote server: exception=${error}\n`);
    response.end();
  });
  request.on('data', (data) => {
    proxy.write(data)
  });
  request.on('end', () => {
    proxy.end();
  });
}

function serveLocalFile(path, request, response) {
  var filename = Path.join(process.cwd(), path);

  fs.exists(filename, function(exists) {
    if(!exists || filename.endsWith('.pem')) {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('404 Not Found\n');
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      serveLocalFile(path + '/index.html', request, response);
      return;
    }

    response.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
    var raw = fs.createReadStream(filename);
    
    var acceptEncoding = request.headers['accept-encoding'] || '';        
    if (acceptEncoding.match(/\bdeflate\b/)) {
      response.writeHead(200, { 'content-encoding': 'deflate' });
      raw.pipe(zlib.createDeflate()).pipe(response);
    } else if (acceptEncoding.match(/\bgzip\b/)) {
      response.writeHead(200, { 'content-encoding': 'gzip' });
      raw.pipe(zlib.createGzip()).pipe(response);
    } else {
      response.writeHead(200, {});
      raw.pipe(response);
    }
    
    // fs.readFile(filename, 'binary', function(err, file) {
    //   if(err) {
    //     response.writeHead(500, {'Content-Type': 'text/plain'});
    //     response.write(err + '\n');
    //     response.end();
    //     return;
    //   }

    //   response.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
    //   response.write(file, 'binary');
    //   response.end();
    // });
  });
}