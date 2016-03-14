var Articles         = require('../proxy').Articles;
var validator        = require('validator');

/**
 * 搜索文章
 * @param req
 * @param res
 */
exports.club_article = function (req, res, next) {
    res.locals.user = req.session.user;
    var keyword     = validator.trim(req.query.keyword);
    var pattern     = new RegExp(keyword); // i修饰符用于执行对大小写不敏感的匹配
    var page = req.query.page ? parseInt(req.query.page) : 1;

    // 根据标题, 一次匹配20篇文章
    Articles.getTwentyArticlesWithAuthorByTitle(page, pattern, function (err, total, articles_20) {
        if (err) next(err);
        res.render('index', {
            articles   : articles_20,
            page       : page,
            isFirstPage: (page - 1) === 0,
            isLastPage : ((page - 1) * 20 + articles_20.length) === total
        });
    });

};

exports.club_question = function (req, res) {

};

exports.club_answer = function (req, res) {

};

exports.club_author = function (req, res) {

};

exports.book_name = function (req, res) {

};


exports.book_author = function (req, res) {

};

exports.book_press = function (req, res) {

};