var Article = require('../models').Article;
var markdown = require('markdown').markdown;
var EventProxy = require('eventproxy');
var User        = require('./user');
var ArticleCollector = require('../models').ArticleCollector;


//获取一个人的所有文章(传入参数 name)或获取所有人的文章(不传入参数)
exports.getAllArticlesByUserId = function (userId, callback) {
    Article.find({
        userId: userId
    }), (function (err, articles) {
        if (err) return callback(err);
        articles.forEach(function (article) {
            article.content = markdown.toHTML(article.content);
        });
        callback(null, articles); // 返回根据检索条件检索到的所有文章合集,以数组形式返回查询的结果
    });
};

// 一次获取20篇文章


exports.getTwentyArticlesWithoutUserId = function (page, callback) {
    Article.count({deleted: false}, function(err, total){
        Article.find({deleted: false}).skip((page - 1) * 20).limit(20).sort('-last_reply_at').exec(function(err, articles){
            if(err) return callback(err);
            if (articles.length === 0) return callback(null, 0, []);

            var proxy = new EventProxy();
            proxy.after('topics_ready', articles.length, function () {
                return callback(null, total, articles);
            });
            articles.forEach(function(article){
                   var ep = new EventProxy();
                   ep.all('author', function(author){
                       author.passsh = null;
                       article.author = author;
                       proxy.emit('topics_ready');
                   });
                    User.getUserById(article.author_id, function(err, author){
                        ep.emit('author', author);
                    });
                });

        });


    });

};
exports.getTwentyArticlesByUserId = function (id, callback) {
    Article.find({deleted: false}).limit(20).sort('-last_reply_at').exec(function(err, articles){
        if (err) return callback(err);
        if (articles.length === 0) return callback(null, []);
        return callback(null, articles);
    });

};


exports.getTwentyArticlesByCollectorId = function (collector_id, callback) {
    ArticleCollector.find({collector_id: collector_id}).limit(20).sort('-create_time').exec(function(err, connections){
        if (err) return callback(err);
        if (connections.length === 0) return callback(null, []);

        var ep = new EventProxy();
        ep.after('one_article', connections.length, function (articles){
            return callback(null, articles);
        });

        connections.forEach(function(connection){
            Article.findOne({ _id: connection.article_id, deleted: false}, function(err, article){
                if (err) return callback(err);
                ep.emit('one_article', article);
            });
        });

    });

};

exports.get5HottestCollectedArticles = function (callback){
    Article.find({deleted: false}).sort('-be_collected_count').limit(5).exec(callback);
};

