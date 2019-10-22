# eOpenPeriscope

based on [gitnew2018/My-OpenPeriscope](https://github.com/gitnew2018/My-OpenPeriscope) and [Pmmlabs/OpenPeriscope](https://github.com/Pmmlabs/OpenPeriscope) [NW.js](https://nwjs.io/). This project is going to be a major refactor to:

* port the code to [cordova](https://cordova.apache.org) to enable running it on mobile phones
* refactor the code to fix the code style and improve maintainability

Will drop support for:

* in-browser client. While it is cool, it is not supported on mobile platforms

# Development

Note: Running this requires [Git](https://git-scm.com/) and [npm](https://www.npmjs.com/).

```
# Clone the repository
$ git clone https://github.com/Max104t/eOpenPeriscope.git
# install cordova
$ npm i -g cordova
# Go into the repository
$ cd eOpenPeriscope/app
# Install dependencies
$ npm install
# Run the app
$ cordova run electron --nobuild
$ cordova run browser --target=chrome -- --allow-file-access-from-files --disable-web-security --allow-file-access --allow-cross-origin-auth-prompt --disable-site-isolation-trials
```

## For browser platform
You will also need `CORS` proxy for `browser` platform. get is from [here](https://github.com/Max104t/bypasscors).

```
git clone git@github.com:Max104t/bypasscors.git
cd bypasscors
npm install
npm run start
```

# Credits

* [Pmmlabs/OpenPeriscope](https://github.com/Pmmlabs/OpenPeriscope)
* [gitnew2018/My-OpenPeriscope](https://github.com/gitnew2018/My-OpenPeriscope)
* jQuery https://jquery.com
* CryptoJS http://crypto-js.googlecode.com
* Leaflet http://leafletjs.com
* [Leaflet/Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
* [iamcal/js-emoji](https://github.com/iamcal/js-emoji)
* clipboard.js https://clipboardjs.com
* [le717/jquery-spoiler](https://github.com/le717/jquery-spoiler)
* [nathancahill/Split.js](https://github.com/nathancahill/Split.js)
* [gitnew2018/nodejs\_peri\_downloader](https://github.com/gitnew2018/nodejs_peri_downloader)
* [charlyBerthet/bypasscors](https://github.com/charlyBerthet/bypasscors)

#License

* [GNU General Public License v2.0](./LICENSE)