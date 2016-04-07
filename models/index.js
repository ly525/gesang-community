var mongoose = require('mongoose');
var config   = require('../config');

mongoose.connect("mongodb://" + config.mongodb_host + ':' + config.mongodb_port + '/' + config.mongodb_dbname, {server: {poolSize: 20}}, function (err) {
    if (err) {
        console.log("****** connect to %s error", config.mongodb_dbname, err.message);
        process.exit(1);
    }
    console.log('****** 数据库的链接信息' + config.mongodb_host + ':' + config.mongodb_port + '/' + config.mongodb_dbname);
});


// models
require('./user/user');
require('./connection/user_follower');
require('./article/article');
require('./article/reply');
require('./connection/article_collector');
require('./connection/article_liker');
require('./question/question');
require('./answer/answer');
require('./answer/answer_comment');

exports.User             = mongoose.model('User');
exports.UserFollower     = mongoose.model('UserFollower');
exports.Article          = mongoose.model('Article');
exports.Reply            = mongoose.model('Reply');
exports.ArticleCollector = mongoose.model('ArticleCollector');
exports.ArticleLiker     = mongoose.model('ArticleLiker');
exports.Question         = mongoose.model('Question');
exports.Answer           = mongoose.model('Answer');
exports.AnswerComment           = mongoose.model('AnswerComment');
