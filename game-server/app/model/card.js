/**
 * Created by zhangjt on 16/12/28.
 */
var Range = require('node-range');
var Shuffle = require('shuffle-array');
var Chunk = require('array.chunk');
var util = require('util');
var arsort = require('locutus/php/array/arsort');
var sort = require('locutus/php/array/sort');
var array_slice = require('locutus/php/array/array_slice');
module.exports = function () {
    return new Card();
};

var Card = function () {
    this.cards = [];
    this.cardlist = [];
};
//洗牌，发牌
Card.prototype.genereteCard = function () {
    //创建棋牌数组
    this.cards = Range(1, 54, true).toArray();
    //洗牌
    Shuffle(this.cards);
    //发牌
    this.cards = Chunk(this.cards, 17);
    this.cardlist[0] = this.cards[0];
    this.cardlist[1] = this.cards[1];
    this.cardlist[2] = this.cards[2];
    //底牌分发
    this.cardlist[2][this.cardlist[2].length] = this.cards[3][0];
    this.cardlist[2][this.cardlist[2].length] = this.cards[3][1];
    this.cardlist[2][this.cardlist[2].length] = this.cards[3][2];
    //整理牌
    this.cardlist[0] = this.adjustCardList(this.cardlist[0]);
    this.cardlist[1] = this.adjustCardList(this.cardlist[1]);
    this.cardlist[2] = this.adjustCardList(this.cardlist[2]);
    //返回分好的牌
    return this.cardlist;
};
/**
 * 十种牌型
 * 1. 单 2.对子 3.3不带 4.3带1 5.炸弹 6.顺子 7.4带2 8.连队 9.飞机 10.对王
 */
//检查出牌是否有效
Card.prototype.isValidType = function (postlist) {
    //不是数组直接返回
    if (!util.isArray(postlist)) {
        return false;
    }

    //是否是单牌(1)
    if (this.isDanZhang(postlist)) {
        return true;
    }

    //是否是对王(2)
    if (this.isWangBoom(postlist)) {
        return true;
    }

    //是否是对子(2)
    if (this.isDuiZi(postlist)) {
        return true;
    }

    //三带(3)
    if (this.isSanBuDai(postlist)) {
        return true;
    }

    //是否是炸弹(4)
    if (this.isBoom(postlist)) {
        return true;
    }

    // 三带一(单)
    if (this.isSanDai(postlist)) {
        return true;
    }


    //是否是单顺(5+)
    if (this.isDanShun(postlist)) {
        return true;
    }

    //是否是双顺(6,8,10）334455
    if (this.isShuangShun(postlist)) {
        return true;
    }

    //四带二(6+) 4444+35(单)
    if (this.isSiDaiEr(postlist)) {
        return true;
    }

    //是否是三顺(6,9,12) 333444
    if (this.isFeiJiBuDai(postlist)) {
        return true;
    }

    //飞机带翅膀(8+) 333444+67(单)
    if (this.isFeiJiDai(postlist)) {
        return true;
    }

    return false;
};
Card.prototype.isDanZhang = function (postlist) {
    if (postlist.length === 1) {
        return this.getGrade(postlist[0]);
    }
    return false;
};
Card.prototype.isDuiZi = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);

    if (tmpPostlist.length == 2) {
        var totalNumberTwo = 0;
        for (var idx = 3; idx < 18; idx++) {
            if (resetlist[idx] == 2) {
                totalNumberTwo++;
            }
        }
        if (totalNumberTwo != 0) {
            return tmpPostlist[0];
        }
    }
    return false;
};
Card.prototype.isSanBuDai = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    //存储大的值
    var tmpNumber = -1;
    if (tmpPostlist.length == 3) {
        var totalNumberThree = 0;
        for (var idx = 3; idx < 18; idx++) {
            if (resetlist[idx] == 3) {
                tmpNumber = idx;
                totalNumberThree++;
            }
        }
        if (totalNumberThree != 0) {
            return tmpNumber;
        }
    }
    return false;
};
Card.prototype.isSanDai = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    //存储大的值
    var tmpNumber = -1;
    if (tmpPostlist.length == 4) {
        var totalNumberThree = 0;
        for (var idx = 3; idx < 18; idx++) {
            if (resetlist[idx] == 3) {
                tmpNumber = idx;
                totalNumberThree++;
            }
        }
        if (totalNumberThree != 0) {
            return tmpNumber;
        }
    }
    return false;
};


Card.prototype.isBoom = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    //存储大的值
    var tmpNumber = -1;
    if (tmpPostlist.length == 4) {
        var totalNumberFour = 0;
        for (var idx = 3; idx < 18; idx++) {
            if (resetlist[idx] == 4) {
                tmpNumber = idx;
                totalNumberFour++;
            }
        }
        if (totalNumberFour != 0) {
            return tmpNumber;
        }
    }
    return false;
};

