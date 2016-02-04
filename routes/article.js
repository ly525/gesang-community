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

router.get('/edit/:_id', checkLogin);
router.get('/edit/:_id', function (req, res) {
    console.log('编辑文章的_id:'+req.params._id);
    Article.edit(req.params._id, function (err, article) {
        if (err) {
            console.log('[Error] /routes/article/edit/:_id :'+err);
            req.flash('error', err);
            return res.redirect('back');
        }
        res.render('editArticle',{
            article:article,
            user:req.session.user,
            success:req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.post('/edit/:_id',checkLogin);
router.post('/edit/:_id', function (req,res) {
   Article.update(req.params._id,req.body.title,req.body.content,function(err){
     // TODO 2016年02月04日10:06:13 查看文章详细的逻辑,将其移动到article的路由中,且使用_id进行查看!
       //var url= encodeURI('/users/u/')
       if (err){
           req.flash('error',err);
           return res.redirect(url);// 错误,返回对应的文章页面
       }
       req.flash('success','修改成功');
       res.redirect(url);
   });
});

module.exports = router;