var ConsoleController = {
    init: function(parent) {

        var resultConsole = $('<pre id="resultConsole" />');
        var downloadButton = $('<a class="button" id="download">Download</a>').click(function () {
            resultConsole.empty();
            var dl = download($('#download_folder_name').val().trim(), $('#download_name').val().trim(), $('#download_url').val().trim(), $('#download_replay_url').val().trim(), $('#download_cookies').val().trim(), JSON.parse($('#download_response').val().trim() || '""'), resultConsole);
            var gui = require('nw.gui');
            gui.Window.get().removeAllListeners('close').on('close', function(){
                try {
                    dl.stdin.end('q', dl.kill);
                } finally {
                    gui.App.quit();
                }
            });
        });
        parent.append($('<div id="Console"/>').append('<dt>URL:</dt><input id="download_url" type="text" size="45"><br/>' +
                                                           '<dt>R_URL:</dt><input id="download_replay_url" type="text" size="45"><br/>' +
                                                           '<dt>Cookies:</dt><input id="download_cookies" type="text" size="45"><br/>' +
                                                           '<dt>Name:</dt><input id="download_name" type="text" size="45"><br/>' +
                                                           '<dt>Folder:</dt><input id="download_folder_name" type="text" size="45"><br/>' +
                                                           '<dt>Key:</dt><input id="download_key" type="text" size="45"><br/>' +
                                                           '<input id="download_response" type="hidden">',
                                                            downloadButton, '<br/><br/>', resultConsole));
    
    }
}
