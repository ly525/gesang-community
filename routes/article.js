var EventProxy       = require('eventproxy');
var validator        = require('validator');
var Article          = require('../proxy').Article;
var User             = require('../proxy').User;
var UserFollower     = require('../proxy').UserFollower;
var ArticleCollector = require('../proxy').ArticleCollector;
var ArticleLiker     = require('../proxy').ArticleLiker;
var Reply            = require('../proxy').Reply;
/**
 * 显示写一篇新文章页面
 * @param req
 * @param res
 * @param next
 */
exports.getCreatePage = function (req, res, next) {
    res.locals.user = req.session.user;
    res.render('article/createArticle');
};

/**
 * 发表新文章并保存
 * @param req
 * @param res
 * @param next
 */
exports.newAndSave = function (req, res, next) {
    var author_id = req.session.user._id;
    var title     = req.body.title;
    var content   = req.body.content;
    var tags      = [req.body.tag1, req.body.tag2, req.body.tag3];// 这边也可以使用req.body[tag3]来获得属性值,而且[]的方法通常可以用来遍历对象的属性和属性值(for-in)
    var is_draft = req.query.is_draft;
    Article.newAndSave(author_id, title, content, tags, is_draft, function (err, article) {
        if (err) next(err);// 注意在这里需要进行事件回滚和浏览器H5localStorage处理
        // TODO  2016年02月02日17:00:28 怎么在发表成功后,也就是客户端接收到success信号后,弹出一个发表成功的弹出框呢?
        return res.redirect('/article/' + article._id);
    });
};


//router.get('/upload', function (req, res) {
//    res.render('upload', {
//        user: req.session.user
//    });
//});

//router.post('/upload', function (req, res) {
//    console.log('文件上传成功');
//    res.redirect('/article/upload');
//});


/**
 * 显示编辑文章页面
 * @param req
 * @param res
 */
exports.showEditPage = function (req, res, next) {
    res.locals.user = req.session.user;
    Article.getArticleWithoutRendingNorAuthorByArticleId(req.params.article_id, function (err, article) {
        if (err) next(err);
        res.render('article/editArticle', {
            article: article
        });
    });
};

