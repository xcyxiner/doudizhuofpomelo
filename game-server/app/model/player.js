/**
 * Created by zhangjt on 16/12/27.
 */
module.exports = function (name, uid, sid) {
    return new Player(name, uid, sid);
}

var Player = function (name, uid, sid) {
    this.name = name;
    this.uid = uid;
    this.sid = sid;
    this.rollScore = 0;//抢地主，扔骰子的点数
    this.uIndex = -1;//在房间中的序号
    this.leftPlayer = null;//左边邻居
    this.rightPlayer = null;//右边邻居
    this.cardList = [];//剩余棋牌
    this.postcardList = [];//当前所发棋牌
}

