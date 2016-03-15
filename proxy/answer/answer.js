var Answer = require('../../models').Answer;
/**
 * 保存一个回答
 * @param author_id 作者ID
 * @param content 内容
 * @param callback 回调函数 用于判断收保存成功
 */
exports.newAndSave = function (author_id, content, callback) {
    var answer       = new Answer();
    answer.author_id = author_id;
    answer.content   = content
    answer.save(callback);
};