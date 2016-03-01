var crypto = require('crypto');
var User = require('../models').User;


router.get('/loginAndRigister', checkNotLogin);
exports.loginAndRigister = function (req, res, next) {
    res.render('login-register', {
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};


router.post('/login', checkNotLogin);
exports.login = function (req, res, next) {
    var password = crypto.createHash('md5').update(req.body.password).digest('hex');
    User.getUserByEmail(req.body.email, function (err, user) {
        if (!user) {
            return res.status(200).json({info: "unregisteredEmail"});
        }

        // 检查密码是否一致
        if (user.password !== password) {
            console.log('密码错误');
            return res.status(200).json({info: "passwordError"});
        }
        // 用户名和密码匹配后,将用户信息存入session
        req.session.user = user;
        return res.status(200).json({info: "signinSuccess"});
    });
};

router.post('/register', checkLogin);
exports.register = function (req, res, next) {
    console.log("之前页面" + req.body.referrer);
    // 从请求中获得数据
    var name = req.body.name,
        password = crypto.createHash('md5').update(req.body.password).digest('hex'),
        email = req.body['email'],
        avatar = "http://cdn.v2ex.co/avatar/704b/889d/158237_normal.png?m=1454721031";


    // 检测用户是否已经存在
    User.findOne({email: email}, function (err, user) {
        if (err) console.log("检测用户是否存在过程中出现问题" + err);
        if (user) {
            return res.status(200).json({info: "emailAlreadyUsed"});
        }
        var newUser = new User({
            name: name,
            password: password,
            email: email,
            avatar: avatar
        });
        newUser.save(function (err, user) {
            if (err) {
                console.log('将新用户保存到数据库时候出现了问题' + err);
            }
            // 为了数据安全, 将用户密码清除, 保留邮箱和用户名信息
            // TODO 2015年12月14日13:04:31 这边的delete 不明白, 还有为什么在delete之前 设置为null呢?
            newUser.password = null;
            delete newUser.password;

            req.session.user = newUser;

            // TODO 2015年12月14日13:02:31 这一步使可以改善的, 也就是跳转到注册之前点额页面

            return res.redirect(req.get("Referer"));
            // res.status(200).json({success: 'register_success'});
            //return res.redirect('/');
            // TODO 2015年12月19日12:07:54 怎么在res.json之后重定向到主页?
        });

    });
}

//
router.get('/logout', checkLogin);
exports.logout = function (req, res, next) {
    req.session.user = null;
    res.redirect('/');
};

//router.get('/u/:name', function (req, res, next) {
//    console.log(req.params.name);
//
//    var page = req.params.page ? parseInt(req.params.page) : 1;
//    console.log('==[Error] in routes/users/u/:name ' + page);
//    User.getUserByName(req.params.name, function (err, user) {
//        if (!user) {
//            return res.redirect('/'); //TODO 用户不存在则跳转到首页,合适吗,是否应该返回原来的页面
//        }
//
//        Article.getTagsByUserName(req.params.name, function (err, tags) {
//            if (err) {
//                console.log('==[Error] in routes/users/u/:name ' + err);
//                res.redirect('/articles');
//            }
//            Article.getTen(req.params.name, page, function (err, articles, total) {
//                if (err) {
//                    console.log('==[Error] in routes/users/u/:name ' + err);
//                    res.redirect('/articles');
//                }
//                res.render('user', {
//                    tags: tags,
//                    articles: articles,
//                    page: page,
//                    isFirstPage: (page - 1) === 0,
//                    isLastPage: ((page - 1) * 10 + articles.length) === total,
//                    user: req.session.user
//                });
//            });
//
//        });
//        //Article.getTen(req.params.name, page, function (err, articles, total) {
//        //    if (err) {
//        //        console.log('==[Error] in routes/users/u/:name ' + err);
//        //        res.redirect('/articles');
//        //    }
//        //    res.render('user', {
//        //        articles: articles,
//        //        page: page,
//        //        isFirstPage: (page - 1) === 0,
//        //        isLastPage: ((page - 1) * 10 + articles.length) === total,
//        //        user: req.session.user
//        //    });
//        //});
//        //Article.getAll(user.name, function (err, articles) {
//        //    if (err) {
//        //        return res.redirect('/');
//        //    }
//        //    res.render('user', {
//        //        title: user.name, // 被查看的用户xxx
//        //        user: req.session.user, // 访问xxx的用户
//        //        articles: articles
//        //    });
//        //});
//    });
//
//});
//
router.get('/user/accountSettings', checkLogin);
exports.accountSettings = function (req, res) {
    res.render('account-settings', {
        user: req.session.user
    });
};

//router.post('/modify-email', checkLogin);
//router.post('/modify-email', function (req, res) {
//    console.log('接收到的AJax请求' + req.body.newEmail);
//    console.log('接收到的AJax请求' + req.session.user._id);
//    User.updateEmail(req.session.user._id, req.body.newEmail, function (err, user) {
//        if (err) {
//            console.log("更新邮箱Error" + err);
//        }
//        req.session.user = user;
//        res.status(200).json({info: "success", email: user.email});
//
//    });
//});
//
//router.post('/modify-password', checkLogin);
//router.post('/modify-password', function (req, res) {
//    console.log('接收到的AJax请求' + req.body.oldPassword);
//    console.log('接收到的AJax请求' + req.body.newPassword);
//    console.log('接收到的AJax请求' + req.session.user._id);
//
//    var oldPassword = crypto.createHash('md5').update(req.body.oldPassword).digest('hex');
//    // 检查密码是否一致
//
//    if (req.session.user.password !== oldPassword) {
//        console.log("当前密码不正确!");
//        res.status(200).json({info: "wrongOldPassword"});
//    } else {
//        console.log("当前密码正确!");
//        var newPassword = crypto.createHash('md5').update(req.body.newPassword).digest('hex');
//        User.updatePassword(req.session.user._id, newPassword, function (err, user) {
//
//            if (err) {
//                console.log("更新密码Error" + err);
//            }
//            req.session.user = user;
//            res.status(200).json({info: "success"});
//
//        });
//    }
//
//});
module.exports = router;