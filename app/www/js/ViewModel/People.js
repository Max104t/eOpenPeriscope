var PeopleController = {
    init: function(parent) {
        var refreshButton = $('<a class="button">Refresh</a>').click(function () {
            PeriscopeWrapper.V2_POST_Api('suggestedPeople', {
                languages: [$('#People .lang').val()]
            }, function (response) {
                var result = $('#resultPeople');
                result.empty();
                if (response.featured && response.featured.length) {
                    result.append('<h1>Featured</h1>');
                    for (var i in response.featured)
                        result.append($('<div class="card cardProfileImg"/>').append(getUserDescription(response.featured[i])));
                }
                result.append('<h1>Popular</h1>');
                for (i in response.popular)
                    result.append($('<div class="card cardProfileImg"/>').append(getUserDescription(response.popular[i])));
                PeriscopeWrapper.V2_POST_Api('suggestedPeople', {}, function (response) {
                    if (response.hearted && response.hearted.length) {
                        result.append('<h1>Hearted</h1>');
                        for (var i in response.hearted)
                            result.append($('<div class="card cardProfileImg"/>').append(getUserDescription(response.hearted[i])));
                    }
                });
            });
        });
        var searchPeople = function () {
            PeriscopeWrapper.V2_POST_Api('userSearch', {
                search: $('#search').val()
            }, function (response) {
                var result = $('#resultPeople');
                result.html('<h1>Search results</h1>');
                var found_exact = false;
                for (var i in response) {
                    result.append($('<div class="card cardProfileImg"/>').append(getUserDescription(response[i])));
                    if (!found_exact && response[i].username.toUpperCase() == $('#search').val().toUpperCase())
                        found_exact=true;
                }
                if (!found_exact)
                    PeriscopeWrapper.V2_POST_Api('user', {
                        username: $('#search').val()
                    }, function (user) {
                        result.prepend($('<div class="card cardProfileImg"/>').append(getUserDescription(user.user)));
                    });
            });
        };
        var searchButton = $('<a class="button">Search</a>').click(searchPeople);
        parent.append($('<div id="People"/>').append(languageSelect, refreshButton, $('<input id="search" type="text">').keypress(function (e) {
            if (e.which == 13) {
                searchPeople();
                return false;
            }
        }), searchButton, '<div id="resultPeople" />'));
        $("#People .lang").find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
        refreshButton.click();
    
    }
}
