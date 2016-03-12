var express = require('express');
var router = express.Router();
var requiredNotLogin = require('./accessControl').requiredNotLogin;
var requiredLogin = require('./accessControl').requiredLogin;
var user = require('./user');
var tag = require('./tag');
var article = require('./article');
var articles = require('./articles');
var search = require('./search');

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {
        user: req.session.user
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
router.get('/user/u/:id',											user.userIndex); // 获得用户主页
router.get('/user/:user_id/be_followers',							user.getBeFollowers); // 获得A关注的人
router.get('/user/:user_id/followers',								user.getFollowers); // 获得A的关注者
router.get('/user/:user_id/articles_20',							user.getArticles_20); 
router.get('/user/:user_id/articles_collects_20',					user.getArticles_Collects_20); 
router.get('/user/login-register', 				requiredNotLogin, 	user.loginAndRigister);
router.get('/user/logout', 						requiredLogin, 		user.logout);
router.get('/user/account-settings', 			requiredLogin, 		user.accountSettings);
router.get('/user/account-active', 				requiredNotLogin, 	user.activeAccount);// 会自动将req, res, next 传递给这些函数
router.post('/user/follow/:id', 				requiredLogin, 		user.follow);
router.post('/user/login', 						requiredNotLogin, 	user.login);
router.post('/user/register', 					requiredNotLogin, 	user.register);
router.post('/user/updateEmail', 				requiredLogin, 		user.updateEmail);
router.post('/user/updatePassword', 			requiredLogin, 		user.updatePassword);
router.post('/user/updateNickNameAndSignature', requiredLogin, 		user.updateNickNameAndSignature);

/**
 * 添加文章路由
 */
router.get('/articles', 						articles.index);
router.get('/article/:article_id', 				article.index);// 根据id获得文章
router.get('/article/create', 					requiredLogin, article.getCreatePage);// 创建一篇新文章
router.get('/article/:article_id/edit', 		requiredLogin, article.showEditPage);//编辑文章
router.post('/article/:article_id/update', 		requiredLogin, article.update);//编辑文章
router.post('/article/create', 					requiredLogin, article.newAndSave);//
router.get('/article/:article_id/delete', 		requiredLogin, article.delete);
router.post('/article/:article_id/like', 		requiredLogin, article.like);
router.post('/article/:article_id/dislike', 	requiredLogin, article.dislike);
router.post('/article/:article_id/collect', 	requiredLogin, article.collect);
router.post('/article/:article_id/createReply', requiredLogin, article.createReply);

/**
　* 添加标签路由
 *	
*/
router.get('/tag/:tag_name', tag.singleTag);

/**
　* 添加搜索路由
 *	
*/
router.get('/search/club_article', 	search.club_article);
router.get('/search/club_question', search.club_question);
router.get('/search/club_answer', 	search.club_answer);
router.get('/search/club_author', 	search.club_author);
router.get('/search/book_name', 	search.book_name);
router.get('/search/book_author', 	search.book_author);
router.get('/search/book_press', 	search.book_press);
module.exports = router;