/**
 * 更新文章
 * - 更新包含: 标题 | 内容 | 标签 | 是否存为草稿 | 更新时间
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    var is_draft = req.query.is_draft;
    var title    = validator.trim(req.body.title);
    var content  = validator.trim(req.body.content);
    var tags     = [validator.trim(req.body.tag1), validator.trim(req.body.tag2), validator.trim(req.body.tag3)];
    Article.getArticleWithoutRendingNorAuthorByArticleId(req.params.article_id, function (err, article) {

        article.title     = title;
        article.content   = content;
        article.tags      = tags;
        article.is_draft  = is_draft;
        article.update_at = new Date();
        article.save(function (err, article) {
            if (err) return next(err);
            res.redirect('/article/' + article._id);
        });
    });
};

exports.delete = function (req, res, next) {
    res.locals.user = req.session.user;
    // 删除文章, 文章作者的article_count减1
    // 删除文章对应的回复, 回复者的reply_count减1
    // 删除文章对应的收藏信息(删除article_collect中和文章有关的记录), 文章作者的collect_article_count减1

    var article_id = req.params.article_id;
    //var ep          = new EventProxy();
    Article.getArticleWithoutRendingNorAuthorByArticleId(article_id, function (err, article) {
        if (err) next(err);
        console.log("****** " + article.author_id);
        console.log("****** " + req.session.user._id);
        if (!article.author_id.equals(req.session.user._id)) {
            res.status(403).render('error', {error: "Access Denied"});
        }
        if (!article) {
            res.status(422).render('error', {error: "文章不存在或者已经被删除!"});
        }

        article.deleted = true;
        article.article_count--;

        article.save(function (err) {
            if (err) next(err);
            res.render('success', {success: '删除文章删除成功!'});
        });

    });
};


/**
 * 查看一篇文章详情
 * - 详情包含: 文章信息 | 作者信息 | 评论信息
 * - 若用户已经登录,另外包含: 是否 收藏文章 | 点赞文章 | 关注作者 (没有登录则不包含)
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
    res.locals.user = req.session.user;
    var article_id  = req.params.article_id;  // 如果用户已经登录,就判断查看的other_user_id和登录用户的id是否相同

    if (req.session.user) {

        // 用户已经登录, 先获得 文章信息 | 作者信息 | 评论信息
        Article.getFullArticleByArticleId(article_id, function (err, article) {
            if (err) next(err);
            var ep = new EventProxy();
            ep.all('is_already_follow', 'is_already_collect', 'is_already_like', function (is_already_follow, is_already_collect, is_already_like) {
                return res.render('article/index', {
                    is_already_follow : is_already_follow,
                    is_already_collect: is_already_collect,
                    is_already_like   : is_already_like,
                    article           : article
                });
            });

            // 查看是否已经关注文章作者
            UserFollower.getUserFollower(article.author_id, req.session.user._id, function (err, connection) {
                if (err) next(err);
                if (!connection)  ep.emit('is_already_follow', false);
                ep.emit('is_already_follow', true);
            });

            // 查看是否已经收藏文章
            ArticleCollector.getArticleCollector(article._id, req.session.user._id, function (err, connection) {
                if (err) next(err);
                console.log("关系存在么?" + connection);
                if (!connection) return ep.emit('is_already_collect', false);
                return ep.emit('is_already_collect', true);
            });

            // 查看时候已经点赞文章
            ArticleLiker.getArticleLiker(article._id, req.session.user._id, function (err, connection) {
                if (err) next(err);
                console.log("关系存在么?" + connection);
                if (!connection) return ep.emit('is_already_like', false);
                return ep.emit('is_already_like', true);
            });
        });

    } else {
        // 用户没有登录的情况下就只返回 文章信息 | 作者信息 | 评论信息
        Article.getFullArticleByArticleId(article_id, function (err, article) {
            if (err) return next(err);
            return res.render('article/index', {article: article});
        });
    }
};

/**
 * 给文章点赞
 * -逻辑: 获得文章ID & 点赞者ID
 * - 判断文章是否存在
 * - 从文章-点赞者 数据库中查询
 * - 若[有记录],说明[已经赞过]文章,说明目的是[取消点赞]
 * - 若[没记录],说明[没有点赞]文章,说明目的是[点赞文章]
 * @param req
 * @param res
 * @param next
 */
exports.like = function (req, res, next) {
    res.locals.user = req.session.user;
    var article_id  = req.params.article_id;
    var liker_id    = req.session.user._id;
    // 根据文章ID, 查询文章是否存在
    Article.getArticleWithoutRendingNorAuthorByArticleId(article_id, function (err, article) {
        if (err) return next(err);
        if (!article) return res.render("error", {error: "该文章已经被作者删除!"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了
        // 根据文章ID和点赞者ID查询是否二者之间存在一条记录
        ArticleLiker.getArticleLiker(article_id, liker_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);

            // 如果不存在对应记录,说明没有点赞,执行点赞
            if (!connection) {
                console.log("4");

                var ep = new EventProxy();
                ep.all('be_liked_count_plus', 'like_article_count_plus', 'save', function () {
                    return res.status(200).json({resultFromServer: "likeSuccess"});
                });

                // 存储一条记录
                ArticleLiker.newAndSave(article_id, liker_id, function (err, connection) {
                    if (err) return next(err);
                    ep.emit('save');
                });
                // 点赞者送出去的赞+1
                User.getUserById(liker_id, function (err, liker) {
                    liker.like_article_count++;
                    liker.save(function (err) {
                        if (err) next(err);
                        console.log("4 " + liker.like_article_count);
                        ep.emit('like_article_count_plus');
                    });
                });

                // 文章被点赞数+1
                article.be_liked_count++;
                article.save(function (err, article) {
                    if (err) next(err);
                    console.log("4 " + article.be_liked_count);
                    ep.emit('be_liked_count_plus');
                });

            }
            // 如果存在对应记录,说明已经点赞,执行取消点赞
            else {

                var ep = new EventProxy();
                ep.all('be_liked_count_minus', 'like_article_count_minus', 'remove', function () {
                    return res.status(200).json({resultFromServer: "cancelCollectSuccess"});
                });
                // 删除一条记录
                ArticleLiker.remove(article_id, liker_id, function (err) {
                    if (err) return next(err);
                    ep.emit('remove');
                });
                // 点赞者送出去的点赞数-1
                User.getUserById(liker_id, function (err, liker) {
                    liker.like_article_count--;
                    liker.save(function (err) {
                        if (err) next(err);
                        ep.emit('like_article_count_minus');

                    });
                });

                //文章被点赞数-1
                article.be_liked_count--;
                article.save(function (err) {
                    if (err) next(err);
                    ep.emit('be_liked_count_minus');
                });

            }
        });
    });
};


