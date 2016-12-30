var GameRoom = require('../../../model/gameRoom');
var Player = require('../../../model/player');
var LandlordHandler = require('../handler/landlordHandler');
module.exports = function (app) {
    return new LandlordRemote(app);
};

var LandlordRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.handler = LandlordHandler(app);
};

var ROOMSIZE = 20;

/**
 * Add user into landlord channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
LandlordRemote.prototype.login = function (uid, sid, name, cb) {
    var channel = this.channelService.getChannel(name, false);
    if (!channel) {
        channel = this.initChannel(name);
    }
    channel.add(uid, sid);
    var username = uid.split('*')[0];
    var param = {
        route: 'onAdd',
        user: username
    };
    channel.pushMessage(param);
    channel.userMap[uid] = Player(name, uid, sid);

    cb(this.handler.getRoomStatus(channel));
};

LandlordRemote.prototype.initChannel = function (channelName) {
    var channel = this.channelService.getChannel(channelName, true);
    channel.rooms = [];
    for (var i = 0; i < ROOMSIZE; i++) {
        channel.rooms[i] = GameRoom(i, this.channelService);
    }
    channel.userMap = {};
    return channel;
}


/**
 * Get user from landlord channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
LandlordRemote.prototype.get = function (name, flag) {
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        users = channel.getMembers();
    }
    for (var i = 0; i < users.length; i++) {
        users[i] = users[i].split('*')[0];
    }
    return users;
};

/**
 * Kick user out landlord channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
LandlordRemote.prototype.kick = function (uid, sid, name, cb) {
    var channel = this.channelService.getChannel(name, false);
    // leave channel
    if (!!channel) {
        channel.leave(uid, sid);
    }
    var username = uid.split('*')[0];
    var param = {
        route: 'onLeave',
        user: username
    };
    channel.pushMessage(param);
    cb();
};
