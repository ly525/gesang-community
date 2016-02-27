var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 定义一个Schema
var UserSchema = new Schema({
    name: String,
    password: String,
    email: String,
    avatar: String,
    introduction: String,
    createTime: {
        type: Date,
        default: Date.now()
    }
});


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

//User.updateEmail = function (_id, newEmail, callback) {
//    mongodbInstance.open(function (err, db) {
//        if (err) return callback(err);
//        db.collection('users').update({
//            _id: new ObjectID(_id)
//        }, {
//            $set: {
//                email: newEmail
//            }
//        }, {
//            safe: true
//        }, function (err) {
//            if (err) {
//                mongodbInstance.close();
//                return callback(err);
//            }
//
//            db.collection('users', function (err, users) {
//                if (err) {
//                    mongodbInstance.close();
//                    return callback(err);
//                }
//
//                users.findOne({
//                    _id: new ObjectID(_id)
//                }, function (err, user) {
//                    mongodbInstance.close();
//                    if (err) return callback(err);
//                    console.log("新邮箱是" + user.email);
//                    callback(null, user);
//                });
//            });
//
//        });
//    });
//};
//
//User.updatePassword = function (_id, newPassword, callback) {
//    mongodbInstance.open(function (err, db) {
//        if (err) return callback(err);
//        db.collection('users').update({
//            _id: new ObjectID(_id)
//        }, {
//            $set: {
//                password: newPassword
//            }
//        }, {
//            safe: true
//        }, function (err) {
//            if (err) {
//                mongodbInstance.close();
//                return callback(err);
//            }
//
//            db.collection('users', function (err, users) {
//                if (err) {
//                    mongodbInstance.close();
//                    return callback(err);
//                }
//
//                users.findOne({
//                    _id: new ObjectID(_id)
//                }, function (err, user) {
//                    mongodbInstance.close();
//                    if (err) return callback(err);
//                    callback(null, user);
//                });
//            });
//
//        });
//    });
//};
mongoose.model('User', UserSchema);