/**
 * 收藏文章
 * @param req
 * @param res
 * @param next
 */
exports.collect = function (req, res, next) {
    res.locals.user  = req.session.user;
    var article_id   = req.params.article_id;
    var collector_id = req.session.user._id;
    Article.getArticleWithoutRendingNorAuthorByArticleId(article_id, function (err, article) {
        if (err) return next(err);
        if (!article) return res.render("error", {error: "该文章已经被作者删除!"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了
        ArticleCollector.getArticleCollector(article_id, collector_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);
            if (!connection) {

                var ep = new EventProxy();
                ep.all('be_collected_count_plus', 'collect_article_count_plus', 'save', function () {
                    return res.status(200).json({resultFromServer: "collectSuccess"});
                });
                ArticleCollector.newAndSave(article_id, collector_id, function (err, connection) {
                    if (err) return next(err);
                    ep.emit('save');
                });
                User.getUserById(collector_id, function (err, collector) {
                    collector.collect_article_count++;
                    collector.save(function (err) {
                        if (err) next(err);
                        console.log("4 " + collector.collect_article_count);
                        ep.emit('collect_article_count_plus');
                    });
                });
                article.be_collected_count++;
                article.save(function (err, article) {
                    if (err) next(err);
                    console.log("4 " + article.be_collected_count);
                    ep.emit('be_collected_count_plus');
                });

            } else {

                var ep = new EventProxy();
                ep.all('be_collected_count_minus', 'collect_article_count_minus', 'remove', function () {
                    return res.status(200).json({resultFromServer: "cancelCollectSuccess"});
                });
                ArticleCollector.remove(article_id, collector_id, function (err) {
                    if (err) return next(err);
                    ep.emit('remove');
                });
                User.getUserById(collector_id, function (err, collector) {
                    collector.collect_article_count--;
                    collector.save(function (err) {
                        if (err) next(err);
                        ep.emit('collect_article_count_minus');

                    });
                });
                article.be_collected_count--;
                article.save(function (err) {
                    if (err) next(err);
                    ep.emit('be_collected_count_minus');
                });

            }
        });
    });
};

/**
 * 发表文章评论
 * @param req
 * @param res
 * @param next
 */
exports.createReply = function (req, res, next) {
    res.locals.user = req.session.user;
    var author_id   = req.session.user._id; //评论者ID
    var article_id  = req.params.article_id; //文章ID
    var content     = validator.trim(req.body.content);// 去除前后的空格
    /**
     * 保存一条新的评论
     * 评论者ID, 文章ID, 评论内容
     */
    Reply.newAndSave(author_id, article_id, content, function (err, reply) {
        if (err) next(err);
        // 在对A文章发表评论成功之后,跳转到A文章,这样就可以看到新的评论了:redirect 重定向的意思
        res.redirect('/article/' + article_id);

    });
};