var express          = require('express');
var router           = express.Router();
var requiredNotLogin = require('./accessControl').requiredNotLogin;
var requiredLogin    = require('./accessControl').requiredLogin;
var user             = require('./user');
var tag              = require('./tag');
var article          = require('./article');
var articles         = require('./articles');
var search           = require('./search');
var question         = require('./question');

/**
 * 首页路由
 */
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
router.get('/user/u/:id',											user.userIndex); // 获得A主页
router.get('/user/:user_id/be_followers',							user.getBeFollowers); // 获得A关注的人
router.get('/user/:user_id/followers',								user.getFollowers); // 获得A的关注者
router.get('/user/:user_id/articles_20',							user.getArticles_20); //获得A发表过最近更新的20篇文章
router.get('/user/:user_id/articles_collects_20',					user.getArticles_Collects_20); //获得A收藏的,最近更新的20篇文章
router.get('/user/login-register', 				requiredNotLogin, 	user.loginAndRigister); //获得登录登录注册页面
router.get('/user/logout', 						requiredLogin, 		user.logout); // 用户注销
router.get('/user/account-settings', 			requiredLogin, 		user.accountSettings); // 用户设置页面
router.get('/user/account-active', 				requiredNotLogin, 	user.activeAccount);// 激活邮箱 会自动将req, res, next 传递给这些函数
router.post('/user/follow/:id', 				requiredLogin, 		user.follow); // 关注某用户
router.post('/user/login', 						requiredNotLogin, 	user.login); // 登录
router.post('/user/register', 					requiredNotLogin, 	user.register); // 注册
router.post('/user/updateEmail', 				requiredLogin, 		user.updateEmail); // 修改邮箱
router.post('/user/updatePassword', 			requiredLogin, 		user.updatePassword);//修改密码
router.post('/user/updateNickNameAndSignature', requiredLogin, 		user.updateNickNameAndSignature); // 修改昵称和签名

/**
 * 添加文章路由
 */
router.get('/articles', 						articles.index); // 获得20篇最新发表的文章
router.get('/article/:article_id', 				article.index);// 根据id获得文章
router.get('/article/create', 					requiredLogin, article.getCreatePage);// 创建一篇新文章
router.get('/article/:article_id/edit', 		requiredLogin, article.showEditPage);//编辑文章
router.post('/article/:article_id/update', 		requiredLogin, article.update);//编辑文章
router.post('/article/create', 					requiredLogin, article.newAndSave);//发布新文章
router.get('/article/:article_id/delete', 		requiredLogin, article.delete);// 删除文章
router.post('/article/:article_id/like', 		requiredLogin, article.like); // 点赞文章
router.post('/article/:article_id/collect', 	requiredLogin, article.collect);// 收藏文章
router.post('/article/:article_id/createReply', requiredLogin, article.createReply);// 发表文章回复

/**
　* 添加标签路由
 *
*/
router.get('/tag/:tag_name', tag.singleTag); // 单个标签页面

/**
　* 添加搜索路由
 *
*/
router.get('/search/club_article', 	search.club_article);// 根据文章标题搜索文章
router.get('/search/club_question', search.club_question);//搜索问题
router.get('/search/club_answer', 	search.club_answer); // 搜索答案
router.get('/search/club_author', 	search.club_author); //搜索社区用户
router.get('/search/book_name', 	search.book_name);// 搜索书名
router.get('/search/book_author', 	search.book_author);// 搜索书作者
router.get('/search/book_press', 	search.book_press);// 搜索出版社



/**
 　* 添加问题路由
 *
 */
router.get('/questions',     question.index);// 最新回复的

router.get('/questions/latest_answered',     question.latest_answered);// 最新回复的
//router.get('/questions/no_answers', 	        question.no_answers);// 没有答案的
//router.get('/questions/most_views', 	        question.most_views);// 最多浏览的(热门的)

module.exports = router; // 导出路由