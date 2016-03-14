var express      = require('express');
var crypto       = require('crypto');
var User         = require('../proxy').User;
var UserFollower = require('../proxy').UserFollower;
var Articles     = require('../proxy').Articles;
var mail         = require('../common/mail');
var utility      = require('utility');
var config       = require('../config');
var validator    = require('validator');
var EventProxy   = require('eventproxy');

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
            mail.sendActiveEmail(user.email, utility.md5(user.email + user.passhash + config.session_secret), user.nickname, user.uniquename, function (error, info) {
                if (error) {
                    return console.log("****** 邮件发送失败" + error);
                }
                return res.status(200).json({resultFromServer: 'unactiveEmail'});
                // TODO 2015年12月19日12:07:54 怎么在res.json之后重定向到主页?

            });
        } else { // 这边需要使用else, 否则异步执行sendActiveMail的时候后面的语句也会执行
            // 检查密码是否一致
            if (user.passhash !== passhash) return res.status(200).json({resultFromServer: "passwordError"});
            // 用户名和密码匹配后,将用户信息存入session
            user.passhash   = null;
            res.locals.user = req.session.user = user;
            return res.status(200).json({resultFromServer: "loginSuccess"});
        }

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

    var nickname   = req.body.nickname,
        passhash   = crypto.createHash('md5').update(validator.trim(req.body.password)).digest('hex'),
        email      = validator.trim(req.body.email),
        uniquename = nickname + Date.now(),
        avatarUrl  = User.makeSomelineAvatarUrl(email, 48);

    // 检测用户是否已经存在
    User.getUserByEmail(email, function (err, user) {
        if (err) console.log("****** 检测用户是否存在过程中出现问题" + err);
        if (user) {
            return res.status(200).json({resultFromServer: "emailAlreadyUsed"});
        }

        // 昵称, 唯一名称, 邮箱, 密码, 头像的地址,是否激活
        User.newAndSave(nickname, uniquename, email, passhash, avatarUrl, false, function (err, user) {
            if (err) {
                return console.log("****** 保存注册用户时候出现问题" + err);

            }
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
    res.locals.user   = req.session.user;
    var other_user_id = req.params.id;
    var ep            = new EventProxy();

    if (req.session.user) {
        // 如果用户已经登录,就判断查看的浏览的用户的ID和登录用户的id是否相同
        if (req.session.user._id === other_user_id) {

            // 相同则直接返回 被浏览的用户信息 == 登录者的信息
            res.render("user/index", {other_user: req.session.user});
        } else {
            // 否则 查询被浏览的用户的信息 | 是否已经关注该人
            ep.all("other_user", "is_already_follow", function (other_user, is_already_follow) {

                return res.render("user/index", {other_user: other_user, is_already_follow: is_already_follow});

            });

            // 获得被浏览的用户的信息
            User.getUserById(other_user_id, function (err, other_user) {
                if (err) return next(err);
                if (!other_user) return res.render("error", {message: "用户不存在"});
                other_user.passhash = null;
                ep.emit('other_user', other_user);
            });

            // 是否已经关注该人
            UserFollower.getUserFollower(other_user_id, req.session.user._id, function (err, connection) {
                if (err)         return next(err);
                if (!connection) return ep.emit('is_already_follow', false);
                if (connection)  return ep.emit('is_already_follow', true);

            });
        }
    } else {

        // 如果用户没有登录, 则直接返回被浏览者的用户信息,也无须判断是否已经关注了
        User.getUserById(other_user_id, function (err, other_user) {
            if (err) return next(err);
            if (!other_user) return res.render("error", {message: "用户不存在"});
            other_user.passhash = null;
            res.render("user/index", {other_user: other_user});

        });
    }


};

/**
 * 获得用户账户设置页面
 * @param req
 * @param res
 * @param next
 */
exports.accountSettings = function (req, res, next) {
    res.locals.user = req.session.user;
    res.render('user/account-settings', {
        other_user: req.session.user
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
    var key        = validator.trim(req.query.key),
        uniquename = validator.trim(req.query.uniquename);
    User.getUserByUniquename(uniquename, function (err, user) {
        res.locals.user = null;
        if (err) return next(err);
        if (!user) return res.render('user/account-active', {account_active_result: "账户激活失败, 该用户不存在"});

        // 如果激活码不匹配,则提醒失败
        if (!user || utility.md5(user.email + user.passhash + config.session_secret) !== key) {
            return res.render('user/account-active', {account_active_result: "账户激活失败, 信息有误!"});
        }
        if (user.active) return res.render('user/account-active', {account_active_result: "该账户已是激活状态,请直接<a href='/user/login-register'>登录</a>"});

        // 没有各种异常的话,激活用户状态
        user.active = true;
        user.save(function (err, user) {
            if (err) return next(err);
            res.render('user/account-active', {account_active_result: "邮箱已经激活,请登录<a href='/user/login-register'>登录</a>"});
        });
    });

};

/**
 * 更新邮箱
 * @param req
 * @param res
 * @param next
 */
exports.updateEmail = function (req, res, next) {
    var user_id  = req.session.user._id;
    var newEmail = validator.trim(req.body.newEmail); // 新邮箱地址
    User.getUserByEmail(newEmail, function (err, user) {
        if (err)  next(err);
        if (user) return res.status(200).json({resultFromServer: 'emailAlreadyUsed'}); // 新邮箱已经被注册了
        User.getUserById(user_id, function (err, user) {
            if (err) next(err);
            user.email = newEmail; // 将数据库中邮箱信息设置为新邮箱
            user.active = false;    // 设置该邮箱未激活.并给 新邮箱 发送激活邮件
            user.save(function (err) {
                if (err) next(err);
                // 给 新邮箱 发送激活邮件
                // 参数: 新邮箱 | 激活码 | 用户昵称[用户显示:你好,某某某] | 用户的唯一名称[用户激活查询使用该用户是否存在之用]
                mail.sendActiveEmail(newEmail, utility.md5(newEmail + user.passhash + config.session_secret), user.nickname, user.uniquename, function (error, info) {
                    if (error) {
                        console.log("****** 邮件发送失败" + error);
                        return res.status(200).json({resultFromServer: 'updateEmailFailed'});
                    }
                    console.log('****** Message sent: ' + info.response);
                    console.log("****** 更改邮箱的验证邮件已经发送,请查收");
                    user.passhash   = null;
                    res.locals.user = req.session.user = user;
                    res.status(200).json({resultFromServer: 'updateEmailSuccess'}); // 如果激活邮件发送成功提醒修改成功
                    // TODO 2015年12月19日12:07:54 怎么在res.json之后重定向到主页?

                });

            });

        });
    });


};

/**
 * 更新密码
 * @param req
 * @param res
 * @param next
 */
exports.updatePassword = function (req, res, next) {
    var newPassword = crypto.createHash('md5').update(req.body.newPassword).digest('hex');
    var oldPassword = crypto.createHash('md5').update(req.body.oldPassword).digest('hex');

    User.getUserById(req.session.user._id, function (err, user) {
        if (err) next(err);
        // 检查密码是否一致
        if (user.passhash !== oldPassword) {
            return res.status(200).json({resultFromServer: "wrongOldPassword"});
        }
        user.passhash = newPassword;
        user.save(function (err) {
            if (err) next(err);
            res.status(200).json({resultFromServer: "updatePasswordSuccess"});
        });
    });
};

/**
 * 更新用户昵称和签名
 * @param req
 * @param res
 * @param next
 */
exports.updateNickNameAndSignature = function (req, res, next) {
    res.locals.user  = req.session.user;
    var newNickname  = req.body.newNickname;
    var newSignature = req.body.newSignature;
    User.getUserById(req.session.user._id, function (err, user) {
        if (err) next(err);
        user.nickname  = newNickname;
        user.signature = newSignature;
        user.save(function (err, user) {
            if (err) next(err);
            user.passhash   = null;
            res.locals.user = req.session.user = user;
            res.status(200).json({resultFromServer: "updateNickNameAndSignatureSuccess"});

        });
    });

};
/**
 * 关注别的用户
 * @param req
 * @param res
 * @param next
 */
exports.follow = function (req, res, next) {
    res.locals.user    = req.session.user;
    var be_follower_id = req.params.id;
    var follower_id    = req.session.user._id;
    User.getUserById(be_follower_id, function (err, be_follower) {
        if (err) next(err);
        if (!be_follower) return res.render("error", {error: "该用户已经注销"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了
        UserFollower.getUserFollower(be_follower_id, follower_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) next(err);
            if (!connection) {
                var ep = new EventProxy();
                ep.all('follower_count_plus', 'be_follower_count_plus', 'save', function () {
                    return res.status(200).json({resultFromServer: "followSuccess"});
                });
                UserFollower.newAndSave(be_follower_id, follower_id, function (err, connection) {
                    if (err) return next(err);
                    ep.emit('save');
                });
                User.getUserById(follower_id, function (err, follower) {
                    follower.be_follower_count++;
                    follower.save(function (err) {
                        if (err) next(err);
                        ep.emit('be_follower_count_plus');

                    });
                });
                be_follower.follower_count++;
                be_follower.save(function (err) {
                    if (err) next(err);
                    ep.emit('follower_count_plus');
                });

            } else {
                var ep = new EventProxy();
                ep.all('follower_count_minus', 'be_follower_count_minus', 'remove', function () {
                    return res.status(200).json({resultFromServer: "cancenFollowSuccess"})
                });
                UserFollower.remove(be_follower_id, follower_id, function (err) {
                    if (err) return next(err);
                    ep.emit('remove');

                });
                User.getUserById(follower_id, function (err, follower) {
                    follower.be_follower_count--;
                    follower.save(function (err) {
                        if (err) next(err);
                        ep.emit('be_follower_count_minus');

                    });
                });
                be_follower.follower_count--;
                be_follower.save(function (err) {
                    if (err) next(err);
                    ep.emit('follower_count_minus');
                });

            }
        });
    });
};

/**
 * 得到关注的人
 * @param req
 * @param res
 * @param next
 */
exports.getBeFollowers = function (req, res, next) {
    var follower_id = req.params.user_id;
    res.locals.user = req.session.user;
    var ep          = new EventProxy();

    if (req.session.user) {
        if (req.session.user._id === follower_id) {
            // 根据粉丝ID, 查询该粉丝关注了哪些用户
            UserFollower.getBeFollowersByfollower_id(follower_id, function (err, be_followers) {
                // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
                if (err) return next(err);
                res.render("user/be_followers", {
                    other_user  : req.session.user,
                    be_followers: be_followers
                });
            });
        } else {
            ep.all("other_user", "be_followers", "is_already_follow", function (other_user, be_followers, is_already_follow) {
                return res.render("user/be_followers", {
                    other_user       : other_user,
                    be_followers     : be_followers,
                    is_already_follow: is_already_follow
                });
            });

            User.getUserById(follower_id, function (err, other_user) {
                if (err) return next(err);
                if (!other_user) return res.render("error", {message: "用户不存在"});
                other_user.passhash = null;
                ep.emit('other_user', other_user);
            });
            // 根据粉丝ID, 查询该粉丝关注了哪些用户
            UserFollower.getBeFollowersByfollower_id(follower_id, function (err, be_followers) {
                // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
                if (err) return next(err);
                ep.emit('be_followers', be_followers);
            });
            // 查询已经登录的用户,是否已经正在被浏览的用户
            UserFollower.getUserFollower(req.params.user_id, req.session.user._id, function (err, connection) {
                if (err)         return next(err);
                if (!connection) return ep.emit('is_already_follow', false);
                if (connection)  return ep.emit('is_already_follow', true);

            });
        }
    } else {
        console.log("followers");
        ep.all("other_user", "be_followers", function (other_user, be_followers) {
            return res.render("user/be_followers", {
                other_user  : other_user,
                be_followers: be_followers
            });
        });

        User.getUserById(follower_id, function (err, other_user) {
            if (err) return next(err);
            if (!other_user) return res.render("error", {message: "用户不存在"});
            other_user.passhash = null;
            ep.emit('other_user', other_user);
        });
        // 根据粉丝ID, 查询该粉丝关注了哪些用户
        UserFollower.getBeFollowersByfollower_id(follower_id, function (err, be_followers) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);
            ep.emit('be_followers', be_followers);
        });

    }

};

/**
 * 得到关注者(粉丝)
 * @param req
 * @param res
 * @param next
 */
exports.getFollowers = function (req, res, next) {
    res.locals.user    = req.session.user;
    var be_follower_id = req.params.user_id;
    var ep             = new EventProxy();
    if (req.session.user) {
        if (req.session.user._id === be_follower_id) {
            //  查询哪些人关注了被浏览者
            UserFollower.getFollowersBybe_follower_id(be_follower_id, function (err, followers) {
                // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
                if (err) return next(err);
                res.render("user/followers", {
                    other_user: req.session.user,
                    followers : followers
                });
            });
        } else {
            ep.all("other_user", "followers", 'is_already_follow', function (other_user, followers, is_already_follow) {
                return res.render("user/followers", {
                    other_user       : other_user,
                    followers        : followers,
                    is_already_follow: is_already_follow
                });
            });
            // 查询要关注的人是否存在
            User.getUserById(be_follower_id, function (err, other_user) {
                if (err) return next(err);
                if (!other_user) return res.render("error", {message: "用户不存在"});
                other_user.passhash = null;
                ep.emit('other_user', other_user);
            });

            //  查询哪些人关注了被浏览者
            UserFollower.getFollowersBybe_follower_id(be_follower_id, function (err, followers) {
                // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
                if (err) return next(err);
                ep.emit('followers', followers);
            });

            // 查询是否已经关注
            UserFollower.getUserFollower(req.params.user_id, req.session.user._id, function (err, connection) {
                if (err)         return next(err);
                if (!connection) return ep.emit('is_already_follow', false);
                if (connection)  return ep.emit('is_already_follow', true);

            });
        }
    } else {
        ep.all("other_user", "followers", function (other_user, followers) {
            return res.render("user/followers", {
                other_user: other_user,
                followers : followers
            });
        });
        // 查询要关注的人是否存在
        User.getUserById(be_follower_id, function (err, other_user) {
            if (err) return next(err);
            if (!other_user) return res.render("error", {message: "用户不存在"});
            other_user.passhash = null;
            ep.emit('other_user', other_user);
        });


    }

};

/**
 * 得到A用户发表的最近更新的20篇文章
 * @param req
 * @param res
 * @param next
 */
exports.getArticles_20 = function (req, res, next) {
    res.locals.user = req.session.user;
    var user_id     = req.params.user_id;
    var ep          = new EventProxy();

    if (req.session.user) {
        if (req.session.user._id === user_id) {

            Articles.getTwentyArticlesByUserId(user_id, function (err, articles) {
                if (err) articles = [];
                res.render('user/articles_20', {
                    other_user: req.session.user,
                    articles  : articles
                });
            });

        } else {
            ep.all("other_user", "articles_20", 'is_already_follow', function (other_user, articles, is_already_follow) {

                res.render('user/articles_20', {
                    other_user       : other_user,
                    articles         : articles,
                    is_already_follow: is_already_follow
                });
            });
            User.getUserById(user_id, function (err, other_user) {
                if (err) return next(err);
                if (!other_user) return res.render("error", {error: "", message: "用户不存在"});
                other_user.passhash = null;
                ep.emit('other_user', other_user);
            });
            Articles.getTwentyArticlesByUserId(user_id, function (err, articles) {
                if (err) articles = [];
                ep.emit('articles_20', articles);
            });
            UserFollower.getUserFollower(req.params.user_id, req.session.user._id, function (err, connection) {
                if (err)         return next(err);
                if (!connection) return ep.emit('is_already_follow', false);
                if (connection)  return ep.emit('is_already_follow', true);

            });
        }

    } else {
        ep.all("other_user", "articles_20", function (other_user, articles) {

            res.render('user/articles_20', {
                other_user: other_user,
                articles  : articles
            });
        });
        User.getUserById(user_id, function (err, other_user) {
            if (err) return next(err);
            if (!other_user) return res.render("error", {error: "", message: "用户不存在"});
            other_user.passhash = null;
            ep.emit('other_user', other_user);
        });
        Articles.getTwentyArticlesByUserId(user_id, function (err, articles) {
            if (err) articles = [];
            ep.emit('articles_20', articles);
        });
    }

};

/**
 * 得到A用户收藏的最近更新的20篇文章
 * @param req
 * @param res
 * @param next
 */
exports.getArticles_Collects_20 = function (req, res, next) {
    res.locals.user  = req.session.user;
    var collector_id = req.params.user_id;
    var ep           = new EventProxy();

    if (req.session.user) {
        if (req.session.user._id === collector_id) {
            Articles.getTwentyArticlesByCollectorId(collector_id, function (err, articles) {
                if (err) articles = [];
                res.render('user/articles_collects_20', {
                    other_user       : req.session.user,
                    articles         : articles
                });
            });
        } else {
            ep.all("other_user", "articles_collects_20", "is_already_follow", function (other_user, articles, is_already_follow) {
                res.render('user/articles_collects_20', {
                    other_user       : other_user,
                    articles         : articles,
                    is_already_follow: is_already_follow
                });
            });
            User.getUserById(collector_id, function (err, other_user) {
                if (err) return next(err);
                if (!other_user) return res.render("error", {error: "", message: "用户不存在"});
                other_user.passhash = null;
                ep.emit('other_user', other_user);
            });
            Articles.getTwentyArticlesByCollectorId(collector_id, function (err, articles) {
                if (err) articles = [];
                ep.emit('articles_collects_20', articles);
            });

            UserFollower.getUserFollower(req.params.user_id, req.session.user._id, function (err, connection) {
                if (err)         return next(err);
                if (!connection) return ep.emit('is_already_follow', false);
                if (connection)  return ep.emit('is_already_follow', true);

            });
        }
    } else {
        ep.all("other_user", "articles_collects_20", function (other_user, articles) {
            res.render('user/articles_collects_20', {
                other_user       : other_user,
                articles         : articles
            });
        });

        User.getUserById(collector_id, function (err, other_user) {
            if (err) return next(err);
            if (!other_user) return res.render("error", {error: "", message: "用户不存在"});
            other_user.passhash = null;
            ep.emit('other_user', other_user);
        });
        Articles.getTwentyArticlesByCollectorId(collector_id, function (err, articles) {
            if (err) articles = [];
            ep.emit('articles_collects_20', articles);
        });

    }

};