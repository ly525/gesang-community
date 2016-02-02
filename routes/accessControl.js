function checkNotLogin(req, res, next) {

    // !undefined -> true
    if (req.session.user) {
        // 这边使用跳出提示比较好;
        // TODO 2016 年02月02日11: 59: 10 以及登录之后回到原来的页面
        req.flash('error', '未登录,请登录!');
        res.redirect('/users/login-register'); // TODO 2016年02月02日12:04:17 这边需要添加return?
        console.log('测试redirect之后的语句是否执行');
    }
    next();
}

function checkLogin(req, res, next) {

    if (!req.session.user) {
        req.flash('success', '已经登录!');
        res.redirect('back');
    }
    next();
}

module.exports = {
    checkNotLogin: checkNotLogin,
    checkLogin: checkLogin
};