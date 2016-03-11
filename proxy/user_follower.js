var UserFollower = require('../models').UserFollower;
var EventProxy   = require('eventproxy');
var User        = require('./user');

exports.getUserFollower  = function (be_follower_id, follower_id, callback) {
    UserFollower.findOne({be_follower_id:be_follower_id,follower_id:follower_id}, callback);
};

exports.getFollowersBybe_follower_id  = function (be_follower_id, callback) {
    UserFollower.find({be_follower_id:be_follower_id},{follower_id:""}, function(err, connections){
        if(err ) return callback(err);

        var ep = new EventProxy();
        ep.after('one_follower', connections.length, function(followers){
            callback(null, followers);
        });

        connections.forEach(function(connection){
            User.getUserById(connection.follower_id, function(err, follower){
                if (err) return callback(err);
                follower.passhash = null;
                ep.emit("one_follower", follower);
            });

        });

    });
};

exports.getBeFollowersByfollower_id  = function (follower_id, callback) {
    UserFollower.find({follower_id:follower_id},{be_follower_id:""}, function(err, connections){
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_be_follower', connections.length, function(be_followers){
            callback(null, be_followers);
        });

        connections.forEach(function(connection){
            User.getUserById(connection.be_follower_id, function(err, be_follower){
                if (err) return callback(err);
                be_follower.passhash = null;
                ep.emit("one_be_follower", be_follower);
            });

        });

    });
};


exports.newAndSave = function(be_follower_id, follower_id, callback ){
    var userFollower = new UserFollower();
    userFollower.be_follower_id = be_follower_id;
    userFollower.follower_id    = follower_id;
    userFollower.save(callback);
};



exports.remove =   function (be_follower_id, follower_id, callback) {
    UserFollower.remove({be_follower_id:be_follower_id,follower_id:follower_id}, callback);
};