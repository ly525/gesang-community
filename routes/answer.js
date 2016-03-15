var EventProxy   = require('eventproxy');
var validator    = require('validator');
var User         = require('../proxy').User;
var UserFollower = require('../proxy').UserFollower;
var Answer       = require('../proxy').Answer;


exports.newAndSave = function (req, res, next) {
    res.locals.user = req.session.user;
    var author_id   = req.session.user._id;
    var content     = validator.trim(req.body.content);
    Answer.newAndSave(author_id, content, function (err, answer) {
        if (err) next(err);
        console.log("接收到的answer" + answer);
        res.status(200).json({resultFromServer: "postAnswerSuccess"});
    });
};