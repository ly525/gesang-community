var router = require('express').Router();
var Article = require('../models/article');

router.get('/', function (req, res) {
    console.log("关键字是"+req.query.keyword);
    Article.search(req.query.keyword, function (err, articles) {
        if (err) {
            console.log('==[Error] in routes/search ' + err);
            return res.redirect('/articles');
        }
        res.render('index', {
            articles: articles,
            user: req.session.user
        });
    })
});

module.exports = router;