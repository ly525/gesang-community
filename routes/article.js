var express = require('express');
var router = express.Router();

router.get('/post', function (req, res, next) {
    res.render('postArticle', {
        user: req.session.user
    });
});
router.get('/articles', function (req, res, next) {
    res.render('postArticle', {
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
router.post('/post', function (req, res, next) {});


module.exports = router;