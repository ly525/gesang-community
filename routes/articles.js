var express = require('express');
var router = express.Router();
var Article = require('../models/article');

router.get('/', function (req, res, next) {
    Article.getAll(null, function (err, articles) {
        if (err) articles = [];
        res.render('articles', {
            user: req.session.user,
            articles: articles,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });

    });
});


module.exports = router;