/**
 * 权限控制: 要求用户没有登录
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function requiredNotLogin(req, res, next) {
    /* !undefined -> true
     TODO 2016 年02月02日11: 59: 10 以及登录之后回到原来的页面
     这边使用跳出提示比较好;
     return res.redirect('back');//返回之前的页面,这边可能会出现重定向
     */
    if (req.session.user) return res.redirect('/');//返回之前的页面,这边可能会出现重定向 TODO 测试redirect之后语句会不会执行?
    next();
}

/**
 * 权限控制: 要求用户已经登录
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function requiredLogin(req, res, next) {

    if (!req.session.user) return res.redirect('/user/login-register');
    next();
}

module.exports = {
    requiredNotLogin: requiredNotLogin,
    requiredLogin   : requiredLogin
};