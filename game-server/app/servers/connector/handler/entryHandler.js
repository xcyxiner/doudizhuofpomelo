module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};
var handler = Handler.prototype;

/**
 * New client entry landlord server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
    var self = this;
    var rid = msg.rid;
    var uid = msg.username + '*' + rid
    var sessionService = self.app.get('sessionService');

    //duplicate log in
    if( !! sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);
    session.set('rid', rid);
    session.push('rid', function(err) {
        if(err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));

    //put user into channel
    self.app.rpc.landlord.landlordRemote.login(session, uid, self.app.get('serverId'), rid, function(data){
        next(null, {
            code:200,
            msg:"Login success",
            rooms:data
        });
    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    app.rpc.landlord.landlordRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};