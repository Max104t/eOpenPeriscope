function getUserDescription(user) {
    user.profile_image_urls.sort(function (a, b) {
        return a.width * a.height - b.width * b.height;
    });
    var verified_icon = user.is_twitter_verified ? ' <svg class="right" title="Verified" viewBox="0 0 17 17" height="1em" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-767.000000, -573.000000)"><g transform="translate(-80.000000, -57.000000)"><g transform="translate(100.000000, 77.000000)"><g transform="translate(400.000000, 401.000000)"><g><g><g transform="translate(347.000000, 152.000000)"><path d="M1.74035847,11.2810213 C1.61434984,11.617947 1.54545455,11.982746 1.54545455,12.3636364 C1.54545455,14.0706983 2.92930168,15.4545455 4.63636364,15.4545455 C5.01725401,15.4545455 5.38205302,15.3856502 5.71897873,15.2596415 C6.22025271,16.2899361 7.2772042,17 8.5,17 C9.7227958,17 10.7797473,16.2899361 11.2810213,15.2596415 L11.2810213,15.2596415 C11.617947,15.3856502 11.982746,15.4545455 12.3636364,15.4545455 C14.0706983,15.4545455 15.4545455,14.0706983 15.4545455,12.3636364 C15.4545455,11.982746 15.3856502,11.617947 15.2596415,11.2810213 C16.2899361,10.7797473 17,9.7227958 17,8.5 C17,7.2772042 16.2899361,6.22025271 15.2596415,5.71897873 C15.3856502,5.38205302 15.4545455,5.01725401 15.4545455,4.63636364 C15.4545455,2.92930168 14.0706983,1.54545455 12.3636364,1.54545455 C11.982746,1.54545455 11.617947,1.61434984 11.2810213,1.74035847 C10.7797473,0.71006389 9.7227958,0 8.5,0 C7.2772042,0 6.22025272,0.71006389 5.71897873,1.74035847 C5.38205302,1.61434984 5.01725401,1.54545455 4.63636364,1.54545455 C2.92930168,1.54545455 1.54545455,2.92930168 1.54545455,4.63636364 C1.54545455,5.01725401 1.61434984,5.38205302 1.74035847,5.71897873 C0.71006389,6.22025272 0,7.2772042 0,8.5 C0,9.7227958 0.71006389,10.7797473 1.74035847,11.2810213 L1.74035847,11.2810213 Z" opacity="1" fill="#88C9F9"></path><path d="M11.2963464,5.28945679 L6.24739023,10.2894568 L7.63289664,10.2685106 L5.68185283,8.44985845 C5.27786241,8.07328153 4.64508754,8.09550457 4.26851062,8.499495 C3.8919337,8.90348543 3.91415674,9.53626029 4.31814717,9.91283721 L6.26919097,11.7314894 C6.66180802,12.0974647 7.27332289,12.0882198 7.65469737,11.7105432 L12.7036536,6.71054321 C13.0960757,6.32192607 13.0991603,5.68876861 12.7105432,5.29634643 C12.3219261,4.90392425 11.6887686,4.90083965 11.2963464,5.28945679 L11.2963464,5.28945679 Z" fill="#FFFFFF"></path></g></g></g></g></g></g></g></g></svg>' : '';
    return $('<div class="description"/>')
    .append((user.profile_image_urls.length ? '<a href="' + (user.profile_image_urls[0].url.includes("googleusercontent.com/") ? user.profile_image_urls[0].url.replace("s96-c", "s0") : user.profile_image_urls[user.profile_image_urls.length - 1].url) + '" target="_blank"><img class="avatar" width="128" lazysrc="' + user.profile_image_urls[0].url + '"></a>' : '<img class="avatar" width="128"/>')
    + '<div class="watching right icon" title="Followers">' + user.n_followers + '</div>'
    + (user.n_hearts ? '<div class="hearts right icon" title="hearts">' + user.n_hearts + '</div>' : '')
    + (user.twitter_screen_name ? '<a class="twitterlink right icon" title="Profile on Twitter" target="_blank" href="https://twitter.com/' + user.twitter_screen_name + '"><svg viewBox="0 0 16 14" height="1em" version="1.2"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-187.000000, -349.000000)" fill="#A4B8BE"><g transform="translate(187.000000, 349.000000)"><path d="M16,2.19685162 C15.4113025,2.4579292 14.7786532,2.63438042 14.1146348,2.71373958 C14.7924065,2.30746283 15.3128644,1.66416205 15.5579648,0.897667303 C14.9237353,1.27380396 14.2212078,1.5469961 13.4734994,1.69424362 C12.8746772,1.05626857 12.0215663,0.6576 11.0774498,0.6576 C9.26453784,0.6576 7.79475475,2.12732457 7.79475475,3.94011948 C7.79475475,4.19739297 7.8238414,4.44793615 7.87979078,4.68817903 C5.15161491,4.55129033 2.73285782,3.24443931 1.11383738,1.25847055 C0.83128132,1.74328711 0.669402685,2.30717021 0.669402685,2.90874306 C0.669402685,4.04757037 1.24897034,5.05231817 2.12976334,5.64095711 C1.591631,5.62392649 1.08551154,5.4762693 0.642891108,5.23040808 C0.64265701,5.2441028 0.64265701,5.25785604 0.64265701,5.27166782 C0.64265701,6.86212833 1.77416877,8.18887766 3.27584769,8.49039564 C3.00037309,8.56542399 2.71038443,8.60551324 2.41097333,8.60551324 C2.19946596,8.60551324 1.99381104,8.58497115 1.79342331,8.54663764 C2.21111233,9.85079653 3.42338783,10.7998291 4.85981199,10.8263406 C3.7363766,11.706724 2.32096273,12.2315127 0.783057171,12.2315127 C0.518116976,12.2315127 0.256805296,12.2160037 0,12.1856881 C1.45269395,13.1170462 3.17817038,13.6604458 5.0319324,13.6604458 C11.0697831,13.6604458 14.3714986,8.65853639 14.3714986,4.32076252 C14.3714986,4.17843105 14.3683383,4.0368604 14.3620176,3.89610909 C15.0033286,3.43329772 15.5598961,2.85513466 16,2.19685162" id="Fill-1" sketch:type="MSShapeGroup"></path></g></g></g></svg></a>' : '')
    + '<a class="periscopelink right icon" title="Profile on Periscope" target="_blank" href="https://periscope.tv/' + user.username + '"><svg version="1.1" height="1em" viewBox="0 0 113.583 145.426"><g><path fill="#A4B8BE" class="tofill" d="M113.583,56.791c0,42.229-45.414,88.635-56.791,88.635C45.416,145.426,0,99.02,0,56.791	C0,25.426,25.426,0,56.792,0C88.159,0,113.583,25.426,113.583,56.791z"/><path fill="#FFFFFF" d="M56.792,22.521c-2.731,0-5.384,0.327-7.931,0.928c4.619,2.265,7.807,6.998,7.807,12.489	c0,7.686-6.231,13.917-13.917,13.917c-7.399,0-13.433-5.779-13.874-13.067c-4.112,5.675-6.543,12.647-6.543,20.191	c0,19.031,15.427,34.458,34.458,34.458S91.25,76.01,91.25,56.979S75.823,22.521,56.792,22.521z"/></g></svg></a>')
    .append($('<div class="username">' + verified_icon + emoji_to_img(user.display_name) + ' (@' + user.username + ')</div>').click(PeriscopeWebClient.SwitchSection.bind(null, 'User', user.id)))
    .append('Created: ' + (new Date(user.created_at)).toLocaleString()
    + (user.description ? '<div class="userdescription">' + emoji_to_img(user.description) +'</div>': '<br/>'))
    .append($('<a class="button' + (user.is_following ? ' activated' : '') + '">' + (user.is_following ? 'unfollow' : 'follow') + '</a>').click(function () {
        var el = this;
        var selectButton=$(el).next().next()
        PeriscopeWrapper.V2_POST_Api(el.innerHTML, { // follow or unfollow
            user_id: user.id
        }, function (r) {
            if (r.success) {
                if (el.innerHTML == 'follow') {
                    el.innerHTML = 'unfollow';
                    $(el).addClass('activated');
                } else {
                    el.innerHTML = 'follow';
                    $(el).removeClass('activated');
                    selectButton.text() == '-' ? selectButton.click() : '';
                }
            }
        })
    }))
    .append($('<a class="button">' + (user.is_blocked ? 'unblock' : 'block') + '</a>').click(function () {
        var el = this;
        PeriscopeWrapper.V2_POST_Api(el.innerHTML == 'block' ? 'block/add' : 'block/remove', {
            to: user.id
            }, function (r) {
                if (r.success)
                el.innerHTML = el.innerHTML == 'block' ? 'unblock' : 'block';
            })
    }))
    .append(NODEJS ? ($('<a class="button' + (selectedDownloadList.includes(user.id) ? ' activated' : '') + '" title="Select/Deselect User">' + (selectedDownloadList.includes(user.id) ? '-' : '+') + '</a>').click(function () {
        var el = this;
        var followButton = $(el).prev().prev()
        if (el.innerHTML == '+') {
            el.innerHTML = '-';
            $(el).addClass('activated');
            followButton.text() == 'follow' ? followButton.click() : '';
        } else {
            el.innerHTML = '+';
            $(el).removeClass('activated');
        }

        var isStoredAt = selectedDownloadList.indexOf(user.id)
        if (isStoredAt === 0){
            selectedDownloadList="";
            localStorage.setItem(('selectedUsersDownloadList'), selectedDownloadList)
        }else if (isStoredAt > 0) {
            selectedDownloadList = selectedDownloadList.substr(0, isStoredAt - 1) + selectedDownloadList.substr(isStoredAt + user.id.length)
            localStorage.setItem(('selectedUsersDownloadList'), selectedDownloadList)
        } else {
            selectedDownloadList += user.id + ','
            localStorage.setItem(('selectedUsersDownloadList'), selectedDownloadList)
        }    
    })) : '')
    .append('<div style="clear:both"/>');
}

