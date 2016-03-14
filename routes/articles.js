var Articles   = require('../proxy').Articles;
var Tag        = require('../proxy').Tag;
var EventProxy = require('eventproxy');

/**
 * 获得20篇最新回复的文章
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
    res.locals.user = req.session.user;
    /*
     判断是否是第一页,并且把请求的页数转换为number类型
     查询并返回第page页面的20篇文章
     这里通过 req.query.page 获取的页数为字符串形式,我们需要通过 parseInt() 把它转换成数字以作后用
     */
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var ep   = new EventProxy();
    ep.all('articles_20', 'articles_hottest_5', 'articles_hot_tags_3', function (articles_20, articles_hottest_5, articles_hot_tags_3) {
        res.render('articles/index', {
            articles           : articles_20[0],
            articles_hottest_5 : articles_hottest_5,
            articles_hot_tags_3: articles_hot_tags_3,
            page               : page,
            isFirstPage        : (page - 1) === 0,
            isLastPage         : ((page - 1) * 20 + articles_20.length) === articles_20[1]
        });
    });

    /**
     * 根据页码获得20篇最新回复的文章
     * @param {Number}  page  就是点击下一页|上一页 时候的页面号码
     * @param {Function} callback 回调函数 (错误,获得总共文章数,20篇文章)
     */
    Articles.getTwentyArticlesWithAuthor(page, function (err, total, articles_20) {
        if (err) next(err);
        ep.emit('articles_20', [articles_20, total]);
    });

    // 获得被收藏最多的5篇文章
    Articles.get5HottestCollectedArticles(function (err, articles_hottest_5) {
        if (err) next(err);
        ep.emit('articles_hottest_5', articles_hottest_5);
    });

    /**
     * 获得包含文章数量最多的3个热门标签
     * 结果是一个数组[],每一项都是一个对象 {id:标签名称, value:标签包含的文章数目}
     */
    Tag.tagArticleStatistical(function (articles_hot_tags_3) {
        ep.emit('articles_hot_tags_3', articles_hot_tags_3);
    });
    
};
