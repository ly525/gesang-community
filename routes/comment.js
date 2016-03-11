var Comment = require('../models/comment');
var router = require('express').Router();
var crypto = require('crypto');

router.post('/:_id', function (req, res) {
    var date = new Date();
    var postTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
        avatar = "http://7xr66o.com1.z0.glb.clouddn.com/avatar/" + email_MD5 + "?s=48";

    var comment = {
        author: req.body.author,
        email: req.body.email,
        avatar: avatar,
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