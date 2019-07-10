var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler);
    },
    fire: function (type, data) {
        $(document).trigger(type, data);
    }
};


var Footer = {
    init: function () {
        this.$footer = $('footer');
        this.$ul = this.$footer.find($('.box ul'));
        this.$leftBtn = this.$footer.find($('.icon-left'));
        this.$rightBtn = this.$footer.find($('.icon-right'));
        this.isEnd = false;
        this.isStart = false;
        this.bind();
        this.render();
    },
    bind: function () {
        var _this = this;
        _this.$rightBtn.on('click', function () {

            _this.$leftBtn.removeClass('disable');
            var liwidth = _this.$ul.find('li').outerWidth(true);
            var rowCount = Math.floor(_this.$footer.find($('.box')).width() / liwidth);
            if (!_this.isEnd) {
                _this.$ul.animate({
                    left: '-=' + rowCount * liwidth
                }, 400, function () {
                    _this.isStart = false;
                    if (parseFloat(_this.$footer.find($('.box')).width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
                        _this.isEnd = true;
                        _this.$rightBtn.addClass('disable');
                    }
                });
            }

        });
        _this.$leftBtn.on('click', function () {

            var liwidth = _this.$ul.find('li').outerWidth(true);
            var rowCount = Math.floor(_this.$footer.find($('.box')).width() / liwidth);
            if (!_this.isStart) {
                _this.$rightBtn.removeClass('disable');
                _this.$ul.animate({
                    left: '+=' + rowCount * liwidth
                }, 400, function () {
                    _this.isEnd = false;
                    console.log(parseFloat(_this.$footer.find($('.box')).width()))
                    console.log(parseFloat(_this.$ul.css('left')))
                    if (parseInt(_this.$ul.css('left')) >= 0) {
                        _this.isStart = true;
                        _this.$leftBtn.addClass('disable');
                    }
                });
            }
        });
        _this.$footer.on('click', 'li', function () {
            $(this).addClass('active').siblings().removeClass('active');
            EventCenter.fire('select-album', {
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            });
        });
    },
    render() {
        var _this = this;
        $.getJSON("//jirenguapi.applinzi.com/fm/getChannels.php")
            .done(function (ret) {
                _this.renderFooter(ret.channels);
            }).fail(function () {
                console.log('error');
            });
    },
    renderFooter: function (channels) {
        var html = '';
        channels.forEach(element => {
            html += `<li data-channel-id=${element.channel_id}
            data-channel-name=${element.name}>
            <div class='cover' style='background-image:url(${element.cover_small}')></div>
            <h3>${element.name}</h3>
            </li>`;
        });
        console.log(html);
        this.$ul.html(html);
        this.setStyle();
    },
    setStyle: function () {
        var count = this.$ul.find('li').length;
        var width = this.$ul.find('li').outerWidth(true)
        console.log(count, width);
        this.$ul.css({
            width: count * width + 'px'
        });
    }
};

var App = {
    init: function () {
        this.bind();
    },
    bind: function () {
        EventCenter.on('select-album', function (e, channelObj) {
            console.log(channelObj);
        });
    }
}

Footer.init();
App.init();