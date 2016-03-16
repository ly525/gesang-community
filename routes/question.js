var EventProxy   = require('eventproxy');
var validator    = require('validator');
var User         = require('../proxy').User;
var UserFollower = require('../proxy').UserFollower;
var Answer       = require('../proxy').Answer;
var Question     = require('../proxy').Question;


/**
 * 显示写一篇新问题页面
 * @param req
 * @param res
 * @param next
 */
exports.getCreatePage = function (req, res, next) {
    res.locals.user = req.session.user;
    res.render('question/createQuestion');
};

/**
 * 发表新问题并保存
 * @param req
 * @param res
 * @param next
 */
exports.newAndSave = function (req, res, next) {
    var author_id = req.session.user._id;
    var title     = req.body.title;
    var content   = req.body.content;
    var tags      = [req.body.tag1, req.body.tag2, req.body.tag3];// 这边也可以使用req.body[tag3]来获得属性值,而且[]的方法通常可以用来遍历对象的属性和属性值(for-in)
    Question.newAndSave(author_id, title, content, tags, function (err, question) {
        if (err) next(err);
        return res.redirect('/question/' + question._id);
    });
};


/**
 * 显示编辑问题页面
 * @param req
 * @param res
 */
exports.showEditPage = function (req, res, next) {
    res.locals.user = req.session.user;
    Question.getQuestionWithoutRendingNorAuthorByQuestionId(req.params.question_id, function (err, question) {
        if (err) next(err);
        res.render('question/editQuestion', {
            question: question
        });
    });
};

/**
 * 更新问题
 * - 更新包含: 标题 | 内容 | 标签 | 是否存为草稿 | 更新时间
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    var title   = validator.trim(req.body.title);
    var content = validator.trim(req.body.content);
    var tags    = [validator.trim(req.body.tag1), validator.trim(req.body.tag2), validator.trim(req.body.tag3)];
    Question.getQuestionWithoutRendingNorAuthorByQuestionId(req.params.question_id, function (err, question) {

        question.title     = title;
        question.content   = content;
        question.tags      = tags;
        question.update_at = new Date();
        question.save(function (err, question) {
            if (err) return next(err);
            res.redirect('/question/' + question._id);
        });
    });
};

exports.delete = function (req, res, next) {
    res.locals.user = req.session.user;
    var question_id = req.params.question_id;
    //var ep          = new EventProxy();
    Question.getQuestionWithoutRendingNorAuthorByQuestionId(question_id, function (err, question) {
        if (err) next(err);
        console.log("****** " + question.author_id);
        console.log("****** " + req.session.user._id);
        if (!question.author_id.equals(req.session.user._id)) {
            res.status(403).render('error', {error: "Access Denied"});
        }
        if (!question) {
            res.status(422).render('error', {error: "问题不存在或者已经被删除!"});
        }

        question.deleted = true;
        question.question_count--;

        question.save(function (err) {
            if (err) next(err);
            res.render('success', {success: '删除问题删除成功!'});
        });

    });
};


/**
 * 查看一个问题详情
 * - 详情包含: 问题信息 | 作者信息 | 回答信息
 * - 若用户已经登录,另外包含: 是否 收藏问题 | 点赞问题 | 关注作者 (没有登录则不包含)
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
    res.locals.user = req.session.user;
    var question_id = req.params.question_id;

    Question.getFullQuestionById(question_id, function (err, message, question, author, answers) {
        if (message) return res.render('error', {error: "", message: message});
        question.visit_count++;
        question.save();

        question.author  = author;
        question.answers = answers;
        res.render("question/index", {question: question});
    });
};

/**
 * 给问题点赞
 * -逻辑: 获得问题ID & 点赞者ID
 * - 判断问题是否存在
 * - 从问题-点赞者 数据库中查询
 * - 若[有记录],说明[已经赞过]问题,说明目的是[取消点赞]
 * - 若[没记录],说明[没有点赞]问题,说明目的是[点赞问题]
 * @param req
 * @param res
 * @param next
 */
