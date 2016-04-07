var Answer        = require('../../models').Answer;
var AnswerComment = require('../../models').AnswerComment;
var User          = require('../user/user');
var EventProxy    = require('eventproxy');

/**
 * 保存一个回答
 * @param author_id 作者ID
 * @param content 内容
 * @param callback 回调函数 用于判断是否保存成功
 */
exports.newAndSave = function (answer_id, author_id, content, master_id, callback) {
    var answerComment       = new AnswerComment();
    answerComment.answer_id = answer_id;
    answerComment.author_id = author_id;
    answerComment.content   = content;
    answerComment.master_id = master_id || null;
    answerComment.lean().save(callback);
};

/**
 * 根据评论ID,获得一个评论
 * Callback:
 * - err, 数据库异常
 * - answer,包含作者信息的评论
 * @param {String} comment_id 评论ID
 * @param {Function} callback 回调函数
 */
exports.getCommentById = function (comment_id, callback) {
    if (!comment_id) return callback(null, null);
    AnswerComment.findOne({_id: comment_id}, function (err, comment) {
        if (err) return callback(err);
        if (!comment) return callback(err, null);
        var author_id = comment.author_id;
        User.getUserById(author_id, function (err, author) {
            if (err) return callback(err);
            author.passhash = null;
            comment.author   = author;
            callback(err, comment);
        });
    });
};