var QuestionCollector    = require('../models').QuestionCollector;
var EventProxy          = require('eventproxy');
var User                = require('./user');
var Question             = require('./question');

exports.getQuestionCollector  = function (collector_id, question_id, callback) {
    QuestionCollector.findOne({collector_id:collector_id,question_id:question_id}, callback);
};

exports.getQuestionsByCollector_id  = function (collector_id, callback) {
    QuestionCollector.find({collector_id:collector_id},{question_id:""}, function(err, connections){
        if(err ) return callback(err);
        var ep = new EventProxy();
        ep.after('one_question', connections.length, function(questions){
            callback(null, questions);
        });

        connections.forEach(function(connection){
            Question.getUserById(connection.question_id, function(err, question){
                if (err) return callback(err);
                ep.emit("one_question", question);
            });

        });

    });
};

exports.getCollectorsByQuestion_id  = function (question_id, callback) {
    QuestionCollector.find({question_id:question_id},{collector_id:""}, function(err, connections){
        if (err) return callback(err);
        var ep = new EventProxy();
        ep.after('one_collector', connections.length, function(collectors){
            callback(null, collectors);
        });

        connections.forEach(function(connection){
            User.getUserById(connection.collector_id, function(err, collector){
                if (err) return callback(err);
                ep.emit("one_collector", collector);
            });

        });

    });
};


exports.newAndSave = function(question_id, collector_id, callback ){
    var questionCollector            = new QuestionCollector();
    questionCollector.question_id     = question_id;
    questionCollector.collector_id   = collector_id;
    questionCollector.save(callback);
};



exports.remove =   function (question_id, collector_id, callback) {
    QuestionCollector.remove({question_id:question_id,collector_id:collector_id}, callback);
};