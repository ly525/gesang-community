var mongoose        = require('mongoose');
var config          = require('../config');

mongoose.connect("mongodb://"+config.mongodb_host + ':' + config.mongodb_port + '/' + config.mongodb_dbname, {server: {poolSize: 20}}, function (err) {
    if (err) {
        console.log("connect to %s error", config.mongodb_dbname, err.message);
        process.exit(1);
    }
    console.log('数据库的链接信息' + config.mongodb_host + ':' + config.mongodb_port + '/' + config.mongodb_dbname);
});


// models
require('./user');
require('./user_follower');

exports.User = mongoose.model('User');
exports.UserFollower = mongoose.model('UserFollower');