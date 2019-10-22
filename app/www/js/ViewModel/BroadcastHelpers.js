var broadcastsCache = {
    idsQueue: [],
    oldBroadcastsList: [],
    interestingList: [],
    autoGettinList: [],
    filters:{
        hideProducer: false,
        hideEnded: false,
        languages:{
            Arabic: 'ar',
            Armenian: 'hy',
            Chinese: 'zh',
            Danish: 'da',
            English: ['en','us'],
            Finnish: 'fi',
            French: 'fr',
            German: 'de',
            Hebrew: 'he',
            Indonesian: 'id',
            Italian: 'it',
            Japanese: 'ja',
            Kazakh: 'kk',
            Korean: 'ko',
            Norwegian: 'nb',
            Polish: 'pl',
            Portuguese: 'pt',
            Romanian: 'ro',
            Russian: 'ru',
            Spanish: 'es',
            Swedish: 'sv',
            Turkish: 'tr',
            Ukrainian: 'uk',
            other: 'other'
        },
        languagesToHide: []
    }
};

var broadcastsWithLinks = {
    idsQueue:[],
    addToBroadcastsLinks(id,params){
        if(this[id]){
            $.extend(true, this[id], params);
        }else{
            this[id] = params;
        }
    }
};

function getDescription(stream) {
    var title = emoji_to_img(stream.status || 'Untitled');
    var featured_reason = '';
    if (stream.featured) {
        title += '<span class="featured" style="background: ' + (stream.featured_category_color || '#FFBD00') + '">' + (stream.featured_category || 'POPULAR') + '</span>';
        if (stream.featured_reason)
            featured_reason = ' <i>'+stream.featured_reason+'</i>';
    }
    var date_created = new Date(stream.created_at);
    var duration = stream.end || stream.timedout ? new Date(new Date(stream.end || stream.timedout) - (new Date(stream.start))) : 0;
    var userLink = $('<a class="username">' + emoji_to_img(stream.user_display_name) + ' (@' + stream.username + ')</a>');
    userLink.click(PeriscopeWebClient.SwitchSection.bind(null, 'User', stream.user_id));
    if (stream.share_display_names) {
        var sharedByLink = $('<a class="sharedByUsername">'+ emoji_to_img(stream.share_display_names[0]) + '</a>')
            .click(PeriscopeWebClient.SwitchSection.bind(null, 'User', stream.share_user_ids[0]));
    }
    if (stream.user_id == loginTwitter.user.id)
        var deleteLink = $('<a class="delete right icon" title="Delete"/>').click(function () {
            PeriscopeWrapper.V2_POST_Api('deleteBroadcast', {broadcast_id: stream.id}, function (resp) {
                if (resp.success)
                    description.parent().remove();
            });
        });
    var screenlistLink = $('<a class="screenlist right icon">Preview</a>').click(function () {
        PeriscopeWrapper.V2_POST_Api('replayThumbnailPlaylist', {
            broadcast_id: stream.id
        }, function (thumbs) {
            loadScreenPreviewer(stream, thumbs);
        });
    });

    var brdcstImage = $('<img lazysrc="' + stream.image_url_small + '"></img>').one('error',function(){this.src = stream.image_url});
    var showImage = $('<a class="lastestImage"></a>').click(function () {
        var win = window.open("", "screen", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=600,top=100,left="+(screen.width/2));
        win.document.head.innerHTML = '<title>'+(stream.status || 'Untitled')+' [My-OpenPeriscope]</title>';
        win.document.body.innerHTML = '<img src="' + stream.image_url + '"/>';
    }).append(brdcstImage, (stream.is_locked ? '<img src="' + IMG_PATH + '/images/lock-white.png" class="lock"/>' : '') 
    + ((stream.broadcast_source === 'producer' || stream.broadcast_source === 'livecms') ? '<span class="sProducer">Producer</span>': ''));
    var watchingTitle=('<div class="watching right icon" title="Watching">' + (stream.n_total_watching || stream.n_web_watching || stream.n_watching || stream.n_total_watched || 0) + '</div>\
    <a target="_blank" href="https://www.periscope.tv/w/' + stream.id + '" class="broadcastTitle">' + title + '</a>'+featured_reason)
    var chatLink = $('<a class="chatlink right icon">Chat</a>').click(PeriscopeWebClient.SwitchSection.bind(null, 'Chat', stream.id));
    var description = $('<div class="description"></div>')
        .append(showImage, watchingTitle, deleteLink, '<br/>', screenlistLink, userLink, (sharedByLink ? [', shared by ', sharedByLink] : ''), (stream.channel_name ? ', on: ' + emoji_to_img(stream.channel_name) : ''), '<br/>', chatLink,
            '<span class="date icon" title="Created">' + zeros(date_created.getDate()) + '.' + zeros(date_created.getMonth() + 1) + '.' + date_created.getFullYear() + ' ' + zeros(date_created.getHours()) + ':' + zeros(date_created.getMinutes()) + '</span>'
            + (duration ? '<span class="time icon" title="Duration">' + zeros(duration.getUTCHours()) + ':' + zeros(duration.getMinutes()) + ':' + zeros(duration.getSeconds()) + '</span>' : '')
            + (stream.friend_chat ? '<span class="friend_chat" title="Chat only for friends"/>' : '')
            + (stream.is_locked ? '<span class="is_locked" title="Locked"/>' : ''),
            '<br/><span class="lang right" title="Language ' + stream.language + '">' + getFlag(stream.language) + '</span>',
            (stream.has_location ? $('<span style="cursor:pointer;">' + stream.country + ', ' + stream.city + '</span>').click(PeriscopeWebClient.SwitchSection.bind(null, 'Map', stream.ip_lat + ',' + stream.ip_lng)) : ''), '<div class="links"><div class="responseLinks"/><div class="responseLinksReplay"/></div>');
    return description[0];
}

function loadScreenPreviewer(stream, thumbs) {
    var win = window.open("", "screenPreviewer" + (settings.previewSeparateWindows?stream.id:''), "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=550,top=100,left="+(screen.width/2));
    var title = '<title>'+(stream.status || 'Untitled')+' [My-OpenPeriscope]</title>';
    var html = '<style type="text/css">.hideImages{display: none;}#screenPreviewer{height: 90%; position: absolute;left: 50% ;transform: translateX(-50%); -webkit-transform: translateX(-50%); border: 1px solid gray} body{background: #2A2A2A} a{color: white; display: block}</style>'
        +'<a href="#" id="button">Switch to screenlist</a><div id="screenPreviewer"></div>';
    for (var i in thumbs.chunks) {
        html+='<img src="' + thumbs.chunks[i].tn + '"/>';
    }
    html+='<script>\
    setTimeout(function () {\
        var images = document.querySelectorAll("img");\
        var widowWidth = (0.9 * window.innerWidth) || 720;\
        var bg = document.getElementById("screenPreviewer");\
        var lastI = 0;\
        var button = document.getElementById("button");\
        button.onclick = function () {\
            bg.style.width = widowWidth;\
            bg.style.display == "block" ? bg.style.display = "none" : bg.style.display = "block";\
            for (var j = 0, len = images.length; j < len; j++)\
            images[j].className == "hideImages" ? (images[j].className = "") : (images[j].className = "hideImages");\
            var i = 0;\
            bg.onmousemove = function (event) {\
                i = Math.floor(event.offsetX / (widowWidth / len));\
                if (i >= len) i = len;\
                if (i < 1) i = 0;\
                if (i != lastI) {\
                    if (images[i].complete)\
                    bg.style.background = "url(" + images[i].src + ") no-repeat center /contain";\
                    lastI = i;\
                }\
            }\
        }\
    }, 100);\
    setTimeout(function () {\
        button.click();\
    }, 200);\
    </script>';
    win.document.body.innerHTML = '';
    win.document.write(title,html);

}

function getBothURLs(id) {
    var live_url = '';
    var urlCallback = function (hls_url, replay_url, cookies, _name, _folder_name, _broadcast_info, _partial_replay) {
        broadcastsCache.interestingList.indexOf(id) < 0 ? broadcastsCache.interestingList.push(id) : '';
        if(broadcastsCache.interestingList.length > 100){
            broadcastsCache.interestingList.shift();
        }
        if(hls_url){
            live_url = hls_url;
            getURL(id, urlCallback, true, true);
        }else if(replay_url){
            switchSection('Console', {url: live_url, rurl: replay_url, cookies: cookies, name: _name, folder_name: _folder_name, broadcast_info: _broadcast_info});
        }else if(hls_url === null && replay_url === null && liveUrl) { //when live just started and no partial replay available
            switchSection('Console', {url: live_url, rurl: '', cookies: cookies, name: _name, folder_name: _folder_name, broadcast_info: _broadcast_info});
        }
    }
    getURL(id, urlCallback);
}
function getM3U(id, jcontainer) {
    var liveLContainer = jcontainer.find('.responseLinks');
    var replayLContainer = jcontainer.find('.responseLinksReplay');
    liveLContainer.addClass('oldLinks');
    replayLContainer.addClass('oldLinks');
    broadcastsCache.interestingList.indexOf(id) < 0 ? broadcastsCache.interestingList.push(id) : '';
    if(broadcastsCache.interestingList.length > 100){
        broadcastsCache.interestingList.shift();
    }
    var urlCallback = function (hls_url, replay_url, cookies, _name, _folder_name, _broadcast_info, _partial_replay) {
        !_partial_replay ? (liveLContainer.removeClass('oldLinks'), liveLContainer.children().length ? liveLContainer.empty() : '') : '';
        (_partial_replay || replay_url) ? (replayLContainer.removeClass('oldLinks'), replayLContainer.children().length ?  replayLContainer.empty() : '') : '';

        var locked = _broadcast_info.is_locked;
        limitAddIDs(broadcastsWithLinks, id, 200, []);
        if (hls_url) {
            var clipboardLink = $('<a data-clipboard-text="' + hls_url + '" class="linkLive button2" title="Copy live broadcast URL">Copy URL</a>');
            var clipboardDowLink = $('<a data-clipboard-text="' + 'node periscopeDownloader.js ' + '&quot;' + hls_url + '&quot;' + ' ' + '&quot;' + (_name || 'untitled') + '&quot;' +( locked ? (' ' + '&quot;' + cookies + '&quot;') : '') + '" class="linkLive button2">NodeDown</a>');
            var downloadLink = $('<a class="linkLive button2" title="Record live broadcast">Record</a>')
            .click(switchSection.bind(null, 'Console', {url: hls_url, rurl: '', cookies: cookies, name: _name, folder_name: _folder_name, broadcast_info: _broadcast_info}));
            liveLContainer.append(
                settings.showM3Ulinks ? '<a href="' + hls_url + '">Live M3U link</a>' : '', settings.showM3Ulinks ? ' | ' : '',
                NODEJS ? [downloadLink, ' | ' ]: '',
                clipboardLink,
                ((!NODEJS && (settings.showNodeDownLinks || (settings.showNodeDownLinksPrv && _broadcast_info.is_locked))) ? [' | ' ,clipboardDowLink] : ''), '<br/>'
            );
            new ClipboardJS(clipboardLink.get(0));
            new ClipboardJS(clipboardDowLink.get(0));

            var linksObj = {
                m3uLink : $('<a href="' + hls_url + '">Live M3U link</a>'),
                downloadLink : downloadLink.clone(true,true),
                clipboardLink : clipboardLink.clone(),
                clipboardDowLink : clipboardDowLink.clone()
            }
            broadcastsWithLinks.addToBroadcastsLinks(id,linksObj)

            settings.showPRlinks ? getURL(id, urlCallback, true) : '';
        }else if (replay_url){
            var replay_base_url = replay_url.replace(/playlist.*m3u8/ig, '');
            GM_xmlhttpRequest({
                method: 'GET',
                url: replay_url,
                headers: {
                    Cookie: cookies
                },
                onload: function (m3u_text) {
                    m3u_text = m3u_text.responseText.replace(/(^[^#][^\s].*)/gm, replay_base_url + '$1');
                    var link = $('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(m3u_text) + '" download="playlist.m3u8">Download' + (_partial_replay ? ' PR ' : ' replay ' ) + 'M3U</a>').click(saveAs.bind(null, m3u_text, 'playlist.m3u8'));
                    var clipboardLink = $('<a data-clipboard-text="' + replay_url + '" class="button2 ' + (_partial_replay ? 'linkPartialReplay' : 'linkReplay') + '" title="' + (_partial_replay ? 'Copy partial replay URL' : 'Copy replay URL') +'">' + (_partial_replay ? 'Copy PR_URL' : 'Copy R_URL') + '</a>');
                    var clipboardDowLink = $('<a data-clipboard-text="' + 'node periscopeDownloader.js ' + '&quot;' + replay_url + '&quot;' + ' ' + '&quot;' + (_name || 'untitled') + '&quot;' + (locked ? (' ' + '&quot;' + cookies + '&quot;') : '') + '" class="' + (_partial_replay ? 'linkPartialReplay' : 'linkReplay') + ' button2">' + (_partial_replay ? 'PR_NodeDown' : 'R_NodeDown') + '</a>');
                    var downloadLink = $('<a class="' + (_partial_replay ? 'linkPartialReplay' : 'linkReplay') + ' button2" title="' + (_partial_replay ? 'Download partial replay' : 'Download replay') + '">' +(_partial_replay ? 'Download PR' : 'Download' ) + '</a>')
                    .click(switchSection.bind(null, 'Console', {url: '', rurl: replay_url, cookies: cookies, name: _name, folder_name: _folder_name, broadcast_info: _broadcast_info}));
                    
                    replayLContainer.append(
                        settings.showM3Ulinks ? [link,  ' | '] : '',
                        NODEJS ? [downloadLink.clone(true,true), ' | '] : '',
                        clipboardLink,
                        ((!NODEJS && (settings.showNodeDownLinks || (settings.showNodeDownLinksPrv && locked))) ? [' | ' ,clipboardDowLink] : ''), '<br/>'
                    );
                    new ClipboardJS(clipboardLink.get(0));
                    new ClipboardJS(clipboardDowLink.get(0));

                    var repLinksObj = {
                        Rm3uLink : link,
                        RdownloadLink : downloadLink.clone(true,true),
                        RclipboardLink : clipboardLink.clone(),
                        RclipboardDowLink : clipboardDowLink.clone()
                    }

                    if(broadcastsWithLinks[id]){
                        $.extend(true, broadcastsWithLinks[id], repLinksObj);
                    }else{
                        broadcastsWithLinks[id] = repLinksObj;
                    }

                    if (locked && !broadcastsWithLinks[id].hasOwnProperty('decryptKey')){
                            var keyURI = m3u_text.split('\n').filter(function (line) {
                                return /(^#EXT-X-KEY:.+)/g.test(line);
                            });
                            keyURI = keyURI[0].split('"')[1];
                            saveDecryptionKey(keyURI, id, cookies, true);
                    }
                }
            });
        }
    }
    getURL(id, urlCallback);
}



