var Article          = require('../../models/index').Article;
var markdown         = require('markdown').markdown;
var EventProxy       = require('eventproxy');
var User             = require('./../user/user');
var ArticleCollector = require('../../models/index').ArticleCollector;


/**
 * 根据用户ID,获取一个人的所有文章
 * - 文章内容没有经过markdown渲染 &没有回复信息 &没有作者信息
 * @param userId
 * @param callback
 */
exports.getAllArticlesByUserId = function (author_id, callback) {
    var query = {author_id: author_id};
    getArticlesWithNothingByQuery(query, callback);

};

/**
 * 根据页码获得20篇最新回复的文章
 * @param page 页码
 * @param callback
 */

exports.getTwentyArticlesWithAuthor = function (page, callback) {
    var query = {deleted: false};
    getArticlesWithAuthorByQueryAndPage(query, page, callback);
};

/**
 *
 * @param id
 * @param callback
 */
exports.getTwentyArticlesByUserId = function (user_id, callback) {
    Article.find({author_id:user_id, deleted: false}).limit(20).sort('-last_reply_at').exec(function (err, articles) {
        if (err) return callback(err);
        if (articles.length === 0) return callback(null, []);
        return callback(null, articles);
    });

};

/**
 * 根据标题得到20篇最新回复的文章
 * - 包含: 文章信息 | 作者信息
 * - 用于: 检索结果显示
 * @param page
 * @param title
 * @param callback
 */
exports.getTwentyArticlesWithAuthorByTitle = function (page, title, callback) {
    var query = {title: title, deleted: false};
    getArticlesWithAuthorByQueryAndPage(query, page, callback);

};
exports.getTwentyArticlesByCollectorId = function (collector_id, callback) {
    ArticleCollector.find({collector_id: collector_id}).limit(20).sort('-create_time').exec(function (err, connections) {
        if (err) return callback(err);
        if (connections.length === 0) return callback(null, []);

        var ep = new EventProxy();
        ep.after('one_article', connections.length, function (articles) {
            return callback(null, articles);
        });
        connections.forEach(function (connection) {
            Article.findOne({_id: connection.article_id, deleted: false}, function (err, article) {
                if (err) return callback(err);
                if (article !== null) ep.emit('one_article', article);

            });
        });

    });

};

exports.get5HottestCollectedArticles = function (callback) {
    Article.find({deleted: false}).sort('-be_collected_count').limit(5).exec(callback);
};

/**
 * 根据查询条件得到文章
 * - 包含: 文章信息, 作者信息
 * @param page
 * @param query
 * @param callback
 */
function getArticlesWithAuthorByQueryAndPage(page, query, callback) {
    Article.count(query, function (err, total) { // count函数用来统计搜索文章数目
        Article.find(query).skip((page - 1) * 20).limit(20).sort('-last_reply_at').exec(function (err, articles) {
            if (err) return callback(err);
            if (articles.length === 0) return callback(null, 0, []);

            var proxy = new EventProxy();
            proxy.after('articles_ready', articles.length, function () {
                return callback(null, total, articles);
            });

            //1. 遍历查找到的所有文章
            articles.forEach(function (article) {
                //2. 根据作者ID查找作者详细信息(去除密码信息)
                User.getUserById(article.author_id, function (err, author) {
                    if (err) return callback(err);
                    // TODO 2016年03月14日00:35:54 如果都是null 怎办????proxy.after一直得不到数据导致用户没有响应怎么办
                    if (author !== null) {
                        author.passhash = null;
                        article.author  = author;
                        proxy.emit('articles_ready');// 每获得一个作者信息,就提交一次
                    }

                });
            });

        });

    });
}

function getArticlesWithNothingByQuery(query, callback) {

    Article.find(query).exec(function (err, articles) {
        if (err) return callback(err);
        if (articles.length === 0) return callback(null, []);
        callback(null, articles); // 返回根据检索条件检索到的所有文章合集,以数组形式返回查询的结果
    });
}