function limitAddIDs(toObject, whatID, howMany, inResponse){
    if(toObject.idsQueue.indexOf(whatID) === -1)
            toObject.idsQueue.unshift(whatID);
    var len = toObject.idsQueue.length;
    if(len > howMany){ //to keep catched broadcasts under (howMany) remove first card from bottom that holds deleted broadcast
        for(var i = len - 1; i >= 0; i--){
            if(inResponse.indexOf(toObject.idsQueue[i]) < 0){//if broadcast(id) is on oryginal following list then don't delete it.
                delete toObject[toObject.idsQueue[i]]
                toObject.idsQueue.splice(i,1)
                return;
            }//TODO, list can get bigger than 'howMany'/low priority fix
        }
    }
}
function refreshList(jcontainer, title, refreshFrom) {  // use it as callback arg
    return function (response) {
        jcontainer.html(title || '<div style="clear:both"/>');
        if (response.length) {
            var ids = [];

            var createCard = function (index) {
                var resp;
                if (refreshFrom === 'following' && !settings.classic_cards_order){
                    var deleted = existingBroadcasts.indexOf(broadcastsCache.idsQueue[index]) < 0;
                    resp = broadcastsCache[broadcastsCache.idsQueue[index]];
                } else {
                    resp = response[index];
                }

                deleted ? resp.state = 'ENDED' : ''; //prevent some cached broadcasts from showing as running.
                var isPrivate = resp.is_locked;
                var producer = (resp.broadcast_source === 'producer' || resp.broadcast_source === 'livecms');
                var newHighlight = (broadcastsCache.oldBroadcastsList.indexOf(resp.id) < 0 && refreshFrom === 'following' && broadcastsCache.oldBroadcastsList.length !== 0) ? ' newHighlight' : '';
                var stream = $('<div class="card ' + resp.state + ' ' + resp.id + newHighlight + (deleted ? ' deletedBroadcast' : '') 
                            + (isPrivate ? ' private' : '') + (producer? ' producer ' : '') + '" nr="' + index + '"' + ' lang="' + resp.language + '"/>').append(getDescription(resp));
                if (refreshFrom != "userBroadcasts")
                    addUserContextMenu(stream, resp.user_id, resp.username);

                var link = $('<a class="downloadGet"> Get stream link </a>');
                link.click(getM3U.bind(null, resp.id, stream));

                let recLink = $('<span class="recContainer"/>').append(downloadStatus(resp.id, true, null));

                var downloadWhole = $('<a class="downloadWhole"> Download </a>').click(getBothURLs.bind(null, resp.id));

                if (refreshFrom === 'following' ){
                    var repeat_getTheLink = (settings.showPRlinks && resp.state === 'RUNNING')? ($('<label><input type="checkbox"' + ((broadcastsCache.autoGettinList.indexOf(resp.id) >= 0) ? 'checked' : '') + '/> repeat</label>').click({param1: resp.id},function (e) {
                        if(e.target.checked) {
                            broadcastsCache.autoGettinList.push(e.data.param1);
                        }else{
                            broadcastsCache.autoGettinList.splice(broadcastsCache.autoGettinList.indexOf(e.data.param1),1);
                        }
                        broadcastsCache.interestingList.indexOf(e.data.param1) < 0 ? broadcastsCache.interestingList.push(e.data.param1) : '';
                        if(broadcastsCache.interestingList.length > 100)
                            broadcastsCache.interestingList.shift();
                    })) : '';

                    broadcastsCache.filters.hideEnded && !newHighlight && (resp.state != 'RUNNING') ? stream.hide() : '';
                }

                broadcastsCache.filters.hideProducer && !newHighlight && producer ? stream.hide() : '';
                broadcastsCache.filters.languagesToHide.indexOf(resp.language) >= 0 ? stream.hide() : '';

                ids.push(resp.id);
                var replayLinkExists = false;
                 if (broadcastsWithLinks.hasOwnProperty(resp.id) ){
                        var brwlID = broadcastsWithLinks[resp.id];
                        var rep = brwlID.RclipboardLink;
                        var repM3U = brwlID.Rm3uLink;
                        var liv = brwlID.clipboardLink;
                        var showDowLink = !NODEJS && (settings.showNodeDownLinks || (settings.showNodeDownLinksPrv && isPrivate)) && settings.showPRlinks;
                        rep ? replayLinkExists = brwlID.RdownloadLink.hasClass('linkReplay') : '';

                        if(liv && !replayLinkExists){
                            var clipboardLink = brwlID.clipboardLink.clone();
                            new ClipboardJS(clipboardLink.get(0));
                            var clipboardDowLink = brwlID.clipboardDowLink.clone();
                            new ClipboardJS(clipboardDowLink.get(0));

                            stream.find('.responseLinks').append(
                            (settings.showM3Ulinks && brwlID.m3uLink) ? [brwlID.m3uLink.clone(), ' | '] : '',
                                NODEJS ? [brwlID.downloadLink.clone(true,true), ' | '] : '',
                                clipboardLink,
                                showDowLink ? [' | ', clipboardDowLink] : '', '<br/>'
                            );
                        }
                        if(rep){
                            var RclipboardLink = brwlID.RclipboardLink.clone();
                            new ClipboardJS(RclipboardLink.get(0));
                            var RclipboardDowLink = brwlID.RclipboardDowLink.clone();
                            new ClipboardJS(RclipboardDowLink.get(0));

                            stream.find('.responseLinksReplay').append(
                            (settings.showM3Ulinks && settings.showPRlinks && repM3U) ? [repM3U.clone(true,true), ' | '] : '',
                            (settings.showPRlinks && NODEJS ? [brwlID.RdownloadLink.clone(true,true), ' | '] : ''),
                             settings.showPRlinks ? RclipboardLink : '',
                             showDowLink ? [' | ', RclipboardDowLink] : '', '<br/>'
                            );
                        }
                    }
                    var addMethod = '';
                    refreshFrom === 'following' && !settings.classic_cards_order ? addMethod = 'prepend' : '';
                    refreshFrom !== 'following' || settings.classic_cards_order ? addMethod = 'append' : '';
                    jcontainer[addMethod](stream.append(recLink, ((NODEJS && !replayLinkExists)? [downloadWhole, ' | '] : ''), link).append((refreshFrom === 'following') ? repeat_getTheLink : ''));
                }

            if (refreshFrom === 'following'){
                var existingBroadcasts = [];
                var interestingToggle = false;
                var interestingList = [];

                for (var o in response) {
                    existingBroadcasts.push(response[o].id);
                }
                for (var i = response.length - 1; i >= 0; i--) {
                    broadcastsCache[response[i].id] = response[i];
                    limitAddIDs(broadcastsCache, response[i].id, 100, existingBroadcasts);
                }
                if (settings.classic_cards_order){
                    for (var i in response){
                        createCard(i)
                    }
                } else {
                    for (var i = broadcastsCache.idsQueue.length - 1; i >= 0; i--)
                        createCard(i)
                }

                broadcastsCache.oldBroadcastsList = [];
                for (var x in broadcastsCache.idsQueue) {
                    broadcastsCache.oldBroadcastsList.push(broadcastsCache.idsQueue[x]);
                }

                jcontainer.prepend($('<br/><a class="watching right icon">Show interesting only</a><br/>').click(function () {
                    var cards = jcontainer.find('.card');
                    $.each(cards, function(i){
                        for(var a in broadcastsCache.interestingList){
                            if($(cards[i]).hasClass(broadcastsCache.interestingList[a])){
                                $(cards[i]).addClass('interesting');
                            break;
                            }
                        }
                    })
                    if(!interestingToggle){
                        interestingToggle = true;
                        cards.filter(":visible").each(function(index, card){
                            interestingList.push(card.getAttribute('nr'))
                        })
                        cards.not(".interesting").hide();
                        $(".interesting").show();
                    }else{
                        interestingToggle = false;
                        $(".interesting").hide();
                        cards.filter(function(i, card){
                            return (interestingList.indexOf(card.getAttribute('nr')) >= 0)
                        }).show()
                        interestingList = [];
                    }
                    $(window).trigger('scroll');    // for lazy load
                }));
            } else { //if not following tab
                for (var i in response)
                    createCard(i)
            }

            var sortedAlready = false;
            jcontainer.prepend($('<a class="watching right icon">Sort by watching</a>').click(function () {  // sort cards in given jquery-container
                var cards = jcontainer.find('.card');
                if(!sortedAlready){
                    var sorted = cards.sort(function (a, b) {
                        return $(b).find('.watching').text() - $(a).find('.watching').text();
                    });
                    sortedAlready = true;
                }else{
                    var sorted = cards.sort(function (a, b) {
                        return $(a)[0].getAttribute('nr') - $(b)[0].getAttribute('nr');
                    });
                    sortedAlready = false;
                }
                jcontainer.append(sorted);
                $(window).trigger('scroll');    // for lazy load
            }));

            if (typeof response[0].n_watching == 'undefined')
                PeriscopeWrapper.V2_POST_Api('getBroadcasts', {
                    broadcast_ids: ids,
                    only_public_publish: true
                }, function (info) {
                    for (var i in info)
                        $('.card.' + info[i].id + ' .watching').text(info[i].n_watching);
                });
        } else
            jcontainer.append('No results');
        // if jcontainer isn't visible, scroll to it
        var top = jcontainer.offset().top;
        if ($(window).scrollTop() + $(window).height() - 100 < top) {
            $(window).scrollTop(top);
        }
    };
}

