var Comment = require('../models/comment');
var router = require('express').Router();


router.post('/:_id', function (req, res) {
    console.log('--'+req.params._id+'--');
    var date = new Date();
    var postTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    var comment = {
        author: req.body.author,
        email: req.body.email,
        website: req.body.website,
        postTime: postTime,
        content: req.body.content
    };
    new Comment(req.params._id, comment).save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '评论成功');
        //req.flash('back');//这样的错误写法会导致发表评论页面一直请求
        res.redirect('back');//留言成功后返回到该文章页
    });
});

module.exports = router;