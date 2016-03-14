var Tag           = require('../proxy').Tag;

/**
 * 获得单个标签详情页面
 * @param req
 * @param res
 * @param next
 */
exports.singleTag = function (req, res, next) {
    res.locals.user = req.session.user;

    // 根据标签获得文章名称
    Tag.getArticlesByTagName(req.params.tag_name, function (err, articles) {
        if (err) next(err);
        res.render('tag/single_tag', {
            articles: articles,
            tag_name: req.params.tag_name
        });
    });
};