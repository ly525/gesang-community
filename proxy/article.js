var Article    = require('../models').Article;
var markdown   = require('markdown').markdown;
var EventProxy = require('eventproxy');
var User       = require('./user');
var Reply      = require('./reply');

/**
 * 保存一篇文章
 * @param author_id 作者ID
 * @param title 标题
 * @param content 内容
 * @param tags 标签数组
 * @param is_draft 是否为草稿
 * @param callback 回调函数 用于判断收保存成功
 */
exports.newAndSave = function (author_id, title, content, tags, is_draft, callback) {
    var article       = new Article();
    article.author_id = author_id;
    article.title     = title;
    article.content   = content
    article.tags      = tags;
    article.is_draft  = is_draft;
    article.save(callback);
};

/**
 * 根据文章ID获得文章详情:用于显示一篇文章详情页面
 * -包含: 文章信息 | 作者信息 | 评论信息
 * @param article_id 文章ID
 * @param callback
 */
exports.getFullArticleByArticleId = function (article_id, callback) {
    console.log("typeof" + (typeof  article_id));
    var ep = new EventProxy();
    ep.all('article', 'author', 'replies', function (article, author, replies) {
        article.author  = author;
        article.replies = replies;
        return callback(null, article);
    });

    // 根据文章ID获得文章信息,并更新文章阅读量+1
    Article.findOneAndUpdate({_id: article_id, deleted: false}, {$inc: {visit_count: 1}}, function (err, article) {
        if (!article) return callback('此文章不存在或者已经被删除');
        article.content = markdown.toHTML(article.content);
        ep.emit('article', article);

        // 查询文章作者详情
        User.getUserById(article.author_id, function (err, author) {
            if (!author) return callback("文章的作者丢了");
            ep.emit('author', author);
        });

        // 查询该文章的所有评论信息
        // ep.done('replies')相当于是一个回调函数.用法参见: https://github.com/JacksonTian/eventproxy#神奇的done
        Reply.getRepliesByArticleId(article_id, function (err, replies) {
            if (err) return callback(err);
            ep.emit('replies', replies);
        });
    });


};

/**
 * 得到一篇文章(有文章信息|作者信息|没有评论)
 * - 用于显示搜索结果,简文首页
 * @param article_id
 * @param callback
 */
exports.getFullArticleWitoutReplyByArticleId = function (article_id, callback) {
    var ep = new EventProxy();
    ep.all('article', 'author', function (article, author) {
        article.author = author;
        return callback(null, article);
    });

    // 查询文章信息
    Article.findOne({_id: article_id, deleted: false}, function (err, article) {
        if (!article) return callback('此文章不存在或者已经被删除');
        article.content = markdown.toHTML(article.content);
        ep.emit('article', article);

        // 查询文章作者详情
        User.getUserById(article.author_id, function (err, author) {
            if (!author) return callback("文章的作者丢了");
            ep.emit('author', author);
        });

    });


};

/**
 * 查询文章(只有文章信息 | 无评论 | 无作者详情)
 * - 用于个人页面显示 某人发表过得文章
 * @param article_id
 * @param callback
 */
exports.getArticleWithoutRendingNorAuthorByArticleId = function (article_id, callback) {
    Article.findOne({_id: article_id}, function (err, article) {
        if (err) return callback(err);
        callback(null, article);
    });
};


