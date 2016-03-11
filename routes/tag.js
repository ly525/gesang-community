var Tag = require('../proxy').Tag;
exports.singleTag = function (req, res, next) {
    res.locals.user  = req.session.user;
    Tag.getArticlesByTagName(req.params.tag, function (err, articles) {
        if (err) next(err);
        res.render('tag/single_tag', {
            articles: articles
        });
    });

};