var express = require('express');
var router = express.Router();
var checkNotLogin = require('./accessControl').checkNotLogin;
var checkLogin = require('./accessControl').checkLogin;
var user = require('./user');


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {
        user: req.session.user,
        articles: []
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
router.get('/user/login-register', checkNotLogin, user.loginAndRigister);
router.post('/user/login', checkNotLogin, user.login);
router.post('/user/register', checkNotLogin, user.register);
router.get('/user/logout', checkLogin, user.logout);
router.get('/user/account-settings', checkLogin, user.accountSettings);
router.get('/user/account-active', checkNotLogin, user.activeAccount);// 会自动将req, res, next 传递给这些函数

/**
 * 添加文章路由
 * - 发表
 * - 删除
 * - 编辑
 * - 查询
 */

module.exports = router;