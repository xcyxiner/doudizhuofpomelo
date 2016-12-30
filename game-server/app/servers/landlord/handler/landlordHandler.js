var LandlordRemote = require('../remote/landlordRemote');
var Card = require('../../../model/card');
module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
    this.card = Card();
};
//获取房间状态
Handler.prototype.getRoomStatus = function (channel) {
    var data = [];
    for (var i = 0; i < channel.rooms.length; i++) {
        data[i] = channel.rooms[i].getRoomStatus();
    }
    return data;
}
//推送给客户端房间状态
Handler.prototype.postRoomStatus = function (channel) {
    var data = this.getRoomStatus(channel);
    channel.pushMessage({
        route: 'onStatus',
        rooms: data
    });
}
//游戏开始，获取房间用户以及棋牌信息
Handler.prototype.getRoomMember = function (msg, session, next) {
    var rid = session.get('rid');
    var channelService = this.app.get('channelService');
    channel = channelService.getChannel(rid, false);
    if (!!channel) {
        var gameRoom = channel.rooms[msg.room];
        var player = channel.userMap[session.uid];
        //获取地主位置相关
        var lordPosition;
        if (player.uIndex == 0) {
            if (gameRoom.landlordUser.uIndex == 1) {
                lordPosition = 'right';
            } else if (gameRoom.landlordUser.uIndex == 2) {
                lordPosition = 'left';
            } else {
                lordPosition = 'mid';
            }
        } else if (player.uIndex == 1) {
            if (gameRoom.landlordUser.uIndex == 0) {
                lordPosition = 'left';
            } else if (gameRoom.landlordUser.uIndex == 1) {
                lordPosition = 'mid';
            } else {
                lordPosition = 'right';
            }
        } else {
            if (gameRoom.landlordUser.uIndex == 0) {
                lordPosition = 'right';
            } else if (gameRoom.landlordUser.uIndex == 1) {
                lordPosition = 'left';
            } else {
                lordPosition = 'mid';
            }
        }
        next(null, {
            code: 200,
            lordPosition: lordPosition,
            uid: session.uid,
            playerLeftID: player.leftPlayer.uid,
            playerRightID: player.rightPlayer.uid,
            selfCardList: player.cardList,
            leftPlayerLeft: player.leftPlayer.cardList,
            rightPlayerLeft: player.rightPlayer.cardList,
            selfPostList: player.postcardList,
            leftPostCardList: player.leftPlayer.postcardList,
            rightPostCardList: player.rightPlayer.postcardList,
            validPostID: gameRoom.validPostID,
            postCardQueueNum: gameRoom.postCardQueueNum
        });
    }
}

//游戏中，出牌之后获取棋牌信息
Handler.prototype.getUpdateCard = function (msg, session, next) {
    var rid = session.get('rid');
    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(rid, false);

    if (!!channel) {
        var gameRoom = channel.rooms[msg.room];
        var player = channel.userMap[session.uid];
        next(null, {
            code: 200,
            uid: session.uid,
            playerLeftID: player.leftPlayer.uid,
            playerRightID: player.rightPlayer.uid,
            selfCardList: player.cardList,
            leftPlayerLeft: player.leftPlayer.cardList,
            rightPlayerLeft: player.rightPlayer.cardList,
            selfPostList: player.postcardList,
            leftPostCardList: player.leftPlayer.postcardList,
            rightPostCardList: player.rightPlayer.postcardList,
            validPostID: gameRoom.validPostID,
            postCardQueueNum: gameRoom.postCardQueueNum
        });

    }
}


//出牌
Handler.prototype.postCard = function (msg, session, next) {
    var rid = session.get('rid');
    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(rid, false);
    if (!!channel) {
        var gameRoom = channel.rooms[msg.room];
        var player = channel.userMap[session.uid];
        //如果牌不为空
        if (msg.cardList != null) {
            //检查出牌是否有效
            if (!this.card.isValidType(msg.cardList)) {
                next(null, {
                    code: 500
                });
                return;
            } else {
                //显示当前出牌
                player.postcardList = this.card.adjustCardList(msg.cardList);
                var prePostCardList = [];
                if (player.leftPlayer.postcardList.length != 0) {
                    //左边已出牌
                    prePostCardList = player.leftPlayer.postcardList;
                } else {
                    if (player.rightPlayer.postcardList.length != 0) {
                        //右边已出牌
                        prePostCardList = player.rightPlayer.postcardList;
                    }
                }
                if (this.card.isOverPre(prePostCardList, player.postcardList)) {
                    //清理剩余出牌
                    player.cardList = this.card.delPostCardList(player.cardList, player.postcardList);
                } else {
                    next(null, {
                        code: 500
                    });
                    return;
                }
            }
        } else {
            //清空上一轮自己所出牌
            player.postcardList = [];
        }
        //设置下一轮该谁出牌
        gameRoom.setvalidPostID();
        //发牌次数递增
        gameRoom.postCardQueueNum = gameRoom.postCardQueueNum + 1;
        //给客户端推送棋牌处理结果
        channel.pushMessage({
            route: 'onUpdateCard'
        });
        next(null, {
            code: 200
        });
    }
}

//进入房间,根据房间状态和人数来决定是否开始游戏
Handler.prototype.join = function (msg, session, next) {
    var rid = session.get('rid');
    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(rid, false);

    if (!!channel) {

        if (channel.rooms[msg.room].status == 'ready') {
            next(null, {
                code: 500,
                msg: "the room is full"
            });
            return;
        }

        if (channel.rooms[msg.room].status == 'empty') {

            var gameRoom = channel.rooms[msg.room];
            var player = channel.userMap[session.uid];
            gameRoom.userlist[0] = player;
            player.room = msg.room;
            player.uIndex = 0;
            gameRoom.status = 'waiting';
            this.postRoomStatus(channel);
            next(null, {
                code: 200
            });
        }

        if (channel.rooms[msg.room].status == 'waiting') {
            var gameRoom = channel.rooms[msg.room];
            var player = channel.userMap[session.uid];

            for (var i = 0; i < gameRoom.userlist.length; i++) {
                if (player.uid == gameRoom.userlist[i].uid) {
                    next(null, {
                        code: 500,
                        msg: "the player is exist of the room"
                    });
                    return;
                }
            }

            if (gameRoom.userlist.length == 1) {
                player.uIndex = 1;
                gameRoom.userlist[1] = player;
                gameRoom.status = 'waiting';
            } else {
                player.uIndex = 2;
                gameRoom.userlist[2] = player;
                gameRoom.status = 'ready';
                //设置地主
                gameRoom.setLord();
                //设置当前玩家左右
                gameRoom.setLRPostList();
                //初始化棋牌,发牌
                gameRoom.setCardlist(this.card.genereteCard());
                //设置地主先发牌
                gameRoom.validPostID = gameRoom.landlordUser.uid;
                //设置发牌队列值 第多少次发牌
                gameRoom.postCardQueueNum = 1;
                //给客户端推送开始游戏
                channel.pushMessage({
                    route: 'onStartGame'
                });
            }
            player.room = msg.room;
            this.postRoomStatus(channel);
            next(null, {
                code: 200
            });
        }
    } else {
        console.log("create channel not found");
    }
}