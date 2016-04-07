var Answer = require('../../models').Answer;
var User   = require('../user/user');
var EventProxy = require('eventproxy');

/**
 * 保存一个回答
 * @param author_id 作者ID
 * @param content 内容
 * @param callback 回调函数 用于判断收保存成功
 */
exports.newAndSave = function (question_id, author_id, content, callback) {
    var answer         = new Answer();
    answer.question_id = question_id;
    answer.author_id   = author_id;
    answer.content     = content;
    answer.save(callback);
};

/**
 * 根据答案ID,获得一个回答
 * Callback:
 * - err, 数据库异常
 * - answer,包含作者信息的答案
 * @param {String} answer_id 答案ID
 * @param {Function} callback 回调函数
 */
exports.getAnswerById = function (answer_id, callback) {
    if (!answer_id) return callback(null, null);
    Answer.findOne({_id: answer_id}, function (err, answer) {
        if (err) return callback(err);
        if (!answer) return callback(err, null);
        var author_id = answer.author_id;
        User.getUserById(author_id, function (err, author) {
            if (err) return callback(err);
            author.passhash = null;
            answer.author   = author;
            callback(err, answer);
        });
    });
};

/**
 * 根据问题ID, 获得答案列表
 * Callback:
 * - err 数据库异常
 * - answers, 答案列表
 * @param {String} question_id 问题ID
 * @param {Function} callback 回调函数
 */
exports.getAnswersByQuestionId = function (question_id, callback) {

    Answer.find({question_id: question_id, deleted: false}, '', {sort: 'create_at'}, function (err, answers) {
        if (err) return callback(err);
        if (answers.length === 0) return callback(null, []);

        var proxy = new EventProxy();
        proxy.after('answer_find', answers.length, function () {
            callback(null, answers);
        });

        // 遍历答案获得作者
        for (var j = 0; j < answers.length; j++) {
            (function (i) {
                var author_id = answers[i].author_id;
                User.getUserById(author_id, function (err, author) {
                    if (err) return callback(err);
                    author.passhash = null;
                    answers[i].author = author || {_id: ''};
                    proxy.emit('answer_find');
                });
            })(j);
        }
    });
};

exports.getAnswerWithoutUserById = function (answer_id, callback) {
    if (!answer_id) return callback(null, null);
    Answer.findOne({_id: answer_id}, function (err, answer) {
        if (err) return callback(err);
        if (!answer) return callback(null, null);
        return callback(null, answer);
    });

};