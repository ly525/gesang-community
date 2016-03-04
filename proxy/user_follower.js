var UserFollower = require('../models').UserFollower;

exports.getUserFollower  = function (be_follower_id, follower_id, callback) {
    UserFollower.findOne({be_follower_id:be_follower_id,follower_id:follower_id}, callback);
};

exports.getFollowersBybe_follower_id  = function (be_follower_id, callback) {
    UserFollower.find({be_follower_id:be_follower_id},{follower_id:""}, callback);
};

exports.getBeFollowersByfollower_id  = function (follower_id, follower_id, callback) {
    UserFollower.find({follower_id:follower_id},{be_follower_id:""}, callback);
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