/**
 * Created by zhangjt on 16/12/26.
 */
var pomelo = window.pomelo;
var username;
var users;
var rid;
var gatePort = 3014;
var roomId;
var clickNowPosition = '';
var postQueue = 0;
$(document).ready(function () {

    //用户进入大厅通知
    pomelo.on('onAdd', function (data) {
        var user = data.user;
        tip('online', user);
    });
    //大厅之更新房间状态
    pomelo.on('onStatus', function (data) {
        for (var i = 0; i < data.rooms.length; i++) {
            var roomID = data.rooms[i][0];
            var roomtitle = "房间" + (roomID + 1) + "(full)";
            if (data.rooms[i][2] == 'empty') {
                roomtitle = "房间" + (roomID + 1) + "(empty)";
            }
            if (data.rooms[i][2] == 'waiting') {
                roomtitle = "房间" + (roomID + 1) + "(" + data.rooms[i][1] + ")";
            }
            var tmpspan = $('#room' + data.rooms[i][0])[0].innerHTML = roomtitle;
        }
    });

    //房间更新用户信息以及棋牌相关
    pomelo.on('onStartGame', function (mdata) {
        //tip('message', "start game");
        pomelo.request('landlord.landlordHandler.getRoomMember', {
            room: roomId
        }, function (data) {

            if (data.code == 200) {
                //返回玩家位置，并显示对应的位置的头像
                switch (data.lordPosition) {
                    case 'left' :
                        var leftProfile = '<img src=\'../image/logo/landlord.png\' /><span>' + data.playerLeftID + '</span>';
                        $(leftProfile).appendTo("#leftProfile");
                        var midProfile = '<img src=\'../image/logo/farmer.png\' /><span>' + data.uid + '</span>';
                        $(midProfile).appendTo("#midProfile");
                        var rightProfile = '<img src=\'../image/logo/farmer.png\' /><span>' + data.playerRightID + '</span>';
                        $(rightProfile).appendTo("#rightProfile");
                        break;
                    case 'mid' :
                        var leftProfile = '<img src=\'../image/logo/farmer.png\' /><span>' + data.playerLeftID + '</span>';
                        $(leftProfile).appendTo("#leftProfile");
                        var midProfile = '<img src=\'../image/logo/landlord.png\' /><span>' + data.uid + '</span>';
                        $(midProfile).appendTo("#midProfile");
                        var rightProfile = '<img src=\'../image/logo/farmer.png\' /><span>' + data.playerRightID + '</span>';
                        $(rightProfile).appendTo("#rightProfile");
                        break;

                    case 'right' :
                        var leftProfile = '<img src=\'../image/logo/farmer.png\' /><span>' + data.playerLeftID + '</span>';
                        $(leftProfile).appendTo("#leftProfile");
                        var midProfile = '<img src=\'../image/logo/farmer.png\' /><span>' + data.uid + '</span>';
                        $(midProfile).appendTo("#midProfile");
                        var rightProfile = '<img src=\'../image/logo/landlord.png\' /><span>' + data.playerRightID + '</span>';
                        $(rightProfile).appendTo("#rightProfile");
                        break;
                }
                //如果出牌次数不匹配，则显示该谁出牌
                if (data.postCardQueueNum != postQueue) {
                    cardHandle(data);
                }
            }
        });
    });

    //出牌之后更新牌信息
    pomelo.on('onUpdateCard', function (mdata) {
        pomelo.request('landlord.landlordHandler.getUpdateCard', {
            room: roomId
        }, function (data) {
            if (data.code == 200) {
                //如果出牌次数不匹配，则显示该谁出牌
                if (data.postCardQueueNum != postQueue) {
                    cardHandle(data);
                }
            }
        });
    });


    //隐藏大厅
    $("#mainTop").hide();
    //隐藏房间
    $("#main").hide();
    //登录
    $("#btnlogin").click(function () {
        username = $("#lblloginName").attr("value");
        rid = "1";
        if (username.length > 20 || username.length == 0) {
            showError("username is null");
            return false;
        }
        //连接网关gate
        pomelo.init({
            host: window.location.hostname,
            port: gatePort,
            log: true
        }, function () {
            //根据网关路由获取connector的ip和端口
            pomelo.request('gate.gateHandler.queryEntry', {
                uid: username
            }, function (data) {
                //断开跟网关的连接
                pomelo.disconnect();
                if (data.code === 500) {
                    showError("no server is login,wait");
                    return;
                }
                //根据connector的ip和端口重新连接
                pomelo.init({
                    host: data.host,
                    port: data.port,
                    log: true
                }, function () {
                    //隐藏登录界面
                    $("#loginbody").hide();
                    //显示大厅界面
                    $("#mainTop").show();
                    //根据登录信息，获取大厅房间状态
                    pomelo.request("connector.entryHandler.enter", {
                        username: username,
                        rid: rid
                    }, function (data) {
                        if (data.code != 200) {
                            showError("user name duplicate");
                            return;
                        }
                        //根据返回的信息显示大厅
                        for (var i = 0; i < data.rooms.length; i++) {
                            var roomID = data.rooms[i][0];
                            var roomtitle = "房间" + (roomID + 1) + "(full)";
                            if (data.rooms[i][2] == 'empty') {
                                roomtitle = "房间" + (roomID + 1) + "(empty)";
                            }
                            if (data.rooms[i][2] == 'waiting') {
                                roomtitle = "房间" + (roomID + 1) + "(" + data.rooms[i][1] + ")";
                            }
                            $('.roomlist').append("<li id=\'li" + roomID + "\'> <a class=\'room\' id=\'" + roomID
                                + "\' onclick='roomClick(this)'><span id=\'room" + roomID + "\'>" + roomtitle
                                + "</span></a></li>");
                        }
                    });
                });
            });
        });
    });
});
//大厅选择房间
function roomClick(e) {
    roomId = e.id;
    //加入房间
    pomelo.request("landlord.landlordHandler.join", {
        room: roomId
    }, function (data) {
        if (data.code == 200) {
            //更换大厅css为房间css
            $("#cssid").attr("href", "css/room.css");
            //隐藏大厅
            $("#mainTop").hide();
            //显示房间
            $("#main").show();
            //出牌
            $("#post").click(
                function () {
                    hideClock('mid');
                    actionLabe('hide');
                    var cardList = getCardIDListByClassName('selectedCard');
                    // 出牌
                    pomelo.request("landlord.landlordHandler.postCard", {
                        room: roomId,
                        cardList:cardList
                    }, function (postCarddata) {
                        if (postCarddata.code == 200) {
                            ShowInfo('出牌成功');
                            actionLabe('hide');
                        }else {
                            ShowInfo('出牌错误');
                            showClock('mid');
                            actionLabe('show');
                        }
                    });
                }
            );
            //不出牌，要不起
            $("#nopost").click(
                function () {
                    hideClock('mid');
                    actionLabe('hide');
                    //要不起
                    pomelo.request("landlord.landlordHandler.postCard", {
                        room: roomId,
                        cardList:null
                    }, function (postCarddata) {
                        if (postCarddata.code == 200) {
                            ShowInfo('要不起');
                        }
                    });
                }
            );
        } else {
            //房间已满等
            alert(data.msg);
        }
    });
}
//棋牌处理
function cardHandle(data) {
    //更新本地出牌次数
    postQueue = data.postCardQueueNum;
    //显示剩余棋牌
    renderLRCardList('left', data.leftPlayerLeft.length);
    renderLRCardList('right', data.rightPlayerLeft.length);
    renderMidCardList(data.selfCardList);
    //显示已出棋牌
    renderPost('left', data.leftPostCardList);
    renderPost('mid', data.selfPostList);
    renderPost('right', data.rightPostCardList);
    //显示 出牌和 不出 按钮,显示时钟
    if (data.validPostID == data.uid) {

        actionLabe('show');
        hideClock(clickNowPosition);
        clickNowPosition = 'mid';
        showClock('mid');
        //添加出牌动画
        addAnimate();
    }
    else if (data.validPostID == data.playerLeftID) {
        actionLabe('hide');
        hideClock(clickNowPosition);
        clickNowPosition = 'left'
        showClock('left');
    }
    else if (data.validPostID == data.playerRightID) {
        actionLabe('hide');
        hideClock(clickNowPosition);
        clickNowPosition = 'right'
        showClock('right');
    }
}
function ShowInfo(info) {
    elementStr =   "<div id='info'><span id='infoContent'>"+
        info+
        "</span>"+
        "</div>";
    $(elementStr).appendTo('body');
    $('#info').fadeOut(4000);

    setTimeout(function(){
        $('#info').remove();
    }, 4000);}
