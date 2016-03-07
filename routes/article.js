var Article     = require('../proxy').Article;
var EventProxy  = require('eventproxy');
var validator  = require('validator');

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
    console.log(author_id+title+content+tags+req.query.is_draft);
    Article.newAndSave(author_id, title, content, tags, is_draft, function (err, article) {
        if (err) res.render('error', {message:"发表文章出现错误,请重新发表"});// 注意在这里需要进行事件回滚和浏览器H5localStorage处理
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
        if (err) return res.render('error', {error:err} );
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
    console.log(is_draft+title+content+tags);
    Article.getArticleWithoutRendingByArticleId(req.params.article_id, function(err, article){

        article.title   = title;
        article.content = content;
        article.tags    = tags;
        article.update_at = new Date();
        article.save(function(err, article) {
            if (err) return next(err);
            res.redirect('/article/' + article._id);
        });
    });
};

exports.delete =  function (req, res) {
    res.locals.user = req.session.user;
    // 删除文章, 文章作者的article_count减1
    // 删除文章对应的回复, 回复者的reply_count减1
    // 删除文章对应的收藏信息(删除article_collect中和文章有关的记录), 文章作者的collect_article_count减1

    var article_id  = req.params.article_id;
    //var ep          = new EventProxy();
    Article.getArticleWithoutRendingByArticleId(article_id, function(err, article){
        if (err) res.render('error', {error:err});
        if (!article.author_id.equals(req.session.user._id)){
            error.status = 403;
            res.render('error', {error:"Access Denied"});
        }
        if (!article) {
            error.status = 422;
            res.render('error',{error:"文章不存在或者已经被删除!"});
        }

        article.deleted = true;
        article.article_count--;

        article.save(function(err){
            if (err) res.render('error',{error:err});
            res.render('success', {success:'删除文章删除成功!'});
        });

    });
}


// 查看一篇文章详情
exports.index = function(req, res) {
    res.locals.user = req.session.user;
    var article_id  = req.params.article_id;
    console.log(article_id);
    Article.getFullArticleByArticleId(article_id, function (errmessage, article) {
        if (errmessage) {
            //TODO 用户不存在则跳转到首页,合适吗,是否应该返回原来的页面
            return res.render('error', {error:"",message: errmessage });
        }
        res.render('article/index',{ article: article });
    });
};

// 查看一篇文章详情
exports.like = function(req, res) {
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
exports.dislike = function(req, res) {
    console.log('查看一篇文章详情的文章ID' + req.params._id);

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
