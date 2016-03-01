// error handlers
module.exports = function (app) {
    console.log('给APP添加错误处理路由');
    //     catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // TODO 2016年02月03日21:00:16 在routes/article.js中出错了,怎么把错误传递到500的处理里面?
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        err.status = err.status || 500;
        console.log("错误" + err.status+ err);
        res.render('error', {
            message: err.message
        });
    });

}