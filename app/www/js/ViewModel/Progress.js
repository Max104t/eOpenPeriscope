var Progress = {
    elem: $('<div id="progress"/>'),
    count: 0,
    start: function(){
        this.count++;
        this.elem.css('visibility', 'visible');
        this.elem.css('width', Math.floor(100/this.count)+'%');
    },
    stop: function(){
        this.count--;
        if (!this.count) {  // if there is no unfinished requests
            this.elem.css('width', '0');
            this.elem.css('visibility', 'hidden');
        } else
            this.elem.css('width', Math.floor(100/this.count)+'%');
    }
};
