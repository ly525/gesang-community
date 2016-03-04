var express         = require('express');
var crypto          = require('crypto');
var User            = require('../proxy').User;
var UserFollower    = require('../proxy').UserFollower;
var mail            = require('../common/mail');
var utility         = require('utility');
var config          = require('../config');
var validator       = require('validator');
var eventproxy      = require('eventproxy');

/**
 * 登录注册页面
 * @param req
 * @param res
 * @param next
 */
exports.loginAndRigister = function (req, res, next) {
    res.locals.user = null;
    res.render('user/login-register');
};

/**
 * 用户登录
 * @param req
 * @param res
 * @param next
 */
exports.login = function (req, res, next) {

    var passhash = crypto.createHash('md5').update(req.body.password).digest('hex');

    User.getUserByEmail(req.body.email, function (err, user) {

        if (!user) return res.status(200).json({resultFromServer: "unregisteredEmail"});
        if (!user.active) {
            mail.sendActiveEmail(email, utility.md5(email + passhash + config.session_secret), nickname, uniquename, function (error, info) {
                if (error) {
                    return console.log("****** 邮件发送失败" + error);
                }
                console.log('****** Message sent: ' + info.response);
                console.log("****** 验证邮件已经发送,请查收");
                return res.status(200).json({resultFromServer: 'unactiveEmail'});
                // TODO 2015年12月19日12:07:54 怎么在res.json之后重定向到主页?

            });
        }
        // 检查密码是否一致
        if (user.passhash !== passhash) return res.status(200).json({resultFromServer: "passwordError"});
        // 用户名和密码匹配后,将用户信息存入session
        user.passhash = null;
        res.locals.user = req.session.user = user;
        console.log("****** type =="+ (typeof  res.locals.user._id));
        console.log("****** type =="+ (typeof  req.session.user._id));
        console.log("****** type =="+ (typeof  user._id));
        return res.status(200).json({resultFromServer: "loginSuccess"});
    });
};

/**
 * 用户注册
 * @param req
 * @param res
 * @param next
 */
exports.register = function (req, res, next) {
    console.log("****** proxy 用户注册逻辑");

    var nickname = req.body.nickname,
        passhash = crypto.createHash('md5').update(validator.trim(req.body.password)).digest('hex'),
        email = validator.trim(req.body.email),
        uniquename = nickname + Date.now(),
        avatarUrl = User.makeSomelineAvatarUrl(email, 48);
    console.log(nickname + passhash + uniquename + avatarUrl);

    // 检测用户是否已经存在
    User.getUserByEmail(email, function (err, user) {
        if (err) console.log("****** 检测用户是否存在过程中出现问题" + err);
        if (user) {
            console.log("****** emailAlreadyUsed");

            return res.status(200).json({resultFromServer: "emailAlreadyUsed"});
        }

        // 昵称, 唯一名称, 邮箱, 密码, 头像的地址,是否激活
        User.newAndSave(nickname, uniquename, email, passhash, avatarUrl, false, function (err, user) {
            if (err) {
                return  console.log("****** 保存注册用户时候出现问题" + err);

            }
            console.log(email + passhash + config.session_secret);
            mail.sendActiveEmail(email, utility.md5(email + passhash + config.session_secret), nickname, uniquename, function (error, info) {
                if (error) {
                    return console.log("****** 邮件发送失败" + error);
                }
                console.log('****** Message sent: ' + info.response);
                console.log("****** 验证邮件已经发送,请查收");
                res.status(200).json({resultFromServer: 'registerSuccess'});
                // TODO 2015年12月19日12:07:54 怎么在res.json之后重定向到主页?

            });

        });
    });
};

/**
 * 用户登出
 * @param req
 * @param res
 * @param next
 */
exports.logout = function (req, res, next) {
    res.locals.user = req.session.user = null;
    res.redirect(req.get("Referrer"));
};

/**
 * 获得用户主页
 * @param req
 * @param res
 * @param next
 */
