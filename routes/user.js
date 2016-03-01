var express         =   require('express');
var crypto          =   require('crypto');
var User            =   require('../proxy').User;
var mail            =   require('../common/mail');
var utility         =   require('utility');
var config          =   require('../config');
var validator       =   require('validator');

exports.loginAndRigister = function (req, res, next) {
    res.locals.user = null;
    res.render('user/login-register');
};


exports.login = function (req, res, next) {
    var password = crypto.createHash('md5').update(req.body.password).digest('hex');
    User.getUserByEmail(req.body.email, function (err, user) {
        if (!user) {
            return res.status(200).json({info: "unregisteredEmail"});
        }

        // 检查密码是否一致
        if (user.password !== password) {
            return res.status(200).json({info: "passwordError"});
        }
        // 用户名和密码匹配后,将用户信息存入session
        res.locals.user = req.session.user = user;
        return res.status(200).json({info: "signinSuccess"});
    });
};

exports.register = function (req, res, next) {
    console.log("****** proxy 用户注册逻辑");

    var nickname = req.body.nickname,
        passhash = crypto.createHash('md5').update(validator.trim(req.body.password)).digest('hex'),
        email = validator.trim(req.body.email),
        uniquename = nickname + Date.now(),
        avatarUrl = User.makeSomelineAvatarUrl(email, 48);
    console.log(nickname+passhash+uniquename+avatarUrl);

    // 检测用户是否已经存在
    User.getUserByEmail(email, function (err, user) {
        if (err) console.log("****** 检测用户是否存在过程中出现问题" + err);
        if (user) {
            console.log("****** emailAlreadyUsed");

            return res.status(200).json({info: "emailAlreadyUsed"});
        }

        // 昵称, 唯一名称, 邮箱, 密码, 头像的地址,是否激活
        User.newAndSave(nickname, uniquename, email, passhash, avatarUrl, false, function (err, user) {
            if (err) {
                return res.status(500).json({info: err});

            }
            console.log(email + passhash + config.session_secret);
            mail.sendActiveEmail(email, utility.md5(email + passhash + config.session_secret), nickname, uniquename,  function (error, info) {
                if (error) {
                    return console.log("****** 邮件发送失败"+ error);
                }
                console.log('****** Message sent: ' + info.response);
                console.log("****** 验证邮件已经发送,请查收");
                res.status(200).json({info: 'registerSuccess'});
                // TODO 2015年12月19日12:07:54 怎么在res.json之后重定向到主页?

            });

        });
    });
}

/**
 * 用户登出
 * @param req
 * @param res
 * @param next
 */
exports.logout = function (req, res, next) {
    req.locals.user = req.session.user = null;
    res.redirect('/');
};

/**
 * 获得用户主页
 * @param req
 * @param res
 * @param next
 */
exports.userIndex = function (req, res, next) {
    var page = req.params.page ? parseInt(req.params.page) : 1;
    User.findOne({_id: req.params.id}, function (err, user) {
        if (err) next(err);
        if (!user) return res.status(200).json({info: "用户已经注销"});

        Article.getTen(req.params.name, page, function (err, articles, total) {
            if (err) {
                console.log('==[Error] in routes/users/u/:name ' + err);

                res.redirect('/articles');
            }
            res.render('user/index', {
                tags: tags,
                articles: articles,
                page: page,
                isFirstPage: (page - 1) === 0,
                isLastPage: ((page - 1) * 10 + articles.length) === total,
                user: req.session.user
            });
        });

    });

};

/**
 * 用户账户设置
 * @param req
 * @param res
 * @param next
 */
exports.accountSettings = function (req, res, next) {
    res.render('user/account-settings', {
        user: req.session.user
    });
};

/**
 * 激活注册邮箱
 * @param req
 * @param res
 * @param next
 *
 * - 逻辑: 检查token是否匹配
 * - 由这个逻辑可以想到,用户登录时候需要首先检测邮箱是否激活
 */
exports.activeAccount = function (req, res, next) {

    // 邮件中的key = utility.md5( 注册的email+passhash+session_secret )
    var key         = validator.trim(req.query.key),
        uniquename  = validator.trim(req.query.uniquename);
    User.getUserByUniquename(uniquename, function(err, user){
        res.locals.user = null;
        if(err) return next(err);

        if (!user) return res.render('user/account-active',{account_active_result: "账户激活失败, 该用户不存在"});

        console.log(utility.md5(user.email + user.passhash + config.session_secret) === key);

        if (!user || utility.md5(user.email + user.passhash + config.session_secret) !== key){

            return res.render('user/account-active',{account_active_result: "账户激活失败, 信息有误!"});
        }

        if (user.active) return res.render('user/account-active',{account_active_result: "该账户已是激活状态,请直接<a href='/user/login-register'>登录</a>"});

        user.active = true;
        user.save(function(err, user){
            if (err) return next(err);
            console.log('****** ' + user.nickname);
            res.render('user/account-active',{account_active_result: "邮箱已经激活,请登录, 该用户不存在"});

        });
    });

};
