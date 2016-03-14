var ArticleLiker = require('../models').ArticleLiker;
var EventProxy   = require('eventproxy');
var User         = require('./user');
var Article      = require('./article');

exports.getArticleLiker = function (article_id, liker_id, callback) {
    ArticleLiker.findOne({article_id: article_id, liker_id: liker_id}, callback);
};

exports.getArticlesByLiker_id = function (liker_id, callback) {
    ArticleLiker.find({liker_id: liker_id}, {article_id: ""}, function (err, connections) {
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_article', connections.length, function (articles) {
            callback(null, articles);
        });

        connections.forEach(function (connection) {
            Article.getUserById(connection.article_id, function (err, article) {
                if (err) return callback(err);
                ep.emit("one_article", article);
            });

        });

    });
};

exports.getLikersByArticle_id = function (article_id, callback) {
    ArticleLiker.find({article_id: article_id}, {liker_id: ""}, function (err, connections) {
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_liker', connections.length, function (likers) {
            callback(null, likers);
        });

        connections.forEach(function (connection) {
            User.getUserById(connection.liker_id, function (err, liker) {
                if (err) return callback(err);
                ep.emit("one_liker", liker);
            });

        });

    });
};


exports.newAndSave = function (article_id, liker_id, callback) {
    var articleLiker        = new ArticleLiker();
    articleLiker.article_id = article_id;
    articleLiker.liker_id   = liker_id;
    articleLiker.save(callback);
};


exports.remove = function (article_id, liker_id, callback) {
    ArticleLiker.remove({article_id: article_id, liker_id: liker_id}, callback);
};