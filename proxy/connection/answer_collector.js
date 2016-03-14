var AnswerCollector = require('../../models/index').AnswerCollector;
var EventProxy      = require('eventproxy');
var User            = require('./../user/user');
var Answer          = require('./answer');

exports.getAnswerCollector = function (collector_id, answer_id, callback) {
    AnswerCollector.findOne({collector_id: collector_id, answer_id: answer_id}, callback);
};

exports.getAnswersByCollector_id = function (collector_id, callback) {
    AnswerCollector.find({collector_id: collector_id}, {answer_id: ""}, function (err, connections) {
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_answer', connections.length, function (answers) {
            callback(null, answers);
        });

        connections.forEach(function (connection) {
            Answer.getUserById(connection.answer_id, function (err, answer) {
                if (err) return callback(err);
                ep.emit("one_answer", answer);
            });

        });

    });
};

exports.getCollectorsByAnswer_id = function (answer_id, callback) {
    AnswerCollector.find({answer_id: answer_id}, {collector_id: ""}, function (err, connections) {
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_collector', connections.length, function (collectors) {
            callback(null, collectors);
        });

        connections.forEach(function (connection) {
            User.getUserById(connection.collector_id, function (err, collector) {
                if (err) return callback(err);
                ep.emit("one_collector", collector);
            });

        });

    });
};


exports.newAndSave = function (answer_id, collector_id, callback) {
    var answerCollector          = new AnswerCollector();
    answerCollector.answer_id    = answer_id;
    answerCollector.collector_id = collector_id;
    answerCollector.save(callback);
};


exports.remove = function (answer_id, collector_id, callback) {
    AnswerCollector.remove({answer_id: answer_id, collector_id: collector_id}, callback);
};