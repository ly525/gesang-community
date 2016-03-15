exports.index = function (req, res, next) {
    res.locals.user = req.session.user;
    res.render("questions/index");
};

exports.latest_answered = function (req, res, next) {
    res.locals.user = req.session.user;
    res.render("questions/index");
};