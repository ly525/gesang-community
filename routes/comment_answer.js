var EventProxy    = require('eventproxy');
var validator     = require('validator');
var Answer        = require('../proxy').Answer;
var User          = require('../proxy').User;
var AnswerComment = require('../proxy').AnswerComment;
var AnswerCommentModel = require('../models').AnswerComment;

exports.newAndSave = function (req, res, next) {
    res.locals.user = req.session.user;
    var answer_id   = req.params.answer_id;
    var author_id   = req.session.user._id;
    var content     = validator.trim(req.body.content);
    var master_id   = req.body.master_id || null;
    console.log("***" + answer_id);
    
    AnswerComment.newAndSave(answer_id, author_id, content, master_id, function (err, answerComment) {
        if (err) next(err);

        var proxy = new EventProxy();
        proxy.all('answer_ready', 'author_ready', function () {
            res.status(200).json({resultFromServer: "successCreateComment", answerComment: answerComment});
        });
        // 更新回答的评论数量
        Answer.getAnswerWithoutUserById(answerComment.answer_id, function (err, answer) {
            if (err) next(err);
            // answer.comment_count++;
            answer.save(function (err) {
                if (err) next(err);
                proxy.emit('answer_ready');

            });
        });

        // 更新评论者的评论数量
        User.getUserById(author_id, function (err, author) {
            if (err) next(err);
            author.passhash = null;
            author.comment_count++;
            res.locals.user = req.session.user = author;
            author.save(function (err) {
                if (err) next(err);
                proxy.emit('author_ready');
            });
        });

        // TODO 消息通知:通知答案有人评论了;

    });
};