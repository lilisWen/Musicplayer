var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}

//底部菜单栏
var Footer = {
    init: function () {
        this.$footer = $('footer')
        this.$ul = this.$footer.find($('.box ul'))
        this.$leftBtn = this.$footer.find($('.icon-left'))
        this.$rightBtn = this.$footer.find($('.icon-right'))
        this.isEnd = false
        this.isStart = false
        this.isAnimate = false
        this.bind()
        this.render()
    },
    bind: function () {
        var _this = this
        //左右翻页按钮
        _this.$rightBtn.on('click', function () {
            if (_this.isAnimate) return
            _this.$leftBtn.removeClass('disable')
            var liwidth = _this.$ul.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$footer.find($('.box')).width() / liwidth)
            if (!_this.isEnd) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + rowCount * liwidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isStart = false
                    if (parseFloat(_this.$footer.find($('.box')).width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
                        _this.isEnd = true
                        _this.$rightBtn.addClass('disable')
                    }
                })
            }
        })
        _this.$leftBtn.on('click', function () {
            if (_this.isAnimate) return
            var liwidth = _this.$ul.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$footer.find($('.box')).width() / liwidth)
            if (!_this.isStart) {
                _this.isAnimate = true
                _this.$rightBtn.removeClass('disable')
                _this.$ul.animate({
                    left: '+=' + rowCount * liwidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isEnd = false
                    // console.log(parseFloat(_this.$footer.find($('.box')).width()))
                    // console.log(parseFloat(_this.$ul.css('left')))
                    if (parseInt(_this.$ul.css('left')) >= 0) {
                        _this.isStart = true
                        _this.$leftBtn.addClass('disable')
                    }
                })
            }
        })
        //选择类别
        _this.$footer.on('click', 'li', function () {
            $(this).addClass('active').siblings().removeClass('active')
            EventCenter.fire('select-album', {
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            })
        })
    },
    //获取歌曲类别
    render() {
        var _this = this
        $.getJSON("//jirenguapi.applinzi.com/fm/getChannels.php")
            .done(function (ret) {
                _this.renderFooter(ret.channels)
            }).fail(function () {
                console.log('error')
            })
    },
    //将所有歌曲类别添加到footer中
    renderFooter: function (channels) {
        var html = ''
        channels.forEach(element => {
            html += `<li data-channel-id=${element.channel_id}
            data-channel-name=${element.name}>
            <div class='cover' style='background-image:url(${element.cover_small}')></div>
            <h3>${element.name}</h3>
            </li>`
        })
        console.log(html)
        this.$ul.html(html)
        this.setStyle()
    },
    //根据类别数量设置ul总长
    setStyle: function () {
        var count = this.$ul.find('li').length
        var width = this.$ul.find('li').outerWidth(true)
        this.$ul.css({
            width: count * width + 'px'
        })
    }
}

//根据EventListener发出通知设置main中歌曲详情
var Fm = {
    init: function () {
        this.$container = $('#music-page')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    bind: function () {
        var _this = this
        EventCenter.on('select-album', function (e, channelObj) {
            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            _this.loadMusic()
        })
        //play按钮点击切换
        _this.$container.find('.btn-play').on('click', function () {
            var $btn = $(this)
            if ($btn.hasClass('icon-play')) {
                $btn.removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            } else {
                $btn.removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
        })
        //下一首
        _this.$container.find('.btn-next').on('click', function () {
            _this.loadMusic()
        })
        _this.$container.find('.btn-collect').on('click', function () {
            console.log(1)
            _this.$container.find('.btn-collect').addClass('animate pulse')
        })
        //播放
        _this.audio.addEventListener('play', function () {
            _this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(function () {
                _this.updateStatus()
            }, 1000)
        })
        //暂停
        _this.audio.addEventListener('pause', function () {
            clearInterval(_this.statusClock)
        })

    },
    //根据类别加载歌曲
    loadMusic() {
        var _this = this
        console.log('loading Music')
        $.getJSON("//jirenguapi.applinzi.com/fm/getSong.php", {
            channel: _this.channelId
        }).done(function (ret) {
            // console.log(ret['song'][0])
            _this.song = ret['song'][0]
            _this.setMusic()
            _this.setLyric()
        })
    },
    //设置播放详情
    setMusic() {
        console.log('setMusic')
        this.audio.src = this.song.url
        $('.bg').css({
            'background-image': `url(${this.song.picture})`
        })
        this.$container.find('.aside figure').css({
            'background-image': `url(${this.song.picture})`
        })
        // console.log(this.$container.find('.detial h1'))
        this.$container.find('.detial h1').text(this.song.title)
        this.$container.find('.detial .author').text(this.song.artist)
        this.$container.find('.tag').text(this.channelName)
    },
    //更新状态歌曲播放时间
    updateStatus() {
        var min = Math.floor(this.audio.currentTime / 60)
        var second = Math.floor(this.audio.currentTime % 60) + ''
        second = second.length == 2 ? second : '0' + second
        this.$container.find('.current-time').text(min + ':' + second)
        this.$container.find('.process-bar').css({
            'width': this.audio.currentTime / this.audio.duration * 100 + '%'
        })
        var line = this.lyricObj['0' + min + ':' + second]
        if (line) {
            this.$container.find('.lyric p').text(line).styletext('rollIn')
        }
    },
    //歌词播放设置
    setLyric() {
        var _this = this
        var lyricObj = {}
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', {
            sid: _this.song.sid
        }).done(function (ret) {
            var lyric = ret.lyric
            lyric.split('\n').forEach(function (line) {
                var times = line.match(/\d{2}:\d{2}/g)
                var content = line.replace(/\[.+?\]/g, '')
                if (Array.isArray(times)) {
                    times.forEach(function (time) {
                        lyricObj[time] = content
                    })
                } else {
                    lyricObj[times] = content
                }
            })
        })
        _this.lyricObj = lyricObj
    }
}

$.fn.styletext = function (type) {
    this.html(function () {
        var arr = $(this).text().split('').map(function (value) {
            return '<span class="styleText">' + value + '</span>'
        })
        return arr.join('')
    })

    var index = 0
    var $texts = $(this).find('span')
    var clock = setInterval(function () {
        $texts.eq(index).addClass('animated ' + type)
        index++
        if (index >= $texts.length) {
            clearInterval(clock)
        }
    }, 300)
}

Footer.init()
Fm.init()
setTimeout(function () {
    $('.box ul li:first-child').trigger('click')
}, 2000)