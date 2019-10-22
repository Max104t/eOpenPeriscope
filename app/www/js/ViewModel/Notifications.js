var Notifications = {
    interval: null,
    notifs_available: null,
    old_list: null,
    default_interval: 15,
    default_replay_limit: 3600,
    start: function () {
        if (!this.interval) {
            if (typeof this.notifs_available !== 'boolean') {
                this.notifs_available = false;
                if ("Notification" in window && Notification.permission === "granted")
                    this.notifs_available = true;
                else if (Notification.permission !== 'denied')
                    Notification.requestPermission(function (permission) {
                        if (permission === "granted")
                            Notifications.notifs_available = true;
                    });
            }
            this.old_list = JSON.parse(localStorage.getItem('followingBroadcastFeed')) || [];
            if (!settings.followingInterval)
                setSet('followingInterval', this.default_interval);
                if (!settings.replayTimeLimit)
                setSet('replayTimeLimit', this.default_replay_limit);
            if (settings.followingNotifications || settings.automaticDownload)
                this.interval = setInterval(PeriscopeWrapper.V2_POST_Api.bind(null, 'followingBroadcastFeed', {}, function (new_list) {
                    var getReplayUrl;
                    var cardsContainer = $('#right > div:visible > div');
                    var new_list_ids =[];
                    for (var i in new_list) {
                        var contains = false;
                        var stateChanged = false;
                        new_list_ids.push(new_list[i].id);
                        var repeatInteresting = broadcastsCache.autoGettinList.indexOf(new_list[i].id) >= 0;
                        var broadcastCard = cardsContainer.find('.card.' + new_list[i].id).not('.downloadCard, .cardProfileImg');
                        broadcastCard.removeClass('RUNNING').addClass(new_list[i].state);

                        if (new_list[i].state === 'RUNNING' && settings.updateThumbnails){
                            var oldImage = broadcastCard.find('.lastestImage img')[0];
                            oldImage ? oldImage.src ? oldImage.src = new_list[i].image_url_small : '' : '' ;
                        }
                        for (var j in Notifications.old_list)
                            if (Notifications.old_list[j].id == new_list[i].id) {
                                contains = true;
                                if((new_list[i].state === 'ENDED' || new_list[i].state === 'TIMED_OUT') && (Notifications.old_list[j].state === 'RUNNING')){
                                    stateChanged = true;
                                    if(repeatInteresting)  {
                                        broadcastsCache.autoGettinList.splice(broadcastsCache.autoGettinList.indexOf(new_list[i].id),1)
                                        repeatInteresting = false;
                                    }
                                }
                                break;
                            }
                        if (!contains) { // NEW BRDCST!
                            // Show notification
                            if (settings.followingNotifications && Notifications.notifs_available) {
                                setTimeout(function (i) {   // fix for massive firing
                                    return function () {
                                        var date_created = new Date(new_list[i].start);
                                        var start = date_created.getFullYear() + '-' + zeros(date_created.getMonth() + 1) + '-' + zeros(date_created.getDate()) + '_' + zeros(date_created.getHours()) + ':' + zeros(date_created.getMinutes());
                                        new Notification(new_list[i].user_display_name + (new_list[i].state == 'RUNNING' ? ' is live now' : ' uploaded replay'), {
                                            body: '[' + start + '] ' + (new_list[i].status || 'Untitled'),
                                            icon: new_list[i].image_url
                                        }).onclick = function () {
                                            window.open('https://www.periscope.tv/w/' + new_list[i].id);
                                            this.close();
                                        };
                                    };
                                }(i), 300 * i);
                            }
                            // Start the record
                            if (settings.automaticDownload && new_list[i].state == 'RUNNING' && NODEJS) {
                                var downloadBroadcast = false;

                                if (settings.privateDownload && new_list[i].is_locked)
                                    downloadBroadcast = true;
                                else if (settings.sharedDownload && new_list[i].share_user_ids)
                                    downloadBroadcast = true;
                                else if (settings.followingDownload && !new_list[i].share_user_ids)
                                    downloadBroadcast = true;
                                else if (settings.selectedDownload && selectedDownloadList.includes(new_list[i].user_id))
                                    downloadBroadcast = true;
                                if (downloadBroadcast) {
                                    if(settings.replayTimeLimit > 2){
                                        let liveUrl;
                                        let urlCallback = function (live, replay, cookies, _name, _folder_name, _broadcast_info, _partial_replay) {
                                            if(live){
                                                let savedLinks = broadcastsWithLinks[_broadcast_info.id];
                                                (_broadcast_info.is_locked && (savedLinks && !savedLinks.hasOwnProperty('decryptKey') || !savedLinks)) ? saveDecryptionKey(live, _broadcast_info.id, cookies, false) : '';//save key while it's live
                                                liveUrl = live;
                                                getURL(_broadcast_info.id, urlCallback, true, true);
                                            }else if(replay){
                                                download(_folder_name, _name, liveUrl, replay, cookies, _broadcast_info, null, true);
                                            }else if(live === null && replay === null && liveUrl){//when live just started and no partial replay available
                                                download(_folder_name, _name, liveUrl, '', cookies, _broadcast_info);
                                            }
                                        }
                                        getURL(new_list[i].id, urlCallback);
                                    }else{
                                        getURL(new_list[i].id, function (live, replay, cookies, _name, _folder_name, _broadcast_info) {
                                            if (live){
                                                let savedLinks = broadcastsWithLinks[_broadcast_info.id];
                                                (_broadcast_info.is_locked && (savedLinks && !savedLinks.hasOwnProperty('decryptKey') || !savedLinks)) ? saveDecryptionKey(live, _broadcast_info.id, cookies, false) : '';//save key while it's live
                                                download(_folder_name, _name, live, '', cookies, _broadcast_info);
                                            } else if (replay)
                                                download(_folder_name, _name, '', replay, cookies, _broadcast_info);
                                        });
                                    }
                                }
                            }
                            //save decryption key 
                            if (!downloadBroadcast){//no need to duplicate requests for key when it's auto downloading broadcast
                            getURL(new_list[i].id, function (live, replay, cookies, _name, _folder_name, _broadcast_info) {
                                    var savedLinks = broadcastsWithLinks[_broadcast_info.id];
                                    if(_broadcast_info.is_locked && (savedLinks && !savedLinks.hasOwnProperty('decryptKey') || !savedLinks)){
                                        live ? '' : live = replay;
                                        saveDecryptionKey(live, _broadcast_info.id, cookies, false);
                                    }
                                })
                            }//save decryption key end
                        }
                        // log live broadcasts to a file
                        if (!contains || stateChanged || repeatInteresting) { // NEW BRDCST! or changed state from live to replay
                            if((NODEJS && settings.logToFile && !(new_list[i].state === 'ENDED' || new_list[i].state === 'TIMED_OUT' )) && !repeatInteresting){
                                const fs = require('fs');
                                var date_start = new Date(new_list[i].start);

                                fs.appendFile(settings.downloadPath + '/' + 'Broadcasts_log.txt', ('* ' + '-LIVE- ' + (new_list[i].is_locked ? 'PRIVATE ' : '') + 'start@'
                                + zeros(date_start.getHours()) + ':' + zeros(date_start.getMinutes()) + ' **' + new_list[i].user_display_name + '** (@' + new_list[i].username + ')(**ID:** ' + new_list[i].id + ') **' + (new_list[i].status || 'Untitled') + ',** [' + new_list[i].language + '] '
                                + (new_list[i].share_display_names ? ['*shared by:* ' + new_list[i].share_display_names[0]] : '') + (new_list[i].channel_name ? [' *on:* ' + new_list[i].channel_name] : '') + '\n'),
                                'utf8',function () {}); //log broadcasts to .txt
                            }

                            if(new_list[i].state === 'ENDED' || new_list[i].state === 'TIMED_OUT' || repeatInteresting){
                                getReplayUrl = function (live, replay, cookies, _name, _folder_name, _broadcast_info, _partial_replay) {
                                    // log ended broadcasts to a file
                                    if(NODEJS && settings.logToFile && !_partial_replay && !repeatInteresting){
                                        const fs = require('fs');
                                        var date_start = new Date(_broadcast_info.start);
                                        var savedLinks = broadcastsWithLinks[_broadcast_info.id];

                                        fs.appendFile(settings.downloadPath + '/' + 'Broadcasts_log.txt', ('* ' +  'REPLAY ' + (_broadcast_info.is_locked ? 'PRIVATE ' : '') + 'start@'
                                        + zeros(date_start.getHours()) + ':' + zeros(date_start.getMinutes()) + ' **' + _broadcast_info.user_display_name + '** (@' + _broadcast_info.username + ')(**ID:** ' + _broadcast_info.id + ') **' + (_broadcast_info.status || 'Untitled') + ',** [' + _broadcast_info.language + '] '
                                        +  ((savedLinks && savedLinks.hasOwnProperty('decryptKey'))? ('**KEY:** ' + savedLinks.decryptKey) : '') + '\n' + (replay ? (replay + '\n') : '')),
                                        'utf8',function () {}); //log replays to .txt 
                                    }
                                    ////////// log live broadcasts to a file end
                                    if(live){
                                        setTimeout(function (a1,a2) {//some are ended in following feed and running when you try to get replay url
                                            getURL(a1, a2);
                                        }, 1000, _broadcast_info.id, getReplayUrl);

                                    }else if (replay){
                                        var attachReplayLinks = function(keyFail){
                                            if(!keyFail){
                                                limitAddIDs(broadcastsWithLinks, _broadcast_info.id, 200, []);

                                                var clipboardLink = $('<a data-clipboard-text="' + replay + '" class="'+ (_partial_replay ? 'linkPartialReplay':'linkReplay') + ' button2" title="Copy ' + (_partial_replay ? 'partial ' : '') + 'replay URL">'+ (_partial_replay ? 'Copy PR_URL':'Copy R_URL') +'</a>');
                                                new ClipboardJS(clipboardLink.get(0));

                                                var clipboardDowLink = $('<a data-clipboard-text="' + 'node periscopeDownloader.js ' + '&quot;' + replay + '&quot;' + ' ' + '&quot;' + (_name || 'untitled') + '&quot;' + ( _broadcast_info.is_locked ? (' ' + '&quot;' + cookies + '&quot;') : '') + '" class="' + (_partial_replay ? 'linkPartialReplay':'linkReplay') + ' button2">' + (_partial_replay ? 'PR_NodeDown' : 'R_NodeDown') + '</a>');
                                                new ClipboardJS(clipboardDowLink.get(0));

                                                var downloadLink = $('<a class="'+ (_partial_replay ? 'linkPartialReplay':'linkReplay') + ' button2" title="Download replay">▼</a>').click(switchSection.bind(null, 'Console', {url: '', rurl: replay, cookies: cookies, name: _name, folder_name: _folder_name, broadcast_info: _broadcast_info}));
                                                var refreshIndicator = $('<a> ◄</>')

                                                setTimeout(function(){refreshIndicator.hide()}, 2000);
                                                var showDowLink = !NODEJS && (settings.showNodeDownLinks || (settings.showNodeDownLinksPrv && _broadcast_info.is_locked));
                                                var card = cardsContainer.find('.card.' + _broadcast_info.id);

                                                card.find('.responseLinks').empty();
                                                card.find('.responseLinksReplay').empty().append(
                                                    (NODEJS ? [downloadLink,' | '] : ''),clipboardLink, showDowLink ? [' | ', clipboardDowLink] : '', refreshIndicator
                                                );

                                                var linksObj = {
                                                    RdownloadLink : downloadLink.clone(true,true),
                                                    RclipboardLink : clipboardLink.clone(),
                                                    RclipboardDowLink : clipboardDowLink.clone()
                                                }
                                                
                                                broadcastsWithLinks.addToBroadcastsLinks(_broadcast_info.id, linksObj)
                                            }
                                        }
                                        
                                        var savedLinks = broadcastsWithLinks[_broadcast_info.id];
                                        if(_broadcast_info.is_locked && (savedLinks && !savedLinks.hasOwnProperty('decryptKey') || !savedLinks)){
                                            saveDecryptionKey(replay, _broadcast_info.id, cookies, false, attachReplayLinks);
                                        }else{
                                            attachReplayLinks();
                                        }
                                    }
                                }
                                getURL(new_list[i].id, getReplayUrl, repeatInteresting);
                            }
                        }
                    }
                    for (var m in broadcastsCache.idsQueue){//update state of deleted broadcasts
                        if(new_list_ids.indexOf(broadcastsCache.idsQueue[m]) < 0){
                            var bid = broadcastsCache.idsQueue[m];
                            var card = cardsContainer.find( '.card.' + bid).not('.downloadCard, .cardProfileImg');
                            if(!card.hasClass('deletedBroadcast')){
                                card.removeClass('RUNNING').addClass('ENDED deletedBroadcast');
                            }
                        }
                    }

                    for (var l = new_list.length - 1; l >= 0  ; l--) {
                        broadcastsCache[new_list[l].id] = $.extend({}, new_list[l]);
                        limitAddIDs(broadcastsCache, new_list[l].id, 100, new_list_ids);
                    }

                    for (var n in broadcastsCache.idsQueue) {
                        cardsContainer.find('.card.' + broadcastsCache.idsQueue[n]).not('.downloadCard, .cardProfileImg').find('.recContainer').empty().append(downloadStatus(broadcastsCache.idsQueue[n], true, null));
                    }
                    
                    Notifications.old_list = new_list;
                    localStorage.setItem('followingBroadcastFeed', JSON.stringify(Notifications.old_list));
                }), (settings.followingInterval || this.default_interval) * 1000);
        }
    },
    stop: function () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
};
