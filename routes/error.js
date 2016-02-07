// error handlers
module.exports = function (app) {
    console.log('errorHanlder');
    //     catch 404 and forward to error handler
    app.use(function (req, res, next) {
        console.log('404-errorHanlder');
        var err = new Error('Not Found');
        err.status = 404;
        next(err);

        //res.render('404', {
        //    message: err.message,
        //    error: err
        //});
    });

    // TODO 2016年02月03日21:00:16 在routes/article.js中出错了,怎么把错误传递到500的处理里面?
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        console.log('500-errorHanlder');
        //res.status(err.status || 500);
        err.status= err.status || 500;
        res.render('error', {
            message: err.message,
            error: err
        });
    });

}