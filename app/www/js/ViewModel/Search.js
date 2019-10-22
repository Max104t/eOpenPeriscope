var SearchController = {
    init: function(parent) {

        var searchResults = $('<div/>');
        var channels = $('<div/>');
        var searchBroadcast = function (query) {
            if (typeof query == 'string')
                input.val(query);
            PeriscopeWrapper.V2_POST_Api('broadcastSearch', {
                search: input.val(),
                include_replay: $('#includeReplays')[0].checked
            }, refreshList(searchResults, '<h3>Search results for '+input.val()+'</h3>'));
        };
        var searchButton = $('<a class="button">Search</a>').click(searchBroadcast);
        var langDt = $(languageSelect).change(RefreshChannels);
        langDt.find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
    
        function RefreshChannels() {
            channels_url_root = 'https://channels.periscope.tv/v1/channels'
            PeriscopeWrapper.V1_GET_ApiChannels(function (response) {
                channels.empty();
                for (var i in response.Channels) {
                    /**
                     * CID: "18168968415973012523"
                     * CreatedAt: "2017-06-08T16:14:47.180165658Z"
                     * Description: "Broadcasts featured by the Periscope editors."
                     * Featured: false
                     * LastActivity: "2019-08-16T03:36:53.234156058Z"
                     * NLive: 1
                     * NMember: 5
                     * Name: "Featured Broadcasts"
                     * OwnerId: "1xnjrzoXMyjYD"
                     * PublicTag: ""
                     * Slug: "featured-broadcasts"
                     * ThumbnailURLs: null
                     * Type: 2
                     * UniversalLocales: null
                     */                
                    var channel = response.Channels[i];
                    var Name = $('<a>' + channel.Name + '</a>').click(searchBroadcast.bind(null, channel.Name));
                    var PublicTag = $('<a>' + channel.PublicTag + '</a>').click(searchBroadcast.bind(null, channel.PublicTag));
                    var PublicChannel = $('<a>' + channel.Name + '</a>').click(PeriscopeWrapper.V1_GET_ApiChannels.bind(null, function (channelName) {
                        return function (chan) {
                            var ids = [];
                            for (var i in chan.Broadcasts)
                                ids.push(chan.Broadcasts[i].BID);
                            PeriscopeWrapper.V2_POST_Api('getBroadcasts', {
                                broadcast_ids: ids,
                                only_public_publish: true
                            }, refreshList(searchResults, '<h3>' + channelName + ', ' + chan.NLive + ' lives, ' + chan.NReplay + ' replays</h3>'));
                        };
                    }(channel.Name), channels_url_root + '/' + channel.CID + '/broadcasts', langDt));
                    channels.append($('<p/>').append('<div class="lives right icon" title="Lives / Replays">' + channel.NLive + ' / ' + channel.NReplay + '</div>',
                        PublicChannel, (channel.Featured ? ' FEATURED<br>' : ''), '<br>',
                        (channel.PublicTag ? ['Tags: ', Name, ', ', PublicTag, '<br>'] : ''),
                        'Description: ' + channel.Description)
                    );
                }
            }, channels_url_root, langDt);
    }
    
        var input = $('<input type="text">').keypress(function (e) {
            if (e.keyCode == 13) {
                searchBroadcast();
                return false;
            }
        });
        parent.append($('<div id="Search"/>').append(input, '<label><input id="includeReplays" type="checkbox"> Include replays</label>&nbsp;&nbsp;&nbsp;', searchButton,
            '<h3>Channels</h3>', langDt, '<br><br>', channels, searchResults));
        RefreshChannels();
    
    }
}
