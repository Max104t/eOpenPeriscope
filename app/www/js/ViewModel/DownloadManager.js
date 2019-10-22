var DownloadManagerController = {
    init: function(parent, go_to_bid) {

        var result = $('<div/>');
        var refreshButton =  $('<a class="button">Refresh</a>').click(function () {dManagerDescription(result)});
        var removefinished = $('<a class="button">Remove Finished</a>').click(function () {
            if (childProcesses && childProcesses.length){
                childProcesses=childProcesses.filter(function(proc){
                  return  proc.exitCode === null;
                })
                refreshButton.click();
            }
        });
        var goButton = $('<a class="button" id="downloadThis">Go</a>').click(function () {
            var dowLink = $('#broadcastLink').val().trim();
            var validLink = (dowLink.startsWith('https://www.periscope.tv/') || dowLink.startsWith('https://www.pscp.tv/'));
            if(validLink){
                var broadcast_id = dowLink.split('/')[4];
                var urlCallback = function(live, replay, cookies, _name, _folder_name, _broadcast_info) {
                    var live_url = $('#right > div:visible >div').find('#templiveUrl');
                    if(live){
                        live_url.val(live);
                        getURL(broadcast_id, urlCallback, true);
                    }else if(replay){
                        download(_folder_name, _name, live_url.val(), replay, cookies, _broadcast_info);
                        live_url.val(null);
                    }
                }
                getURL(broadcast_id, urlCallback);
                setTimeout(function(){refreshButton.click()},5000);
            }
        });
        var linkInput = $('<div id="downloadFrom" title="Download from link"><input id="broadcastLink" type="text" size="15" placeholder="https://www.pscp.tv/w/...">' + '<input id="templiveUrl" type="hidden"></div>').append(goButton);
        parent.append($('<div id="Dmanager"/>').append(refreshButton, removefinished,'</br>', linkInput, result));
        refreshButton.click();
    
        if(go_to_bid){
            var dowCards = $('.downloadCard.' + go_to_bid );
            setTimeout(function(){
                document.documentElement.scrollTop = 0;
                dowCards[0].scrollIntoView({behavior: 'smooth'});
                dowCards.addClass('focusedDownloadCard');
            },0);
        }    
    }
}
