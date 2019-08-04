# eOpenPeriscope
based on [gitnew2018/My-OpenPeriscope](https://github.com/gitnew2018/My-OpenPeriscope) and [Pmmlabs/OpenPeriscope](https://github.com/Pmmlabs/OpenPeriscope) [NW.js](https://nwjs.io/) based OpenPeriscope. This project is going to be a major refactor to:
 - port the code to [cordova-electron](https://cordova.apache.org/docs/en/latest/guide/platforms/electron/index.html#requirements-and-support) to enable running it on mobile phones
 - refactor the code to fix the code style and improve maintainability
 
 Will drop support for:
 -  in-browser client. While it is cool, it is not supported on mobile platforms

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
```
