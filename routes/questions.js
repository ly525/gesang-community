var EventProxy   = require('eventproxy');
var validator    = require('validator');
var User         = require('../proxy').User;
var UserFollower = require('../proxy').UserFollower;
var Answer       = require('../proxy').Answer;
var Question     = require('../proxy').Question;
var config       = require('../config');

exports.latest_answered = function (req, res, next) {
    res.locals.user = req.session.user;
    var page        = parseInt(req.query.page, 10) || 1;// 表示以10进制进行解析
    //var proxy = new EventProxy();
    //proxy.fail(next);

    // 取文章
    var query   = {};
    var limit   = config.list_question_lastest_answered_count;
    var options = {skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};
    Question.getQuestionsByQuery(query, options, function (err, questions) {
        if (err) next(err);
        console.log("============"+questions);
        res.render("questions/index", {questions: questions});
    });

};
