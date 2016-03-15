var Question   = require('../../models/index').Question;
var markdown   = require('markdown').markdown;
var EventProxy = require('eventproxy');
var User       = require('../user/user');
var Answer     = require('../answer/answer');


/**
 * 保存一篇文章
 * @param author_id 作者ID
 * @param title 标题
 * @param content 内容
 * @param tags 标签数组
 * @param callback 回调函数 用于判断收保存成功
 */
exports.newAndSave = function (author_id, title, content, tags, callback) {
    var question       = new Question();
    question.author_id = author_id;
    question.title     = title;
    question.content   = content
    question.tags      = tags;
    question.save(callback);
};


exports.getQuestionAndUserWithoutAnswersById = function (id, callback) {
    Question.findOne({_id: id, deleted: false}, function (err, question) {
        if (err) callback(err);
        console.log("question" + question);
        if (!question) return callback(null, null);
        User.getUserById(question.author_id, function (err, user) {
            if (err) callback(err);
            console.log("user" + user);
            if (!user) callback(null, null);
            question.author = user;
            callback(err, question);
        });
    });
};