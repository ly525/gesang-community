var Article = require('../proxy').Article;

exports.index = function (req, res, next) {
    res.locals.user = req.session.user;
    // 判断是否是第一页,并且把请求的页数转换为number类型
    var page = req.query.page ? parseInt(req.query.page) : 1;
    // 查询并返回第page页面的20篇文章
    // 这里通过 req.query.page 获取的页数为字符串形式,我们需要通过 parseInt() 把它转换成数字以作后用
    // Article.getTwenty = function (author, page, callback) {}
    Article.getTwentyArticleByUserId(null, page, function (err, total, articles ) {
        if (err) articles = [];
        res.render('articles/index', {
            articles: articles,
            page: page,
            isFirstPage: (page - 1) === 0,
            isLastPage: ((page - 1) * 20 + articles.length) === total
        });
    });
};