exports.userIndex = function (req, res, next) {
    res.locals.user     = req.session.user;
    var other_user_id   = req.params.id;
    var ep              = new eventproxy();
    // 如果用户已经登录,就判断查看的other_user_id和登录用户的id是否相同

    if (req.session.user) {

        if (req.session.user._id === other_user_id ){

            res.render("user/index", {other_user: req.session.user});
        }else {

            ep.all("other_user", "is_already_follow", function (other_user, is_already_follow){

                return res.render("user/index", {other_user: other_user, is_already_follow:is_already_follow });

            });

            User.getUserById(other_user_id, function (err, other_user) {
                if (err) return next(err);
                if (!other_user) return res.render("error", {message: "用户不存在"});
                other_user.passhash = null;
                ep.emit('other_user', other_user);
            });

            UserFollower.getUserFollower(other_user_id, req.session.user._id, function(err, connection){
                if (err)         return next(err);
                if (!connection) return ep.emit('is_already_follow',false);
                if (connection)  return ep.emit('is_already_follow',true );

            });
        }
    } else{
        User.getUserById(other_user_id, function (err, other_user) {
            if (err) return next(err);
            if (!other_user) return res.render("error", {message: "用户不存在"});
            other_user.passhash = null;
            res.render("user/index", {other_user: other_user});

        });
    }



    //var page = req.params.page ? parseInt(req.params.page) : 1;
    //User.findOne({_id: req.params.id}, function (err, user) {
    //    if (err) next(err);
    //    if (!user) return res.status(200).json({info: "用户已经注销"});
    //
    //    Article.getTen(req.params.name, page, function (err, articles, total) {
    //        if (err) {
    //            console.log('==[Error] in routes/users/u/:name ' + err);
    //
    //            res.redirect('/articles');
    //        }
    //        res.render('user/index', {
    //            tags: tags,
    //            articles: articles,
    //            page: page,
    //            isFirstPage: (page - 1) === 0,
    //            isLastPage: ((page - 1) * 10 + articles.length) === total,
    //            user: req.session.user
    //        });
    //    });
    //
    //});

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
    var key = validator.trim(req.query.key),
        uniquename = validator.trim(req.query.uniquename);
    User.getUserByUniquename(uniquename, function (err, user) {
        res.locals.user = null;
        if (err) return next(err);

        if (!user) return res.render('user/account-active', {account_active_result: "账户激活失败, 该用户不存在"});

        console.log(utility.md5(user.email + user.passhash + config.session_secret) === key);

        if (!user || utility.md5(user.email + user.passhash + config.session_secret) !== key) {

            return res.render('user/account-active', {account_active_result: "账户激活失败, 信息有误!"});
        }

        if (user.active) return res.render('user/account-active', {account_active_result: "该账户已是激活状态,请直接<a href='/user/login-register'>登录</a>"});

        user.active = true;
        user.save(function (err, user) {
            if (err) return next(err);
            console.log('****** ' + user.nickname);
            res.render('user/account-active', {account_active_result: "邮箱已经激活,请登录<a href='/user/login-register'>登录</a>"});

        });
    });

};

exports.follow = function (req, res, next) {
    res.locals.user = req.session.user;
    var be_follower_id = req.params.id;
    console.log(be_follower_id);
    var follower_id = req.session.user._id;

    console.log('****** ======'+res.locals.user._id);

    User.getUserById(be_follower_id, function (err, be_follower) {
        console.log('****** ======');

        if (err){
            console.log(err);
            return next(err);
        }
        console.log('****** ==+===='+be_follower);

        if (!be_follower) return res.render("error", {error: "该用户已经注销"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了


        UserFollower.getUserFollower(be_follower_id, follower_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);
            if (!connection) {
                UserFollower.newAndSave(be_follower_id, follower_id, function (err, connection) {
                    if (err) return next(err);
                    if (connection) return res.status(200).json({resultFromServer: "followSuccess"});
                });
            } else {
                UserFollower.remove(be_follower_id, follower_id, function (err) {
                    if (err) return next(err);
                    return res.status(200).json({resultFromServer: "cancenFollowSuccess"});
                });
            }
        });
    });
};