Card.prototype.isWangBoom = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);

    if (tmpPostlist.length === 2 && tmpPostlist[0] > 15 && tmpPostlist[1] > 15) {
        return tmpPostlist[0];
    }
    return false;
};
Card.prototype.isDanShun = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    if (tmpPostlist.length >= 5) {
        if (tmpPostlist[tmpPostlist.length - 1] >= 15) {
            return false;
        }
        for (var idx = 0; idx < tmpPostlist.length - 1; idx++) {
            if (tmpPostlist[idx] != (tmpPostlist[idx + 1] - 1)) {
                return false;
            }
        }
        return tmpPostlist[tmpPostlist.length - 1];
    }
    return false;
};
Card.prototype.isShuangShun = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    if (tmpPostlist.length < 6 || tmpPostlist.length % 2 != 0 || tmpPostlist[tmpPostlist.length - 1] > 14) {
        return false;
    }

    for (var idx = 0; idx < tmpPostlist.length - 1; idx++) {
        if (idx % 2 != 0) {
            if (tmpPostlist [idx] != tmpPostlist [idx + 1] - 1) {
                return false;
            }
        }
        else {
            if (tmpPostlist [idx] != tmpPostlist [idx + 1]) {
                return false;
            }
        }
    }
    return tmpPostlist[tmpPostlist.length - 1];
};
Card.prototype.isFeiJiBuDai = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    //存储大的值
    var tmpNumber = -1;

    if (tmpPostlist.length < 6 || tmpPostlist.length % 3 != 0) {
        return false;
    }
    var totalNumberThree = 0;
    var tmpThreeNumberCardList = [];
    for (var idx = 3; idx < 18; idx++) {
        if (resetlist[idx] == 3) {
            tmpNumber = idx;
            totalNumberThree++;
            tmpThreeNumberCardList[tmpThreeNumberCardList.length] = idx;
        }
    }
    if (totalNumberThree == tmpPostlist.length / 3) {
        for (var idx = 0; idx < tmpThreeNumberCardList.length; idx++) {
            if (idx < tmpThreeNumberCardList.length - 1) {
                if (tmpThreeNumberCardList[idx] + 1 != tmpThreeNumberCardList[idx + 1]) {
                    return false;
                }
            }
        }
        return tmpNumber;
    }
    return false;
};
Card.prototype.isFeiJiDai = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    //存储大的值
    var tmpNumber = -1;
    if (postlist.length < 8 || postlist.length % 4 != 0) {
        return false;
    }
    var totalNumberThree = 0;
    var tmpThreeNumberCardList = [];
    for (var idx = 3; idx < 18; idx++) {
        if (resetlist[idx] == 3) {
            tmpNumber = idx;
            totalNumberThree++;
            tmpThreeNumberCardList[tmpThreeNumberCardList.length] = idx;
        }
    }
    if (totalNumberThree == postlist.length / 4) {
        for (var idx = 0; idx < tmpThreeNumberCardList.length; idx++) {
            if (idx < tmpThreeNumberCardList.length - 1) {
                if (tmpThreeNumberCardList[idx] + 1 != tmpThreeNumberCardList[idx + 1]) {
                    return false;
                }
            }
        }
        return tmpNumber;
    }
    return false;
};
Card.prototype.isFeiJi = function (postlist) {
    var isFeiJiBuDaiResult = this.isFeiJiBuDai(postlist);
    if (isFeiJiBuDaiResult) {
        return isFeiJiBuDaiResult;
    }
    var isFeiJiDaiResult = this.isFeiJiDai(postlist);
    if (isFeiJiDaiResult) {
        return isFeiJiDaiResult;
    }
    return false;
};
Card.prototype.isSiDaiEr = function (postlist) {
    //将牌解析成对应的数字，并重新排序
    var tmpPostlist = this.sortCardList(postlist);
    var resetlist = [];
    //统计牌中数字出现的频率
    resetlist = this.resetCardList(tmpPostlist);
    //存储大的值
    var tmpNumber = -1;
    if (tmpPostlist.length != 6) {
        return false;
    }
    var totalNumberFour = 0;
    for (var idx = 3; idx < 18; idx++) {
        if (resetlist[idx] == 4) {
            tmpNumber = idx;
            totalNumberFour++;
        }
    }
    if (totalNumberFour != 0) {
        return tmpNumber;
    }
    return false;
};
Card.prototype.getGrade = function (value) {
    var grade = 0;

    if (value == 53) {
        grade = 16;
    }
    else if (value == 54) {
        grade = 17;
    }
    else {
        var modResult = value % 13;

        if (modResult == 1) {
            grade = 14;
        }
        else if (modResult == 2) {
            grade = 15;
        }
        else if (modResult == 3) {
            grade = 3;
        }
        else if (modResult == 4) {
            grade = 4;
        }
        else if (modResult == 5) {
            grade = 5;
        }
        else if (modResult == 6) {
            grade = 6;
        }
        else if (modResult == 7) {
            grade = 7;
        }
        else if (modResult == 8) {
            grade = 8;
        }
        else if (modResult == 9) {
            grade = 9;
        }
        else if (modResult == 10) {
            grade = 10;
        }
        else if (modResult == 11) {
            grade = 11;
        }
        else if (modResult == 12) {
            grade = 12;
        }
        else if (modResult == 0) {
            grade = 13;
        }

    }

    return grade;
};
/**按牌面数量进行排序
 * @param cardList
 * @return array
 */
