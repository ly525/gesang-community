var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var checkLogin = require('./accessControl').checkLogin;

router.get('/post', checkLogin);
router.get('/post', function (req, res, next) {
    res.render('postArticle', {
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()

    });
});


router.post('/post', checkLogin);
router.post('/post', function (req, res, next) {
    var currentUser = req.session.user;
    var newArticle = new Article(currentUser.name, req.body.title, req.body.content);
    newArticle.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        // TODO  2016年02月02日17:00:28 怎么在发表成功后,也就是客户端接收到success信号后,弹出一个发表成功的弹出框呢?
        req.flash('success', '发表成功');
        return res.redirect('/');
    });
});


router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
    res.render('upload', {
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/upload', checkLogin);
router.post('/upload', function (req, res) {
    console.log('文件上传成功');
    req.flash('success', '文件上传成功');
    res.redirect('/upload');
});

module.exports = router;