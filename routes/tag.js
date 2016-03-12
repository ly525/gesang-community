var Tag = require('../proxy').Tag;
exports.singleTag = function (req, res, next) {
    res.locals.user  = req.session.user;
    Tag.getArticlesByTagName(req.params.tag_name, function (err, articles) {
        if (err) next(err);
        console.log("***** "+articles.length);
        res.render('tag/single_tag', {
            articles: articles,
            tag_name: req.params.tag_name
        });
    });

};