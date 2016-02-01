// error handlers
module.exports = function (app) {
    console.log('errorHanlder');
    //     catch 404 and forward to error handler
    app.use(function (req, res, next) {
        console.log('404-errorHanlder');
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        console.log('500-errorHanlder');
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

}