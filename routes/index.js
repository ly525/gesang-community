var express = require('express');
var router = express.Router();
var requiredNotLogin = require('./accessControl').requiredNotLogin;
var requiredLogin = require('./accessControl').requiredLogin;
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
 * - 关注某人
 */
router.get('/user/login-register', requiredNotLogin, user.loginAndRigister);
router.get('/user/logout', requiredLogin, user.logout);
router.get('/user/account-settings', requiredLogin, user.accountSettings);
router.get('/user/account-active', requiredNotLogin, user.activeAccount);// 会自动将req, res, next 传递给这些函数
router.get('/user/u/:id',user.userIndex);
router.post('/user/follow/:id', requiredLogin, user.follow);
router.post('/user/login', requiredNotLogin, user.login);
router.post('/user/register', requiredNotLogin, user.register);
/**
 * 添加文章路由
 * - 发表
 * - 删除
 * - 编辑
 * - 查询
 */

module.exports = router;