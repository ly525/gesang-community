var Article = require('../models').Article;
var markdown = require('markdown').markdown;
var EventProxy = require('eventproxy');
var User        = require('./user');
var Reply       = require('./reply');

exports.newAndSave = function (author_id, title, content, tags, is_draft, callback){
    var article         = new Article();
    article.author_id   = author_id;
    article.title       = title;
    article.content     = content
    article.tags        = tags;
    article.is_draft    = is_draft;
    article.save(callback);
};

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


exports.getFullArticleByArticleId = function(article_id, callback){
    var ep = new EventProxy();
    ep.all('article', 'author', 'replies', function(article, author, replies){
        article.author =  author;
        article.replies = replies;
        return callback(null, article);
    });

    Article.findOneAndUpdate({_id:article_id, deleted: false},{$inc:{visit_count:1}},function(err, article){
        if(!article) return callback('此文章不存在或者已经被删除' );
        article.content = markdown.toHTML(article.content);
        ep.emit('article', article);

        User.getUserById(article.author_id, function(err, author){
            if(!author) return callback( "文章的作者丢了");
            ep.emit('author', author);
        });
        // ep.done('replies')相当于是一个回调函数.用法参见: https://github.com/JacksonTian/eventproxy#神奇的done
        Reply.getRepliesByArticleId(article_id, function(err, replies){
            if(err) return callback(err);
            ep.emit('replies', replies);
        });
    });


};

exports.getFullArticleWitoutReplyByArticleId = function(title, callback){
    var ep = new EventProxy();



    ep.all('article', 'author', function(article, author){
        article.author =  author;
        return callback(null, article);
    });

    Article.find({title:title, deleted: false},function(err, articles){
        if (err) return callback(err);
        articles


        ep.emit('article', article);

        User.getUserById(article.author_id, function(err, author){
            if(!author) return callback( "文章的作者丢了");
            ep.emit('author', author);
        });

    });


};

exports.getFullArticleWitoutReplyByArticleTitle = function(article_id, callback){
    var ep = new EventProxy();
    ep.all('article', 'author', function(article, author){
        article.author =  author;
        return callback(null, article);
    });

    Article.findOneAndUpdate({_id:article_id, deleted: false},{$inc:{visit_count:1}},function(err, article){
        if(!article) return callback('此文章不存在或者已经被删除' );
        article.content = markdown.toHTML(article.content);
        ep.emit('article', article);

        User.getUserById(article.author_id, function(err, author){
            if(!author) return callback( "文章的作者丢了");
            ep.emit('author', author);
        });

    });


};


exports.getArticleWithoutRendingNorAuthorByArticleId = function (article_id, callback) {
       Article.findOne({_id: article_id}, function (err, article) {
                if (err) return callback(err);
                callback(null, article);
        });
};




exports.search = function (keyword, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            var pattern = new RegExp(keyword, 'i'); // i修饰符用于执行对大小写不敏感的匹配
            collection.find({
                title: pattern // TODO 2016年02月06日20:02:10 现在是只匹配标题,怎么查询文章的内容和作者呢?
            }, {
                name: 1,
                time: 1,
                title: 1,
                content: 1 // 这边的属性是什么意思？？
            }).sort({
                time: -1 // TODO 2016年02月06日20:02:52 这边的-1 是什么意思?
            }).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                articles.forEach(function (article) {
                    //article.content = markdown.toHTML(article.content);
                    article.content = article.content.length > 150 ? article.content.substring(0, 100) + "..." : article.content;
                });
                callback(null, articles);
            });
        });
    });
};