function sortNumber(a, b) {
    return a - b
}
function actionLabe(isShow) {
    if (isShow == 'show') {
        $('#actionbtn').show();
    }
    else {
        $('#actionbtn').hide();
    }

}
function hideClock(position) {
    var numSelector = "#" + position + "Timer";
    $(numSelector).hide();
}
function showClock(position) {
    var numSelector = "#" + position + "Timer";
    var postSelector = "#" + position + "PostLogo";

    $(numSelector).show();
    // $(postSelector).empty();
}
function addAnimate() {
    $('#midCardList li').toggle(
        function () {
            $(this).animate({'marginTop': '-20px'}, "fast");
            $(this).addClass('selectedCard');
        },
        function () {
            $(this).animate({'marginTop': '0px'}, "fast");
            $(this).removeClass('selectedCard');
        }
    );
}
function renderLRCardList(position, num) {
    var selector = "#" + position + "CardList";
    var content = '';

    for (var idx = 0; idx < num; idx++) {
        content += '<li><img src=\'../image/logo/cover.png\'></li>';
    }
    $(selector).empty();
    $(selector).append(content);
    padding = (20 - num) * 10;
    $(selector).css({paddingTop: padding + 'px'});
}
function renderMidCardList(cardList) {
    if (cardList == undefined) {
        $('#midCardList').empty();
    }
    else {
        var Newlen = cardList.length;
        var exist = $('#midCardList');

        content = '';
        for (var idx = 0; idx < Newlen; idx++) {
            content += '<li id=\'' + cardList[idx] + '\'><img src=\'../image/card/' + cardList[idx] + '.png\'></li>';
        }
        $('#midCardList').empty();
        $('#midCardList').append(content);

        padding = (20 - Newlen) * 10;
        $('#midCardList').css({paddingLeft: padding + 'px'});
    }
}
function renderPost(position, cardList) {
    positionCardList = '#' + position + 'PostLogo';
    positionClock = '#' + position + 'Timer';
    if (!cardList) {
        content = '<ul></ul>';
    }
    else {
        $(positionClock).hide();
        len = cardList.length;
        cardList = cardList.sort(sortNumber);

        content = '<ul>';
        for (var idx = 0; idx < len; idx++) {
            content += '<li><img src=\'../image/card/' + cardList[idx] + '.png\'></li>';
        }
        content += '</ul>';
    }
    $(positionCardList).empty();
    $(positionCardList).append(content);
}
function getCardIDListByClassName(className) {
    var cardList = new Array();
    var cardEle = $("." + className);
    var cardLen = cardEle.length;

    for (var idx = 0; idx < cardLen; idx++) {
        cardList.push(cardEle[idx].id);
    }
    return cardList;
}
function tip(type, name) {
    var tip, title;
    switch (type) {
        case 'online':
            tip = name + ' is online now.';
            title = 'Online Notify';
            break;
        case 'offline':
            tip = name + ' is offline now.';
            title = 'Offline Notify';
            break;
        case 'message':
            tip = name + ' is saying now.'
            title = 'Message Notify';
            break;
    }
    //合并Pop.js到该文件中，防止没找到该文件
    var pop = new Pop(title, tip);
};
function showError(content) {
    $("#loginError").text(content);
    $("#loginError").show();
};
jQuery(function ($j) {
    $j.positionFixed = function (el) {
        $j(el).each(function () {
            new fixed(this)
        })
        return el;
    }
    $j.fn.positionFixed = function () {
        return $j.positionFixed(this)
    }
    var fixed = $j.positionFixed.impl = function (el) {
        var o = this;
        o.sts = {
            target: $j(el).css('position', 'fixed'),
            container: $j(window)
        }
        o.sts.currentCss = {
            top: o.sts.target.css('top'),
            right: o.sts.target.css('right'),
            bottom: o.sts.target.css('bottom'),
            left: o.sts.target.css('left')
        }
        if (!o.ie6) return;
        o.bindEvent();
    }
    $j.extend(fixed.prototype, {
        ie6: $.browser.msie && $.browser.version < 7.0,
        bindEvent: function () {
            var o = this;
            o.sts.target.css('position', 'absolute')
            o.overRelative().initBasePos();
            o.sts.target.css(o.sts.basePos)
            o.sts.container.scroll(o.scrollEvent()).resize(o.resizeEvent());
            o.setPos();
        },
        overRelative: function () {
            var o = this;
            var relative = o.sts.target.parents().filter(function () {
                if ($j(this).css('position') == 'relative') return this;
            })
            if (relative.size() > 0) relative.after(o.sts.target)
            return o;
        },
        initBasePos: function () {
            var o = this;
            o.sts.basePos = {
                top: o.sts.target.offset().top - (o.sts.currentCss.top == 'auto' ? o.sts.container.scrollTop() : 0),
                left: o.sts.target.offset().left - (o.sts.currentCss.left == 'auto' ? o.sts.container.scrollLeft() : 0)
            }
            return o;
        },
        setPos: function () {
            var o = this;
            o.sts.target.css({
                top: o.sts.container.scrollTop() + o.sts.basePos.top,
                left: o.sts.container.scrollLeft() + o.sts.basePos.left
            })
        },
        scrollEvent: function () {
            var o = this;
            return function () {
                o.setPos();
            }
        },
        resizeEvent: function () {
            var o = this;
            return function () {
                setTimeout(function () {
                    o.sts.target.css(o.sts.currentCss)
                    o.initBasePos();
                    o.setPos()
                }, 1)
            }
        }
    })
})
jQuery(function ($j) {
    $j('#footer').positionFixed()
})
function Pop(title, intro) {
    this.title = title;
    this.intro = intro;
    this.apearTime = 1000;
    this.hideTime = 500;
    this.delay = 8000;
    this.addInfo();
    this.showDiv();
    this.closeDiv();
}
Pop.prototype = {
    addInfo: function () {
        $("#popIntro").html(this.intro);
    },
    showDiv: function (time) {
        if (!($.browser.msie && ($.browser.version == "6.0") && !$.support.style)) {
            $('#pop').slideDown(this.apearTime).delay(this.delay).fadeOut(400);
        } else {
            $('#pop').show();
            jQuery(function ($j) {
                $j('#pop').positionFixed()
            })
        }
    },
    closeDiv: function () {
        $("#popClose").click(function () {
            $('#pop').hide();
        });
        $("#popMore").click(function () {
            $('#pop').remove();
        });
    }
}
