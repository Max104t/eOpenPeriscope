var chat_interval;
var ws; // websocket
var MESSAGE_KIND = {
    CHAT: 1,
    CONTROL: 2,
    AUTH: 3,
    PRESENCE: 4
};
/* LEVEL 1 */
function zeros(number) {
    return (100 + number + '').substr(1);
}
function getFlag(country) {
    var a = ['en','zh','ar','uk','ja','kk','da','da','he','ko','nb','sv'];//language code
    var b = ['gb','cn','sa','ua','jp','kz','dk','dk','il','kr','no','se'];//country flag code
    var langIndex = a.indexOf(country);
    (langIndex >= 0) ? country = b[langIndex] : '';
    var flagOffset = 127365;
    var both = String.fromCodePoint(country.codePointAt(0) + flagOffset) + String.fromCodePoint(country.codePointAt(1) + flagOffset);
    var output = emoji.replace_unified(both);
    return (output === both) ? country : output;
};

function lazyLoad(parent) {
    var right = $('#right');
    $(parent).on('scroll', function () {
        clearTimeout($.data(this, 'scrollTimer'));      // for preventing dozens of firing
        $.data(this, 'scrollTimer', setTimeout(function () {
            var windowHeight = $(window).height();
            var scrollTop = $(window).scrollTop();
            right.find('img[lazysrc]:visible').each(function () {
                var el = $(this);
                var top = el.offset().top;
                if (scrollTop < top + el.height() + 800 && scrollTop + windowHeight + 800 > top) {  // 800 is handicap
                    el.attr('src', el.attr('lazysrc'));
                    el.removeAttr('lazysrc');
                }
            })
        }, 100));
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function emoji_to_img(textInput){
    if(ifEmoji('🐸')){
        return textInput;
    } else{
        return emoji.replace_unified(textInput)// for browsers/systems without emojis support
    }
}
