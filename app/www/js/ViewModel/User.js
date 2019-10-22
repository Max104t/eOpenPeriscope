var UserController = {
    init: function(parent) {
        var resultUser = $('<div id="resultUser" />');
        var showButton = $('<a class="button" id="showuser">OK</a>').click(function () {
            resultUser.empty();
            var id =  $('#user_id').val().trim();
            var name =  $('#user_name').val().trim();
            name.startsWith('@') ? (name = name.slice('1',name.length)) : '';
            var param = {user_id : id};
            name ? param = {username : name} : '' ;
            PeriscopeWrapper.V2_POST_Api('user', param, function (response) {
                id = response.user.id;
                $('#user_id').val(id);
                resultUser.prepend(getUserDescription(response.user));
                FollowersSpoiler.append(' (' + response.user.n_followers + ')');
                FollowingSpoiler.append(' (' + response.user.n_following + ')');
                PeriscopeWrapper.V2_POST_Api('userBroadcasts', {
                    user_id: id,
                    all: true
                }, function (broadcasts) {
                    refreshList($('#userBroadcasts'), null, "userBroadcasts")(broadcasts);
                    BroadcastsSpoiler.append(' (' + broadcasts.length + ')').click();
                });
            },function(response){resultUser.prepend(response)});
            var BroadcastsSpoiler = $('<div class="spoiler menu" data-spoiler-link="broadcasts">Broadcasts</div>');
            var FollowersSpoiler = $('<div class="spoiler menu" data-spoiler-link="followers">Followers</div>').on("jq-spoiler-visible", function() {
                var followersDiv = $('#userFollowers');
                if (!followersDiv.html())
                    PeriscopeWrapper.V2_POST_Api('followers', {
                        user_id: id
                    }, function (followers) {
                        if (followers.length){
                            FollowersSpoiler.append(' (' + followers.length + ')');
                            for (var i in followers)
                                followersDiv.append($('<div class="card cardProfileImg"/>').append(getUserDescription(followers[i])));
                            }
                        else
                            followersDiv.html('No results');
                    });
            });
            var FollowingSpoiler = $('<div class="spoiler menu" data-spoiler-link="following">Following</div>').on("jq-spoiler-visible", function() {
                var followingDiv = $('#userFollowing');
                if (!followingDiv.html())
                    PeriscopeWrapper.V2_POST_Api('following', {
                        user_id: id
                    }, function (following) {
                        if (following.length){
                            FollowingSpoiler.append(' (' + following.length + ')');
                            for (var i in following)
                                followingDiv.append($('<div class="card cardProfileImg"/>').append(getUserDescription(following[i])));
                            }
                        else
                            followingDiv.html('No results');
                    });
            });
            resultUser.append(BroadcastsSpoiler, '<div class="spoiler-content" data-spoiler-link="broadcasts" id="userBroadcasts" />',
                FollowersSpoiler, '<div class="spoiler-content" data-spoiler-link="followers" id="userFollowers" />',
                FollowingSpoiler, '<div class="spoiler-content" data-spoiler-link="following" id="userFollowing" />');
            if (id == loginTwitter.user.id) {   // Blocked list
                var BlockedSpoiler = $('<div class="spoiler menu" data-spoiler-link="blocked">Blocked</div>').on("jq-spoiler-visible", function() {
                    var blockedDiv = $('#userBlocked');
                    if (!blockedDiv.html())
                        PeriscopeWrapper.V2_POST_Api('block/users', {}, function (blocked) {
                            if (blocked.length)
                                for (var i in blocked) {
                                    blocked[i].is_blocked = true;
                                    blockedDiv.append($('<div class="card cardProfileImg"/>').append(getUserDescription(blocked[i])));
                                }
                            else
                                blockedDiv.html('No results');
                        });
                });
                resultUser.append(BlockedSpoiler, '<div class="spoiler-content" data-spoiler-link="blocked" id="userBlocked" />');
            }
            $(".spoiler").off("click").spoiler({ triggerEvents: true });
        });
        var idInput = $('<div id="User">id: <input id="user_id" type="text" size="15" placeholder="user_id"><input id="user_name" type="text" size="15" placeholder="@username"></div>');
        parent.append(idInput.append(showButton, '<br/><br/>', resultUser));
    }
}
