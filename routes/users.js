var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var Article = require('../models/article');
var User = require('../models/user');
var accessControl = require('./accessControl');
var checkNotLogin = accessControl.checkNotLogin;
var checkLogin = accessControl.checkLogin;


/* GET users listing. */
//router.get('/users', function (req, res, next) {
//    console.log(req.params);
//    res.send(req.params);
//});
//router.get('/:demo', function (req, res, next) {
//    console.log(req.originalUrl);
//    console.log(req.params);
//    console.log(req.params.demo);
//    console.log(req.params[0]);
//    //        res.send(req.params('demo'));
//    res.send(req.params.demo);
//});
router.get('/login-register', checkNotLogin);
router.get('/login-register', function (req, res, next) {
    console.log(req.params);
    res.render('login-register', {
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.get('/login', checkNotLogin);
router.post('/login', function (req, res, next) {
    console.log('/users/login');
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
        if (!user) {
            console.log('用户不存在,请确认用户名是否正确');
            req.flash('error', '用户不存在,请确认用户名是否正确');
            return res.redirect('/user/login-register');
        }

        // 检查密码是否一致
        if (user.password !== password) {
            console.log('密码错误');
            req.flash('error', '密码错误!');
            return res.redirect('/users/login-register');
        }
        // 用户名和密码匹配后,将用户信息存入session
        req.session.user = user;
        req.flash('success', '登录成功!');
        res.redirect('/'); //登录成功后跳转到首页
    });
});

router.get('/register', checkNotLogin);
router.post('/register', function (req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        password_repeat = req.body['password-repeat'],
        email = req.body['email'];
    console.log('name:' + name);
    console.log('password:' + password);
    console.log('password_repeat:' + password_repeat);
    console.log('email:' + email);
    // 检验两次密码输入是否一致 TODO 2016年02月01日12:42:21 这里的检测可以放在浏览器中完成
    if (password_repeat !== password) {
        req.flash('error', '两次输入密码不一致');
        return res.redirect('/users/login-register');
    }

    // 生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    console.log('注册加密后的密码:' + password);
    var newUser = new User({
        name: name,
        password: password,
        email: email
    });
    // 检测用户是否已经存在

    User.get(newUser.name, function (err, user) {

        console.log('注册之前先检索是否存在');
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if (user) {
            console.log('用户名已经存在');
            //console.log('重定向的结果是:' + res.redirect('/users/login-register'));
            // 不能这样来测试重定向结果,因为会报错:Error: Can't set headers after they are sent;因为console.log()里面有了重定向语句了
            req.flash('error', '用户名已经存在');
            return res.redirect('/users/login-register'); // TODO 2016年02月01日13:26:10  这边的res.redirect()的返回结果是什么? 结果是undefined

        }

        // 如果数据库中不存在该用户名,则新增用户
        newUser.save(function (err, user) {
            console.log('用户不存在,可以注册,注册后返回的user信息' + user);

            if (err) {
                console.log('保存新用户出错' + err);
                req.flash('error', err);
                return res.redirect('/users/login-register');
            }
            req.session.user = user; // 把注册成功的用户信息存入session中
            req.flash('success', '注册成功');
            res.redirect('/'); // TODO 这边从系返回是的/users 还是/ ?此外怎么记住用户之前浏览的文章,注册成功之后返回这边篇文章或者想点击收藏按钮,需要注册,怎么在注册后执行收藏动作
        });
    });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res, next) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
});
router.get('/u/:name', function (req, res, next) {
    User.get(req.params.name, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在!');
            return res.redirect('/'); //TODO 用户不存在则跳转到首页,合适吗,是否应该返回原来的页面
        }
        Article.getAll(user.name, function (err, articles) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name, // 被查看的用户xxx
                user: req.session.user, // 访问xxx的用户
                articles: articles,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
            });
        });
    });

});



module.exports = router;