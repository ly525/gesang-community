var express = require('express');
var router = express.Router();

var checkNotLogin = accessControl.checkNotLogin;
var checkLogin = accessControl.checkLogin;

var user = require('./user');


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {
        user: req.session.user,
        articles: [],
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

/**
 * 添加用户路由
 * - 登录
 * - 注册
 * - 注销
 * - 设置
 * - 主页
 */
router.get('/user/loginAndRigister', checkNotLogin);
router.get('/user/loginAndRigister', users.loginAndRigister);
router.get('/user/logout', checkLogin);
router.get('/user/logout', users.logout);
router.post('/user/login', checkNotLogin);
router.post('/user/login', users.login);
router.post('/user/register', checkNotLogin);
router.post('/user/register', users.register);
router.get('/user/accountSettings', checkLogin);
router.get('/user/accountSettings', users.accountSettings);

module.exports = router;