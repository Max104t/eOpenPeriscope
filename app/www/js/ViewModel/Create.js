var CreateController = {
    init: function(parent) {

        parent.append('<div id="Create">' +
        '<dt>Title:</dt><input id="status" type="text" autocomplete="on"><br/>' +
        '<dt>Width:</dt><input id="width" type="text" autocomplete="on" placeholder="320"><br/>' +
        '<dt>Height:</dt><input id="height" type="text" autocomplete="on" placeholder="568"><br/>' +
        '<dt>Filename:</dt><input id="filename" type="text" autocomplete="on"><label><input id="camera" type="checkbox"> From camera</label><br/>' +
        '<dt>Streaming bitrate:</dt><input id="bitrate" type="text" value="200">kBps<br/>' +
        '<dt>Latitude:</dt><input id="lat" type="text" placeholder="0"><br/>' +
        '<dt>Longitude:</dt><input id="lon" type="text" placeholder="0"><br/>' +
        '<dt>Language:</dt><input id="cr_lang" type="text" value="'+(navigator.language || navigator.userLanguage || "en").substr(0, 2)+'"><br/>' +
        '<dt>Server:</dt><select id="server">' +
            '<option>us-west-1</option>' +
            '<option selected>eu-central-1</option>' +
        '</select><br/>' +
        '<br/><div style="clear: left;"><label><input id="friend_chat" type="checkbox"> Limit the chat to friends only</label></div><br/>' +
        '<br/></div>');
    $('#camera').click(function(){
        $('#filename').val(this.checked ? '/dev/video0' : '');
    });
    var createButton = $('<a class="button">Create</a>').click(function () {
        var widthInput = $('#width');
        var heightInput = $('#height');
        if (widthInput.val().trim() == '')
            widthInput.val(320);
        if (heightInput.val().trim() == '')
            heightInput.val(568);
        PeriscopeWrapper.V2_POST_Api('createBroadcast', {
            lat: +$('#lat').val() || 0,
            lng: +$('#lon').val() || 0,
            //supports_psp_version: [1, 0, 0],
            region: $('#server').val(),
            width: +widthInput.val(),
            height: +heightInput.val()
        }, function (createInfo) {
            PeriscopeWrapper.V2_POST_Api('publishBroadcast', {
                broadcast_id: createInfo.broadcast.id,
                friend_chat: $('#friend_chat')[0].checked,
                has_location: true,
                locale: $('#cr_lang').val(),
                lat: +$('#lat').val() || 0,
                lng: +$('#lon').val() || 0,
                status: $('#status').val().trim()
            }, function () {
                var filename = $('#filename').val();
                var input_options = ($('#camera')[0].checked ? '-f v4l2 -framerate 25 -video_size 640x480' : '') + ' -i "' + filename + '"';
                var code =
                    '#!/bin/bash\n' +
                    'FFOPTS="-vcodec libx264 -b:v ' + $('#bitrate').val() + 'k -profile:v main -level 2.1 -s ' + createInfo.broadcast.width + 'x' + createInfo.broadcast.height + ' -aspect ' + createInfo.broadcast.width + ':' + createInfo.broadcast.height + '"\n' +
                    'ffmpeg -loglevel quiet ' + input_options + ' $FFOPTS -vbsf h264_mp4toannexb -t 1 -an out.h264\n' + // converting to Annex B mode for getting right NALs
                    'SPROP=$(h264_analyze out.h264 2>&1 | grep -B 6 SPS | head -n1 | cut -c 4- | xxd -r -p | base64)","$(h264_analyze out.h264 2>&1 | grep -B 5 PPS | head -n1 | cut -c 4- | xxd -r -p | base64)\n' + // generating "sprop..."
                    'rm -f out.h264\n' +    // delete temp file
                    'ffmpeg ' + input_options + ' -r 1 -s ' + createInfo.broadcast.width + 'x' + createInfo.broadcast.height + ' -vframes 1 -y -f image2 orig.jpg\n' +
                    'curl -s -T orig.jpg -H "content-type:image/jpeg" "' + createInfo.thumbnail_upload_url + '"\n' +
                    'rm -f orig.jpg\n' +
                    'ffmpeg -re ' + input_options + ' $FFOPTS -metadata sprop-parameter-sets="$SPROP"' +
                    ' -strict experimental -acodec aac -b:a 128k -ar 44100 -ac 1 -f flv' +
                    ' rtmp://' + createInfo.host + ':' + createInfo.port + '/'+createInfo.application+'?t=' + createInfo.credential + '/' + createInfo.stream_name + ' < /dev/null &\n' +
                    'while true\n' +
                    ' do\n' +
                    '  echo -e "\\033[0;32m[My-OpenPeriscope] `curl -s --form "cookie=' + loginTwitter.cookie + '" --form "broadcast_id=' + createInfo.broadcast.id + '" https://api.periscope.tv/api/v2/pingBroadcast`\\033[0m"\n' +
                    '  sleep 20\n' +
                    ' done\n' +
                    'curl --form "cookie=' + loginTwitter.cookie + '" --form "broadcast_id=' + createInfo.broadcast.id + '" https://api.periscope.tv/api/v2/endBroadcast';
                var sh = 'stream_' + filename + '.sh';
                $('#Create').append('<pre>' + code + '</pre>',
                    $('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(code) + '" download="' + sh + '">Download .SH</a>').click(saveAs.bind(null, code, sh)),
                    $('<div class="card RUNNING"/>').append(getDescription(createInfo.broadcast)));
            });
            //var broadcast = response.broadcast;
        });
    });
    $('#Create').append(createButton);

    }
}