exports.like = function (req, res, next) {
    res.locals.user = req.session.user;
    var question_id = req.params.question_id;
    var liker_id    = req.session.user._id;
    // 根据问题ID, 查询问题是否存在
    Question.getQuestionWithoutRendingNorAuthorByQuestionId(question_id, function (err, question) {
        if (err) return next(err);
        if (!question) return res.render("error", {error: "该问题已经被作者删除!"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了
        // 根据问题ID和点赞者ID查询是否二者之间存在一条记录
        QuestionLiker.getQuestionLiker(question_id, liker_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);

            // 如果不存在对应记录,说明没有点赞,执行点赞
            if (!connection) {
                console.log("4");

                var ep = new EventProxy();
                ep.all('be_liked_count_plus', 'like_question_count_plus', 'save', function () {
                    return res.status(200).json({resultFromServer: "likeSuccess"});
                });

                // 存储一条记录
                QuestionLiker.newAndSave(question_id, liker_id, function (err, connection) {
                    if (err) return next(err);
                    ep.emit('save');
                });
                // 点赞者送出去的赞+1
                User.getUserById(liker_id, function (err, liker) {
                    liker.like_question_count++;
                    liker.save(function (err) {
                        if (err) next(err);
                        console.log("4 " + liker.like_question_count);
                        ep.emit('like_question_count_plus');
                    });
                });

                // 问题被点赞数+1
                question.be_liked_count++;
                question.save(function (err, question) {
                    if (err) next(err);
                    console.log("4 " + question.be_liked_count);
                    ep.emit('be_liked_count_plus');
                });

            }
            // 如果存在对应记录,说明已经点赞,执行取消点赞
            else {

                var ep = new EventProxy();
                ep.all('be_liked_count_minus', 'like_question_count_minus', 'remove', function () {
                    return res.status(200).json({resultFromServer: "cancelCollectSuccess"});
                });
                // 删除一条记录
                QuestionLiker.remove(question_id, liker_id, function (err) {
                    if (err) return next(err);
                    ep.emit('remove');
                });
                // 点赞者送出去的点赞数-1
                User.getUserById(liker_id, function (err, liker) {
                    liker.like_question_count--;
                    liker.save(function (err) {
                        if (err) next(err);
                        ep.emit('like_question_count_minus');

                    });
                });

                //问题被点赞数-1
                question.be_liked_count--;
                question.save(function (err) {
                    if (err) next(err);
                    ep.emit('be_liked_count_minus');
                });

            }
        });
    });
};


/**
 * 收藏问题
 * @param req
 * @param res
 * @param next
 */
exports.collect = function (req, res, next) {
    res.locals.user  = req.session.user;
    var question_id  = req.params.question_id;
    var collector_id = req.session.user._id;
    Question.getQuestionWithoutRendingNorAuthorByQuestionId(question_id, function (err, question) {
        if (err) return next(err);
        if (!question) return res.render("error", {error: "该问题已经被作者删除!"}); // 主要是A用户自己删除了自己的账户之前B在浏览其主页,A删除了自己的账户后,B关注A发现A用户不存在了
        QuestionCollector.getQuestionCollector(question_id, collector_id, function (err, connection) {
            // 这里的connection表示一条关系,也就是关注者和被关注者之间的关系,也就是数据库中一条记录
            if (err) return next(err);
            if (!connection) {

                var ep = new EventProxy();
                ep.all('be_collected_count_plus', 'collect_question_count_plus', 'save', function () {
                    return res.status(200).json({resultFromServer: "collectSuccess"});
                });
                QuestionCollector.newAndSave(question_id, collector_id, function (err, connection) {
                    if (err) return next(err);
                    ep.emit('save');
                });
                User.getUserById(collector_id, function (err, collector) {
                    collector.collect_question_count++;
                    collector.save(function (err) {
                        if (err) next(err);
                        console.log("4 " + collector.collect_question_count);
                        ep.emit('collect_question_count_plus');
                    });
                });
                question.be_collected_count++;
                question.save(function (err, question) {
                    if (err) next(err);
                    console.log("4 " + question.be_collected_count);
                    ep.emit('be_collected_count_plus');
                });

            } else {

                var ep = new EventProxy();
                ep.all('be_collected_count_minus', 'collect_question_count_minus', 'remove', function () {
                    return res.status(200).json({resultFromServer: "cancelCollectSuccess"});
                });
                QuestionCollector.remove(question_id, collector_id, function (err) {
                    if (err) return next(err);
                    ep.emit('remove');
                });
                User.getUserById(collector_id, function (err, collector) {
                    collector.collect_question_count--;
                    collector.save(function (err) {
                        if (err) next(err);
                        ep.emit('collect_question_count_minus');

                    });
                });
                question.be_collected_count--;
                question.save(function (err) {
                    if (err) next(err);
                    ep.emit('be_collected_count_minus');
                });

            }
        });
    });
};

/**
 * 发表问题回答
 * @param req
 * @param res
 * @param next
 */
exports.createAnswer = function (req, res, next) {
    res.locals.user = req.session.user;
    var author_id   = req.session.user._id; //回答者ID
    var question_id = req.params.question_id; //问题ID
    var content = validator.trim(req.body.content);// 去除前后的空格
    /**
     * 保存一条新的回答
     * 回答者ID, 问题ID, 回答内容
     */
    Answer.newAndSave(author_id, question_id, content, function (err, answer) {
        if (err) next(err);
        // 在对A问题发表回答成功之后,跳转到A问题,这样就可以看到新的回答了:redirect 重定向的意思
        res.redirect('/question/' + question_id);

    });
};