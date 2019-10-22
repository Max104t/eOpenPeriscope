var TopController = {
    init: function(parent) {
        var featured = $('<div/>');
        var ranked = $('<div/>');
        var langDt = $(languageSelect);
        langDt.find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
        var button = $('<a class="button" id="refreshTop">Refresh</a>').click(function () {
            PeriscopeWrapper.V2_POST_Api('rankedBroadcastFeed', {languages: (langDt.find('.lang').val() == 'all') ? ["ar","da","de","en","es","fi","fr","he","hy","id","it","ja","kk","ko","nb","pl","other","pt","ro","ru","sv","tr","uk","zh"] : [langDt.find('.lang').val()]}, refreshList(ranked, '<h3>Ranked</h3>'));
            PeriscopeWrapper.V2_POST_Api('featuredBroadcastFeed', {}, refreshList(featured, '<h3>Featured</h3>'));
        });
    
        if (!settings.refreshTopOnLoad)
            setSet('refreshTopOnLoad', false);
    
        var refreshOnLoadBtn = $('<input id="refreshTopOnLoad" type="checkbox">').change(function () {
            setSet('refreshTopOnLoad', this.checked);
        });
        refreshOnLoadBtn.prop("checked", settings.refreshTopOnLoad);
    
        var refreshOnLoad = $('<label/>Refresh on load</label>').prepend(refreshOnLoadBtn);
    
        var TopObj = $('<div id="Top"/>').append(langDt, button, refreshOnLoad, featured, ranked);
        parent.append(TopObj);
    
        button.click();
    }
}
