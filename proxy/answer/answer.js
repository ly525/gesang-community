var Answer = require('../../models').Answer;
var User   = require('../user/user');
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

exports.getAnswerById = function (answer_id, callback) {
    console.log("1" + answer_id);
    if (!answer_id) return callback(null, null);
    Answer.findOne({_id: answer_id}, function (err, answer) {
        if (err) return callback(err);
        if (!answer) return callback(err, null);
        var author_id = answer.author_id;
        User.getUserById(author_id, function (err, author) {
            if (err) return callback(err);
            author.passhash = null;
            console.log("2" + author.nickname);
            answer.author = author;
            return callback(err, answer);
        });
    });
};