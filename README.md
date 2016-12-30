#背景资料
[斗地主逻辑以及素材参考的php版的棋牌](https://github.com/xcyxiner/doudizhi)

[斗地主房间参考的pomelo版的五子棋](https://github.com/xcyxiner/chess)

[斗地主通知参考的官方的chat](https://github.com/xcyxiner/chatofpomelo)

PS: 一个php的可以提供素材，chess的可以提供房间等参考，chat可以提供初始化通知等。

#如何使用
* node v0.10.38 
* npm  1.4.28
* Debian 8
* 替换config/servers.json以及master.json中的ip（192.168.0.202）

#一些难点
* php版本是多个html（两个php文件）合并成一个
* php版本洗牌，拆分转成对应的node.js的遇到很多坑
* 原php检测出牌是否有效逻辑没看懂，遂部分重写(2.对子 3.3不带 4.3带1 5.炸弹 6.顺子 7.4带2 8.连队 9.飞机 )

#出牌是否合理检测(以飞机为例)
 将牌解析为对应的数字，统计数字出现的次数
 
```
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
```

#待改进
* 地主由服务器在三个用户之间随机roll
* 已出牌整理无效
* 重复刷新有时候会不显示（出牌和不出）按钮
* 用户退出没有清空房间,需重启
* 三带以及四带二以及飞机带只匹配单牌不匹配对牌

#版本库记录
```
732aba4 xcyxiner on 16/12/30 at 下午5:54 比牌
411b8a3 xcyxiner on 16/12/30 at 下午4:34 更新对方出牌,更新剩余棋牌,整理初始化手牌，自己出牌清空已出牌
1a12fdf xcyxiner on 16/12/30 at 下午3:16 十种牌型检测，修复三带一，飞机带翅膀，单顺出现的bug
ebd429a xcyxiner on 16/12/29 at 下午12:39 要不起（发牌）操作，轮到下一位发牌
b4814a8 xcyxiner on 16/12/29 at 上午10:14 添加注释，显示玩家发牌，显示时钟，显示出牌和要不起按钮
8550e46 xcyxiner on 16/12/28 at 下午5:36 显示玩家手中的棋牌
665cb58 xcyxiner on 16/12/28 at 下午2:49 凑满三人，显示玩家（地主和农民）
7c10c04 xcyxiner on 16/12/27 at 下午6:30 更新房间状态
ba94521 xcyxiner on 16/12/27 at 下午5:42 加入房间
2432eae xcyxiner on 16/12/27 at 上午11:10 添加房间，点击房间事件
f89370f xcyxiner on 16/12/27 at 上午8:58 1226
1d6bc5c xcyxiner on 16/12/27 at 上午8:56 connector连接完成
5c0128b xcyxiner on 16/12/26 at 下午2:45 connector连接完成
fa2c3b4 xcyxiner on 16/12/26 at 上午11:45 修改首页面，只保留登录
0ab6467 xcyxiner on 16/12/26 at 上午11:31 修改配置后的初始版本
``` 