Card.prototype.sortCardList = function (postlist) {
    var list = [];
    for (var idx = 0; idx < postlist.length; idx++) {
        list[idx] = this.getGrade(postlist[idx]);
    }
    list.sort(function (a, b) {
        return a - b;
    })
    //list.reverse();
    return list;
};
//统计牌中的数字
Card.prototype.resetCardList = function (postlist) {
    var resetlist = [];
    for (var idx = 3; idx < 18; idx++) {
        resetlist[idx] = 0;
    }

    for (var idx = 0; idx < postlist.length; idx++) {
        resetlist[postlist[idx]]++;
    }
    return resetlist;
};
//清理发出的棋牌
Card.prototype.delPostCardList = function (cardList, postcardList) {
    var lastCardList = [];
    for (var idx = 0; idx < cardList.length; idx++) {
        for (var subidx = 0; subidx < postcardList.length; subidx++) {
            if (cardList[idx] == postcardList[subidx]) {
                cardList[idx] = -1;
                break;
            }
        }
    }
    for (var idx = 0; idx < cardList.length; idx++) {
        if (cardList[idx] != -1) {
            lastCardList[lastCardList.length] = cardList[idx];
        }
    }
    return lastCardList;
};
//整理手中的棋牌
Card.prototype.adjustCardList = function (subCardList) {
    var lastCardList = [];

    for (var idx = 3; idx < 18; idx++) {
        for (var subidx = 0; subidx < subCardList.length; subidx++) {
            if (this.getGrade(subCardList[subidx]) == idx) {
                lastCardList[lastCardList.length] = subCardList[subidx];
            }
        }
    }
    lastCardList.reverse();
    return lastCardList;
};

//现牌跟上一次出牌对比
Card.prototype.isOverPre = function (prePostList, curPostList) {
    var cur = -1;
    var pre = -1;
    if ((prePostList == '' || prePostList == ' ' || prePostList[0] == '' || prePostList[0] == ' ' ) && this.isValidType(curPostList)) {
        return true;
    }
    if (this.isWangBoom(prePostList)) {
        return false;
    }

    if (this.isWangBoom(curPostList)) {
        return true;
    }

    //现牌炸 前牌不炸
    if (this.isBoom(curPostList) && !(this.isBoom(prePostList))) {
        return true;
    }

    //现不炸 前牌炸
    if (this.isBoom(prePostList) && !(this.isBoom(curPostList))) {
        return false;
    }

    //单
    if ((cur = this.isDanZhang(curPostList)) && (pre = this.isDanZhang(prePostList))) {
        return cur > pre;
    }

    //对子
    else if ((cur = this.isDuiZi(curPostList)) && ( pre = this.isDuiZi(prePostList))) {
        return cur > pre;
    }

    //三不带
    else if ((cur = this.isSanBuDai(curPostList)) && (pre = this.isSanBuDai(prePostList))) {
        return cur > pre;
    }

    //炸弹
    else if ((cur = this.isBoom(curPostList) ) && ( pre = this.isBoom(prePostList))) {
        return cur > pre;
    }

    //三带
    else if ((cur = this.isSanDai(curPostList)) && (pre = this.isSanDai(prePostList))) {
        return cur > pre;
    }

    //四带二
    else if ((cur = this.isSiDaiEr(curPostList)) && (pre = this.isSiDaiEr(prePostList))) {
        return cur > pre;
    }

    //顺子
    else if ((cur = this.isDanShun(curPostList)) && (pre = this.isDanShun(prePostList))) {
        return cur > pre;
    }

    //连对
    else if ((cur = this.isShuangShun(curPostList)) && ( pre = this.isShuangShun(prePostList))) {
        return cur > pre;
    }

    //飞机
    else if ((cur = this.isFeiJi(curPostList)) && (pre = this.isFeiJi(prePostList))) {
        return cur > pre;
    }
    return false;
}