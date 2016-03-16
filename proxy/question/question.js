var Question   = require('../../models/index').Question;
var markdown   = require('markdown').markdown;
var EventProxy = require('eventproxy');
var User       = require('../user/user');
var Answer     = require('../answer/answer');
var _          = require('lodash');

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

exports.getFullQuestionById                  = function (id, callback) {

    var proxy  = new EventProxy();
    var events = ['question', 'author', 'answers'];

    proxy.assign(events, function (question, author, answers) {

        callback(null, '', question, author, answers);
    }).fail(callback);
    Question.findOne({_id: id, deleted: false}, proxy.done(function (question) {
        // 问题不存在
        if (!question) {
            proxy.unbind();
            return callback(null, "问题已经不存在或者已经被删除!");
        }
        proxy.emit('question', question);


        // 获得提问者信息
        User.getUserById(question.author_id, proxy.done(function (author) {
            if (!author) {
                proxy.unbind();
                return callback(null, '提问者丢了');
            }
            author.passhash = null;
            proxy.emit('author', author);
        }));

        // 获得问题所有未被删除的回答-包含回答者信息
        Answer.getAnswersByQuestionId(question._id, proxy.done('answers'));


    }));


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

exports.getQuestionWithoutUserAndAnswersById = function (id, callback) {
    Question.findOne({_id: id, deleted: false}, callback);
};


/**
 * 根据关键词获取问题以及答案
 * Callback:
 * - err 数据库错误
 * - count, 问题列表
 * @param {String} query 查询关键字
 * @param {Object} options 选项
 * @param {Function} callback 回调函数
 */
exports.getQuestionsByQuery = function (query, options, callback) {
    query.deleted = false;
    Question.find(query, {}, options, function (err, questions) {
        if (err) return callback(err);
        if (questions.length === 0) return callback(null, []);
        var proxy = new EventProxy();
        proxy.after('question_ready', questions.length, function () {
            questions = _.compact(questions); // 去除不合理的questions,比如null;https://lodash.com/docs#compact
            return callback(null, questions);

        });
        proxy.fail(callback);

        // 遍历问题
        questions.forEach(function (question, index) {
            var ep = new EventProxy();
            ep.all('author', 'lastest_answer', function (author, lastest_answer) {
                // 保证顺序
                // 作者有可能被删除,对应不显示其回答和问题
                if (author) {
                    question.author         = author;
                    question.lastest_answer = lastest_answer;
                    console.log("3" + question.lastest_answer.author);
                } else {
                    question[index] = null;
                }
                proxy.emit('question_ready');
            });

            User.getUserById(question.author_id, ep.done('author'));
            Answer.getAnswerById(question.last_answer, ep.done('lastest_answer'));
        });


    });
};