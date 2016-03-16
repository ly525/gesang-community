var EventProxy   = require('eventproxy');
var validator    = require('validator');
var User         = require('../proxy').User;
var UserFollower = require('../proxy').UserFollower;
var Answer       = require('../proxy').Answer;
var Question     = require('../proxy').Question;


exports.newAndSave = function (req, res, next) {
    res.locals.user = req.session.user;
    var question_id = req.params.question_id;
    var author_id   = req.session.user._id;
    var content     = validator.trim(req.body.content);


    Answer.newAndSave(question_id, author_id, content, function (err, answer) {
        if (err) next(err);
        Question.getQuestionWithoutUserAndAnswersById(question_id, function (err, question) {
            if (err) next(err);
            question.last_answer = answer._id;
            question.answer_count++;
            question.save(function (err) {
                if (err) next(err);
                res.redirect('/question/' + question_id);
            });
        });

    });
};