var childProcesses=[]; //list of video downloading processes
function downloadStatus(broadcast_id, link, cpIndex){
    if (cpIndex === null) cpIndex = childProcesses.findIndex(function(cProcess) {return cProcess.b_info.id == broadcast_id;});
    if (cpIndex >= 0){
        let title = 'Recording/Downloading';
        let emote = '🔴';
        let eCode = childProcesses[cpIndex].exitCode;
        if (link) {childProcesses.some(function(cProcess){ return (cProcess.b_info.id == broadcast_id && cProcess.exitCode === null)}) ? (eCode = null) : ''}; //if any process still downloading then show as downloading.
        if (eCode === 0) title = 'Downloaded', emote = '✅';
        if (eCode === 1) title = 'Stopped', emote = '❎';
        if (eCode > 1) title = 'error', emote = '❌';
        if(link){
            let recLink = [$('<a title="' + title + '" class="downloadStatus">' + emoji_to_img(emote) + '</a>').click(
                switchSection.bind(null,'Dmanager', broadcast_id)
            ), ' | '];
            return recLink;
        }else{
            let exitEmote = '<span title="' + title + (eCode > 1 ? (' exit code:' + eCode): '') + '" class="downloadStatus">' + emoji_to_img(emote) + '</span>';
            return exitEmote;
        }
    };
    return '';
}

function cleanFilename(filename){
    var tmp = filename.replace(/[<>+\\/:"|?*]/g, '');
    if (tmp.length > 100)
        tmp = tmp.substring(0, 98);
    if (tmp.endsWith('.'))
        tmp = tmp.replace(/\.$/, '_')
    return tmp;
}

function userFolderFileName(userString, b_info, partialReplay, replay, producer, whole){
    var date_created = new Date(b_info.start);

    b_info.year = date_created.getFullYear();
    b_info.month = zeros(date_created.getMonth() + 1);
    b_info.day = zeros(date_created.getDate());
    b_info.hour = zeros(date_created.getHours());
    b_info.minute = zeros(date_created.getMinutes());
    (partialReplay && !whole) ? (b_info.partial = (settings.userPartialShort || DefaultFolderFileNames.partialShort)) : '';
    (replay && !whole) ? (b_info.replay = (settings.userReplayShort || DefaultFolderFileNames.replayShort)) : '';
    b_info.is_locked ? (b_info.private = (settings.userPrivateShort || DefaultFolderFileNames.privateShort)) : '';
    producer ?  (b_info.replay = (settings.userProducerShort || DefaultFolderFileNames.producerShort)) : '';

    return userString.replace(/(\#|\$){[a-z_]+}/gi, function(param){
        return (b_info[param.slice(2,-1)] !== undefined) ? (param = b_info[param.slice(2,-1)]) : '';
    });
}

function download(folder_name ,name, url, rurl, cookies, broadcast_info, jcontainer, replayLimit) { // cookies=['key=val','key=val']
    function _arrayBufferToString(buf, callback) {
        var bb = new Blob([new Uint8Array(buf)]);
        var f = new FileReader();
        f.onload = function (e) {
            callback(e.target.result);
        };
        f.readAsText(bb);
    }

    var windows = process.platform === 'win32',
        folder_separator = windows ? '\\' : '/';

    var output_dir = settings.downloadPath + folder_separator

    if (folder_name)
        output_dir += cleanFilename(folder_name) + folder_separator;

    const fs = require('fs');
    try {
        fs.mkdirSync(output_dir);
    } catch (e) {}
    
    name = cleanFilename(name || 'untitled')

    output_name_check(0);

    var otherProcessHasName = function (nameToCheck) {
        return childProcesses.some(function (child) {
            return child.file_name === nameToCheck;
        });
    }
    function output_name_check(num) {
        fs.stat(output_dir + name + (num ? num : '') + '.ts', function (err, stats) {
            if (stats || otherProcessHasName(name + (num ? num : ''))) {
                output_name_check(num + 1);
            } else {
                num ? name = name + num : '';
                var decryption_key;
                if (broadcastsWithLinks[broadcast_info.id] && broadcastsWithLinks[broadcast_info.id].hasOwnProperty('decryptKey')){ // if broadcast has decryption key saved
                    decryption_key = broadcastsWithLinks[broadcast_info.id].decryptKey;
                    $('#download_key').val(decryption_key);
                }
                
                const spawn = require('child_process').spawn(process.execPath, [
                    'downloaderNode.js',
                    '-url', url,
                    '-rurl', rurl,
                    '-dir', output_dir,
                    '-name', name,
                    '-cookies', cookies,
                    '-key', decryption_key,
                    '-limit', replayLimit === true ? settings.replayTimeLimit : ''
                ],{
                    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                });

                spawn.b_info = broadcast_info;
                spawn.folder_path = output_dir;
                spawn.file_name = name;
                childProcesses.push(spawn);
                if(childProcesses.length > 50){
                    childProcesses.shift()
                }
                $(document).find('.card.' + broadcast_info.id).find('.recContainer').empty().append(downloadStatus(broadcast_info.id, true, null));

                if (jcontainer) {
                    if (!spawn.pid)
                        jcontainer.append('FFMpeg not found. On Windows, place the static build into OpenPeriscope directory.');
                    spawn.stdout.on('data', function (data) {
                        _arrayBufferToString(data, function (d) {
                            jcontainer.append(d);
                        });
                    });
            
                    spawn.stderr.on('data', function (data) {
                        _arrayBufferToString(data, function (d) {
                            jcontainer.append(d);
                        });
                    });

                    spawn.on('error', function (code) {
                        _arrayBufferToString(code, function (d) {
                            console.log('error: ', d);
                        });
                    });
                    
                    // $(window).keydown(function(event){
                    //     spawn.stdin.write(String.fromCharCode(event.keyCode)+'\r\n');
                    //     //spawn.stdin.close();
                    // });
                } else {
                    if (spawn.pid) {
                        ffLog = "";
                        function writeToLog(data) {
                            _arrayBufferToString(data, function (d) {
                                ffLog += d;
                            });
                        }
                        spawn.stdout.on('data', writeToLog);
                        spawn.stderr.on('data', writeToLog);
                        spawn.on('close', function (code, signal) {
                            ffLog+="\nClose: code "+code+", signal "+signal;
                        });
                        spawn.on('error', writeToLog.bind("disconnected"));
                        spawn.on('disconnect', writeToLog);
                        spawn.on('exit', function (code, signal) {
                            ffLog+="\nExit: code "+code+", signal "+signal;
                        });
                    }
                }
                return spawn;
            }
        });
    }

}
function saveAs(data, filename) {
    if (NODEJS) {
        $('<input type="file" nwsaveas="' + filename + '" />').change(function () {
            const fs = require('fs');
            fs.writeFile($(this).val(), data);
        }).click();
    }
}

