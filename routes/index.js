var express = require('express');
var router = express.Router();
var requiredNotLogin = require('./accessControl').requiredNotLogin;
var requiredLogin = require('./accessControl').requiredLogin;
var user = require('./user');
var article = require('./article');
var articles = require('./articles');


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
router.get('/user/u/:id',user.userIndex); // 获得用户主页
router.get('/user/:other_user_id/be_followers',user.getBeFollowers); // 获得A关注的人
router.get('/user/:other_user_id/followers',user.getFollowers); // 获得A的关注者
router.post('/user/follow/:id', requiredLogin, user.follow);
router.post('/user/login', requiredNotLogin, user.login);
router.post('/user/register', requiredNotLogin, user.register);
router.post('/user/updateEmail', requiredLogin, user.updateEmail);
router.post('/user/updatePassword', requiredLogin, user.updatePassword);
router.post('/user/updateNickNameAndSignature', requiredLogin, user.updateNickNameAndSignature);

/**
 * 添加文章路由
 */
router.get('/articles', articles.index);
router.get('/article/create', requiredLogin, article.getCreatePage);// 创建一篇新文章
router.get('/article/:article_id', article.index);// 根据id获得文章
router.get('/article/:article_id/edit', requiredLogin, article.showEditPage);//编辑文章
router.post('/article/:article_id/update', requiredLogin, article.update);//编辑文章
router.post('/article/create', requiredLogin, article.newAndSave);//
// router.post('/article/draft', requiredLogin, article.draftAndSave);// 提交草稿
router.get('/article/:article_id/delete', requiredLogin, article.delete);
router.post('/article/:article_id/like', requiredLogin, article.like);
router.post('/article/:article_id/dislike', requiredLogin, article.dislike);
module.exports = router;