var FollowingController = {
    init: function(parent) {
        var result = $('<div/>');
        var button = $('<a class="button" id="refreshFollowing">Refresh</a>').click(PeriscopeWrapper.V2_POST_Api.bind(null, 'followingBroadcastFeed', {}, refreshList(result , null, 'following')));
    
        var hideEnded = $('<label><input type="checkbox"' + (broadcastsCache.filters.hideEnded ? 'checked' : '') + '/> Hide non-live</label>').click(function (e) {
            $('#Following').find('.card').not('.RUNNING').not('.newHighlight');//cardsToHide
            broadcastsCache.filters.hideEnded = e.target.checked;
            FollowingController.applyFilters();
        });
        var hideProducer = $('<label><input type="checkbox"' + (broadcastsCache.filters.hideProducer ? 'checked' : '') + '/> Hide non-private producer</label>').click(function (e) {
            $('#Following').find('.producer').not('.newHighlight').not('.private');//cardsToHide
            broadcastsCache.filters.hideProducer = e.target.checked;
            FollowingController.applyFilters();
        });
        var languagesFilter = $('<fieldset class="languageFilter"><legend>Languages:</legend></fieldset>');
        for(var i in broadcastsCache.filters.languages){
            languagesFilter.append(
                $('<label><input type="checkbox"' + (broadcastsCache.filters.languagesToHide.some(function(r){return broadcastsCache.filters.languages[i].indexOf(r) >= 0}) ? '' : 'checked') + '/> ' + i + '</label>').change(
                {param: broadcastsCache.filters.languages[i]}, function(e){
                    var toHideList = broadcastsCache.filters.languagesToHide;
                    var arr = (typeof e.data.param != 'string') ? 'true' : '';
                    if(arr){
                        if(e.target.checked){
                            e.data.param.forEach(function(a){
                                toHideList.splice(toHideList.indexOf(a),1);
                            });
                        }else{
                            e.data.param.forEach(function(a){
                                toHideList.push(a)
                            });
                        }
                    }else{
                        if(e.target.checked){
                            toHideList.splice(toHideList.indexOf(e.data.param),1);
                        }else{
                            toHideList.push(e.data.param);
                        }
                    }
                    FollowingController.applyFilters();
                })
            );
        }

        var filterBox = $('<div id="followingFilters"></div>').hide();
        filterBox.append(languagesFilter, hideEnded, hideProducer)
        var filtersToggle = $('<a class="button" style="float:right">Filters</a></br>').click(function(){filterBox.toggle()});
        
        if (!settings.classic_cards_order)
            setSet('classic_cards_order', false);
        var classicOrderBtn = $('<input id="classicOrder" type="checkbox">').change(function () {
            setSet('classic_cards_order', this.checked);
        });
        classicOrderBtn.prop("checked", settings.classic_cards_order);
    
        var classic_order = $('<label> Classic Order</label>').prepend(classicOrderBtn);
    
        if (!settings.refreshFollowingOnLoad)
            setSet('refreshFollowingOnLoad', false);
        var refreshOnLoadBtn = $('<input id="refreshFollowingOnLoad" type="checkbox">').change(function () {
            setSet('refreshFollowingOnLoad', this.checked);
        });
        refreshOnLoadBtn.prop("checked", settings.refreshFollowingOnLoad);
    
        var refreshOnLoad = $('<label> Refresh on load</label>').prepend(refreshOnLoadBtn);
        var optionsContainer = $('<span id="optionsContainer"></span>').append(refreshOnLoad, '</br>', classic_order)
    
        var FollowingObj = $('<div id="Following"/>');
        FollowingObj.append(button, optionsContainer, filtersToggle, filterBox, result);
    
        parent.append(FollowingObj);
        button.click();
    },
    applyFilters: function () {
        var cards = $('#Following').find('.card').not('.newHighlight');
        cards.each(function(index, card){
            card = $(card);
            var hide = false;
            broadcastsCache.filters.hideEnded && !card.hasClass('RUNNING') ? hide = true : '';
            broadcastsCache.filters.hideProducer && card.hasClass('producer') ? hide = true : '';
            broadcastsCache.filters.languagesToHide.indexOf(card[0].getAttribute('lang')) >= 0 ? hide = true : '';
            hide ? card.hide() : card.show();
            $(window).trigger('scroll');    // for lazy load
        });
    }
}
