var ChatController = {
    init: function(parent) {

        var broadcast_id = $('<input id="broadcast_id" type="text" size="15" placeholder="broadcast id">');
        var title = $('<span id="title"/>');
        var userlist = $('<div id="userlist"/>');
        var chat = $('<div id="chat"/>');
        var textBox = $('<input type="text" id="message">');
        var historyDiv = $('<div/>');
        if (NODEJS) {
            WebSocket = require('ws');
            $(window).on('unload', function(){
                if (ws)
                    ws.close();
            });
        }
    
        function userlistAdd(user){
            var id = user.id || user.remoteID || user.user_id;
            if (!userlist.find('#'+id).length && (user.display_name || user.displayName)) {
                var userCard = $('<div class="user" id="' + id + '">' + emoji_to_img(user.display_name || user.displayName) + ' </div>')
                    .append($('<div class="username">(' + user.username + ')</div>')
                    .click(switchSection.bind(null, 'User', id)));
                addUserContextMenu(userCard, id, user.username);
                userlist.append(userCard);
            }
        }
        function userlistRemove(user){
            var id = user.id || user.remoteID || user.user_id;
            userlist.find('#'+id).remove();
        }
        function renderMessages(event, container) {
            if (event.occupants) {  // "presense" for websockets
                userlist.empty();
                var user;
                for (var j in event.occupants)
                    if ((user = event.occupants[j]) && user.display_name) {
                        userlistAdd(user);
                    }
            }
            else
            switch (event.type) {
                case 1:  // text message
                    var date = new Date((parseInt(event.ntpForLiveFrame.toString(16).substr(0, 8), 16) - 2208988800) * 1000);
                    if ($.isArray(container)) {   // for subtitles
                        // for (var i = 0; i < event.body.length; i++) // remove emoji surrogates
                        //     if (String.fromCodePoint(event.body.codePointAt(i)).length == 2) {
                        //         event.body = event.body.slice(0, i) + event.body.slice(i + 2);
                        //         i--;
                        //     }
                        container.push({
                            date: date,
                            user: event.username,
                            text: event.body
                        });
                    } else {
                        var messageBox =$('<div class="messageBox"/>');
                        var profImage = $('<div style="background-image:url(' + (event.profile_image_url ? event.profile_image_url : event.profileImageURL) + ')" class="chatUserImg">').click(function () {
                            $(this).toggleClass("bigThumbnail");
                            $(this).next().children().first().toggleClass("hidename");
                        });
                        var messageTime = '<span class="messageTime">[' + zeros(date.getHours()) + ':' + zeros(date.getMinutes()) + ':' + zeros(date.getSeconds()) + '] </span>';
                        var display_name = $('<span class="displayName hidename">' + (event.locale ? getFlag(event.locale) : '') + ' ' + emoji_to_img(event.display_name || event.displayName || ' ') + '</span>').click(switchSection.bind(null, 'User', event.user_id));
                        var username = $('<span class="user">&lt;' + event.username + '&gt;</span>').click(function () { // insert username to text field
                            textBox.val(textBox.val() + '@' + $(this).text().substr(1, $(this).text().length - 2) + ' ');
                            textBox.focus();
                        });
                        var html = $('<div class="chatMessage"/>').append(display_name, ' ', username, ' ', messageTime, '</br>', '<span class="messageBody">'+ emoji_to_img($('<div/>').text(event.body).html()).replace(/(@\S+)/g, '<b>$1</b>')+'</span>');
                        messageBox.append(profImage,html);
                        if (!event.body)    // for debug
                            console.log('empty body!', event);
                        container.append(messageBox);
                    }
                    break;
                case 2: // heart
                    /*moderationReportType: 0
                    moderationType: 0*/
                    break;
                case 3: // "joined"
                    if (event.displayName && !$.isArray(container))
                        userlistAdd(event);
                    break;
                case 4: // broadcaster moved to new place
                    if ($('#debug')[0].checked && !$.isArray(container))
                        console.log('new location: ' + event.lat + ', ' + event.lng + ', ' + event.heading);
                    break;
                case 5: // broadcast ended
                    if (!$.isArray(container))
                        container.append('<div class="service">*** ' + (event.displayName || 'Broadcaster') + (event.username ? ' (@' + event.username + ')' : '') + ' ended the broadcast</div>');
                    break;
                case 6: // followers invited
                    if (!$.isArray(container))
                        container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + '): ' + event.body.replace('*%s*', event.invited_count) + '</div>');
                    break;
                case 7: // BROADCAST_STARTED_LOCALLY (?)
                    if (!$.isArray(container)) {
                        container.append('<div class="service">*** Broadcast started locally</div>');
                        console.log('BROADCAST_STARTED_LOCALLY', event);
                    }
                    break;
                case 8: // replay available
                    break;
                case 9: // Broadcaster starts streaming. uuid=SE-0. timestampPlaybackOffset
                    break;
                case 10: //LOCAL_PROMPT_TO_FOLLOW_BROADCASTER (?)
                    if (!$.isArray(container)) {
                        container.append('<div class="service">*** LOCAL_PROMPT_TO_FOLLOW_BROADCASTER</div>');
                        console.log('LOCAL_PROMPT_TO_FOLLOW_BROADCASTER', event);
                    }
                    break;
                case 11: //LOCAL_PROMPT_TO_SHARE_BROADCAST (?)
                    if (!$.isArray(container)) {
                        container.append('<div class="service">*** LOCAL_PROMPT_TO_SHARE_BROADCAST</div>');
                        console.log('LOCAL_PROMPT_TO_SHARE_BROADCAST', event);
                    }
                    break;
                case 12: // Ban
                case 14: //SUBSCRIBER_BLOCKED_VIEWER
                    if ($.isArray(container))
                        container.push({
                            date: date,
                            user: '',
                            text: '@' + event.broadcasterBlockedUsername + ' has been blocked for message: "' + event.broadcasterBlockedMessageBody +'"'
                        });
                    else
                    container.append('<div class="service">*** @' + event.broadcasterBlockedUsername + ' has been blocked for message: "' + emoji_to_img(event.broadcasterBlockedMessageBody) + '"</div>');
                    break;
                case 13: //SUBSCRIBER_SHARED_ON_TWITTER
                    if (!$.isArray(container))
                        container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + ') shared on twitter</div>');
                    break;
                case 15: //SUBSCRIBER_SHARED_ON_FACEBOOK
                    if (!$.isArray(container))
                        container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + ') shared on facebook</div>');
                    break;
                case 16: //SCREENSHOT
                    if (!$.isArray(container))
                        container.append('<div class="service">*** ' + (event.displayName || '') + (event.username ? ' (@' + event.username + ')':'')+' has made the screenshot</div>');
                    break;
                default: // service messages (event.action = join, leave, timeout, state_changed)
                    if ($('#debug')[0].checked)
                        console.log('renderMessages default!', event);
                    /*event.occupancy && event.total_participants*/
                    break;
            }
        }
        function processWSmessage (message, div) {
            message.payload = JSON.parse(message.payload);
            message.body = $.extend(JSON.parse(message.payload.body), message.payload.sender);
            if ($('#autoscroll')[0].checked)
                chat[0].scrollTop = chat[0].scrollHeight;
            switch (message.kind) {
                case MESSAGE_KIND.CHAT:
                    renderMessages(message.body, div);
                    break;
                case MESSAGE_KIND.CONTROL:
                    switch (message.payload.kind) {
                        case  MESSAGE_KIND.PRESENCE:
                            $('#presence').text(message.body.occupancy + '/' + message.body.total_participants);
                            break;
                        case MESSAGE_KIND.CHAT: // smb joined
                            userlistAdd(message.body); // message.payload.cap
                            break;
                        case MESSAGE_KIND.CONTROL: // smb left
                            userlistRemove(message.body); //message.payload.of
                            break;
                        default:
                            console.log(message);
                    }
                    break;
                default:
                    console.log('default!', message);
            }
        }
        var playButton = $('<a class="button" id="startchat">OK</a>').click(function () {
            clearInterval(chat_interval);
            if (NODEJS && ws && ws.readyState == ws.OPEN)
                ws.close();
            chat.empty();
            userlist.empty();
            title.empty();
            historyDiv.empty();
             //Load user list
            PeriscopeWrapper.V2_POST_Api('getBroadcastViewers', {
                broadcast_id: broadcast_id.val().trim()
            }, function(viewers){
                userlist.empty();
                var user;
                for (var j in viewers.live)
                    if ((user = viewers.live[j]) && user.display_name) {
                        userlistAdd(user);
                    }
            });
            PeriscopeWrapper.V2_POST_Api('accessChannel', {
                broadcast_id: broadcast_id.val().trim()
            }, function (broadcast) {
                var userLink = $('<a class="username">(@' + broadcast.broadcast.username + ')</a>').click(switchSection.bind(null, 'User', broadcast.broadcast.user_id));
                var srtLink = $('<a>SRT</a>').click(function () {
                    Progress.start();
                    var data = [];
                    historyLoad('', data, function(){
                        data.sort(function (a, b) { return a.date - b.date; });
                        var start = new Date(broadcast.broadcast.start);
                        var srt = '';
                        for (var i = 0; i < data.length; i++) {
                            var date0 = new Date(data[i].date - start); // date of the current message
                            var date1 = new Date((i < data.length - 1 ? data[i + 1].date : new Date(broadcast.broadcast.end || new Date())) - start); // date of the next message
                            srt += (i + 1) + '\n' +
                                zeros(date0.getUTCHours()) + ':' + zeros(date0.getMinutes()) + ':' + zeros(date0.getSeconds()) + ','+date0.getMilliseconds()+' --> ' +
                                zeros(date1.getUTCHours()) + ':' + zeros(date1.getMinutes()) + ':' + zeros(date1.getSeconds()) + ','+date1.getMilliseconds()+'\n' +
                                (i > 3 ? '<b>' + data[i - 4].user + '</b>: ' + data[i - 4].text + '\n' : '') +
                                (i > 2 ? '<b>' + data[i - 3].user + '</b>: ' + data[i - 3].text + '\n' : '') +
                                (i > 1 ? '<b>' + data[i - 2].user + '</b>: ' + data[i - 2].text + '\n' : '') +
                                (i > 0 ? '<b>' + data[i - 1].user + '</b>: ' + data[i - 1].text + '\n' : '') +
                                '<b>' + data[i].user + '</b>: ' + data[i].text + '\n\n';
                        }
                        var filename = (broadcast.broadcast.status || 'Untitled') + '.srt';
                        srtLink.unbind('click')
                            .click(saveAs.bind(null, srt, filename))
                            .attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(srt))
                            .attr('download', filename)
                            .get(0).click();
                    });
                });
                title.html((broadcast.read_only?'Read-only | ':'') + '<a href="https://www.periscope.tv/w/' + broadcast.broadcast.id + '" target="_blank">' + emoji_to_img(broadcast.broadcast.status || 'Untitled') + '</a> | '
                    + emoji_to_img(broadcast.broadcast.user_display_name) + ' ')
                    .append(userLink,
                        broadcast.hls_url ? ' | <a href="' + broadcast.hls_url + '">M3U Link</a>' : '',
                        broadcast.replay_url ? ' | <a href="' + broadcast.replay_url + '">Replay Link</a>' : '',
                        broadcast.rtmp_url ? ' | <a href="' + broadcast.rtmp_url + '">RTMP Link</a>' : '',
                        ' | ', srtLink
                    );
                // Load history
                function historyLoad(start, container, callback) {
                    GM_xmlhttpRequest({
                        method: 'POST',
                        url: broadcast.endpoint + '/chatapi/v1/history',
                        data: JSON.stringify({
                            access_token: broadcast.access_token,
                            cursor: start,
                            duration: 100 // actually 40 is maximum
                        }),
                        onload: function (history) {
                            if (history.status == 200) {
                                history = JSON.parse(history.responseText);
                                for (var i in history.messages)
                                    processWSmessage(history.messages[i], container || historyDiv);
                                if (history.cursor != '')
                                    historyLoad(history.cursor, container, callback);
                                else {
                                    Progress.stop();
                                    if (Object.prototype.toString.call(callback) === '[object Function]')
                                        callback();
                                }
                            } else {
                                Progress.stop();
                                if (Object.prototype.toString.call(callback) === '[object Function]')
                                    callback();
                            }
                        }
                    });
                }
                chat.append(historyDiv, $('<center><a>Load history</a></center>').click(function () {
                    Progress.start();
                    historyLoad('');
                    $(this).remove();
                }));
                if (broadcast.read_only)
                    switch (broadcast.type) {
                        case "StreamTypeOnlyFriends":
                            chat.append('<div class="error">*** This chat is for friends only!</div>');
                            break;
                        default:
                            chat.append('<div class="error">*** Chatroom is full! You in read only mode!</div>');
                    }
                // Chat reading & posting
                if (NODEJS) {
                    var openSocket = function (failures) {
                        ws = new WebSocket(broadcast.endpoint.replace('https:', 'wss:').replace('http:', 'ws:') + '/chatapi/v1/chatnow');
    
                        ws.on('open', function open() {
                            // AUTH
                            ws.send(JSON.stringify({
                                payload: JSON.stringify({access_token: broadcast.access_token}),
                                kind: MESSAGE_KIND.AUTH
                            }));
                            // JOIN
                            ws.send(JSON.stringify({
                                payload: JSON.stringify({
                                    body: JSON.stringify({
                                        room: broadcast.room_id
                                    }),
                                    kind: MESSAGE_KIND.CHAT
                                }),
                                kind: MESSAGE_KIND.CONTROL
                            }));
                        });
    
                        ws.on('ping', function (data) {
                            ws.pong(data, {masked: false, binary: true});
                        });
    
                        ws.on('message', function (data) {
                            processWSmessage(JSON.parse(data), chat);
                        });
    
                        ws.on('close', function (code) {
                            ws.close();
                            switch (code) {
                                case 403:   // 403=forbidden
                                    console.log('Forbidden');
                                    break;
                                case 1006:  // 1006=timeout
                                    if (failures < 4) {
                                        setTimeout(openSocket.bind(null, failures + 1), 100);
                                        console.log('reconnect ' + failures);
                                    }
                                    break;
                                case 1000:  // 1000=broadcast ended
                                    break;
                                default:
                                    console.log('websocket closed, code: ', code);
                            }
                        });
    
                        ws.on('error', function () {});
                    };
    
                    function uuid() {//function from stackoverflow
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }
    
                    var sendMessage = function (customtype) {
                        var timestamp = Math.floor(Date.now() / 1000);
                        var ntpstamp = parseInt((timestamp + 2208988800).toString(16) + '00000000', 16); // timestamp in NTP format
                        var message = {
                            body: textBox.val(),
                            //display_name: 'OpenPeriscope',
                            //initials: '',
                            //"moderationReportType": 0,
                            //"moderationType": 0,
                            //v: 2
                            profileImageURL: loginTwitter.user.profile_image_urls[0].url,
                            timestamp: timestamp,
                            remoteID: loginTwitter.user.id,
                            username: loginTwitter.user.username,
                            uuid: uuid(),// no longer identifie yourself as open periscope user on comment or heart.
                            signer_token: broadcast.signer_token,
                            participant_index: broadcast.participant_index,
                            type: customtype || 1,    // "text message"
                            ntpForBroadcasterFrame: ntpstamp,
                            ntpForLiveFrame: ntpstamp
                        };
                        ws.send(JSON.stringify({
                            payload: JSON.stringify({
                                body: JSON.stringify(message),
                                room: broadcast.room_id,
                                timestamp: timestamp
                                //sender
                            }),
                            kind: MESSAGE_KIND.CHAT
                        }), function (error) {
                            textBox.val('');
                            if (error)
                                console.log('message not sent', error);
                            else
                                renderMessages(message, chat);
                        });
                    };
                    if (broadcast.endpoint)
                        openSocket(0);
                } else {
                    if (broadcast.endpoint) {
                        var cursor = null;
                        clearInterval(chat_interval);
                        var prevMessages = [];
                        chat_interval = setInterval(function () {
                            GM_xmlhttpRequest({
                                method: 'POST',
                                url: broadcast.endpoint + '/chatapi/v1/history',
                                data: JSON.stringify({
                                    access_token: broadcast.access_token,
                                    cursor: cursor || (Date.now() - 30000) * 1000000 + '',
                                    limit: 1000
                                }),
                                onload: function (history) {
                                    if (history.status == 200) {
                                        history = JSON.parse(history.responseText);
                                        for (var i in history.messages) {
                                            var contains = false;
                                            for (var j = 0; j < prevMessages.length && !contains; j++) // if prevMessages contains meesage
                                                if (prevMessages[j].signature == history.messages[i].signature)
                                                    contains = true;
                                            if (!contains)
                                                processWSmessage(history.messages[i], chat);
                                        }
                                        prevMessages = history.messages;
                                        cursor = history.cursor;
                                    }
                                }
                            });
                        }, 1000);
                    }
                    var sendMessage = function () {
                        alert('Sending messages available only in standalone version');
                    };
                }
                $('#sendMessage').off().click(sendMessage.bind(null, null));
                $('#sendLike').off().click(sendMessage.bind(null, 2));
                textBox.off().keypress(function (e) {
                    if (e.which == 13) {
                        sendMessage();
                        return false;
                    }
                });
            }, function (error) {
                title.append('<b>' + error + '</b>');
            });
        });
        parent.append(
            $('<div id="Chat"/>').append(
                broadcast_id, playButton, title, '<br/><div id="presence" title="watching/maximum"/>', userlist, chat, $('<div id="underchat">').append(
                    '<label class="right"><input type="checkbox" id="autoscroll" checked/> Autoscroll</label>',
                    '<a class="button right" id="sendLike">\u2665</a><a class="button right" id="sendMessage">Send</a>', $('<div/>').append(textBox)
                )
            )
        );
    }
}
