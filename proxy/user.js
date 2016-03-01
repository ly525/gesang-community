var User = require('../models').User;
var utility = require('utility');
var uuid = require('node-uuid');


/**
 * 根据邮箱地址查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */

exports.getUserByEmail = function (email, callback) {
    User.findOne({email: email}, callback);
};
exports.getUserByUniquename = function (uniquename, callback) {
    User.findOne({uniquename: uniquename}, callback);
};


/**
 * 根据用户ID, 查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */

exports.getUserById = function (id, callback) {
    if (!id) return callback();
    User.findOne({_id: id}, callback);
};

exports.newAndSave = function(nickname, uniquename, email, passhash,avatarUrl,active, callback){
    var user = new User();
    user.nickname = nickname;
    user.uniquename = uniquename;
    user.passhash = passhash;
    user.active = active || false;
    user.email = email;
    user.avatarUrl = avatarUrl;
    user.save(callback);
};


var makeSomelineAvatarUrl = function (email, size) {
    return 'https://www.someline.com/cn/avatar/' + utility.sha1(email.toLowerCase()) + '/' + size;
};

exports.makeSomelineAvatarUrl = makeSomelineAvatarUrl;