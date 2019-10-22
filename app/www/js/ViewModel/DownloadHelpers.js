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

