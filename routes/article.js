var EventProxy          = require('eventproxy');
var validator           = require('validator');
var Article             = require('../proxy').Article;
var User                = require('../proxy').User;
var UserFollower        = require('../proxy').UserFollower;
var ArticleCollector    = require('../proxy').ArticleCollector;
var Reply               = require('../proxy').Reply;
/**
 * 创建一篇新文章
 * @param req
 * @param res
 * @param next
 */
exports.getCreatePage = function (req, res, next) {
    res.locals.user = req.session.user;
    res.render('article/createArticle');
};


exports.newAndSave = function (req, res, next) {
    var author_id   = req.session.user._id;
    var title       = req.body.title;
    var content     = req.body.content;
    var tags        = [req.body.tag1, req.body.tag2, req.body.tag3];// 这边也可以使用req.body[tag3]来获得属性值,而且[]的方法通常可以用来遍历对象的属性和属性值(for-in)
    var is_draft    = req.query.is_draft;
    Article.newAndSave(author_id, title, content, tags, is_draft, function (err, article) {
        if (err) next(err);// 注意在这里需要进行事件回滚和浏览器H5localStorage处理
        // TODO  2016年02月02日17:00:28 怎么在发表成功后,也就是客户端接收到success信号后,弹出一个发表成功的弹出框呢?
        return res.redirect('/article/'+article._id);
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

exports.showEditPage = function (req, res) {
    res.locals.user = req.session.user;
    Article.getArticleWithoutRendingByArticleId(req.params.article_id, function (err, article) {
        if (err) next(err);
        res.render('article/editArticle', {
            article: article
        });
    });
};

exports.update = function (req, res, next) {
    var is_draft    = req.query.is_draft;
    var title       = validator.trim(req.body.title);
    var content     = validator.trim(req.body.content);
    var tags        = [validator.trim(req.body.tag1), validator.trim(req.body.tag2), validator.trim(req.body.tag3)];
    Article.getArticleWithoutRendingByArticleId(req.params.article_id, function(err, article){

        article.title       = title;
        article.content     = content;
        article.tags        = tags;
        article.is_draft    = is_draft;
        article.update_at   = new Date();
        article.save(function(err, article) {
            if (err) return next(err);
            res.redirect('/article/' + article._id);
        });
    });
};

exports.delete =  function (req, res, next) {
    res.locals.user = req.session.user;
    // 删除文章, 文章作者的article_count减1
    // 删除文章对应的回复, 回复者的reply_count减1
    // 删除文章对应的收藏信息(删除article_collect中和文章有关的记录), 文章作者的collect_article_count减1

    var article_id  = req.params.article_id;
    //var ep          = new EventProxy();
    Article.getArticleWithoutRendingByArticleId(article_id, function(err, article){
        if (err) next(err);
        console.log("****** "+article.author_id);
        console.log("****** "+req.session.user._id);
        if (!article.author_id.equals(req.session.user._id)){
            res.status(403).render('error', {error:"Access Denied"});
        }
        if (!article) {
            res.status(422).render('error',{error:"文章不存在或者已经被删除!"});
        }

        article.deleted = true;
        article.article_count--;

        article.save(function(err){
            if (err) next(err);
            res.render('success', {success:'删除文章删除成功!'});
        });

    });
};


// 查看一篇文章详情
exports.index = function(req, res) {
    res.locals.user = req.session.user;
    var article_id  = req.params.article_id;  // 如果用户已经登录,就判断查看的other_user_id和登录用户的id是否相同

    if (req.session.user) {
        Article.getFullArticleByArticleId(article_id, function (errmessage, article) {
            if (errmessage) next(err);
            var ep = new EventProxy();
            ep.all('is_already_follow','is_already_collect', function(is_already_follow,is_already_collect){
                return res.render('article/index', {is_already_follow:is_already_follow,is_already_collect:is_already_collect, article:article});
            });

            UserFollower.getUserFollower(article.author_id, req.session.user._id, function(err, connection){
                if (err) next(err);
                if (!connection)  ep.emit('is_already_follow', false);
                 ep.emit('is_already_follow', true);
            });
            console.log(article.author_id+"-" +req.session.user._id);
            ArticleCollector.getArticleCollector(article._id, req.session.user._id, function(err, connection){
                if (err) next(err);
                console.log("关系存在么?"+ connection);
                if (!connection) return ep.emit('is_already_collect', false);
                return ep.emit('is_already_collect', true);
            });
        });

    } else {
        Article.getFullArticleByArticleId(article_id, function (errmessage, article) {
            if (errmessage) return next(errmessage);
                return res.render('article/index',{ article: article });
        });
    }
};

// 查看一篇文章详情
exports.like = function(req, res, next) {
    Article.getOne(req.params._id, function (err, article) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/'); //TODO 用户不存在则跳转到首页,合适吗,是否应该返回原来的页面
        }

        res.render('article/article', {
            title: req.params.title, // 被查看的用户xxx
            article: article,
            user: req.session.user // 访问xxx的用户

        });
    });
};// 查看一篇文章详情
exports.dislike = function(req, res, next) {
    Article.getOne(req.params._id, function (err, article) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/'); //TODO 用户不存在则跳转到首页,合适吗,是否应该返回原来的页面
        }

        res.render('article', {
            title: req.params.title, // 被查看的用户xxx
            article: article,
            user: req.session.user // 访问xxx的用户

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
    res.locals.user = req.session.user;
    var article_id = req.params.article_id;
    var collector_id = req.session.user._id;
    Article.getArticleByArticleId(article_id, function (err, article) {
        if (err) return next(err);
        if (!article) return res.render("error", {error: "该文章已经被作者删除!"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了
        ArticleCollector.getArticleCollector(article_id, collector_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);
            if (!connection) {
                console.log("4");

                var ep = new EventProxy();
                ep.all('be_collected_count_plus','collect_article_count_plus', 'save', function(){
                    return res.status(200).json({resultFromServer: "collectSuccess"});
                });
                ArticleCollector.newAndSave(article_id, collector_id, function (err, connection) {
                    if (err) return next(err);
                    ep.emit('save');
                });
                User.getUserById(collector_id, function (err, collector) {
                    collector.collect_article_count++;
                    collector.save(function(err){
                        if (err) next(err);
                        console.log("4 "+collector.collect_article_count);
                        ep.emit('collect_article_count_plus');
                    });
                });
                article.be_collected_count++;
                article.save(function(err, article){
                    if (err) next(err);
                    console.log("4 "+article.be_collected_count);
                    ep.emit('be_collected_count_plus');
                });

            } else {
                console.log("5");

                var ep = new EventProxy();
                ep.all('be_collected_count_minus','collect_article_count_minus', 'remove', function(){
                    return res.status(200).json({resultFromServer: "cancelCollectSuccess"});
                });
                ArticleCollector.remove(article_id, collector_id, function (err) {
                    if (err) return next(err);
                    ep.emit('remove');
                });
                User.getUserById(collector_id, function (err, collector) {
                    collector.collect_article_count--;
                    collector.save(function(err){
                        if (err) next(err);
                        ep.emit('collect_article_count_minus');

                    });
                });
                article.be_collected_count--;
                article.save(function(err){
                    if (err) next(err);
                    ep.emit('be_collected_count_minus');
                });

            }
        });
    });
};

exports.createReply = function (req, res, next){
    res.locals.user = req.session.user;
    var author_id   = req.session.user._id;
    var article_id  = req.params.article_id;
    var content     = validator.trim(req.body.content);
    Reply.newAndSave(author_id, article_id, content, function(err, reply) {
        if (err) next(err);
        res.redirect('/article/'+article_id);

    });
};