function addUserContextMenu(node, id, username) {
    node.contextmenu(function (ev) {
        ev.preventDefault();
        var contextmenu = $('<div class="contextmenu" style="top: ' + ev.pageY + 'px; left: ' + ev.pageX + 'px;"/>')
            .append($('<div>Follow</div>').click(function () {
                PeriscopeWrapper.V2_POST_Api('follow', {
                    user_id: id
                });
            }))
            .append($('<div>Unfollow</div>').click(function () {
                PeriscopeWrapper.V2_POST_Api('unfollow', {
                    user_id: id
                });
            }))
            .append('<div data-clipboard-text="https://periscope.tv/' + username + '">Copy profile URL</div>' +
                    '<div data-clipboard-text="' + username + '">Copy username</div>' +
                    '<div data-clipboard-text="' + id + '">Copy user ID</div>')
            .append($('<div>Block user</div>').click(function () {
                PeriscopeWrapper.V2_POST_Api('block/add', {
                    to: id
                });
            }))
            .append($('<div>Unlock user</div>').click(function () {
                PeriscopeWrapper.V2_POST_Api('block/remove', {
                    to: id
                });
            }))
            .append($('<div>Profile on Periscope</div>').click(function(){
                var win = window.open(
                    "https://periscope.tv/" + username, 
                    "PeriscopeProfile" + (settings.previewSeparateWindows?username:''), 
                    "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=550,top=100,left="+(screen.width/2));
            }))
            .click(function (event) {
                $(this).remove();
            })
            .mousedown(function (event) {
                event.stopPropagation();
            });
        $(document.body).append(contextmenu).off('mousedown').mousedown(function () {
            contextmenu.remove();
        });
        new ClipboardJS('.contextmenu div');
    })
};

