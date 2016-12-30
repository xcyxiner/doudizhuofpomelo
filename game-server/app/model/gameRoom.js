/**
 * Created by zhangjt on 16/12/27.
 */
module.exports = function (roomId, channelService) {
    return new GameRoom(roomId, channelService);
};


var GameRoom = function (roomId, channelService) {
    this.roomId = roomId;
    this.channelService = channelService;
    this.status = 'empty';//房间状态
    this.userlist = [];//房间用户列表
    this.landlordUser = null;//地主
    this.validPostID = null;//当前该谁出牌
    this.postCardQueueNum = -1; //第多少次发牌
};

//房间状态
GameRoom.prototype.getRoomStatus = function () {
    if (this.userlist.length == 0)
        return [this.roomId, '', this.status];
    else
        return [this.roomId, this.userlist.length, this.status];
}
//掷骰子，决定谁是地主
GameRoom.prototype.setLord = function () {
    if (this.userlist.length == 3) {
        this.userlist[0].rollScore = Math.random();
        this.userlist[1].rollScore = Math.random();
        this.userlist[2].rollScore = Math.random();
//点数大的为地主，有相同点数以索引小的为地主
        if (this.userlist[0].rollScore >= this.userlist[1].rollScore) {
            if (this.userlist[0].rollScore >= this.userlist[2].rollScore) {
                this.landlordUser = this.userlist[0];
            } else {
                this.landlordUser = this.userlist[2];
            }
        } else {
            if (this.userlist[1].rollScore >= this.userlist[2].rollScore) {
                this.landlordUser = this.userlist[1];
            } else {
                this.landlordUser = this.userlist[2];
            }
        }
    }
}
//设置用户的左右邻居
GameRoom.prototype.setLRPostList = function () {
    this.userlist[0].leftPlayer = this.userlist[2];
    this.userlist[0].rightPlayer = this.userlist[1];
    this.userlist[1].leftPlayer = this.userlist[0];
    this.userlist[1].rightPlayer = this.userlist[2];
    this.userlist[2].leftPlayer = this.userlist[1];
    this.userlist[2].rightPlayer = this.userlist[0];
}
//根据当前发牌次数，决定谁来发牌
GameRoom.prototype.setvalidPostID = function () {
    var postQueue = this.postCardQueueNum;
    var lordIndex = this.landlordUser.uIndex;
    var idx = (postQueue) % 3 + lordIndex;

    if (idx >= 3) {
        idx = idx % 3;
    }
    //清空发牌者前的棋牌
    this.userlist[idx].postcardList=[];
    this.validPostID = this.userlist[idx].uid;
}

//分牌
GameRoom.prototype.setCardlist = function (cardlist) {
    //将带有底牌的发给地主，其他两份发给农民
    if (this.landlordUser.uIndex == 0) {
        this.userlist[0].cardList = cardlist[2];
        this.userlist[1].cardList = cardlist[0];
        this.userlist[2].cardList = cardlist[1];
    } else if (this.landlordUser.uIndex == 1) {
        this.userlist[1].cardList = cardlist[2];
        this.userlist[0].cardList = cardlist[1];
        this.userlist[2].cardList = cardlist[0];
    } else {
        this.userlist[2].cardList = cardlist[2];
        this.userlist[1].cardList = cardlist[0];
        this.userlist[0].cardList = cardlist[1];
    }
}