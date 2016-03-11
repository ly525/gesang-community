var ArticleCollector    = require('../models').ArticleCollector;
var EventProxy          = require('eventproxy');
var User                = require('./user');
var Article             = require('./article');
exports.getArticleCollector  = function (article_id, collector_id, callback) {
    ArticleCollector.findOne({article_id:article_id,collector_id:collector_id}, callback);
};

exports.getArticlesByCollector_id  = function (collector_id, callback) {
    ArticleCollector.find({collector_id:collector_id},{article_id:""}, function(err, connections){
        if(err ) return callback(err);
        var ep = new EventProxy();
        ep.after('one_article', connections.length, function(articles){
            callback(null, articles);
        });

        connections.forEach(function(connection){
            Article.getUserById(connection.article_id, function(err, article){
                if (err) return callback(err);
                ep.emit("one_article", article);
            });

        });

    });
};

exports.getCollectorsByArticle_id  = function (article_id, callback) {
    ArticleCollector.find({article_id:article_id},{collector_id:""}, function(err, connections){
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_collector', connections.length, function(collectors){
            callback(null, collectors);
        });

        connections.forEach(function(connection){
            User.getUserById(connection.collector_id, function(err, collector){
                if (err) return callback(err);
                ep.emit("one_collector", collector);
            });

        });

    });
};


exports.newAndSave = function(article_id, collector_id, callback ){
    var articleCollector            = new ArticleCollector();
    articleCollector.article_id     = article_id;
    articleCollector.collector_id   = collector_id;
    articleCollector.save(callback);
};



exports.remove =   function (article_id, collector_id, callback) {
    ArticleCollector.remove({article_id:article_id,collector_id:collector_id}, callback);
};