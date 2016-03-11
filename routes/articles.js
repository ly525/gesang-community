var Articles    = require('../proxy').Articles;
var EventProxy  = require('eventproxy');
exports.index = function (req, res, next) {
    res.locals.user = req.session.user;
    // 判断是否是第一页,并且把请求的页数转换为number类型
    var page = req.query.page ? parseInt(req.query.page) : 1;
    // 查询并返回第page页面的20篇文章
    // 这里通过 req.query.page 获取的页数为字符串形式,我们需要通过 parseInt() 把它转换成数字以作后用
    // Article.getTwenty = function (author, page, callback) {}
    
    var ep = new EventProxy();
    ep.all('articles_20','articles_hottest_5' ,function(articles_20,articles_hottest_5){
            


            res.render('articles/index', {
                articles: articles_20[0],
                articles_hottest_5:articles_hottest_5,
                page: page,
                isFirstPage: (page - 1) === 0,
                isLastPage: ((page - 1) * 20 + articles_20.length) === articles_20[1]
        });
    });
    Articles.getTwentyArticlesWithoutUserId(page, function (err, total, articles_20 ) {
        if (err) next(err);
        ep.emit('articles_20',[articles_20, total]);


        
    });
    Articles.get5HottestCollectedArticles (function(err, articles_hottest_5){
        if (err) next(err);
        ep.emit('articles_hottest_5',articles_hottest_5 );
    });
    console.log("*********************");
        Articles.tagStatistical(function(results){
            // console.log(results);
        });
        console.log("*********************");
    
};
